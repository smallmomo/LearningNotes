/* 柔和古风背景音乐：五声音阶、低音铺底、轻古琴与箫感旋律。 */
(() => {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;

  let ctx;
  let master;
  let scheduleTimer = null;
  let nextTime = 0;
  let step = 0;
  let starting = false;

  const beatLength = 0.92;
  const scheduleAhead = 0.45;
  const lookaheadMs = 120;

  // D 宫五声音阶，避免半音摩擦，听感更古风、更稳。
  const melody = [
    62, 0, 64, 67, 69, 0, 67, 64,
    62, 0, 57, 60, 62, 0, 0, 0,
    64, 0, 67, 69, 72, 0, 69, 67,
    64, 62, 60, 0, 57, 0, 0, 0,
    57, 0, 60, 62, 64, 0, 62, 60,
    57, 0, 55, 57, 60, 0, 0, 0,
    62, 0, 64, 67, 69, 0, 72, 69,
    67, 64, 62, 0, 57, 0, 0, 0,
  ];
  const bass = [38, 45, 41, 43, 38, 45, 48, 43];
  const fluteAnswer = [0, 0, 0, 0, 74, 72, 69, 0, 67, 0, 69, 72, 69, 0, 0, 0];

  function midiToFreq(midi) {
    return 440 * 2 ** ((midi - 69) / 12);
  }

  function makeGain(value, destination) {
    const gain = ctx.createGain();
    gain.gain.value = value;
    gain.connect(destination);
    return gain;
  }

  function softPluck(midi, time, level = 0.055, duration = 2.8) {
    const output = makeGain(1, master);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(980, time);
    filter.Q.value = 0.35;
    output.disconnect();
    output.connect(filter);
    filter.connect(master);

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(level, time + 0.055);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    envelope.connect(output);

    const partials = [
      [1, 1, 'triangle'],
      [2, 0.18, 'sine'],
      [3, 0.05, 'sine'],
    ];

    let ended = 0;
    partials.forEach(([multiple, volume, type]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = midiToFreq(midi) * multiple;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(envelope);
      osc.start(time);
      osc.stop(time + duration + 0.08);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        if (++ended === partials.length) {
          envelope.disconnect();
          output.disconnect();
          filter.disconnect();
        }
      };
    });
  }

  function softFlute(midi, time, level = 0.024, duration = 3.2) {
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(level, time + 0.5);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    envelope.connect(master);

    const vibrato = ctx.createOscillator();
    const vibratoDepth = ctx.createGain();
    vibrato.type = 'sine';
    vibrato.frequency.value = 4.2;
    vibratoDepth.gain.value = 2.1;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = midiToFreq(midi);
    vibrato.connect(vibratoDepth);
    vibratoDepth.connect(osc.frequency);
    osc.connect(envelope);
    vibrato.start(time);
    osc.start(time);
    vibrato.stop(time + duration + 0.08);
    osc.stop(time + duration + 0.08);
    osc.onended = () => {
      vibrato.disconnect();
      vibratoDepth.disconnect();
      osc.disconnect();
      envelope.disconnect();
    };
  }

  function lowDrone(midi, time, level = 0.035, duration = 7.2) {
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(level, time + 0.8);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    envelope.connect(master);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = midiToFreq(midi);
    osc.connect(envelope);
    osc.start(time);
    osc.stop(time + duration + 0.1);
    osc.onended = () => {
      osc.disconnect();
      envelope.disconnect();
    };
  }

  function schedule() {
    if (!ctx || ctx.state !== 'running' || document.hidden) return;
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.08;

    while (nextTime < ctx.currentTime + scheduleAhead) {
      const melodyNote = melody[step % melody.length];
      if (melodyNote) {
        softPluck(melodyNote, nextTime, step % 8 === 0 ? 0.062 : 0.048, 2.7);
      }

      if (step % 8 === 0) {
        lowDrone(bass[Math.floor(step / 8) % bass.length], nextTime, 0.03, beatLength * 8.5);
      }

      const answerNote = fluteAnswer[step % fluteAnswer.length];
      if (answerNote && step % 32 >= 16) {
        softFlute(answerNote, nextTime + beatLength * 0.18, 0.018, 3.4);
      }

      step += 1;
      nextTime += beatLength;
    }
  }

  function stopScheduling() {
    if (scheduleTimer) {
      window.clearInterval(scheduleTimer);
      scheduleTimer = null;
    }
  }

  function beginScheduling() {
    if (!scheduleTimer) scheduleTimer = window.setInterval(schedule, lookaheadMs);
    schedule();
  }

  function setupGraph() {
    ctx = new AudioEngine();
    master = ctx.createGain();
    master.gain.value = 0.16;

    const toneSoftener = ctx.createBiquadFilter();
    toneSoftener.type = 'lowpass';
    toneSoftener.frequency.value = 1450;
    toneSoftener.Q.value = 0.2;

    const delay = ctx.createDelay(2.4);
    const echo = ctx.createGain();
    delay.delayTime.value = 0.72;
    echo.gain.value = 0.12;

    master.connect(toneSoftener);
    toneSoftener.connect(ctx.destination);
    toneSoftener.connect(delay);
    delay.connect(echo);
    echo.connect(ctx.destination);

    ctx.onstatechange = () => {
      if (ctx.state === 'running' && !document.hidden) beginScheduling();
      else stopScheduling();
    };
  }

  function start() {
    if (starting || document.hidden) return;
    starting = true;
    try {
      if (!ctx) setupGraph();
      ctx.resume().then(() => {
        if (document.hidden) {
          ctx.suspend().catch(() => {});
          return;
        }
        beginScheduling();
      }).catch(() => {});
    } catch (e) {
      // 不支持 Web Audio 时不影响花灯制作。
    } finally {
      starting = false;
    }
  }

  ['pointerdown', 'keydown'].forEach(event => {
    document.addEventListener(event, () => {
      if (!ctx || ctx.state !== 'running') start();
    }, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) {
      stopScheduling();
      ctx.suspend().catch(() => {});
    } else {
      start();
    }
  });

  start();
})();
