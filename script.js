'use strict';

const openButton = document.getElementById('openInvitation');
const opening = document.getElementById('opening');

function openInvitation() {
  opening.classList.add('is-opening');
  window.setTimeout(() => {
    opening.classList.add('is-open');
    document.body.classList.remove('is-locked');
    opening.setAttribute('aria-hidden', 'true');
    opening.setAttribute('aria-modal', 'false');
    openButton.blur();
    document.querySelector('.topbar-link').focus({ preventScroll: true });
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520);
}
openButton.addEventListener('click', openInvitation);

// Solo se muestra la cantidad de días hasta la fecha, ya que la hora del evento no se ha confirmado.
function updateCountdown() {
  const parts = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const fields = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const today = Date.UTC(Number(fields.year), Number(fields.month) - 1, Number(fields.day));
  const event = Date.UTC(2026, 11, 26);
  const days = Math.round((event - today) / 86400000);
  const dayElement = document.getElementById('daysLeft');
  const label = document.getElementById('countdownLabel');
  dayElement.textContent = Math.max(days, 0).toLocaleString('es-MX');
  label.textContent = days > 0 ? (days === 1 ? 'DÍA PARA CELEBRAR' : 'DÍAS PARA CELEBRAR') :
    days === 0 ? '¡HOY ES EL GRAN DÍA!' : 'GRACIAS POR COMPARTIR ESTE DÍA';
}
updateCountdown();

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.09, rootMargin: '0px 0px -25px 0px' });
  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('visible'));
}

const rsvpForm = document.getElementById('rsvpForm');
const guestCountWrapper = document.getElementById('guestsWrap');
const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
attendanceRadios.forEach(radio => radio.addEventListener('change', () => {
  const isAttending = document.querySelector('input[name="attendance"]:checked').value === 'Sí asistiré';
  guestCountWrapper.hidden = !isAttending;
}));

rsvpForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!rsvpForm.reportValidity()) return;
  const name = document.getElementById('guestName').value.trim();
  if (!name) return;
  const attending = document.querySelector('input[name="attendance"]:checked').value;
  const guestCount = document.getElementById('guestCount').value;
  const message = attending === 'Sí asistiré'
    ? `Hola, soy ${name}. Confirmo mi asistencia a los XV años de Naiara Elizabeth el 26 de diciembre de 2026. Asistiremos ${guestCount} persona${guestCount === '1' ? '' : 's'}. ¡Muchas gracias por la invitación!`
    : `Hola, soy ${name}. Muchas gracias por la invitación a los XV años de Naiara Elizabeth. Lamentablemente no podré asistir. ¡Les deseo un día precioso!`;
  const url = `https://wa.me/524691419101?text=${encodeURIComponent(message)}`;
  // El invitado revisa y envía su mensaje en WhatsApp. Aquí no se almacena ningún dato.
  window.open(url, '_blank', 'noopener,noreferrer');
});
