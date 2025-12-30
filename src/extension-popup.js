// Ghost Catcher Extension - Popup Script with Firebase Integration

// Import Firebase (loaded from CDN in popup.html)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUrl = '';
let currentTitle = '';
let screenshotData = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab.url;
  currentTitle = tab.title;
  
  // Display context
  document.getElementById('contextUrl').textContent = `Page: ${currentUrl}`;
  document.getElementById('contextTime').textContent = `Time: ${new Date().toLocaleString()}`;
  
  // Load saved email if exists
  chrome.storage.sync.get(['userEmail'], (result) => {
    if (result.userEmail) {
      document.getElementById('email').value = result.userEmail;
    }
  });
  
  // Setup impact slider
  const impactSlider = document.getElementById('impact');
  const impactValue = document.getElementById('impactValue');
  
  impactSlider.addEventListener('input', (e) => {
    impactValue.textContent = e.target.value;
  });
  
  // Setup form submission
  document.getElementById('ghostForm').addEventListener('submit', handleSubmit);
  
  // Setup cancel button
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });
  
  // Setup screenshot button
  document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);
  
  // Setup report another button
  document.getElementById('reportAnotherBtn').addEventListener('click', () => {
    document.getElementById('successView').classList.remove('show');
    document.getElementById('formView').style.display = 'block';
    resetForm();
  });
});

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  const ghostId = generateGhostId();
  
  const formData = {
    id: ghostId,
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    category: document.getElementById('category').value,
    impact: parseInt(document.getElementById('impact').value),
    effort: 3, // Default effort
    email: document.getElementById('email').value,
    reporterEmail: document.getElementById('email').value,
    reporter: document.getElementById('email').value.split('@')[0], // Extract name from email
    department: 'Not specified',
    geography: 'Global',
    riskType: [],
    url: currentUrl,
    pageTitle: currentTitle,
    timestamp: new Date().toISOString(),
    dateReported: new Date().toISOString().split('T')[0],
    status: 'New',
    assignedTo: null,
    resolutionNotes: '',
    daysOpen: 0,
    screenshot: screenshotData
  };
  
  // Save email for next time
  chrome.storage.sync.set({ userEmail: formData.email });
  
  try {
    // Send to Firebase
    await addDoc(collection(db, 'ghosts'), formData);
    
    console.log('Ghost reported to Firebase:', ghostId);
    
    // Show success
    showSuccess(ghostId);
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'ghostReported',
      ghostId: ghostId
    });
    
  } catch (error) {
    console.error('Error reporting ghost:', error);
    alert('Error reporting ghost. Please check your internet connection and try again.');
  }
}

// Generate unique ghost ID
function generateGhostId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `GH-${timestamp.toString().slice(-6)}${random}`;
}

// Take screenshot of current tab
async function takeScreenshot() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Capture visible tab
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        alert('Screenshot failed: ' + chrome.runtime.lastError.message);
        return;
      }
      
      screenshotData = dataUrl;
      
      // Show preview
      const preview = document.getElementById('screenshotPreview');
      const img = document.getElementById('screenshotImg');
      img.src = dataUrl;
      preview.classList.add('show');
      
      // Update button
      document.getElementById('screenshotBtn').textContent = '✅ Screenshot Captured';
      document.getElementById('screenshotBtn').style.background = '#d4edda';
      document.getElementById('screenshotBtn').style.borderColor = '#c3e6cb';
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    alert('Unable to take screenshot. Please check permissions.');
  }
}

// Show success message
function showSuccess(ghostId) {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('successView').classList.add('show');
  document.getElementById('ghostId').textContent = ghostId;
  
  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Ghost Reported! 👻',
    message: `Tracking ID: ${ghostId}\nYour ghost has been captured and sent to the COO's office.`,
    priority: 2
  });
  
  // Auto-close after 3 seconds
  setTimeout(() => {
    window.close();
  }, 3000);
}

// Reset form
function resetForm() {
  document.getElementById('ghostForm').reset();
  document.getElementById('impact').value = 3;
  document.getElementById('impactValue').textContent = '3';
  screenshotData = null;
  
  const preview = document.getElementById('screenshotPreview');
  preview.classList.remove('show');
  
  document.getElementById('screenshotBtn').textContent = '📸 Add Screenshot (Optional)';
  document.getElementById('screenshotBtn').style.background = '#edf2f7';
  document.getElementById('screenshotBtn').style.borderColor = '#cbd5e0';
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ghostReported') {
    console.log('Ghost reported via background:', request.ghostId);
  }
});
