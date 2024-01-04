chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'scroll') {
      const direction = request.direction;
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTabId = tabs[0].id;
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, function (allTabs) {
          let index;
          if (direction === 'next') {
            index = (allTabs.findIndex(tab => tab.id === currentTabId) + 1) % allTabs.length;
          } else if (direction === 'prev') {
            index = (allTabs.findIndex(tab => tab.id === currentTabId) - 1 + allTabs.length) % allTabs.length;
          }
          chrome.tabs.update(allTabs[index].id, { active: true });
        });
      });
    }
  });
  