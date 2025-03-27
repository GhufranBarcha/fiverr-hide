// Initialize the UI based on current state
async function initializeUi() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on a Fiverr page
    if (!tab.url || !tab.url.includes('fiverr.com')) {
      document.getElementById('status').textContent = 'Please navigate to Fiverr.com first';
      return;
    }
    
    // Check if content script is loaded and get current state
    chrome.tabs.sendMessage(tab.id, { action: "ping" }, response => {
      if (chrome.runtime.lastError) {
        // Content script is not running
        document.getElementById('status').textContent = 'Extension not active on this page. Please refresh the page.';
        console.log('Error:', chrome.runtime.lastError.message);
      } else if (response) {
        // Update button text/style based on current state
        updateButtonState('toggleBalance', response.balanceHidden);
        updateButtonState('toggleCurrency', response.currencyHidden);
      }
    });
  } catch (error) {
    console.error("Error initializing UI:", error);
  }
}

// Update button appearance based on state
function updateButtonState(buttonId, isHidden) {
  const button = document.getElementById(buttonId);
  if (button) {
    if (isHidden) {
      button.textContent = buttonId === 'toggleBalance' ? 'Show Balance' : 'Show Currency Amounts';
      button.style.backgroundColor = '#e74c3c'; // Red when hidden
    } else {
      button.textContent = buttonId === 'toggleBalance' ? 'Hide Balance' : 'Hide Currency Amounts';
      button.style.backgroundColor = '#1dbf73'; // Green when visible
    }
  }
}

document.getElementById('toggleBalance').addEventListener('click', async () => {
  toggleFeature('toggleBalance', 'Balance');
});

document.getElementById('toggleCurrency').addEventListener('click', async () => {
  toggleFeature('toggleCurrency', 'Currency amounts');
});

async function toggleFeature(action, featureName) {
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
        chrome.tabs.sendMessage(tab.id, { action: action }, response => {
          if (chrome.runtime.lastError) {
            document.getElementById('status').textContent = `Error: Failed to toggle ${featureName.toLowerCase()}`;
            console.log('Toggle error:', chrome.runtime.lastError.message);
          } else {
            const isHidden = response && response.hidden;
            const state = isHidden ? 'hidden' : 'visible';
            document.getElementById('status').textContent = `${featureName} now ${state}`;
            
            // Update button state
            updateButtonState(action, isHidden);
          }
        });
      }
    });
  } catch (error) {
    document.getElementById('status').textContent = 'Error: ' + error.message;
    console.error(error);
  }
}

// Initialize UI when popup opens
document.addEventListener('DOMContentLoaded', initializeUi);