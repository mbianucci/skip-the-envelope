// Create an observer instance linked to the callback function
let observer = null;

function skip(button, inner_text) {
    let buttons = document.querySelectorAll(button);

    // Confirm we aren't about to click on something we don't intend to.
    for(let i = 0;i < buttons.length; ++i) {
        if (buttons[i].innerText === inner_text) {
            if (observer != null) {
                observer.disconnect(); // with mission accomplished, deactivate observer
                observer = null;
            }
            buttons[i].click();
        }
    }
}

function go() {
    switch (window.location.hostname) {
    case 'delivery.cardago.com':
        skip('.btn_base', 'READY TO OPEN YOUR GIFT CARD?');
        break;
    case 'www.paypal.com':
        skip('[data-pa-click]', 'Skip');
        break;
    }
}

function configure_dom_observer(id_to_observe) {
    // Select the node that will be observed for mutations
    let targetNode = document.getElementById(id_to_observe);

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                //console.log('A child node has been added or removed.');
                go();
            }
            else if (mutation.type === 'attributes') {
                //console.log('The ' + mutation.attributeName + ' attribute was modified.');
                // don't care about attribute mutations for now
            }
        }
    };

    observer = new MutationObserver(callback);
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
