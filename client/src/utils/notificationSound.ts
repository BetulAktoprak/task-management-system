/**
 * Görev bildirimi için kısa, yumuşak bir zil sesi çalar (Web Audio API, harici dosya gerekmez).
 * Tarayıcı genelde kullanıcı etkileşimi sonrası ses çalmaya izin verir; sayfa ilk yüklendiğinde
 * otomatik çalma kısıtlaması olabilir.
 */
export function playNotificationSound(): void {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playTone(523.25, 0, 0.12);      // C5
    playTone(659.25, 0.14, 0.2);   // E5 (kısa “ding-dong”)
  } catch {
    // Ses API desteklenmiyorsa veya izin yoksa sessizce geç
  }
}
