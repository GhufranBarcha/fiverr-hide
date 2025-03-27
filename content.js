// This script runs in the context of the Fiverr website
let balanceHidden = false;
let currencyHidden = false;

// WeakMap to store original text values
const originalTextMap = new WeakMap();

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

// Function to hide or show currency amounts
function toggleCurrencyVisibility() {
  // Target all text nodes in the document
  const textWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const currencyRegex = /(\$|€|£|¥)(\d[\d,.\s]*)/;
  let nodesWithCurrency = [];
  let currentNode;
  
  // Find all text nodes containing currency
  while (currentNode = textWalker.nextNode()) {
    if (currencyRegex.test(currentNode.nodeValue) && 
        !isInIgnoredElement(currentNode.parentElement)) {
      nodesWithCurrency.push(currentNode);
    }
  }
  
  console.log(`Found ${nodesWithCurrency.length} text nodes with currency to toggle`);
  
  currencyHidden = !currencyHidden;
  
  if (currencyHidden) {
    // Hide currency values
    nodesWithCurrency.forEach(node => {
      // Store original text in our WeakMap
      originalTextMap.set(node, node.nodeValue);
      // Replace currency with asterisks
      node.nodeValue = node.nodeValue.replace(currencyRegex, "$1***");
    });
  } else {
    // Show currency values
    nodesWithCurrency.forEach(node => {
      // Restore from our WeakMap if available
      const originalText = originalTextMap.get(node);
      if (originalText) {
        node.nodeValue = originalText;
      }
    });
  }
  
  return currencyHidden;
}

// Helper function to check if element should be ignored (e.g., scripts, styles)
function isInIgnoredElement(element) {
  const ignoredTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OPTION'];
  let current = element;
  
  while (current) {
    if (ignoredTags.includes(current.tagName)) {
      return true;
    }
    current = current.parentElement;
  }
  
  return false;
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
  
  if (message.action === "toggleCurrency") {
    console.log("Toggle currency request received");
    const isNowHidden = toggleCurrencyVisibility();
    sendResponse({ success: true, hidden: isNowHidden });
    return true;
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
    
    // If currency is hidden, handle any new text nodes
    if (currencyHidden) {
      mutations.forEach(mutation => {
        // Check for new text nodes
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && !isInIgnoredElement(node)) {
              const textWalker = document.createTreeWalker(
                node,
                NodeFilter.SHOW_TEXT,
                null,
                false
              );
              
              const currencyRegex = /(\$|€|£|¥)(\d[\d,.\s]*)/;
              let currentTextNode;
              
              while (currentTextNode = textWalker.nextNode()) {
                if (currencyRegex.test(currentTextNode.nodeValue)) {
                  // Store original text in WeakMap
                  originalTextMap.set(currentTextNode, currentTextNode.nodeValue);
                  // Replace currency with asterisks
                  currentTextNode.nodeValue = currentTextNode.nodeValue.replace(
                    currencyRegex, "$1***"
                  );
                }
              }
            }
          });
        }
      });
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  return observer;
}

// Start observing once the page is loaded
window.addEventListener('load', () => {
  observeDynamicChanges();
});