/**
 * IKE K VENTURES — main.js
 * Vanilla JavaScript:
 *  1. Shift rotation config (ready for multiple staff numbers)
 *  2. Live Ghana GMT+0 Open/Closed ledger status (without AI dot markers)
 *  3. Mobile MENU / CLOSE toggle
 *  4. Copyright year
 */

'use strict';

const SHIFT_CONFIG = {
  /*
   * When staff phone rotation is ready, uncomment and add shift numbers:
   * shifts: [
   *   { label: 'Morning',   startsAt: 8,  number: '+233 XX XXX XXXX', href: 'tel:+233XXXXXXXXXX' },
   *   { label: 'Afternoon', startsAt: 14, number: '+233 XX XXX XXXX', href: 'tel:+233XXXXXXXXXX' },
   *   { label: 'Evening',   startsAt: 18, number: '+233 XX XXX XXXX', href: 'tel:+233XXXXXXXXXX' },
   * ],
   */
  defaultNumber: '+233 20 911 4636',
  defaultHref:   'tel:+233209114636',
};

const HOURS = {
  weekday: { open: 8, close: 21 },  // Mon–Sat: 8:00 AM – 9:00 PM
  sunday:  { open: 13, close: 21 }, // Sun:     1:00 PM – 9:00 PM
};

function getGhanaTime() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const ghanaDate = new Date(utcMs);
  return {
    day:    ghanaDate.getDay(),
    hour:   ghanaDate.getHours(),
    minute: ghanaDate.getMinutes(),
  };
}

function getOpenStatus() {
  const { day, hour, minute } = getGhanaTime();
  const isSunday = day === 0;
  const schedule = isSunday ? HOURS.sunday : HOURS.weekday;

  const currentMinutes = hour * 60 + minute;
  const openMinutes    = schedule.open  * 60;
  const closeMinutes   = schedule.close * 60;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  const fmt = (h) => {
    const period = h < 12 ? 'AM' : 'PM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${period}`;
  };

  return {
    isOpen,
    opensAt:  fmt(schedule.open),
    closesAt: fmt(schedule.close),
    isSunday,
  };
}

function renderOpenStatus() {
  const { isOpen, opensAt, closesAt, isSunday } = getOpenStatus();

  const utilityStatus = document.getElementById('js-open-status');
  if (utilityStatus) {
    if (isOpen) {
      utilityStatus.innerHTML = `<span class="ledger-bar__key">STATUS:</span> <span class="status-tag--open">[OPEN NOW — CLOSES ${closesAt} GMT]</span>`;
    } else {
      const nextOpen = isSunday ? 'OPENS TODAY 1:00 PM' : `OPENS ${opensAt} GMT`;
      utilityStatus.innerHTML = `<span class="ledger-bar__key">STATUS:</span> <span class="status-tag--closed">[CLOSED — ${nextOpen}]</span>`;
    }
  }

  const hoursStatus = document.getElementById('js-hours-status');
  if (hoursStatus) {
    if (isOpen) {
      hoursStatus.textContent = `CURRENT STATUS: OPEN NOW (CLOSES AT ${closesAt} GHANA TIME)`;
    } else {
      hoursStatus.textContent = `CURRENT STATUS: CLOSED right now. Regular hours: Mon–Sat 8 AM–9 PM, Sun 1 PM–9 PM.`;
    }
  }
}

function renderActiveNumber() {
  const { hour } = getGhanaTime();
  const { shifts, defaultNumber, defaultHref } = SHIFT_CONFIG;

  let activeNumber = defaultNumber;
  let activeHref   = defaultHref;

  if (Array.isArray(shifts) && shifts.length > 0) {
    const { isOpen } = getOpenStatus();
    if (isOpen) {
      const sorted = [...shifts].sort((a, b) => a.startsAt - b.startsAt);
      let active = sorted[0];
      for (const shift of sorted) {
        if (hour >= shift.startsAt) active = shift;
      }
      activeNumber = active.number;
      activeHref   = active.href;
    }
  }

  const numberEl = document.getElementById('js-active-number');
  if (numberEl) numberEl.textContent = activeNumber;

  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.href = activeHref;
  });
}

function initMobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  const labelEl = toggle.querySelector('.nav-toggle__label');

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (labelEl) labelEl.textContent = open ? 'CLOSE' : 'MENU';
    nav.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isExpanded);
  });

  nav.querySelectorAll('.site-nav__link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

function renderYear() {
  const yearEl = document.getElementById('js-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function init() {
  renderOpenStatus();
  renderActiveNumber();
  renderYear();
  initMobileNav();
  setInterval(renderOpenStatus, 60 * 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
