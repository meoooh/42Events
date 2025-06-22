
function waitForElement(selector, callback) {
  const interval = setInterval(() => {
    if (document.querySelector(selector) && Object.keys(document.getElementsByClassName("App")[0])[0]) {
      clearInterval(interval);
      callback();
    }
  }, 100); // 100ms마다 체크
}

function convertDate(d) {
  d = new Date(d);
  return d.getFullYear() + (d.getMonth() + 1).toString().padStart(2, "0") + d.getDate().toString().padStart(2, "0") +
            'T' + d.getHours().toString().padStart(2, "0") + d.getMinutes().toString().padStart(2, "0") + "00Z"
}

function addCalButton(ft_event) {

  description = Array.from( jQuery.trim(ft_event.description).replaceAll('\r', '')).slice(0, 200).join('') + '...\n\nSee Detail: '
                  + "https://profile.intra.42.fr/"+ (ft_event.kind == "exam" ? "exams" : "events") + "/" + ft_event.id
  // // https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20250622T144500Z%2F20250622T144500Z&details=description&location=4c&text=title
  query_params_obj = {
    action: "TEMPLATE",
    dates: (convertDate(ft_event.beginAt) + '/' + convertDate(ft_event.endAt)),
    details: description,
    location: ft_event.location,
    text: ft_event.name
  };
  query_params = new URLSearchParams(query_params_obj).toString();
  $('.justify-end').prepend("<a class=\"text-4xl\" href=\"https://calendar.google.com/calendar/render?" + query_params + "\" target=\"_blank\">📅</a>")
  // document.querySelector('[role="dialog"]').querySelector('.justify-end').innerHTML = "<a class=\"text-4xl\" href=\"https://calendar.google.com/calendar/render?" + query_params + "\" target=\"_blank\">📅</a>" + document.querySelector('[role="dialog"]').querySelector('.justify-end').innerHTML;
}

waitForElement('.clear-both', (interval) => {

  const react_key = Object.keys(document.getElementsByClassName("App")[0])[0];

  Array.from(document.getElementsByClassName("clear-both")).forEach( (el, _) => {
    el_with_key = el[react_key];
    ft_event = el_with_key.child.dependencies.firstContext.memoizedValue.event;
    beginAt = new Date(ft_event.beginAt+'Z');


$('button.text-white[aria-haspopup="dialog"]').off().on('click', (event) => {
  this_event = $(event.target).parent().parent()[0][react_key].child.dependencies.firstContext.memoizedValue.event;

  const interval = setInterval(() => {
    if (document.querySelector('div[role="dialog"]')) {
      clearInterval(interval);
      addCalButton(this_event);
    }
  }, 100);

});

    // $(el).on('click', () => {
    //   $(this).
    // });

    converted = beginAt.toLocaleTimeString(
      void 0,
      {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          hour: "2-digit",
          minute: "2-digit"
      }
    );

    el.querySelector("div.w-20.pt-2.pb-4.flex-shrink-0").innerHTML
      += ("<div class=\"font-bold\">" + converted + "</div>");
  });
});
