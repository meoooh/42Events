/**
 * Waits for an element to appear in the DOM, then runs a callback.
 * @param {string} selector - CSS selector for the element.
 * @param {Function} callback - Function to call when the element appears.
 */
function waitForElement(selector, callback) {
  const interval = setInterval(() => {
    const appElement = document.getElementsByClassName("App")[0];
    if (document.querySelector(selector) && appElement && Object.keys(appElement)[0]) {
      clearInterval(interval);
      callback();
    }
  }, 100);
}

/**
 * Converts a date string to the format YYYYMMDDTHHmm00Z for Google Calendar.
 * @param {string|Date} dateInput
 * @returns {string}
 */
function convertDate(date) {
  // Google Calendar expects UTC times with Z suffix
  // The date object is already in local time, getUTC methods will give us the correct UTC values
  date = new Date(date + 'Z');
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

/** Parse API timestamps as UTC unless an explicit timezone is present. */
function parseEventDate(value) {
  if (typeof value !== 'string' || !value.trim()) return new Date(NaN);
  return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : value + 'Z');
}

/** Emphasize the start/end times in the existing dialog date line. */
function updateDialogTime(eventObj) {
  const dialog = document.querySelector('div[role="dialog"]');
  const dateLine = dialog?.querySelector('h4')?.nextElementSibling;
  const start = parseEventDate(eventObj.beginAt);
  const end = parseEventDate(eventObj.endAt);
  if (!dateLine || !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) || end < start) return;

  // Leave hour12/hourCycle unset so the browser's user preferences apply.
  const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const sameDay = start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() && start.getDate() === end.getDate();
  const range = document.createElement('strong');
  range.style.cssText = 'font-weight:700;font-size:16px;font-variant-numeric:tabular-nums';
  range.textContent = sameDay ? `${time.format(start)}–${time.format(end)}` :
    `${time.format(start)}–${date.format(end)} ${time.format(end)}`;
  dateLine.replaceChildren(document.createTextNode(`${date.format(start)} · `), range);
}

/** Show the dialog's permalink without navigating away from the list. */
const dialogUrlSessions = new WeakMap();
function syncDialogUrl(dialog, permalink) {
  if (dialogUrlSessions.has(dialog)) return;
  const originalUrl = window.location.href;
  const originalState = window.history.state;
  // History URLs must stay on the current origin, including profile-v3.
  const dialogUrl = new URL(new URL(permalink).pathname, window.location.origin).href;
  window.history.replaceState(originalState, '', dialogUrl);
  currentUrl = dialogUrl;

  const observer = new MutationObserver(() => {
    if (dialog.isConnected && dialog.getAttribute('data-state') !== 'closed') return;
    observer.disconnect();
    dialogUrlSessions.delete(dialog);
    // Do not undo a real navigation that happened while the dialog was open.
    if (window.location.href === dialogUrl) {
      window.history.replaceState(originalState, '', originalUrl);
      currentUrl = originalUrl;
    }
  });
  dialogUrlSessions.set(dialog, observer);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-state'] });
}

/**
 * Adds a Google Calendar button to the event dialog.
 * @param {Object} eventObj - Event data.
 */
function addCalendarButton(eventObj) {
  updateDialogTime(eventObj);
  const dialog = document.querySelector('div[role="dialog"]');
  if (!dialog) return;
  const permalink = `https://profile.intra.42.fr/${eventObj.kind === 'exam' ? 'exams' : 'events'}/${encodeURIComponent(eventObj.id)}`;
  syncDialogUrl(dialog, permalink);
  const heading = dialog.querySelector('h4');
  if (heading) {
    let titleLink = heading.querySelector('.event-permalink-42events');
    if (!titleLink) {
      titleLink = document.createElement('a');
      titleLink.className = 'event-permalink-42events';
      titleLink.style.cssText = 'color:inherit;text-decoration:none;cursor:pointer';
      titleLink.append(...heading.childNodes);
      heading.append(titleLink);
    }
    titleLink.href = permalink;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
  }
  const description =
    Array.from(jQuery.trim(eventObj.description).replaceAll('\r', ''))
      .slice(0, 200).join('') + '...\n\nSee Detail: ' +
    permalink;

  const queryParams = new URLSearchParams({
    action: "TEMPLATE",
    dates: `${convertDate(eventObj.beginAt)}/${convertDate(eventObj.endAt)}`,
    details: description,
    location: eventObj.location,
    text: eventObj.name
  }).toString();

  const footer = dialog.querySelector('.justify-end');
  if (!footer) return;
  footer.querySelector('.event-actions-42events')?.remove();
  const actions = document.createElement('span');
  actions.className = 'event-actions-42events';
  actions.style.cssText = 'display:inline-flex;align-items:center;gap:8px';
  const calendarLink = document.createElement('a');
  calendarLink.className = 'text-4xl';
  calendarLink.href = `https://calendar.google.com/calendar/render?${queryParams}`;
  calendarLink.target = '_blank';
  calendarLink.rel = 'noopener noreferrer';
  calendarLink.textContent = '📅';
  calendarLink.setAttribute('aria-label', 'Add to Google Calendar');
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'text-4xl';
  copyButton.style.cssText = 'cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:1.2em;height:1.2em';
  copyButton.textContent = '🔗';
  copyButton.title = 'Copy permalink';
  copyButton.setAttribute('aria-label', 'Copy permalink');
  let feedbackTimer;
  copyButton.addEventListener('click', async () => {
    clearTimeout(feedbackTimer);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      copyButton.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(0.85)' }, { transform: 'scale(1)' }],
        { duration: 180, easing: 'ease-out' }
      );
    }
    try {
      await navigator.clipboard.writeText(permalink);
      copyButton.textContent = '✅';
      copyButton.title = 'Permalink copied';
      copyButton.setAttribute('aria-label', 'Permalink copied');
    } catch (error) {
      copyButton.textContent = '🔗';
      copyButton.title = 'Could not copy permalink. Please try again.';
      copyButton.setAttribute('aria-label', copyButton.title);
    }
    feedbackTimer = setTimeout(() => {
      copyButton.textContent = '🔗';
      copyButton.title = 'Copy permalink';
      copyButton.setAttribute('aria-label', 'Copy permalink');
    }, 500);
  });
  actions.append(copyButton, calendarLink);
  footer.prepend(actions);
}

/**
 * Parses date and duration text to create start and end dates
 * @param {string} dateText - Text like "August 20, 2025 at 17:00"
 * @param {string} durationText - Text like "for about 2 hours"
 * @returns {object} - Object with startDate and endDate
 */
function parseDateAndDuration(dateText, durationText) {
  // Parse the date text
  const dateMatch = dateText.match(/(\w+ \d+, \d+) at (\d+):(\d+)/);
  if (!dateMatch) return null;

  const [, datePart, hours, minutes] = dateMatch;
  // Parse the date properly with timezone offset for CET/CEST
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // Extract month, day, year from datePart
  const datePartMatch = datePart.match(/(\w+) (\d+), (\d+)/);
  if (!datePartMatch) return null;

  const [, monthName, day, year] = datePartMatch;
  const monthIndex = monthNames.indexOf(monthName);
  if (monthIndex === -1) return null;

  // Create date as UTC directly (17:00 CEST = 15:00 UTC)
  // We subtract 2 hours from CEST to get UTC
  const startDate = new Date(Date.UTC(
    parseInt(year),
    monthIndex,
    parseInt(day),
    parseInt(hours) - 2, // CEST is UTC+2
    parseInt(minutes),
    0
  ));

  // Parse duration text
  const durationMatch = durationText.match(/for\s+about\s+(\d+)\s+hours?/);
  let durationHours = 1; // default 1 hour
  if (durationMatch) {
    durationHours = parseInt(durationMatch[1], 10);
  }

  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  return { startDate, endDate };
}

/**
 * Adds Google Calendar button for exams/events pages
 */
function addCalendarButtonForDetailPage() {
  // Only run on exams/events pages
  if (!window.location.href.includes('/exams/') && !window.location.href.includes('/events/')) {
    return;
  }

  const addButton = () => {
    // Check if already added
    if ($('#calendar-link-42events').length > 0) {
      return;
    }

    // Find Subscribe button exactly as shown
    const subscribeBtn = $('a[href*="/events_users"]:contains("Subscribe")');

    if (subscribeBtn.length === 0) {
      return;
    }

    // Extract event data
    const title = $('h4').text().trim() || 'Event';
    const dateText = $('small').text().trim();
    const description = $('.pb-6.break-words').text().trim() || '';
    const location = 'FabLab (Dirt Lab)';

    // Parse date
    const dateMatch = dateText.match(/(\w+ \d+, \d+ at \d+:\d+)/);
    const dateStr = dateMatch ? dateMatch[1] : '';
    const durationMatch = dateText.match(/for about (\d+) hours?/);
    const durationText = durationMatch ? durationMatch[0] : 'for about 2 hours';

    const dateInfo = parseDateAndDuration(dateStr, durationText);

    // Format for Google Calendar
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    // Build calendar URL
    const queryParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDate(dateInfo.startDate)}/${formatDate(dateInfo.endDate)}`,
      details: description,
      location: location
    }).toString();

    // Insert calendar emoji link right before Subscribe button
    subscribeBtn.before(`<a id="calendar-link-42events" class="btn" href="https://calendar.google.com/calendar/render?${queryParams}" target="_blank" style="font-size: 2.5em;" title="Add to Google Calendar">📅</a>`);

    console.log('Calendar button added!');
  };

  // Try adding button with retries
  $(document).ready(() => {
    addButton();
    setTimeout(addButton, 500);
    setTimeout(addButton, 1000);
    setTimeout(addButton, 2000);
  });
}

// Main logic for event list pages
waitForElement('.clear-both', () => {
  const appElement = document.getElementsByClassName("App")[0];
  const reactKey = Object.keys(appElement)[0];

  Array.from(document.getElementsByClassName("clear-both")).forEach((el) => {
    const elWithKey = el[reactKey];
    const ftEvent = elWithKey.child.dependencies.firstContext.memoizedValue.event;
    const beginAt = new Date(ftEvent.beginAt + 'Z');

    // Emphasize the registration badge in the event list.
    const statusBadge = el.querySelector(':scope > .absolute.uppercase');
    if (statusBadge?.textContent.trim().toLowerCase() === 'registered') {
      statusBadge.textContent = `✅ ${statusBadge.textContent.trim()}`;
      statusBadge.style.fontWeight = '700';
    }

    // Attach click handler to open dialog and add calendar button
    $('button.text-white[aria-haspopup="dialog"]').off().on('click', (event) => {
      const thisEvent = $(event.target).parent().parent()[0][reactKey]
        .child.dependencies.firstContext.memoizedValue.event;

      const dialogInterval = setInterval(() => {
        if (document.querySelector('div[role="dialog"]')) {
          clearInterval(dialogInterval);
          addCalendarButton(thisEvent);
        }
      }, 100);
    });

    // Display local time in the event element
    const localTime = beginAt.toLocaleTimeString(undefined, {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: "2-digit",
      minute: "2-digit"
    });

    el.querySelector("div.w-20.pt-2.pb-4.flex-shrink-0").innerHTML +=
      `<div class="font-bold">${localTime}</div>`;
  });
});

// Add calendar button for detail pages (exams/events)
console.log('42Events Extension Loaded');
console.log('Initial URL:', window.location.href);

// Run immediately and also after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCalendarButtonForDetailPage);
} else {
  addCalendarButtonForDetailPage();
}

// Also run when URL changes (for SPA navigation)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    console.log('URL changed from', currentUrl, 'to', window.location.href);
    currentUrl = window.location.href;
    setTimeout(addCalendarButtonForDetailPage, 500);
  }
}, 1000);
