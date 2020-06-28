function skip(button, inner_text, observer) {
  let buttons = document.querySelectorAll(button);

  // Confirm we aren't about to click on something we don't intend to.
  for(let i = 0;i < buttons.length; ++i) {
    if (buttons[i].innerText === inner_text) {
      if (observer !== undefined) {
        observer.disconnect(); // with mission accomplished, deactivate observer
      }

      buttons[i].click();
    }
  }
}

function go(observer) {
  switch (window.location.hostname) {
  case 'delivery.cardago.com':
    skip('.btn_base', 'READY TO OPEN YOUR GIFT CARD?', observer);
    break;
  case 'www.paypal.com':
    skip('[data-pa-click]', 'Skip', observer);
    break;
  }
}

function configure_dom_observer(id_to_observe) {
  // Select the node that will be observed for mutations
  let targetNode = document.getElementById(id_to_observe);

  // Options for the observer (which mutations to observe)
  const config = { childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = function(mutationsList, obs) {
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        go(obs);
      }
    }
  };

  let observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}

function init() {
  // Assume that the user will want to extract the info and prepare for it.
  add_extraction_listener();

  switch (window.location.hostname) {
    case 'delivery.cardago.com':
      configure_dom_observer('content-main');
      break;
    case 'www.paypal.com':
      configure_dom_observer('root');
      break;
  }

  go();
}

// If for some reason there are two divs that match the pattern we expect for
// this specific info (whether number/pin/val), then just mark the info as
// unsure so that the user can be informed and can confirm if the numbers that
// we display match the information they see.
function assign_gc_info(info, extracted, to_change) {
  switch (to_change) {
    case 'pin':
      if(info.pin !== "")
        info.unsure = true;
      info.pin = extracted;
      break;
    case 'num':
      if(info.number !== "")
        info.unsure = true;
      info.number = extracted;
      break;
    case 'val':
      if(info.value !== "")
        info.unsure = true;
      info.value = extracted;
  }
}

function add_extraction_listener() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let gc_info = {
      number: "",
      pin: "",
      value: "",
      unsure: false
    }

    switch (window.location.hostname) {
      case 'www.paypal.com':
        // GC number and pin are both in divs with the same classes on PPDG, so
        // just get all of those divs then slice off the appropriate amont of
        // the inner text for the number or pin.
        let num_and_pin = document.querySelectorAll('.e1qejv266');
        for(let num_or_pin of num_and_pin) {
          if(num_or_pin.innerText.includes('CARD NUMBER'))
            assign_gc_info(gc_info, num_or_pin.innerText.slice(12), 'num');
          else if(num_or_pin.innerText.includes('PIN'))
            assign_gc_info(gc_info, num_or_pin.innerText.slice(4), 'pin');
        }

        let value = document.querySelectorAll('.e1qejv263');
        for(let val of value) {
          if(val.innerText.includes('$'))
            assign_gc_info(gc_info, val.innerText.slice(1), 'val');
        }
        break;

      case 'www.vcdelivery.com':
        // This website has divs with classes like |gift-card-number| and |pin|,
        // but not every GC actually puts the expected value in those divs for
        // whatever reason. However, |item-info| div contains all of that and
        // the value of the GC, with line breaks between every piece of info,
        // so just grab that div and split it by line breaks instead.
        //
        // Some key assumptions are made here that may not be true of every
        // GC on vcdelivery:
        // 1. Value will always be on the first line and in "$XXX.XX" format
        //    (i.e. also have both a $ and a decimal point)
        // 2. PIN will always be on the last line after the final whitespace.
        // 3. GC number will be after the first line and before the last line,
        //    contain ONLY numbers, and be at least 8 digits in length.
        // 4. Number, PIN, and value will all be on their own lines.
        // #3 in particular could potentially cause issues - at the very least,
        // extraction WILL NOT work for iTunes, Amazon, or Xbox Live GC from
        // MGCP. Since these brands are rarely on sale from MGCP (IME), it
        // seemed acceptable to ignore those for the time being.
        let infos = document.getElementsByClassName('item-info');
        for(let info of infos) {
          let lines = info.innerText.split("\n");

          let index_of_$ = lines[0].indexOf('$');
          let index_of_dot = lines[0].indexOf('.');
          assign_gc_info(gc_info, lines[0].slice(index_of_$+1,index_of_dot),
                         'val');
          lines.splice(0,1);

          // If there is whitespace on the last line (there may not be if the
          // "PIN" text is on the line above it or doesn't exist), then split
          // the line up based on that, then save the final element of that as
          // the pin. If there is no whitespace, then just assume that is the
          // pin.
          const whitespace_regex = /\s/g;
          if(whitespace_regex.test(lines[lines.length-1])) {
            maybe_pins = lines[lines.length-1].split(whitespace_regex);
            assign_gc_info(gc_info, maybe_pins[maybe_pins.length-1], 'pin');
          } else {
            assign_gc_info(gc_info, lines[lines.length-1], 'pin');
          }
          lines.pop();

          // Remove everything that is not a number from the rest of the lines
          // and assume that there will only be one with more than 7 digits and
          // that it must be the card number.
          for(let line of lines){
            let formatted_line = line.replace(/\D/g,'');
            if(formatted_line.length >= 8)
              assign_gc_info(gc_info, formatted_line, 'num');
          }
        }
        break;
    }

    sendResponse(gc_info);
  });
}

init();