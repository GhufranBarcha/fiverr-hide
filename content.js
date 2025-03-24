// This script runs in the context of the Fiverr website
let balanceHidden = false;

// Function to hide or show the balance
function toggleBalanceVisibility() {
  // Balance selector - may need adjustment based on Fiverr's actual DOM structure
  const balanceElements = document.querySelectorAll('.balance-amount, .user-balance, .wallet-balance');
  
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

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle ping request to check if content script is ready
  if (message.action === "ping") {
    sendResponse({ status: "ready" });
    return true;
  }
  
  if (message.action === "toggleBalance") {
    const isNowHidden = toggleBalanceVisibility();
    sendResponse({ success: true, hidden: isNowHidden });
    return true; // Indicates you wish to send a response asynchronously
  }
});

// Auto-hide on page load (optional)
window.addEventListener('load', () => {
  // Uncomment the next line if you want to hide the balance automatically on page load
  // toggleBalanceVisibility();
});