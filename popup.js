// Initialize the UI when popup opens
document.addEventListener('DOMContentLoaded', () => {
  initializeUi();
  initializeThemeToggle();
});

// Setup theme toggle functionality with system theme detection
function initializeThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const moonIcon = themeToggle.querySelector('.moon');
  const sunIcon = themeToggle.querySelector('.sun');
  
  // First check if user has explicitly saved a theme preference
  const savedTheme = localStorage.getItem('privacyLens-theme');
  
  // If no saved preference, check system preference
  if (!savedTheme) {
    // Check if system prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
      localStorage.setItem('privacyLens-theme', 'dark');
      console.log('Using system preference: dark mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
      localStorage.setItem('privacyLens-theme', 'light');
      console.log('Using system preference: light mode');
    }
  } else {
    // Use saved preference
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
    } else {
      document.documentElement.removeAttribute('data-theme');
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
    }
    console.log(`Using saved theme preference: ${savedTheme} mode`);
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    // Only auto-update if the user hasn't explicitly set a preference
    const userPreference = localStorage.getItem('privacyLens-userSelected');
    if (userPreference !== 'true') {
      const newTheme = event.matches ? 'dark' : 'light';
      console.log(`System theme changed to ${newTheme}, updating...`);
      
      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
        localStorage.setItem('privacyLens-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
        localStorage.setItem('privacyLens-theme', 'light');
      }
    }
  });
  
  // Handle click on theme toggle
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // Mark that the user has explicitly selected a theme
    localStorage.setItem('privacyLens-userSelected', 'true');
    
    if (currentTheme === 'dark') {
      // Switch to light mode
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('privacyLens-theme', 'light');
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
    } else {
      // Switch to dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('privacyLens-theme', 'dark');
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
    }
  });
}

// Setup event listeners for toggles
document.getElementById('toggleBalance').addEventListener('click', function() {
  this.classList.toggle('active');
  toggleFeature('toggleBalance', 'Balance');
});

document.getElementById('toggleCurrency').addEventListener('click', function() {
  this.classList.toggle('active');
  toggleFeature('toggleCurrency', 'Currency amounts');
});

// Function to toggle features
async function toggleFeature(action, featureName) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on a Fiverr page
    if (!tab.url || !tab.url.includes('fiverr.com')) {
      document.getElementById('status').textContent = 'Please navigate to Fiverr.com first';
      document.getElementById('status').classList.add('animated');
      return;
    }
    
    // Send the toggle command to the content script
    chrome.tabs.sendMessage(tab.id, { action: action }, response => {
      if (chrome.runtime.lastError) {
        document.getElementById('status').textContent = `Error: Failed to toggle ${featureName.toLowerCase()}`;
        console.log('Toggle error:', chrome.runtime.lastError.message);
      } else {
        const isHidden = response && response.hidden;
        const state = isHidden ? 'hidden' : 'visible';
        document.getElementById('status').textContent = `${featureName} now ${state}`;
        document.getElementById('status').classList.add('animated');
        
        // Update button state
        updateButtonState(action, isHidden);
      }
    });
  } catch (error) {
    document.getElementById('status').textContent = 'Error: ' + error.message;
    console.error(error);
  }
}

// Update toggle button state
function updateButtonState(buttonId, isHidden) {
  const toggle = document.getElementById(buttonId);
  if (toggle) {
    if (isHidden) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }
}

// Initialize UI based on current state
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
        // Update toggle states based on current settings
        updateButtonState('toggleBalance', response.balanceHidden);
        updateButtonState('toggleCurrency', response.currencyHidden);
        
        // Show status
        const balanceState = response.balanceHidden ? 'hidden' : 'visible';
        const currencyState = response.currencyHidden ? 'hidden' : 'visible';
        document.getElementById('status').textContent = `Balance: ${balanceState}, Currency: ${currencyState}`;
      }
    });
  } catch (error) {
    document.getElementById('status').textContent = 'Error initializing: ' + error.message;
    console.error(error);
  }
}