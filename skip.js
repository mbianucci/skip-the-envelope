function skip(button, inner_text) {
  let buttons = document.querySelectorAll(button);

  // Confirm we aren't about to click on something we don't intend to.
  for(let i = 0;i < buttons.length; ++i) {
    if(buttons[i].innerText === inner_text) {
      buttons[i].click();
      return true;
    }
  }

  return false;
}

function MutationCallback(mutation, observer) {
  observer.disconnect();
  skip(AnimationSkipper.button, AnimationSkipper.inner_text);
}

function main() {
  if(!skip(AnimationSkipper.button, AnimationSkipper.inner_text)) {
    console.assert(AnimationSkipper.mutating_class != null,
      'Button didn\'t exist when it was expected, please let someone know ' +
      'what page this occured on.');
    const target = document.getElementsByClassName(
      AnimationSkipper.mutating_class);
    const config = { childList: true };
    const observer = new MutationObserver(MutationCallback);
    observer.observe(target[0], config);
  }
}

AnimationSkipper = {};
switch (window.location.hostname) {
  case 'delivery.cardago.com':
    AnimationSkipper.button = '.btn_base';
    AnimationSkipper.inner_text = 'READY TO OPEN YOUR GIFT CARD?';
    AnimationSkipper.mutating_class = null;
    break;
  case 'www.paypal.com':
    AnimationSkipper.button = '[data-pa-click]';
    AnimationSkipper.inner_text = 'Skip';
    AnimationSkipper.mutating_class = 'mainContent';
    break;
  default:
    console.log('Unexpected website.');
}

main();