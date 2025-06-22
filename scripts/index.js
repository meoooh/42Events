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
function convertDate(dateInput) {
  const d = new Date(dateInput);
  return (
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    "T" +
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0") +
    "00Z"
  );
}

/**
 * Adds a Google Calendar button to the event dialog.
 * @param {Object} eventObj - Event data.
 */
function addCalendarButton(eventObj) {
  const description =
    Array.from(jQuery.trim(eventObj.description).replaceAll('\r', ''))
      .slice(0, 200).join('') + '...\n\nSee Detail: ' +
    `https://profile.intra.42.fr/${eventObj.kind === "exam" ? "exams" : "events"}/${eventObj.id}`;

  const queryParams = new URLSearchParams({
    action: "TEMPLATE",
    dates: `${convertDate(eventObj.beginAt)}/${convertDate(eventObj.endAt)}`,
    details: description,
    location: eventObj.location,
    text: eventObj.name
  }).toString();

  $('.justify-end').prepend(
    `<a class="text-4xl" href="https://calendar.google.com/calendar/render?${queryParams}" target="_blank">📅</a>`
  );
}

// Main logic
waitForElement('.clear-both', () => {
  const appElement = document.getElementsByClassName("App")[0];
  const reactKey = Object.keys(appElement)[0];

  Array.from(document.getElementsByClassName("clear-both")).forEach((el) => {
    const elWithKey = el[reactKey];
    const ftEvent = elWithKey.child.dependencies.firstContext.memoizedValue.event;
    const beginAt = new Date(ftEvent.beginAt + 'Z');

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
