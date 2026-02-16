export enum TaskStatus {
  ToDo = 0,
  InProgress = 1,
  Done = 2,
}

export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId: number;
  projectName: string;
  assignedUserId?: number;
  assignedUserName?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: number;
  status: TaskStatus;
  assignedUserId?: number;
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  status: TaskStatus;
}

export interface AssignTaskDto {
  assignedUserId?: number;
}
