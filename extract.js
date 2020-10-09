// Sends the message to the content script that will trigger the GC extraction.
// Extracted info is then put into the extension popup and on user's clipboard.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
    if(response && response.length >= 1) {
      // Format all of the cards' info nicely. Keep track of validity separately
      // so that if any of the GCs are marked invalid then the text is not
      // automatically put on the users's clipboard and the warning is displayed.
      let info = "";
      let valid = true;
      for(let r of response) {
        if(info != "")
          info += "\n";
        info += r.number + "," + r.pin + "," + r.value;
        valid = (valid && r.valid);
      }

      // Write extracted GC info to clipboard if we're sure its correct.
      if(valid)
        navigator.clipboard.writeText(info);

      // Let the user actually see the info that's been extracted and let them
      // know if its on their clipboard already.
      document.getElementById('GcInfo').innerText = info

      let node = document.getElementById('info');
      if(valid) {
        node.innerText = 'Extracted info has been placed on your clipboard.';
      } else {
        node.innerText = 'Unexpected values found during extraction. Check ' +
                         'to confirm values are correct.';
      }

      // Highlight the extracted info in case they want to manually copy it
      // anyway.
      var range = document.createRange();
      range.selectNode(document.getElementById('GcInfo'));
      window.getSelection().addRange(range);
    }
  });
});
