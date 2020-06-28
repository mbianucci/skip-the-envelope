// Listens for the URLs that the GC are available on and enables the extension button
// when the active tab is on either site.
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {urlContains: 'www.paypal.com/gifts/claim/'},
      }), new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {urlContains: 'www.vcdelivery.com/certificate/'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});