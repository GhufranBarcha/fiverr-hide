// This script runs in the context of the Fiverr website
let balanceHidden = false;

// Function to hide or show the balance
function toggleBalanceVisibility() {
  // Balance selector - using your existing selectors
  const balanceElements = document.querySelectorAll('.grade, .user-balance, .wallet-balance, ul.order-data > li > span');
  
  console.log(`Found ${balanceElements.length} balance elements to toggle`);
  
  balanceHidden = !balanceHidden;
  
  balanceElements.forEach(element => {
    if (balanceHidden) {
      element.dataset.originalText = element.textContent;
      element.textContent = "***";
    } else {
      if (element.dataset.originalText) {
        element.textContent = element.dataset.originalText;
      }
    }
  });
  
  return balanceHidden; // Return the current state
}

// Initialize when the DOM is ready
function initialize() {
  console.log("Fiverr Balance Hider: Content script initialized");
  
  // Create a small notification to confirm script loaded
  const notification = document.createElement('div');
  notification.textContent = 'Fiverr Balance Hider active';
  notification.style.position = 'fixed';
  notification.style.bottom = '10px';
  notification.style.right = '10px';
  notification.style.backgroundColor = '#1dbf73';
  notification.style.color = 'white';
  notification.style.padding = '8px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '9999';
  notification.style.fontSize = '12px';
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  
  // Handle ping request to check if content script is ready
  if (message.action === "ping") {
    console.log("Ping received, sending ready status");
    sendResponse({ status: "ready" });
    return true;
  }
  
  if (message.action === "toggleBalance") {
    console.log("Toggle balance request received");
    const isNowHidden = toggleBalanceVisibility();
    sendResponse({ success: true, hidden: isNowHidden });
    return true; // Indicates you wish to send a response asynchronously
  }
});

// Initialize as soon as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also run when window loads (for dynamically loaded content)
window.addEventListener('load', () => {
  console.log("Window load event fired");
  // Uncomment the next line if you want to hide the balance automatically on page load
  // toggleBalanceVisibility();
});

// Add a mutation observer to handle dynamic content that might be loaded after the page loads
function observeDynamicChanges() {
  const observer = new MutationObserver((mutations) => {
    // If needed, you can check if balance elements were added and apply hiding
    // This is useful if Fiverr loads balance elements asynchronously
    if (balanceHidden) {
      // Re-apply hiding to any new elements that match our selectors
      const newBalanceElements = document.querySelectorAll('.grade, .user-balance, .wallet-balance, ul.order-data > li.price > span , div.title-wrapper > h3 > span');
      newBalanceElements.forEach(element => {
        if (!element.dataset.originalText) {
          element.dataset.originalText = element.textContent;
          element.textContent = "***";
        }
      });
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// Start observing once the page is loaded
window.addEventListener('load', () => {
  observeDynamicChanges();
});