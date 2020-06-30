// Listens for the URLs that the GC are available on and enables the extension
// button when the active tab is on either site.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' &&
     (tab.url.includes('www.paypal.com/gifts/claim/') ||
      tab.url.includes('www.vcdelivery.com/certificate/'))) {
    chrome.pageAction.show(tabId);
  }
});
