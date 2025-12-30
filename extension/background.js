chrome.runtime.onInstalled.addListener(() => {
  console.log('Ghost Catcher extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ghostReported') {
    console.log('Ghost reported:', request.ghostId);

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Ghost Captured! 👻',
      message: `Tracking ID: ${request.ghostId}`,
      priority: 1
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});
