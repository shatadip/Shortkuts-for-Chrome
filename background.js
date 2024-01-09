// Listen for the extension installation event and inject the script into all opened tabs
chrome.runtime.onInstalled.addListener(loadScriptInAllTabs);

// Listen for incoming messages from the extension
chrome.runtime.onMessage.addListener(onMessage);

// Check if the current active tab is a Chrome internal page and skip context menu adjustments if so
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (tabs[0]?.url?.startsWith("chrome://")) {
    // Skip URLs like "chrome://" to avoid extension errors
    chrome.runtime.sendMessage({ action: 'skipContextMenu' });
  }
});

// Listen for messages indicating skipping the context menu adjustments
chrome.runtime.onMessage.addListener(function (message) {
  if (message.action === 'skipContextMenu') {
    // Remove the event listener for contextmenu to avoid conflicts with Chrome's internal pages
    window.removeEventListener('mousewheel', preventOneContextMenuEvent);
  }
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case 'deleteTabsToRight':
      deleteTabsToRight();
      break;
    case 'deleteTabsToLeft':
      deleteTabsToLeft();
      break;
    case 'closeAllOtherTabs':
      closeAllOtherTabs();
      break;
    case 'duplicateTab':
      duplicateTab();
      break;
  }
});

/*
 * Handle incoming extension messages
 * @param {string} message - The received message
 * @param {chrome.runtime.MessageSender} sender - The sender of the message
 * @param {function} sendResponse - A function to send a response back to the sender
 */
function onMessage(message, sender, sendResponse) {
  // Check for a message to scroll up
  if (message === 'up') {
    const index = sender.tab?.index - 1;

    // Ensure the tab index is valid
    if (index >= 0) {
      // Activate the tab above the current one
      activateTab(index, sender.tab.windowId);
    }
  }

  // Check for a message to scroll down
  if (message === 'down') {
    // Activate the tab below the current one
    activateTab(sender.tab.index + 1, sender.tab.windowId);
  }
}

/*
 * Activate a specific tab
 * @param {number} tabIndex - Index of the tab to activate
 * @param {number} windowId - ID of the window containing the tab
 */
function activateTab(tabIndex, windowId) {
  const query = {
    index: tabIndex,
    windowId: windowId,
  };

  // Query for the specified tab
  chrome.tabs.query(query, function (tabs) {
    const tab = tabs[0] || null;

    // If the tab exists, activate it and prevent the context menu from appearing one time
    if (tab) {
      // Activate the specified tab
      chrome.tabs.update(tab.id, { active: true });

      // Prevent the context menu from appearing one time (occurs when scrolling with right-click, releasing the click opens the context menu)
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: disableContextMenu,
      });
    }
  });
}

/*
 * On plugin install, inject the JavaScript script into all currently opened tabs
 */
function loadScriptInAllTabs() {
  // Query all currently opened tabs
  chrome.tabs.query({}, function (tabs) {
    // Iterate through each tab
    for (const tab of tabs) {
      // Skip Chrome internal pages to prevent injection errors
      if (!tab.url || tab.url.startsWith("chrome://")) continue;

      // Execute the script in the tab
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['popup.js'],
      });
    }
  });
}

/*
 * Disable the context menu for a single occurrence
 */
function disableContextMenu() {
  // Add an event listener to disable the context menu for one occurrence
  window.addEventListener('contextmenu', preventOneContextMenuEvent);
}

/*
 * Prevent one occurrence of the context menu event
 * @param {Event} event - The context menu event
 */
function preventOneContextMenuEvent(event) {
  // Prevent the context menu from appearing for this one occurrence
  event.preventDefault();

  // Remove the event listener to avoid conflicts with subsequent interactions
  window.removeEventListener('contextmenu', preventOneContextMenuEvent);
}

/*
 * Close all tabs to the right of the current active tab
*/
function deleteTabsToRight() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    if (currentTab) {
      const currentIndex = currentTab.index;

      chrome.tabs.query({ currentWindow: true }, function (allTabs) {
        const tabsToDelete = allTabs.filter(tab => tab.index > currentIndex);

        if (tabsToDelete.length > 0) {
          const tabIdsToDelete = tabsToDelete.map(tab => tab.id);

          // Close the tabs to the right
          chrome.tabs.remove(tabIdsToDelete);
        }
      });
    }
  });
}
/*
 * Close all tabs to the left of the current active tab
*/
function deleteTabsToLeft() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    if (currentTab) {
      const currentIndex = currentTab.index;

      chrome.tabs.query({ currentWindow: true }, function (allTabs) {
        const tabsToDelete = allTabs.filter(tab => tab.index < currentIndex);

        if (tabsToDelete.length > 0) {
          const tabIdsToDelete = tabsToDelete.map(tab => tab.id);

          // Close the tabs to the left
          chrome.tabs.remove(tabIdsToDelete);
        }
      });
    }
  });
}
/*
 * Close all other tabs except for current active tab
*/
function closeAllOtherTabs() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    if (currentTab) {
      chrome.tabs.query({ currentWindow: true }, function (allTabs) {
        const tabsToKeep = allTabs.filter(tab => tab.id === currentTab.id);

        // Close all tabs except the ones to keep
        const tabsToClose = allTabs.filter(tab => tab.id !== currentTab.id);
        chrome.tabs.remove(tabsToClose.map(tab => tab.id));
      });
    }
  });
}
/*
 * Duplicate current tab
*/
function duplicateTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    if (currentTab) {
      // Duplicate the current tab
      chrome.tabs.duplicate(currentTab.id);
    }
  });
}