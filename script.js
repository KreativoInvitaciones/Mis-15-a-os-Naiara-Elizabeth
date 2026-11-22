'use strict';

// FECHA CONFIRMADA: sábado 26 de diciembre de 2026.
const EVENT = { year: 2026, month: 12, day: 26, readable: '26 de diciembre de 2026' };
const opening = document.getElementById('opening');
const openButton = document.getElementById('openInvitation');
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const musicText = document.getElementById('musicText');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function reflectMusicState() {
  const playing = !backgroundMusic.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  musicText.textContent = playing ? 'Pausar' : 'Música';
}
backgroundMusic.addEventListener('play', reflectMusicState);
backgroundMusic.addEventListener('pause', reflectMusicState);

function startMusic() {
  backgroundMusic.volume = 0.55;
  const promise = backgroundMusic.play();
  if (promise && typeof promise.catch === 'function') promise.catch(() => reflectMusicState());
}

// La interacción de abrir habilita el audio en navegadores móviles.
openButton.addEventListener('click', () => {
  startMusic();
  opening.classList.add('is-opening');
  document.body.classList.remove('is-locked');
  window.setTimeout(() => {
    opening.setAttribute('aria-hidden', 'true');
    opening.setAttribute('aria-modal', 'false');
    const focusTarget = document.querySelector('.topbar-link');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }, prefersReducedMotion ? 0 : 850);
});

musicToggle.addEventListener('click', () => {
  if (backgroundMusic.paused) startMusic();
  else backgroundMusic.pause();
});
reflectMusicState();

function updateCountdown() {
  // Cuenta regresiva por DÍAS de calendario en el centro de México.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const f = Object.fromEntries(parts.map(x => [x.type, x.value]));
  const today = Date.UTC(Number(f.year), Number(f.month) - 1, Number(f.day));
  const event = Date.UTC(EVENT.year, EVENT.month - 1, EVENT.day);
  const days = Math.round((event - today) / 86400000);
  document.getElementById('daysLeft').textContent = Math.max(0, days).toLocaleString('es-MX');
  document.getElementById('countdownLabel').textContent = days > 1 ? 'DÍAS PARA CELEBRAR' : days === 1 ? 'DÍA PARA CELEBRAR' : days === 0 ? '¡HOY ES EL GRAN DÍA!' : 'GRACIAS POR COMPARTIR ESTE DÍA';
}
updateCountdown();

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.06, rootMargin: '0px 0px -16px 0px' });
  revealElements.forEach(el => observer.observe(el));
} else revealElements.forEach(el => el.classList.add('visible'));

const rsvpForm = document.getElementById('rsvpForm');
const guestsWrap = document.getElementById('guestsWrap');
const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
function updateGuests() {
  const yes = document.querySelector('input[name="attendance"]:checked').value === 'Sí asistiré';
  guestsWrap.hidden = !yes;
}
attendanceRadios.forEach(radio => radio.addEventListener('change', updateGuests));
updateGuests();
rsvpForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!rsvpForm.reportValidity()) return;
  const name = document.getElementById('guestName').value.trim();
  if (!name) return;
  const attendance = document.querySelector('input[name="attendance"]:checked').value;
  const number = document.getElementById('guestCount').value;
  const message = attendance === 'Sí asistiré'
    ? `Hola, soy ${name}. Confirmo mi asistencia a los XV años de Naiara Elizabeth el ${EVENT.readable}. Asistiremos ${number} persona${number === '1' ? '' : 's'}. ¡Muchas gracias por la invitación!`
    : `Hola, soy ${name}. Muchas gracias por la invitación a los XV años de Naiara Elizabeth. Lamentablemente no podré asistir. ¡Les deseo una celebración preciosa!`;
  const url = `https://wa.me/524691419101?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});
