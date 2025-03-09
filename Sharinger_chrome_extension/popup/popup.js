function adjustPopupHeight() {
  const CONTENT_BUFFER = 100;
  const content = document.getElementById('content');
  const { paddingTop, paddingBottom } = getComputedStyle(content);
  
  const totalHeight = content.scrollHeight 
    + parseInt(paddingTop) 
    + parseInt(paddingBottom) 
    + CONTENT_BUFFER;

  document.body.style.height = `${totalHeight}px`;
}

async function copyToClipboard(text, tabId, onSuccess, onError) {
  try {
    await navigator.clipboard.writeText(text);
    chrome.runtime.sendMessage({ action: "updateBadge", status: "success", tabId });
    onSuccess();
  } catch (err) {
    console.error('Copy failed:', err);
    chrome.runtime.sendMessage({ action: "updateBadge", status: "error", tabId });
    onError(err);
  }
}

function handleMarkdownCopyClick(button, data, tabId) {
  const originalText = button.textContent;
  let timeoutId = null;

  const titleElement = document.getElementById('title-message');
  const contentElement = document.getElementById('content');

  return async () => {
    const mdText = `[${data.title}](${data.url})`;
    
    await copyToClipboard(mdText, tabId,
      () => {
        titleElement.textContent = 'Copied:';
        contentElement.textContent = mdText;
        button.classList.add('copied');
        button.textContent = '✓ Copied!';
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          button.classList.remove('copied');
          button.textContent = originalText;
        }, 2000);
      },
      () => button.textContent = 'Error!'
    );
  };
}

// Popup initialization
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const pageData = await chrome.runtime.sendMessage({ action: "getPageData", tabId: tab.id });
  const textToCopy = `${pageData.title} ${pageData.url}`;
  const titleElement = document.getElementById('title-message');
  const contentElement = document.getElementById('content');

  await copyToClipboard(textToCopy, tab.id,
    () => {
      titleElement.textContent = 'Copied:';
      contentElement.textContent = textToCopy;
    },
    (error) => {
      titleElement.textContent = 'Error:';
      contentElement.textContent = error.message;
    }
  );

  adjustPopupHeight();
  window.addEventListener('resize', adjustPopupHeight);
  
  document.getElementById('copy-md')
    .addEventListener('click', handleMarkdownCopyClick(
      document.getElementById('copy-md'),
      pageData,
      tab.id
    ));
});
