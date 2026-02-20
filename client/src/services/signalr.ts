import * as signalR from '@microsoft/signalr';
import type { TaskDto } from '../types/task';

const HUB_BASE_URL = 'http://localhost:5227';

export type TaskUpdatedCallback = (task: TaskDto) => void;

let connection: signalR.HubConnection | null = null;
/** Tek bir handler kayıtlı kalır; güncel callback buradan okunur (çoklu kayıt engeli). */
let currentCallback: TaskUpdatedCallback | null = null;
/** Aynı anda birden fazla bağlantı açılmasını engeller. */
let connectPromise: Promise<signalR.HubConnection> | null = null;

/**
 * Task Hub'a bağlanır. JWT token query string ile gönderilir (backend Program.cs'deki OnMessageReceived ile uyumlu).
 * TaskAssigned event'ini tek handler ile dinler; callback sadece görev atanan kullanıcıya bildirim göstermek için kullanılır.
 */
export async function startTaskHubConnection(
  accessToken: string,
  onTaskAssigned: TaskUpdatedCallback
): Promise<signalR.HubConnection> {
  currentCallback = onTaskAssigned;

  if (connection?.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  // Zaten bağlanıyorsak aynı promise'i döndür (tek bağlantı garantisi)
  if (connectPromise) {
    return connectPromise;
  }

  const hubUrl = `${HUB_BASE_URL}/hubs/task`;
  const newConnection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => accessToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.None)
    .build();

  // Sadece görev atandığında tetiklenir; durum güncellemesinde tetiklenmez
  newConnection.on('TaskAssigned', (task: TaskDto) => {
    currentCallback?.(task);
  });

  connectPromise = (async () => {
    await newConnection.start();
    connection = newConnection;
    connectPromise = null;
    return newConnection;
  })();

  return connectPromise;
}

/**
 * Bağlantıyı durdurur (logout veya unmount'ta çağrılmalı).
 */
export async function stopTaskHubConnection(): Promise<void> {
  connectPromise = null;
  currentCallback = null;
  if (connection) {
    await connection.stop();
    connection = null;
  }
}

/**
 * Bağlantı durumunu döndürür.
 */
export function getTaskHubConnection(): signalR.HubConnection | null {
  return connection;
}
