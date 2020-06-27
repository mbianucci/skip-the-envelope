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

init();
