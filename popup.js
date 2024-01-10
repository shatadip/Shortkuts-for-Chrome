/*
 * This event listener is responsible for detecting mouse wheel movements and sending messages to the background.js script.
 * When the Alt key or right mouse button is pressed, it indicates a request to scroll between tabs.
 * If the wheelDelta is positive, it signifies scrolling up, triggering a message to switch to the previous tab.
 * If the wheelDelta is negative, it denotes scrolling down, prompting a message to switch to the next tab.
 * To ensure smooth tab switching, the event's default behavior is prevented.
 */
window.addEventListener('mousewheel', function (e) {
  if (e.altKey || e.buttons === 2) {
    if (e.wheelDelta / 120 > 0) {
      // Send message to background.js indicating a request to switch to the previous tab
      chrome.runtime.sendMessage('up');
    } else {
      // Send message to background.js indicating a request to switch to the next tab
      chrome.runtime.sendMessage('down');
    }

    // Prevent the default scrolling behavior of the new active tab (may not work in all cases)
    e.preventDefault();
  }
});
window.addEventListener('keydown', function (e) {
  if (e.altKey && e.key === ',') {
    // Send message to background.js indicating a request to move the current tab left
    chrome.runtime.sendMessage('moveLeft');
  } else if (e.altKey && e.key === '.') {
    // Send message to background.js indicating a request to move the current tab right
    chrome.runtime.sendMessage('moveRight');
  }
});
/*
 * This function prevents the context menu from appearing after a scroll action with the right-click.
 * It is attached to the 'contextmenu' event and removes itself after execution to prevent continuous blocking.
 */
function preventOneContextMenuEvent(e) {
  e.preventDefault();
  window.removeEventListener('contextmenu', preventOneContextMenuEvent);
}
