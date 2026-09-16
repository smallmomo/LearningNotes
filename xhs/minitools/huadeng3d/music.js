/* 本地合成的五声音阶背景曲，无需联网下载音频。 */
(() => {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  let context, master, timer, nextTime = 0, beat = 0, starting = false;
  const tempo = .58;
  const melody = [
    74,0,77,79,81,0,79,77, 74,0,72,69,72,0,0,0,
    72,0,74,77,79,0,77,74, 72,69,67,0,69,0,0,0,
    77,0,79,81,84,0,81,79, 77,0,74,72,74,0,0,0,
    79,0,77,74,72,0,69,67, 69,0,72,74,72,0,0,0
  ];
  const bass = [50,48,45,43,50,53,48,45];
  function note(midi, time, level, duration) {
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(level, time + .016);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    envelope.connect(master);
    const partials = [[1,1],[2,.24],[3,.07]];
    let ended = 0;
    partials.forEach(([multiple, volume]) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12) * multiple;
      gain.gain.value = volume;
      oscillator.connect(gain); gain.connect(envelope);
      oscillator.start(time); oscillator.stop(time + duration + .05);
      oscillator.onended = () => {
        oscillator.disconnect(); gain.disconnect();
        if (++ended === partials.length) envelope.disconnect();
      };
    });
  }
  function schedule() {
    if (context.state !== 'running' || document.hidden) return;
    if (nextTime < context.currentTime) nextTime = context.currentTime + .08;
    while (nextTime < context.currentTime + .2) {
      const pitch = melody[beat % melody.length];
      if (pitch) note(pitch, nextTime, .15, 2.5);
      if (beat % 8 === 0) note(bass[Math.floor(beat / 8) % bass.length], nextTime, .1, 4);
      beat++; nextTime += tempo;
    }
  }
  async function start() {
    if (starting || document.hidden) return;
    starting = true;
    try {
      if (!context) {
        context = new AudioEngine();
        master = context.createGain(); master.gain.value = .38;
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 2800;
        master.connect(filter); filter.connect(context.destination);
        // 轻回声增加余韵，避免持续铺底掩盖旋律。
        const delay = context.createDelay(1), echo = context.createGain();
        delay.delayTime.value = tempo * .75; echo.gain.value = .2;
        filter.connect(delay); delay.connect(echo); echo.connect(context.destination);
        context.onstatechange = () => {
          if (context.state === 'running' && !document.hidden) {
            if (!timer) timer = window.setInterval(schedule, 100);
            schedule();
          } else { clearInterval(timer); timer = null; }
        };
      }
      // 不等待被自动播放策略挂起的 Promise，保留首次交互重试能力。
      context.resume().then(() => {
        if (document.hidden) { context.suspend().catch(() => {}); return; }
        if (!timer) timer = window.setInterval(schedule, 100);
        schedule();
      }).catch(() => {});
    } catch { /* 不支持音频时仍可正常制作花灯。 */ }
    finally { starting = false; }
  }
  ['pointerdown', 'keydown'].forEach(event => document.addEventListener(event, () => {
    if (!context || context.state !== 'running') start();
  }, { passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    if (document.hidden) {
      clearInterval(timer); timer = null;
      context.suspend().catch(() => {});
    } else start();
  });
  start();
})();
