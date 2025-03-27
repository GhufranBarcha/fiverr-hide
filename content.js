// This script runs in the context of the Fiverr website
let balanceHidden = false;
let currencyHidden = false;

// Store original text values with DOM node references for better persistence
const originalBalanceValues = new Map();
const originalCurrencyValues = new Map();

// Create a stylesheet that will be used for immediate hiding
let immediateHidingStyle = null;

// Apply immediate hiding with CSS as early as possible (before DOM is ready)
function applyImmediateHiding() {
  try {
    // Check saved preferences from localStorage
    const savedBalanceHidden = localStorage.getItem('fiverr-hide-balance') === 'true';
    const savedCurrencyHidden = localStorage.getItem('fiverr-hide-currency') === 'true';
    
    // Set initial state variables to match saved preferences
    balanceHidden = savedBalanceHidden;
    currencyHidden = savedCurrencyHidden;
    
    // Only inject CSS if either feature should be hidden
    if (savedBalanceHidden || savedCurrencyHidden) {
      // Create style element if it doesn't exist
      if (!immediateHidingStyle) {
        immediateHidingStyle = document.createElement('style');
        immediateHidingStyle.id = 'fiverr-hide-immediate-style';
      }
      
      let cssRules = [];
      
      if (savedBalanceHidden) {
        // Hide balance elements immediately
        cssRules.push(`
          .grade, .user-balance, .wallet-balance, ul.order-data > li > span,
          .balance-line, .total-balance, .revenue, .earnings {
            color: transparent !important;
          }
          .grade::before, .user-balance::before, .wallet-balance::before, 
          ul.order-data > li > span::before, .balance-line::before, 
          .total-balance::before, .revenue::before, .earnings::before {
            content: '***';
            color: black;
            position: absolute;
          }
        `);
      }
      
      if (savedCurrencyHidden) {
        // Hide elements that typically contain currency values
        cssRules.push(`
          .price-wrapper, .price-tag, .price-unit, .gig-card-price, 
          .price, .amount, .js-price, span[itemprop="price"],
          [class*="price"], [class*="Price"], [class*="amount"], [class*="Amount"] {
            color: transparent !important;
          }
          .price-wrapper::before, .price-tag::before, .price-unit::before, 
          .gig-card-price::before, .price::before, .amount::before, .js-price::before, 
          span[itemprop="price"]::before, [class*="price"]::before, [class*="Price"]::before,
          [class*="amount"]::before, [class*="Amount"]::before {
            content: '$***';
            color: black;
            position: absolute;
          }
        `);
      }
      
      immediateHidingStyle.textContent = cssRules.join('\n');
      
      // Insert as early as possible
      if (document.head) {
        document.head.appendChild(immediateHidingStyle);
      } else if (document.documentElement) {
        // If head doesn't exist yet, add to html element
        document.documentElement.appendChild(immediateHidingStyle);
      }
      
      console.log('Immediate hiding CSS applied');
    }
  } catch (error) {
    console.error('Error applying immediate hiding:', error);
  }
}

// Run this as early as possible, before DOM is ready
applyImmediateHiding();

// Remove the immediate hiding style
function removeImmediateHidingStyle() {
  if (immediateHidingStyle && immediateHidingStyle.parentNode) {
    immediateHidingStyle.parentNode.removeChild(immediateHidingStyle);
    immediateHidingStyle = null;
  } else {
    // As a fallback, also try to find by ID
    const styleElement = document.getElementById('fiverr-hide-immediate-style');
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  }
}

// Function to hide or show the balance
function toggleBalanceVisibility(forceState = null) {
  // If forceState is provided, use it instead of toggling
  if (forceState !== null) {
    balanceHidden = forceState;
  } else {
    balanceHidden = !balanceHidden;
  }
  
  // Save state to local storage
  localStorage.setItem('fiverr-hide-balance', balanceHidden.toString());
  
  // Remove any immediate hiding CSS
  removeImmediateHidingStyle();
  
  // Re-apply CSS with updated settings
  applyCorrectStyles();
  
  // Balance selector - using expanded selectors
  const balanceElements = document.querySelectorAll(`
    .grade, .user-balance, .wallet-balance, ul.order-data > li > span,
    .balance-line, .total-balance, .revenue, .earnings
  `);
  
  console.log(`Found ${balanceElements.length} balance elements to toggle (hidden: ${balanceHidden})`);
  
  balanceElements.forEach(element => {
    // Generate a unique key for this element (using element's path or position)
    const elementKey = getElementKey(element);
    
    if (balanceHidden) {
      // Store original text if not already stored
      if (!originalBalanceValues.has(elementKey)) {
        originalBalanceValues.set(elementKey, {
          element: element,
          text: element.textContent
        });
      }
      element.textContent = "***";
    } else {
      // Restore original text
      const originalData = originalBalanceValues.get(elementKey);
      if (originalData) {
        element.textContent = originalData.text;
      }
    }
  });
  
  return balanceHidden; // Return the current state
}

// Function to hide or show currency amounts
function toggleCurrencyVisibility(forceState = null) {
  // If forceState is provided, use it instead of toggling
  if (forceState !== null) {
    currencyHidden = forceState;
  } else {
    currencyHidden = !currencyHidden;
  }
  
  // Save state to local storage
  localStorage.setItem('fiverr-hide-currency', currencyHidden.toString());
  
  // Remove any immediate hiding CSS
  removeImmediateHidingStyle();
  
  // Re-apply CSS with updated settings
  applyCorrectStyles();
  
  // Currency processing logic - directly find and replace text nodes
  processTextNodesInBody();
  
  return currencyHidden;
}

// Process all text nodes in the body for currency values
function processTextNodesInBody() {
  // Target all text nodes in the document
  const textWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const currencyRegex = /(\$|€|£|¥)(\d[\d,.\s]*)/g;
  let currentNode;
  let processedNodes = 0;
  
  // Process all text nodes
  while (currentNode = textWalker.nextNode()) {
    if (!isInIgnoredElement(currentNode.parentElement) && 
        currencyRegex.test(currentNode.nodeValue)) {
      
      // Generate a unique key for this text node
      const nodeKey = getTextNodeKey(currentNode);
      
      if (currencyHidden) {
        // Store original value if we haven't already
        if (!originalCurrencyValues.has(nodeKey)) {
          originalCurrencyValues.set(nodeKey, {
            parentPath: getNodePath(currentNode.parentNode),
            text: currentNode.nodeValue,
            index: getTextNodeIndex(currentNode)
          });
        }
        
        // Replace currency amounts with asterisks
        currentNode.nodeValue = currentNode.nodeValue.replace(
          currencyRegex, 
          (match, currency) => `${currency}***`
        );
        processedNodes++;
      } else {
        // Try to restore the original text
        const originalData = originalCurrencyValues.get(nodeKey);
        if (originalData) {
          currentNode.nodeValue = originalData.text;
          processedNodes++;
        }
      }
    }
  }
  
  console.log(`Processed ${processedNodes} text nodes containing currency (hidden: ${currencyHidden})`);
}

// Apply the correct styles based on current settings
function applyCorrectStyles() {
  // Create a new style element
  const style = document.createElement('style');
  style.id = 'fiverr-hide-immediate-style';
  let cssRules = [];
  
  if (balanceHidden) {
    // Hide balance elements immediately
    cssRules.push(`
      .grade, .user-balance, .wallet-balance, ul.order-data > li > span,
      .balance-line, .total-balance, .revenue, .earnings {
        color: transparent !important;
      }
      .grade::before, .user-balance::before, .wallet-balance::before, 
      ul.order-data > li > span::before, .balance-line::before, 
      .total-balance::before, .revenue::before, .earnings::before {
        content: '***';
        color: black;
        position: absolute;
      }
    `);
  }
  
  if (currencyHidden) {
    // Hide elements that typically contain currency values
    cssRules.push(`
      .price-wrapper, .price-tag, .price-unit, .gig-card-price, 
      .price, .amount, .js-price, span[itemprop="price"],
      [class*="price"], [class*="Price"], [class*="amount"], [class*="Amount"] {
        color: transparent !important;
      }
      .price-wrapper::before, .price-tag::before, .price-unit::before, 
      .gig-card-price::before, .price::before, .amount::before, .js-price::before, 
      span[itemprop="price"]::before, [class*="price"]::before, [class*="Price"]::before,
      [class*="amount"]::before, [class*="Amount"]::before {
        content: '$***';
        color: black;
        position: absolute;
      }
    `);
  }
  
  // If neither are hidden, we don't need a style element
  if (cssRules.length > 0) {
    style.textContent = cssRules.join('\n');
    document.head.appendChild(style);
    immediateHidingStyle = style;
  }
}

// Helper function to get a unique key for an element
function getElementKey(element) {
  return getNodePath(element);
}

// Helper function to get a unique key for a text node
function getTextNodeKey(textNode) {
  return `${getNodePath(textNode.parentNode)}_${getTextNodeIndex(textNode)}`;
}

// Helper function to get the index of a text node among its siblings
function getTextNodeIndex(textNode) {
  let index = 0;
  let node = textNode.previousSibling;
  
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      index++;
    }
    node = node.previousSibling;
  }
  
  return index;
}

// Helper function to get a node's path in the document
function getNodePath(node) {
  const path = [];
  let current = node;
  
  while (current && current !== document.body) {
    let index = 0;
    let sibling = current;
    
    while (sibling) {
      if (sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }
    
    const nodeName = current.nodeName.toLowerCase();
    const pathPart = index > 1 ? `${nodeName}:nth-of-type(${index})` : nodeName;
    path.unshift(pathPart);
    current = current.parentNode;
  }
  
  return path.join(' > ');
}

// Helper function to check if element should be ignored
function isInIgnoredElement(element) {
  if (!element) return true;
  
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
  
  // Apply saved settings from local storage
  applySavedSettings();
  
  // Start observing DOM changes
  observeDynamicChanges();
}

// Apply settings saved in localStorage
function applySavedSettings() {
  // Check if we have saved settings
  const savedBalanceHidden = localStorage.getItem('fiverr-hide-balance');
  const savedCurrencyHidden = localStorage.getItem('fiverr-hide-currency');
  
  console.log('Applying saved settings:', { savedBalanceHidden, savedCurrencyHidden });
  
  // Apply balance setting if it exists
  if (savedBalanceHidden === 'true') {
    toggleBalanceVisibility(true);
  }
  
  // Apply currency setting if it exists
  if (savedCurrencyHidden === 'true') {
    toggleCurrencyVisibility(true);
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  
  try {
    // Handle ping request to check if content script is ready
    if (message.action === "ping") {
      // Return current state along with ready status
      const state = {
        status: "ready",
        balanceHidden: balanceHidden,
        currencyHidden: currencyHidden
      };
      console.log("Ping received, sending ready status and state:", state);
      sendResponse(state);
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
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ success: false, error: error.message });
    return true;
  }
});

// Initialize as soon as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Add a mutation observer to handle dynamic content
function observeDynamicChanges() {
  const observer = new MutationObserver((mutations) => {
    try {
      // If balance is hidden, check for new elements
      if (balanceHidden) {
        // Re-apply hiding to any new elements that match our selectors
        const newBalanceElements = document.querySelectorAll(`
          .grade, .user-balance, .wallet-balance, ul.order-data > li > span,
          .balance-line, .total-balance, .revenue, .earnings
        `);
        
        newBalanceElements.forEach(element => {
          const elementKey = getElementKey(element);
          if (!originalBalanceValues.has(elementKey)) {
            originalBalanceValues.set(elementKey, {
              element: element,
              text: element.textContent
            });
            element.textContent = "***";
          }
        });
      }
      
      // If currency is hidden, process new text nodes
      if (currencyHidden) {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE && !isInIgnoredElement(node)) {
                // Process text nodes in the new element
                const textWalker = document.createTreeWalker(
                  node,
                  NodeFilter.SHOW_TEXT,
                  null,
                  false
                );
                
                const currencyRegex = /(\$|€|£|¥)(\d[\d,.\s]*)/g;
                let currentTextNode;
                
                while (currentTextNode = textWalker.nextNode()) {
                  if (currencyRegex.test(currentTextNode.nodeValue)) {
                    const nodeKey = getTextNodeKey(currentTextNode);
                    
                    // Store original value
                    originalCurrencyValues.set(nodeKey, {
                      parentPath: getNodePath(currentTextNode.parentNode),
                      text: currentTextNode.nodeValue,
                      index: getTextNodeIndex(currentTextNode)
                    });
                    
                    // Replace currency amounts with asterisks
                    currentTextNode.nodeValue = currentTextNode.nodeValue.replace(
                      currencyRegex, 
                      (match, currency) => `${currency}***`
                    );
                  }
                }
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("Error in mutation observer:", error);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  return observer;
}
