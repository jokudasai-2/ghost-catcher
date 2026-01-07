console.log('Ghost Catcher Extension: Loading...');

const SUPABASE_URL = "https://qjtfpkhlhaimhkxbaoos.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdGZwa2hsaGFpbWhreGJhb29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc2NDksImV4cCI6MjA4MzE3MzY0OX0.SZpdeXm2C7iW5Kcsc0kjOwSPSiHVgDOQSH_SlFjA37Q";
const API_URL = `${SUPABASE_URL}/functions/v1/submit-ghost`;

console.log('Supabase API configured');

let currentUrl = '';
let currentTitle = '';
let screenshotData = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab.url;
  currentTitle = tab.title;

  console.log('Current page:', currentUrl);

  document.getElementById('contextUrl').textContent = currentUrl.length > 50 ? currentUrl.substring(0, 50) + '...' : currentUrl;
  document.getElementById('contextTime').textContent = new Date().toLocaleString();

  const impactSlider = document.getElementById('impact');
  const impactValue = document.getElementById('impactValue');

  impactSlider.addEventListener('input', (e) => {
    impactValue.textContent = e.target.value;
  });

  document.getElementById('ghostForm').addEventListener('submit', handleSubmit);

  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });

  document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);

  document.getElementById('reportAnotherBtn').addEventListener('click', () => {
    document.getElementById('successView').classList.remove('show');
    document.getElementById('formView').style.display = 'block';
    resetForm();
  });
});

async function handleSubmit(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Reporting Ghost...';

  const ghostId = generateGhostId();
  const now = new Date();

  const formData = {
    id: ghostId,
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    category: document.getElementById('category').value,
    impact: parseInt(document.getElementById('impact').value),
    effort: 3,
    email: '',
    reporterEmail: '',
    reporter: 'Anonymous',
    department: 'Not specified',
    geography: 'Global',
    riskType: [],
    url: currentUrl,
    pageTitle: currentTitle,
    timestamp: now.toISOString(),
    dateReported: now.toISOString().split('T')[0],
    status: 'New',
    assignedTo: null,
    resolutionNotes: '',
    daysOpen: 0,
    screenshot: screenshotData
  };

  try {
    console.log('Attempting to report ghost:', ghostId);
    console.log('Form data:', formData);

    const authToken = await getAuthToken();
    if (!authToken) {
      throw new Error('You must be logged in to report ghosts. Please sign in to the Ghost Catcher web app first.');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('Ghost successfully reported!');
    console.log('Ghost ID:', ghostId);

    showSuccess(ghostId);

    chrome.runtime.sendMessage({
      action: 'ghostReported',
      ghostId: ghostId
    });

  } catch (error) {
    console.error('Error reporting ghost:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Report Ghost 👻';

    alert(`Error: ${error.message}\n\nPlease check:\n1. You are signed in to Ghost Catcher\n2. Your internet connection\n3. Browser console (F12) for details`);
  }
}

async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['supabase_auth_token'], (result) => {
      resolve(result.supabase_auth_token || null);
    });
  });
}

function generateGhostId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `GH-${timestamp.toString().slice(-6)}${random}`;
}

async function takeScreenshot() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        alert('Screenshot failed: ' + chrome.runtime.lastError.message);
        return;
      }

      screenshotData = dataUrl;

      const preview = document.getElementById('screenshotPreview');
      const img = document.getElementById('screenshotImg');
      img.src = dataUrl;
      preview.classList.add('show');

      document.getElementById('screenshotBtn').textContent = '✅ Screenshot Captured';
      document.getElementById('screenshotBtn').style.background = '#d4edda';
      document.getElementById('screenshotBtn').style.borderColor = '#c3e6cb';
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    alert('Unable to take screenshot. Please check permissions.');
  }
}

function showSuccess(ghostId) {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('successView').classList.add('show');
  document.getElementById('ghostId').textContent = ghostId;

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Ghost Reported! 👻',
    message: `Tracking ID: ${ghostId}\nYour ghost has been captured and sent to the operations team.`,
    priority: 2
  });

  setTimeout(() => {
    window.close();
  }, 3000);
}

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ghostReported') {
    console.log('Ghost reported via background:', request.ghostId);
  }
});
