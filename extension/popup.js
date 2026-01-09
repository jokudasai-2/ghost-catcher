console.log('Ghost Catcher Extension: Loading...');

const SUPABASE_URL = "https://qjtfpkhlhaimhkxbaoos.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdGZwa2hsaGFpbWhreGJhb29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc2NDksImV4cCI6MjA4MzE3MzY0OX0.SZpdeXm2C7iW5Kcsc0kjOwSPSiHVgDOQSH_SlFjA37Q";
const API_URL = `${SUPABASE_URL}/functions/v1/submit-ghost`;

console.log('Supabase API configured');

let currentUrl = '';
let currentTitle = '';
let mediaData = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab.url;
  currentTitle = tab.title;

  console.log('Current page:', currentUrl);

  document.getElementById('contextUrl').textContent = currentUrl.length > 50 ? currentUrl.substring(0, 50) + '...' : currentUrl;
  document.getElementById('contextTime').textContent = new Date().toLocaleString();
  document.getElementById('url').value = currentUrl;

  const impactSlider = document.getElementById('impact');
  const impactValue = document.getElementById('impactValue');
  const effortSlider = document.getElementById('effort');
  const effortValue = document.getElementById('effortValue');

  impactSlider.addEventListener('input', (e) => {
    impactValue.textContent = e.target.value;
  });

  effortSlider.addEventListener('input', (e) => {
    effortValue.textContent = e.target.value;
  });

  document.getElementById('advancedToggle').addEventListener('click', () => {
    const toggle = document.getElementById('advancedToggle');
    const content = document.getElementById('advancedContent');
    toggle.classList.toggle('active');
    content.classList.toggle('show');
  });

  document.getElementById('uploadArea').addEventListener('click', () => {
    document.getElementById('mediaInput').click();
  });

  document.getElementById('mediaInput').addEventListener('change', handleMediaUpload);
  document.getElementById('removeMediaBtn').addEventListener('click', removeMedia);

  document.getElementById('ghostForm').addEventListener('submit', handleSubmit);

  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });

  document.getElementById('reportAnotherBtn').addEventListener('click', () => {
    document.getElementById('successView').classList.remove('show');
    document.getElementById('formView').style.display = 'flex';
    resetForm();
  });

  loadSavedReporterInfo();
});

async function handleSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Reporting...';

  const ghostId = generateGhostId();
  const now = new Date();

  const riskCheckboxes = document.querySelectorAll('input[name="risk"]:checked');
  const riskTypes = Array.from(riskCheckboxes).map(cb => cb.value);

  const email = document.getElementById('email').value.trim();
  const reporter = document.getElementById('reporter').value.trim();
  const department = document.getElementById('department').value;
  const geography = document.getElementById('geography').value;

  const formData = {
    id: ghostId,
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    category: document.getElementById('category').value,
    impact: parseInt(document.getElementById('impact').value),
    effort: parseInt(document.getElementById('effort').value),
    email: email,
    reporterEmail: email,
    reporter: reporter || email.split('@')[0] || 'Anonymous',
    department: department || 'Not specified',
    geography: geography || 'Global',
    riskType: riskTypes,
    url: document.getElementById('url').value.trim() || currentUrl,
    pageTitle: currentTitle,
    timestamp: now.toISOString(),
    dateReported: now.toISOString().split('T')[0],
    status: 'New',
    assignedTo: null,
    resolutionNotes: '',
    daysOpen: 0,
    screenshot: mediaData
  };

  try {
    console.log('Attempting to report ghost:', ghostId);

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

    saveReporterInfo(email, reporter, department, geography);

    showSuccess(ghostId);

    chrome.runtime.sendMessage({
      action: 'ghostReported',
      ghostId: ghostId
    });

  } catch (error) {
    console.error('Error reporting ghost:', error);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Report Ghost';

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

function handleMediaUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (PNG, JPG, etc.)');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB');
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    mediaData = reader.result;

    const uploadArea = document.getElementById('uploadArea');
    const preview = document.getElementById('mediaPreview');
    const img = document.getElementById('mediaImg');

    img.src = mediaData;
    uploadArea.classList.add('has-file');
    preview.classList.add('show');
  };
  reader.readAsDataURL(file);
}

function removeMedia() {
  mediaData = null;

  const uploadArea = document.getElementById('uploadArea');
  const preview = document.getElementById('mediaPreview');
  const input = document.getElementById('mediaInput');

  uploadArea.classList.remove('has-file');
  preview.classList.remove('show');
  input.value = '';
}

function loadSavedReporterInfo() {
  chrome.storage.local.get(['ghostReporter'], (result) => {
    if (result.ghostReporter) {
      try {
        const data = JSON.parse(result.ghostReporter);
        if (data.email) document.getElementById('email').value = data.email;
        if (data.reporter) document.getElementById('reporter').value = data.reporter;
        if (data.department) document.getElementById('department').value = data.department;
        if (data.geography) document.getElementById('geography').value = data.geography;
      } catch (e) {
        console.error('Error loading saved reporter info:', e);
      }
    }
  });
}

function saveReporterInfo(email, reporter, department, geography) {
  const data = {
    email: email,
    reporter: reporter,
    department: department,
    geography: geography
  };
  chrome.storage.local.set({ ghostReporter: JSON.stringify(data) });
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
  document.getElementById('effort').value = 3;
  document.getElementById('effortValue').textContent = '3';
  document.getElementById('url').value = currentUrl;

  removeMedia();

  const advancedToggle = document.getElementById('advancedToggle');
  const advancedContent = document.getElementById('advancedContent');
  advancedToggle.classList.remove('active');
  advancedContent.classList.remove('show');

  loadSavedReporterInfo();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ghostReported') {
    console.log('Ghost reported via background:', request.ghostId);
  }
});
