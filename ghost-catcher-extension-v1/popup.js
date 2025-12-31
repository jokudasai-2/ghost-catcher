console.log('Ghost Catcher Extension: Loading...');

const FIREBASE_PROJECT_ID = "ghost-catcher-deel";
const FIREBASE_API_KEY = "AIzaSyBgGG_ChCi4e_2SOFzNgQNYFzZdyZVuAUE";
const FIRESTORE_API_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

console.log('Firebase REST API configured');

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

    const firestoreDoc = convertToFirestoreFormat(formData);

    const response = await fetch(`${FIRESTORE_API_URL}/ghosts?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: firestoreDoc })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const docId = result.name.split('/').pop();

    console.log('Ghost successfully reported to Firebase!');
    console.log('Document ID:', docId);
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

    alert(`Error: ${error.message}\n\nPlease check:\n1. Internet connection\n2. Browser console (F12) for details\n3. Firebase configuration`);
  }
}

function convertToFirestoreFormat(data) {
  const firestoreDoc = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null) {
      firestoreDoc[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      firestoreDoc[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      firestoreDoc[key] = { integerValue: value };
    } else if (typeof value === 'boolean') {
      firestoreDoc[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      firestoreDoc[key] = {
        arrayValue: {
          values: value.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return { integerValue: item };
            return { stringValue: String(item) };
          })
        }
      };
    } else {
      firestoreDoc[key] = { stringValue: String(value) };
    }
  }

  return firestoreDoc;
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
