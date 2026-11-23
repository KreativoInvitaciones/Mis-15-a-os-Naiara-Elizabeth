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
let invitationHasOpened = false;
openButton.addEventListener('click', () => {
  if (invitationHasOpened) return;
  invitationHasOpened = true;
  // Keep music.play() inside the user gesture for mobile Safari/Chrome.
  startMusic();
  openButton.disabled = true;
  opening.classList.add('magic-opening');
  // The wax seal flashes with tiny stars, then the invitation unfolds.
  window.setTimeout(() => {
    opening.classList.add('is-opening');
    document.body.classList.remove('is-locked');
    window.setTimeout(() => {
      opening.setAttribute('aria-hidden', 'true');
      opening.setAttribute('aria-modal', 'false');
      const focusTarget = document.querySelector('.topbar-link');
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    }, prefersReducedMotion ? 0 : 850);
  }, prefersReducedMotion ? 0 : 560);
});

musicToggle.addEventListener('click', () => {
  if (backgroundMusic.paused) startMusic();
  else backgroundMusic.pause();
});
reflectMusicState();

// Cuenta regresiva real: 26 de diciembre de 2026, 13:00 (hora de Pénjamo / centro de México).
const EVENT_START_MS = Date.parse('2026-12-26T13:00:00-06:00');
const EVENT_DAY_START_MS = Date.parse('2026-12-26T00:00:00-06:00');
const EVENT_DAY_END_MS = Date.parse('2026-12-27T00:00:00-06:00');
const timerValues = {
  days: document.getElementById('daysLeft'),
  hours: document.getElementById('hoursLeft'),
  minutes: document.getElementById('minutesLeft'),
  seconds: document.getElementById('secondsLeft'),
};
const countdownLabel = document.getElementById('countdownLabel');
function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, EVENT_START_MS - now);
  const wholeSeconds = Math.floor(diff / 1000);
  const days = Math.floor(wholeSeconds / 86400);
  const hours = Math.floor((wholeSeconds % 86400) / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = wholeSeconds % 60;
  timerValues.days.textContent = String(days);
  timerValues.hours.textContent = String(hours).padStart(2, '0');
  timerValues.minutes.textContent = String(minutes).padStart(2, '0');
  timerValues.seconds.textContent = String(seconds).padStart(2, '0');
  if (now >= EVENT_START_MS && now < EVENT_DAY_END_MS) countdownLabel.textContent = '¡Hoy celebramos los XV años de Naiara!';
  else if (now >= EVENT_DAY_END_MS) countdownLabel.textContent = 'Gracias por ser parte de este día especial';
  else if (now >= EVENT_DAY_START_MS) countdownLabel.textContent = '¡Hoy es el gran día!';
  else countdownLabel.textContent = 'Faltan para comenzar la ceremonia';
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

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
const adultCount = document.getElementById('adultCount');
const childCount = document.getElementById('childCount');
const guestTotal = document.getElementById('guestTotal');
const guestCountError = document.getElementById('guestCountError');

function getGuestCounts() {
  return {
    adults: adultCount.valueAsNumber,
    children: childCount.valueAsNumber,
  };
}

function hasValidCounts() {
  const { adults, children } = getGuestCounts();
  return Number.isInteger(adults) && Number.isInteger(children) &&
    adults >= 0 && children >= 0 && adults <= 99 && children <= 99 &&
    adults + children > 0;
}

function updateGuestSummary() {
  const { adults, children } = getGuestCounts();
  const total = Number.isFinite(adults) && Number.isFinite(children)
    ? adults + children : 0;
  guestTotal.textContent = `${total} persona${total === 1 ? '' : 's'}`;
  guestCountError.hidden = true;
}

function updateGuests() {
  const attending = document.querySelector('input[name="attendance"]:checked').value === 'Sí asistiré';
  guestsWrap.hidden = !attending;
  // Los números no se validan cuando el invitado rechaza la invitación.
  adultCount.disabled = !attending;
  childCount.disabled = !attending;
  if (attending) updateGuestSummary();
}

attendanceRadios.forEach(radio => radio.addEventListener('change', updateGuests));
adultCount.addEventListener('input', updateGuestSummary);
childCount.addEventListener('input', updateGuestSummary);
updateGuestSummary();
updateGuests();

rsvpForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!rsvpForm.reportValidity()) return;
  const name = document.getElementById('guestName').value.trim();
  if (!name) return;
  const attendance = document.querySelector('input[name="attendance"]:checked').value;
  let message;

  if (attendance === 'Sí asistiré') {
    if (!hasValidCounts()) {
      guestCountError.hidden = false;
      adultCount.focus();
      return;
    }
    const { adults, children } = getGuestCounts();
    const total = adults + children;
    message = `Hola, soy ${name}. Confirmo mi asistencia a los XV años de Naiara Elizabeth el ${EVENT.readable}. ` +
      `Asistiremos ${total} persona${total === 1 ? '' : 's'}: ` +
      `${adults} adulto${adults === 1 ? '' : 's'} y ${children} niño${children === 1 ? '' : 's'}. ` +
      `¡Muchas gracias por la invitación!`;
  } else {
    message = `Hola, soy ${name}. Muchas gracias por la invitación a los XV años de Naiara Elizabeth. ` +
      `Lamentablemente no podré asistir. ¡Les deseo una celebración preciosa!`;
  }
  const url = `https://wa.me/524691429101?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});
