document.addEventListener('DOMContentLoaded', function() {
    let isRightClicking = false;
    chrome.runtime.sendMessage({ action: 'toggleRightClick', value: true });
    // Tell the background script to toggle right-clicking
    chrome.runtime.sendMessage({ action: 'toggleRightClick', value: true });
  
    // Listen for mouse down events
    window.addEventListener('mousedown', function(event) {
      // Check if it's a right-click
      isRightClicking = (event.button === 2);
    });
  
    // Listen for mouse up events
    window.addEventListener('mouseup', function(event) {
      // Reset right-click state on mouse up
      isRightClicking = false;
    });
  
    // Listen for mouse wheel events in the popup
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
  });
  
//   document.addEventListener('DOMContentLoaded', function() {
//     // Tell the background script to toggle right-clicking
//     chrome.runtime.sendMessage({ action: 'toggleRightClick', value: true });
//   });
  