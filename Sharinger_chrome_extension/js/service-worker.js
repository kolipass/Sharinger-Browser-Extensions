chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageData") {
    try {
      chrome.scripting.executeScript({
        target: { tabId: request.tabId },
        func: () => ({
          title: document.title,
          url: location.href
        })
      }, results => sendResponse(results[0].result));
    } 
    catch (err) {
      updateBadge("error", request.tabId);
      console.error(err);
    }
    return true; // Для асинхронного ответа
  }

  if (request.action === "updateBadge") {
    updateBadge(request.status, request.tabId);
  }
});

const updateBadge = (status, tabId) => {
  const colors = { success: "#4CAF50", error: "#FF0000" };
  const symbols = { success: "✓", error: "✗" };

  chrome.action.setBadgeText({ text: symbols[status], tabId });
  chrome.action.setBadgeBackgroundColor({ color: colors[status], tabId });

  setTimeout(() => chrome.action.setBadgeText({ text: "", tabId }), 2000);
};
