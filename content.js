// This script runs in the context of the Fiverr website
let balanceHidden = false;
let currencyHidden = false;
let namesHidden = false;
const originalBalanceValues = new Map();
const originalCurrencyValues = new Map();
const originalNameValues = new Map();

// Create a stylesheet that will be used for immediate hiding
let immediateHidingStyle = null;

// Apply immediate hiding with CSS as early as possible (before DOM is ready)
function applyImmediateHiding() {
  try {
    // Check saved preferences from localStorage
    const savedBalanceHidden = localStorage.getItem('fiverr-hide-balance') === 'true';
    const savedCurrencyHidden = localStorage.getItem('fiverr-hide-currency') === 'true';
    const savedNamesHidden = localStorage.getItem('fiverr-hide-names') === 'true';
    
    // Set initial state variables to match saved preferences
    balanceHidden = savedBalanceHidden;
    currencyHidden = savedCurrencyHidden;
    namesHidden = savedNamesHidden;
    
    // Only inject CSS if any feature should be hidden
    if (savedBalanceHidden || savedCurrencyHidden || savedNamesHidden) {
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
      
      if (savedNamesHidden) {
        cssRules.push(`
          div.tbl-row div.username,
          div.conversation p.conversation-title,
          div.content-container strong.display-name,
          .display-name,
          .conversation-description,
          .username,
          .user-name,
          .seller-name,
          [class*="username"],
          [class*="userName"] {
            filter: blur(3px) !important;
            content: "User" !important;
          }
          
          div.tbl-row div.username::before,
          div.conversation p.conversation-title::before,
          div.content-container strong.display-name::before,
          .display-name::before,
          .conversation-description::before,
          .username::before,
          .user-name::before,
          .seller-name::before,
          [class*="username"]::before,
          [class*="userName"]::before {
            content: "User";
            position: absolute;
            filter: blur(0);
            color: transparent;
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

// Function to hide or show usernames
function toggleNamesVisibility(forceState = null) {
  // If forceState is provided, use it instead of toggling
  if (forceState !== null) {
    namesHidden = forceState;
  } else {
    namesHidden = !namesHidden;
  }
  
  // Save state to local storage
  localStorage.setItem('fiverr-hide-names', namesHidden.toString());
  
  // Remove any immediate hiding CSS
  removeImmediateHidingStyle();
  
  // Re-apply CSS with updated settings
  applyCorrectStyles();
  
  // Username selectors - target all username elements with expanded selectors
  const usernameElements = document.querySelectorAll(`
    div.tbl-row div.username,
    div.conversation p.conversation-title,
    div.content-container strong.display-name,
    .display-name,
    .conversation-description,
    .username,
    .user-name,
    .seller-name,
    [class*="username"],
    [class*="userName"]
  `);
  
  console.log(`Found ${usernameElements.length} username elements to toggle (hidden: ${namesHidden})`);
  
  usernameElements.forEach(element => {
    // Generate a unique key for this element
    const elementKey = getElementKey(element);
    
    if (namesHidden) {
      // Store original text if not already stored
      if (!originalNameValues.has(elementKey)) {
        originalNameValues.set(elementKey, {
          element: element,
          text: element.textContent,
          style: element.getAttribute('style') || ''
        });
      }
      
      // Apply blur effect and replace content with "User"
      element.textContent = "User";
      element.style.filter = "blur(3px)";
      
      // Add a hover effect to temporarily show content on hover (for usability)
      element.style.transition = "filter 0.3s ease";
      element.addEventListener('mouseenter', unblurTemporarily);
      element.addEventListener('mouseleave', reblur);
    } else {
      // Restore original text and remove blur
      const originalData = originalNameValues.get(elementKey);
      if (originalData) {
        element.textContent = originalData.text;
        
        // Restore original style or remove the blur filter
        if (originalData.style) {
          element.setAttribute('style', originalData.style);
        } else {
          element.style.filter = '';
          element.style.transition = '';
        }
      }
      
      // Remove event listeners
      element.removeEventListener('mouseenter', unblurTemporarily);
      element.removeEventListener('mouseleave', reblur);
    }
  });
  
  enhancedUsernameHiding(namesHidden);
  
  return namesHidden;
}

// Add this after the toggleNamesVisibility function to handle special cases
function enhancedUsernameHiding(hide) {
  if (hide) {
    // Target profile pages and conversation pages more aggressively
    const profileElements = document.querySelectorAll('.profile-name, .seller-info h3, .seller-card h3, .user-profile-info h1, .seller-card-name');
    
    profileElements.forEach(element => {
      const elementKey = getElementKey(element);
      if (!originalNameValues.has(elementKey)) {
        originalNameValues.set(elementKey, {
          element: element,
          text: element.textContent,
          style: element.getAttribute('style') || ''
        });
      }
      
      element.textContent = "User";
      element.style.filter = "blur(3px)";
      element.style.transition = "filter 0.3s ease";
      element.addEventListener('mouseenter', unblurTemporarily);
      element.addEventListener('mouseleave', reblur);
    });
    
    // Also look for name snippets in the page that might not be easily targeted by class
    const textWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    // Look for text nodes containing potential @ usernames
    const usernameRegex = /@[A-Za-z0-9_]+\b/g;
    let currentNode;
    
    while (currentNode = textWalker.nextNode()) {
      if (!isInIgnoredElement(currentNode.parentElement) && 
          usernameRegex.test(currentNode.nodeValue)) {
        
        // Generate a unique key for this text node
        const nodeKey = getTextNodeKey(currentNode);
        
        if (!originalNameValues.has(nodeKey)) {
          originalNameValues.set(nodeKey, {
            parentPath: getNodePath(currentNode.parentNode),
            text: currentNode.nodeValue,
            index: getTextNodeIndex(currentNode)
          });
        }
        
        // Replace @ usernames with @User
        currentNode.nodeValue = currentNode.nodeValue.replace(usernameRegex, '@User');
      }
    }
  }
}

// Helper function to temporarily unblur on hover
function unblurTemporarily(event) {
  event.currentTarget.style.filter = 'blur(0px)';
}

// Helper function to reapply blur on mouse leave
function reblur(event) {
  event.currentTarget.style.filter = 'blur(3px)';
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
  
  if (namesHidden) {
    cssRules.push(`
      div.tbl-row div.username,
      div.conversation p.conversation-title,
      div.content-container strong.display-name,
      .display-name,
      .conversation-description,
      .username,
      .user-name,
      .seller-name,
      [class*="username"],
      [class*="userName"] {
        filter: blur(3px) !important;
        content: "User" !important;
      }
      
      div.tbl-row div.username::before,
      div.conversation p.conversation-title::before,
      div.content-container strong.display-name::before,
      .display-name::before,
      .conversation-description::before,
      .username::before,
      .user-name::before,
      .seller-name::before,
      [class*="username"]::before,
      [class*="userName"]::before {
        content: "User";
        position: absolute;
        filter: blur(0);
        color: transparent;
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
  console.log("PrivacyLens for Fiverr: Content script initialized");
  
  // Create a small notification to confirm script loaded
  const notification = document.createElement('div');
  notification.textContent = 'PrivacyLens active';
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
  const savedNamesHidden = localStorage.getItem('fiverr-hide-names');
  
  console.log('Applying saved settings:', { 
    savedBalanceHidden, 
    savedCurrencyHidden, 
    savedNamesHidden 
  });
  
  // Apply balance setting if it exists
  if (savedBalanceHidden === 'true') {
    toggleBalanceVisibility(true);
  }
  
  // Apply currency setting if it exists
  if (savedCurrencyHidden === 'true') {
    toggleCurrencyVisibility(true);
  }
  
  // Apply names setting if it exists
  if (savedNamesHidden === 'true') {
    toggleNamesVisibility(true);
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
        currencyHidden: currencyHidden,
        namesHidden: namesHidden
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
    
    if (message.action === "toggleNames") {
      console.log("Toggle names request received");
      const isNowHidden = toggleNamesVisibility();
      sendResponse({ success: true, hidden: isNowHidden });
      return true;
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ success: false, error: error.message });
    return true;
  }
});

// Modify your observeDynamicChanges function to be more aggressive
function observeDynamicChanges() {
  const observer = new MutationObserver((mutations) => {
    try {
      // If names are hidden, check for new elements
      if (namesHidden) {
        // Check for DOM changes that might contain usernames
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // If entire elements were added, check them for username elements
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Find all potential username elements within this node
                const newUsernames = node.querySelectorAll(`
                  div.tbl-row div.username,
                  div.conversation p.conversation-title,
                  div.content-container strong.display-name,
                  .display-name,
                  .conversation-description,
                  .username,
                  .user-name,
                  .seller-name,
                  [class*="username"],
                  [class*="userName"],
                  [data-username],
                  [aria-label*="username"],
                  [title*="username"]
                `);
                
                newUsernames.forEach(element => {
                  const elementKey = getElementKey(element);
                  if (!originalNameValues.has(elementKey) && !element.style.filter.includes('blur')) {
                    originalNameValues.set(elementKey, {
                      element: element,
                      text: element.textContent,
                      style: element.getAttribute('style') || ''
                    });
                    
                    // Apply blur effect and replace content with "User"
                    element.textContent = "User";
                    element.style.filter = "blur(3px)";
                    element.style.transition = "filter 0.3s ease";
                    
                    // Add hover behavior
                    element.addEventListener('mouseenter', unblurTemporarily);
                    element.addEventListener('mouseleave', reblur);
                  }
                });
                
                // Also check for profile elements within this node
                enhancedUsernameHiding(true);
              }
            });
          } else if (mutation.type === 'characterData') {
            // If text content changed, check if it contains usernames
            const node = mutation.target;
            if (node.nodeType === Node.TEXT_NODE) {
              const usernameRegex = /@[A-Za-z0-9_]+\b/g;
              if (!isInIgnoredElement(node.parentElement) && 
                  usernameRegex.test(node.nodeValue)) {
                
                const nodeKey = getTextNodeKey(node);
                if (!originalNameValues.has(nodeKey)) {
                  originalNameValues.set(nodeKey, {
                    parentPath: getNodePath(node.parentNode),
                    text: node.nodeValue,
                    index: getTextNodeIndex(node)
                  });
                }
                
                node.nodeValue = node.nodeValue.replace(usernameRegex, '@User');
              }
            }
          }
        });
        
        // Do a full scan periodically to catch everything
        if (Math.random() < 0.1) { // 10% chance on each mutation batch
          toggleNamesVisibility(true);
        }
      }
      
      // Existing code for balance and currency...
      
    } catch (error) {
      console.error("Error in mutation observer:", error);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'data-username']
  });
  
  return observer;
}