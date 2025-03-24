document.getElementById('toggleBalance').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on a Fiverr page
    if (!tab.url || !tab.url.includes('fiverr.com')) {
      document.getElementById('status').textContent = 'Please navigate to Fiverr.com first';
      return;
    }
    
    // First check if content script is loaded by sending a "ping"
    chrome.tabs.sendMessage(tab.id, { action: "ping" }, response => {
      if (chrome.runtime.lastError) {
        // Content script is not running
        document.getElementById('status').textContent = 'Extension not active on this page. Please refresh the page.';
        console.log('Error:', chrome.runtime.lastError.message);
      } else {
        // Content script is running, now send the real command
        chrome.tabs.sendMessage(tab.id, { action: "toggleBalance" }, response => {
          if (chrome.runtime.lastError) {
            document.getElementById('status').textContent = 'Error: Failed to toggle balance';
            console.log('Toggle error:', chrome.runtime.lastError.message);
          } else {
            const state = response && response.hidden ? 'hidden' : 'visible';
            document.getElementById('status').textContent = `Balance is now ${state}`;
          }
        });
      }
    });
  } catch (error) {
    document.getElementById('status').textContent = 'Error: ' + error.message;
    console.error(error);
  }
});