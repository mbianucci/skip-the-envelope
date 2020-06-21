function skip(button, inner_text) {
    let buttons = document.querySelectorAll(button);

    // Confirm we aren't about to click on something we don't intend to.
    for(let i = 0;i < buttons.length; ++i) {
        if(buttons[i].innerText === inner_text)
            buttons[i].click();
    }
}

switch (window.location.hostname) {
    case 'delivery.cardago.com':
        skip('.btn_base', 'READY TO OPEN YOUR GIFT CARD?');
        break;
    case 'www.paypal.com':
        skip('[data-pa-click]', 'Skip');
        break;
}
