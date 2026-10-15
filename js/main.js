(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     Configuration
     ------------------------------------------------------------------------ */
  const CONFIG = Object.freeze({
    audioSrc: 'assets/musica.mp3',
    volume: 0.9,
    fadeMs: 1200,

    // Optional reply button. Country code + number, digits only (e.g. "573001234567").
    whatsapp: '',
    whatsappMessage: 'Hola, vi tu detalle 🙂'
  });

  const MESSAGES = Object.freeze({
    idle: 'Toca la taza para escuchar',
    playing: 'Toca de nuevo para pausar',
    error: 'No se pudo reproducir el audio'
  });

  /* ------------------------------------------------------------------------
     Elements
     ------------------------------------------------------------------------ */
  const page = document.getElementById('page');
  const cup = document.getElementById('cup');
  const hint = document.getElementById('hint');
  const reply = document.getElementById('reply');

  const audio = new Audio(CONFIG.audioSrc);
  audio.loop = true;
  audio.preload = 'auto';

  let fadeFrame = null;

  /* ------------------------------------------------------------------------
     Audio helpers
     ------------------------------------------------------------------------ */
  function fadeVolume(target, duration) {
    cancelAnimationFrame(fadeFrame);

    const from = audio.volume;
    const start = performance.now();

    return new Promise((resolve) => {
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        audio.volume = from + (target - from) * progress;

        if (progress < 1) {
          fadeFrame = requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      fadeFrame = requestAnimationFrame(step);
    });
  }

  function render(isPlaying) {
    page.classList.toggle('is-playing', isPlaying);
    cup.setAttribute('aria-pressed', String(isPlaying));
    cup.setAttribute('aria-label', isPlaying ? 'Pausar canción' : 'Reproducir canción');
    hint.textContent = isPlaying ? MESSAGES.playing : MESSAGES.idle;
  }

  async function play() {
    try {
      audio.volume = 0;
      await audio.play();
      render(true);
      fadeVolume(CONFIG.volume, CONFIG.fadeMs);
    } catch (error) {
      hint.textContent = MESSAGES.error;
    }
  }

  async function pause() {
    render(false);
    await fadeVolume(0, CONFIG.fadeMs / 2);
    audio.pause();
  }

  /* ------------------------------------------------------------------------
     Events
     ------------------------------------------------------------------------ */
  cup.addEventListener('click', () => (audio.paused ? play() : pause()));

  audio.addEventListener('error', () => {
    hint.textContent = MESSAGES.error;
  });

  // Pause quietly if the visitor leaves the tab.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audio.paused) {
      audio.pause();
      render(false);
    }
  });

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  render(false);

  if (CONFIG.whatsapp) {
    const text = encodeURIComponent(CONFIG.whatsappMessage);
    reply.href = `https://wa.me/${CONFIG.whatsapp}?text=${text}`;
    reply.hidden = false;
  }
})();