// Global variables - these need to be defined at the top
let balanceHidden = false;
let namesHidden = false;
let immediateHidingStyle = null;
let originalBalanceValues = new Map();
let originalNameValues = new Map();

// Function to apply CSS rules for hiding financial information
function applyImmediateHiding() {
  try {
    // Check saved preferences from localStorage
    const savedBalanceHidden = localStorage.getItem('fiverr-hide-balance') === 'true';
    const savedNamesHidden = localStorage.getItem('fiverr-hide-names') === 'true';
    
    // Set initial state variables to match saved preferences
    balanceHidden = savedBalanceHidden;
    namesHidden = savedNamesHidden;
    
    // Only inject CSS if any feature should be hidden
    if (savedBalanceHidden || savedNamesHidden) {
      // Create style element if it doesn't exist
      if (!immediateHidingStyle) {
        immediateHidingStyle = document.createElement('style');
        immediateHidingStyle.id = 'fiverr-hide-immediate-style';
      }
      
      let cssRules = [];
      
      if (savedBalanceHidden) {
        // Expanded selector based on your specific element examples
        cssRules.push(`
          /* Balance elements - General classes */
          .grade, .user-balance, .wallet-balance, ul.order-data > li > span,
          .balance-line, .total-balance, .revenue, .earnings,
          .dashboard-balance-value, [class*="Balance"], [id*="balance"],
          [data-testid*="balance"], [data-testid*="earnings"], [data-testid*="revenue"],
          .grey-1200-balance, .earnings-overflow-auto, .earnings-whitespace-nowrap,
          .kpi-data-inner .grade,
          
          /* Table cells with price values */
          tr.table-tr td.table-td span.text-bold,
          
          /* Price elements */
          .price-wrapper, .price-tag, .price-unit, .gig-card-price, 
          .price, .amount, .js-price, span[itemprop="price"],
          .order-price, .total-price, .package-price, .sub-price,
          .fee-price, .service-price, .gig-price, .tip-price,
          [class*="price"], [class*="Price"], [class*="amount"], [class*="Amount"],
          [data-testid*="price"], [data-testid*="amount"],
          
          /* Specific element selectors */
          #__ZONE__main > div > div > div > div.right-panel > div > div.filter-wrapper.cf > div.title-wrapper > h3 > span,
          
          /* Additional specific Fiverr elements */
          .gig-card-base__price, .package-base__price, 
          .seller-card__price, .gig-poster-price__price,
          span[data-test-selector="package-price"], 
          span[itemprop="price"],
          .package-row__price,
          tr.table-tr td.table-td span[class*="text-bold"] {
            filter: blur(3px) !important;
            transition: filter 0.3s ease !important;
          }
          
          /* Target specific money amounts in text */
          span:not(.privacy-lens-exempt):has(+ span.text-bold),
          span.text-bold {
            filter: blur(3px) !important;
            transition: filter 0.3s ease !important;
          }
        `);
      }
      
      if (savedNamesHidden) {
        cssRules.push(`
          div.tbl-row div.username,
          div.conversation p.conversation-title,
          div.content-container strong.display-name,
          .display-name, .seller-display-name,
          .conversation-description,
          .username, .user-name, .user-info-name,
          .seller-name, .seller-card-name, .profile-name,
          .co-text-medium,
          td.table-td span.co-text-medium,
          [class*="username"], [class*="userName"],
          [data-username], [aria-label*="username"],
          [title*="username"] {
            filter: blur(3px) !important;
            transition: filter 0.3s ease !important;
          }
        `);
      }
      
      immediateHidingStyle.textContent = cssRules.join('\n');
      
      // Insert as early as possible
      if (document.head) {
        document.head.appendChild(immediateHidingStyle);
      } else if (document.documentElement) {
        document.documentElement.appendChild(immediateHidingStyle);
      }
      
      console.log('Immediate hiding CSS applied');
    }
  } catch (error) {
    console.error('Error applying immediate hiding:', error);
  }
}

// Apply the correct styles based on current settings
function applyCorrectStyles() {
  // Create a new style element
  const style = document.createElement('style');
  style.id = 'fiverr-hide-immediate-style';
  let cssRules = [];
  
  if (balanceHidden) {
    cssRules.push(`
      /* Balance elements - General classes */
      .grade, .user-balance, .wallet-balance, ul.order-data > li > span,
      .balance-line, .total-balance, .revenue, .earnings,
      .dashboard-balance-value, [class*="Balance"], [id*="balance"],
      [data-testid*="balance"], [data-testid*="earnings"], [data-testid*="revenue"],
      .grey-1200-balance, .earnings-overflow-auto, .earnings-whitespace-nowrap,
      .kpi-data-inner .grade,
      
      /* Table cells with price values */
      tr.table-tr td.table-td span.text-bold,
      
      /* Price elements */
      .price-wrapper, .price-tag, .price-unit, .gig-card-price, 
      .price, .amount, .js-price, span[itemprop="price"],
      .order-price, .total-price, .package-price, .sub-price,
      .fee-price, .service-price, .gig-price, .tip-price,
      [class*="price"], [class*="Price"], [class*="amount"], [class*="Amount"],
      [data-testid*="price"], [data-testid*="amount"],
      
      /* Specific element selectors */
      #__ZONE__main > div > div > div > div.right-panel > div > div.filter-wrapper.cf > div.title-wrapper > h3 > span,
      
      /* Additional specific Fiverr elements */
      .gig-card-base__price, .package-base__price, 
      .seller-card__price, .gig-poster-price__price,
      span[data-test-selector="package-price"], 
      span[itemprop="price"],
      .package-row__price,
      tr.table-tr td.table-td span[class*="text-bold"] {
        filter: blur(3px) !important;
        transition: filter 0.3s ease !important;
      }
      
      /* Target specific money amounts in text */
      span:not(.privacy-lens-exempt):has(+ span.text-bold),
      span.text-bold {
        filter: blur(3px) !important;
        transition: filter 0.3s ease !important;
      }
    `);
  }
  
  if (namesHidden) {
    cssRules.push(`
      div.tbl-row div.username,
      div.conversation p.conversation-title,
      div.content-container strong.display-name,
      .display-name, .seller-display-name,
      .conversation-description,
      .username, .user-name, .user-info-name,
      .seller-name, .seller-card-name, .profile-name,
      .co-text-medium,
      td.table-td span.co-text-medium,
      [class*="username"], [class*="userName"],
      [data-username], [aria-label*="username"],
      [title*="username"] {
        filter: blur(3px) !important;
        transition: filter 0.3s ease !important;
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

// Function to handle toggling balance visibility with improved unblurring
function toggleBalanceVisibility(forceState = null) {
  try {
    // If forceState is provided, use it instead of toggling
    if (forceState !== null) {
      balanceHidden = forceState;
    } else {
      balanceHidden = !balanceHidden;
    }
    
    console.log(`Toggling financial information to: ${balanceHidden ? 'hidden' : 'visible'}`);
    
    // Save state to local storage
    localStorage.setItem('fiverr-hide-balance', balanceHidden.toString());
    
    // Remove any immediate hiding CSS
    removeImmediateHidingStyle();
    
    // Re-apply CSS with updated settings
    applyCorrectStyles();
    
    // Find all existing privacy-lens-currency spans and remove them if unhiding
    if (!balanceHidden) {
      console.log("Removing currency blur spans...");
      
      // Clear the original values map to prevent issues with stale references
      originalBalanceValues.clear();
      
      // 1. Remove all inline blur styles
      const blurredElements = document.querySelectorAll('[data-blur-type="balance"]');
      blurredElements.forEach(element => {
        try {
          element.style.filter = '';
          element.style.transition = '';
          delete element.dataset.blurType;
          element.removeEventListener('mouseenter', unblurTemporarily);
          element.removeEventListener('mouseleave', reblur);
        } catch (error) {
          console.error("Error clearing element blur:", error);
        }
      });
      
      // 2. Remove all privacy-lens-currency spans
      const currencySpans = document.querySelectorAll('.privacy-lens-currency');
      currencySpans.forEach(span => {
        try {
          if (span.parentNode) {
            const textNode = document.createTextNode(span.textContent);
            span.parentNode.replaceChild(textNode, span);
          }
        } catch (error) {
          console.error("Error removing currency span:", error);
        }
      });
      
      console.log(`Removed currency blur from elements`);
      return balanceHidden;
    }
    
    // Enhanced selector for balance and price elements (if hiding)
    const balanceElements = document.querySelectorAll(`
      /* Balance elements - General classes */
      .grade, .user-balance, .wallet-balance, ul.order-data > li > span,
      .balance-line, .total-balance, .revenue, .earnings,
      .dashboard-balance-value, [class*="Balance"], [id*="balance"],
      [data-testid*="balance"], [data-testid*="earnings"], [data-testid*="revenue"],
      .grey-1200-balance, .earnings-overflow-auto, .earnings-whitespace-nowrap,
      .kpi-data-inner .grade,
      
      /* Table cells with price values */
      tr.table-tr td.table-td span.text-bold,
      
      /* Price elements */
      .price-wrapper, .price-tag, .price-unit, .gig-card-price, 
      .price, .amount, .js-price, span[itemprop="price"],
      .order-price, .total-price, .package-price, .sub-price,
      .fee-price, .service-price, .gig-price, .tip-price,
      [class*="price"], [class*="Price"], [class*="amount"], [class*="Amount"],
      [data-testid*="price"], [data-testid*="amount"],
      
      /* Specific element selectors */
      #__ZONE__main > div > div > div > div.right-panel > div > div.filter-wrapper.cf > div.title-wrapper > h3 > span,
      
      /* Additional specific Fiverr elements */
      .gig-card-base__price, .package-base__price, 
      .seller-card__price, .gig-poster-price__price,
      span[data-test-selector="package-price"], 
      span[itemprop="price"],
      .package-row__price,
      tr.table-tr td.table-td span[class*="text-bold"]
    `);
    
    console.log(`Found ${balanceElements.length} balance/price elements to hide`);
    
    // Process all the matched elements
    balanceElements.forEach(element => {
      try {
        // Skip already blurred elements
        if (element.style.filter && element.style.filter.includes('blur')) {
          return;
        }
        
        // Generate a unique key for this element
        const elementKey = getElementKey(element);
        
        // Store original text and style if not already stored
        if (!originalBalanceValues.has(elementKey)) {
          originalBalanceValues.set(elementKey, {
            element: element,
            text: element.textContent,
            style: element.getAttribute('style') || ''
          });
        }
        
        // Apply blur effect
        element.style.filter = "blur(3px)";
        element.style.transition = "filter 0.3s ease";
        
        // Tag element for reblur function to identify the type
        element.dataset.blurType = 'balance';
        
        // Add hover effect to temporarily show content
        element.addEventListener('mouseenter', unblurTemporarily);
        element.addEventListener('mouseleave', reblur);
      } catch (error) {
        console.error("Error processing element:", error);
      }
    });
    
    // Also process text nodes for inline currency values
    processTextNodesInBody();
    
    return balanceHidden;
  } catch (error) {
    console.error("Error in toggleBalanceVisibility:", error);
    return balanceHidden;
  }
}

// Process inline text nodes for currency values
function processTextNodesInBody() {
  try {
    // Target all text nodes in the document
    const textWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    // More comprehensive currency regex to catch amounts with and without currency symbols
    const currencyRegex = /(\$|€|£|¥|USD|EUR|GBP|JPY)\s*(\d[\d,.\s]*)/g;
    const amountRegex = /(?:total|price|amount|cost|payment|paid|balance|earning)s?\s*(?:is|of|:)?\s*(\$|€|£|¥|USD|EUR|GBP|JPY)?\s*(\d[\d,.\s]*)/i;
    
    let currentNode;
    let processedNodes = 0;
    
    // Process all text nodes
    while (currentNode = textWalker.nextNode()) {
      if (!isInIgnoredElement(currentNode.parentElement)) {
        // Check for currency values in this text node
        const hasCurrency = currencyRegex.test(currentNode.nodeValue);
        const hasAmount = amountRegex.test(currentNode.nodeValue);
        
        if (hasCurrency || hasAmount) {
          // Generate a unique key for this text node
          const nodeKey = getTextNodeKey(currentNode);
          const parentNode = currentNode.parentNode;
          const originalText = currentNode.nodeValue;
          
          // Store original value if we haven't already
          if (!originalBalanceValues.has(nodeKey)) {
            originalBalanceValues.set(nodeKey, {
              parentPath: getNodePath(parentNode),
              text: originalText,
              index: getTextNodeIndex(currentNode)
            });
            
            // Only replace if we haven't already
            // Replace the text node with a span element containing the text
            // This allows us to apply the blur effect
            const tempDiv = document.createElement('div');
            
            // Pattern to replace prices with blurred spans
            const patternReplacer = (match) => {
              return `<span class="privacy-lens-currency" data-blur-type="balance" 
                  style="filter: blur(3px); transition: filter 0.3s ease;"
                  onmouseover="this.style.filter='blur(0)'" 
                  onmouseout="this.style.filter='blur(3px)'">` 
                + match + 
              '</span>';
            };
            
            // Replace both types of currency patterns
            let processedText = originalText.replace(currencyRegex, patternReplacer);
            processedText = processedText.replace(amountRegex, patternReplacer);
            
            tempDiv.innerHTML = processedText;
            
            // If the parent is already a span with our class, we don't need to replace
            if (parentNode.tagName !== 'SPAN' || !parentNode.classList.contains('privacy-lens-currency')) {
              // Replace the text node with our new HTML
              const fragment = document.createDocumentFragment();
              while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
              }
              parentNode.replaceChild(fragment, currentNode);
              processedNodes++;
            }
          }
        }
      }
    }
    
    console.log(`Processed ${processedNodes} text nodes containing currency values`);
  } catch (error) {
    console.error("Error in processTextNodesInBody:", error);
  }
}

// Helper function to detect prices in tables
function detectPricesInTables() {
  try {
    // Look for table cells that might contain prices
    const tableCells = document.querySelectorAll('td, th');
    let found = 0;
    
    tableCells.forEach(cell => {
      // Skip if already processed
      if (cell.dataset.priceLensProcessed) return;
      
      // Mark as processed
      cell.dataset.priceLensProcessed = 'true';
      
      // Check for currency patterns in the cell text
      const text = cell.textContent.trim();
      if (/\$\d+|\$\d+\.\d+|\d+\.\d+\$|\d+\$/.test(text)) {
        // This might be a price cell
        if (text.length < 30 && !cell.querySelector('.privacy-lens-currency')) {
          // Apply blur to the entire cell or to specific spans
          const priceSpans = cell.querySelectorAll('span');
          
          if (priceSpans.length > 0) {
            // Try to target just the price spans
            priceSpans.forEach(span => {
              if (/\$\d+|\$\d+\.\d+|\d+\.\d+\$|\d+\$/.test(span.textContent)) {
                span.style.filter = "blur(3px)";
                span.style.transition = "filter 0.3s ease";
                span.dataset.blurType = 'balance';
                span.addEventListener('mouseenter', unblurTemporarily);
                span.addEventListener('mouseleave', reblur);
                found++;
              }
            });
          } else {
            // Apply to the whole cell
            cell.style.filter = "blur(3px)";
            cell.style.transition = "filter 0.3s ease";
            cell.dataset.blurType = 'balance';
            cell.addEventListener('mouseenter', unblurTemporarily);
            cell.addEventListener('mouseleave', reblur);
            found++;
          }
        }
      }
    });
    
    if (found > 0) {
      console.log(`Found and blurred ${found} table cells with prices`);
    }
  } catch (error) {
    console.error("Error in detectPricesInTables:", error);
  }
}

// Handle dynamically loaded content
function observeDynamicChanges() {
  const observer = new MutationObserver((mutations) => {
    try {
      // Check for relevant changes that might contain prices or usernames
      let hasRelevantChanges = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // If entire elements were added
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // If we've added a table or a div that might contain financial info
              const isRelevantAddition = node.tagName === 'TABLE' || 
                                         node.tagName === 'TR' ||
                                         node.tagName === 'DIV' ||
                                         node.classList && 
                                         (node.classList.contains('price') || 
                                          node.classList.contains('balance') ||
                                          node.classList.toString().includes('amount'));
              
              if (isRelevantAddition) {
                hasRelevantChanges = true;
              }
            }
          });
        }
      });
      
      // If we've detected relevant changes, reapply our hiding logic
      if (hasRelevantChanges) {
        console.log("Detected new elements that might contain prices");
        
        // Delay slightly to ensure the new content is fully rendered
        setTimeout(() => {
          if (balanceHidden) {
            detectPricesInTables();
            periodicallyRescanForPrices();
          }
          if (namesHidden) {
            enhancedUsernameHiding(true);
          }
        }, 200);
      }
    } catch (error) {
      console.error("Error in mutation observer:", error);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  return observer;
}

// Function to periodically scan for new price elements
function periodicallyRescanForPrices() {
  // Only run if balance hiding is active
  if (!balanceHidden) return;
  
  console.log("Running periodic price element scan...");
  
  // First check tables for price cells
  detectPricesInTables();
  
  // Use more specific attribute selectors to find elements with prices
  const priceRegex = /(\$|€|£|¥)\s*(\d[\d,.\s]*)/;
  const potentialPriceElements = document.querySelectorAll('span, div, strong, b');
  
  let detected = 0;
  potentialPriceElements.forEach(element => {
    // Skip elements that already have blur applied
    if (element.style.filter && element.style.filter.includes('blur')) return;
    
    // Skip elements we've already processed
    const elementKey = getElementKey(element);
    if (originalBalanceValues.has(elementKey)) return;
    
    // Check if the element contains text that looks like a price
    const text = element.textContent.trim();
    if (priceRegex.test(text) || /^\$\d+(\.\d+)?$/.test(text)) {
      // Only handle elements where a significant portion of the content is a price
      // (to avoid blurring large blocks of text that happen to contain a price)
      if (text.length < 30) {
        detected++;
        originalBalanceValues.set(elementKey, {
          element: element,
          text: element.textContent,
          style: element.getAttribute('style') || ''
        });
        
        element.style.filter = "blur(3px)";
        element.style.transition = "filter 0.3s ease";
        element.dataset.blurType = 'balance';
        element.addEventListener('mouseenter', unblurTemporarily);
        element.addEventListener('mouseleave', reblur);
      }
    }
  });
  
  if (detected > 0) {
    console.log(`Auto-detected and blurred ${detected} additional price elements`);
  }
}

// Initialize with periodic table scanning and our enhanced unblur logic
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
  
  // Set up periodic rescanning for price elements
  setInterval(() => {
    if (balanceHidden) {
      periodicallyRescanForPrices();
    }
  }, 3000);
}

// Helper functions for node processing
function getElementKey(element) {
  return getNodePath(element);
}

function getTextNodeKey(textNode) {
  return `${getNodePath(textNode.parentNode)}_${getTextNodeIndex(textNode)}`;
}

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

function isInIgnoredElement(element) {
  if (!element) return true;
  
  const ignoredTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OPTION'];
  const ignoredClasses = ['privacy-lens-exempt'];
  
  let current = element;
  
  while (current) {
    if (ignoredTags.includes(current.tagName)) {
      return true;
    }
    
    if (current.classList) {
      for (const cls of ignoredClasses) {
        if (current.classList.contains(cls)) {
          return true;
        }
      }
    }
    
    current = current.parentElement;
  }
  
  return false;
}

// Function to remove immediate hiding style
function removeImmediateHidingStyle() {
  if (immediateHidingStyle && immediateHidingStyle.parentNode) {
    immediateHidingStyle.parentNode.removeChild(immediateHidingStyle);
    immediateHidingStyle = null;
  }
}

// Function to temporarily unblur on hover
function unblurTemporarily(event) {
  try {
    if (event && event.target) {
      event.target.style.filter = 'blur(0)';
    }
  } catch (error) {
    console.error('Error in unblur:', error);
  }
}

// Function to reblur on mouse leave
function reblur(event) {
  try {
    if (event && event.target) {
      event.target.style.filter = 'blur(3px)';
    }
  } catch (error) {
    console.error('Error in reblur:', error);
  }
}

// Function to toggle username visibility
function toggleNameVisibility(forceState = null) {
  try {
    // If forceState is provided, use it instead of toggling
    if (forceState !== null) {
      namesHidden = forceState;
    } else {
      namesHidden = !namesHidden;
    }
    
    console.log(`Toggling username visibility to: ${namesHidden ? 'hidden' : 'visible'}`);
    
    // Save state to local storage
    localStorage.setItem('fiverr-hide-names', namesHidden.toString());
    
    // Remove any immediate hiding CSS
    removeImmediateHidingStyle();
    
    // Re-apply CSS with updated settings
    applyCorrectStyles();
    
    if (!namesHidden) {
      // Unhide all username elements
      const blurredElements = document.querySelectorAll('[data-blur-type="name"]');
      blurredElements.forEach(element => {
        try {
          element.style.filter = '';
          element.style.transition = '';
          delete element.dataset.blurType;
          element.removeEventListener('mouseenter', unblurTemporarily);
          element.removeEventListener('mouseleave', reblur);
        } catch (error) {
          console.error("Error clearing element blur:", error);
        }
      });
      
      // Clear the original values map to prevent issues with stale references
      originalNameValues.clear();
      
      return namesHidden;
    }
    
    // Enhanced username hiding on names
    enhancedUsernameHiding();
    
    return namesHidden;
  } catch (error) {
    console.error("Error in toggleNameVisibility:", error);
    return namesHidden;
  }
}

// Enhanced function for username hiding
function enhancedUsernameHiding(dynamicOnly = false) {
  try {
    // Username selectors
    const usernameSelectors = `
      div.tbl-row div.username,
      div.conversation p.conversation-title,
      div.content-container strong.display-name,
      .display-name, .seller-display-name,
      .conversation-description,
      .username, .user-name, .user-info-name,
      .seller-name, .seller-card-name, .profile-name,
      .co-text-medium,
      td.table-td span.co-text-medium,
      [class*="username"], [class*="userName"],
      [data-username], [aria-label*="username"],
      [title*="username"]
    `;
    
    const usernameElements = document.querySelectorAll(usernameSelectors);
    console.log(`Found ${usernameElements.length} username elements to hide`);
    
    // Process all the matched elements
    usernameElements.forEach(element => {
      try {
        // Skip already blurred elements
        if (element.style.filter && element.style.filter.includes('blur')) {
          return;
        }
        
        // Skip elements we've processed in a previous pass if this is dynamic only
        if (dynamicOnly) {
          const elementKey = getElementKey(element);
          if (originalNameValues.has(elementKey)) {
            return;
          }
        }
        
        // Generate a unique key for this element
        const elementKey = getElementKey(element);
        
        // Store original text and style if not already stored
        if (!originalNameValues.has(elementKey)) {
          originalNameValues.set(elementKey, {
            element: element,
            text: element.textContent,
            style: element.getAttribute('style') || ''
          });
        }
        
        // Apply blur effect
        element.style.filter = "blur(3px)";
        element.style.transition = "filter 0.3s ease";
        
        // Tag element for reblur function to identify the type
        element.dataset.blurType = 'name';
        
        // Add hover effect to temporarily show content
        element.addEventListener('mouseenter', unblurTemporarily);
        element.addEventListener('mouseleave', reblur);
      } catch (error) {
        console.error("Error processing username element:", error);
      }
    });
  } catch (error) {
    console.error("Error in enhancedUsernameHiding:", error);
  }
}

// Function to apply saved settings
function applySavedSettings() {
  try {
    // Check for saved settings
    const savedBalanceHidden = localStorage.getItem('fiverr-hide-balance') === 'true';
    const savedNamesHidden = localStorage.getItem('fiverr-hide-names') === 'true';
    
    console.log(`Applying saved settings: balance hidden=${savedBalanceHidden}, names hidden=${savedNamesHidden}`);
    
    // Apply the settings
    if (savedBalanceHidden) {
      toggleBalanceVisibility(true);
    }
    
    if (savedNamesHidden) {
      toggleNameVisibility(true);
    }
  } catch (error) {
    console.error("Error applying saved settings:", error);
  }
}

// Message listener for communication with popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    console.log("Received message:", request);
    
    if (request.action === "ping") {
      // Return current state
      sendResponse({
        balanceHidden: balanceHidden,
        namesHidden: namesHidden
      });
      return true;
    }
    
    if (request.action === "toggleBalance") {
      const newState = toggleBalanceVisibility();
      sendResponse({ hidden: newState });
      return true;
    }
    
    if (request.action === "toggleNames") {
      const newState = toggleNameVisibility();
      sendResponse({ hidden: newState });
      return true;
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ error: error.message });
  }
  return true;
});

// Apply immediate hiding CSS as early as possible
applyImmediateHiding();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}