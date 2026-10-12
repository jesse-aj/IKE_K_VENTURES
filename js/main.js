/**
 * IKE K VENTURES — main.js
 * Simple vanilla JS for:
 *  1. Staff shift phone rotation (when ready)
 *  2. Live Ghana GMT open/closed status
 *  3. Mobile menu toggle (with outside-click, Escape, and resize handling)
 *  4. Current year in footer
 */

'use strict';

const SHIFT_CONFIG = {
  /*
   * To rotate staff phone numbers by time of day, uncomment and edit:
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

  const heroStatus = document.getElementById('js-open-status');
  if (heroStatus) {
    if (isOpen) {
      heroStatus.textContent = `Open Now (Closes ${closesAt}) · Opposite Apremdo Market, Takoradi`;
    } else {
      const nextOpen = isSunday ? 'Opens today at 1:00 PM' : `Opens ${opensAt}`;
      heroStatus.textContent = `Currently Closed (${nextOpen}) · Opposite Apremdo Market, Takoradi`;
    }
  }

  const hoursStatus = document.getElementById('js-hours-status');
  if (hoursStatus) {
    if (isOpen) {
      hoursStatus.textContent = `Open right now — closes at ${closesAt} today (Ghana time).`;
    } else {
      hoursStatus.textContent = `Currently closed. Regular hours: Mon–Sat 8:00 AM–9:00 PM, Sun 1:00 PM–9:00 PM.`;
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
    if (link.classList.contains('header-cta')) {
      link.textContent = `Call ${activeNumber}`;
    } else if (link.classList.contains('hero-card__tel')) {
      link.textContent = activeNumber;
    }
  });
}

function initMobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    toggle.textContent = open ? 'Close' : 'Menu';
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

  document.addEventListener('click', (e) => {
    const header = document.querySelector('.site-header');
    if (header && !header.contains(e.target) && nav.classList.contains('is-open')) {
      setOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 860 && nav.classList.contains('is-open')) {
      setOpen(false);
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
