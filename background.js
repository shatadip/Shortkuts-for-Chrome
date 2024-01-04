let isRightClicking = false;

chrome.runtime.onInstalled.addListener(function() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleRightClick') {
      isRightClicking = request.value;
    }
  });
});

window.addEventListener('wheel', function(event) {
  if (isRightClicking) {
    const delta = event.deltaY;

    if (delta > 0) {
      chrome.runtime.sendMessage({ action: 'scroll', direction: 'next' });
    } else if (delta < 0) {
      chrome.runtime.sendMessage({ action: 'scroll', direction: 'prev' });
    }
  }
});
