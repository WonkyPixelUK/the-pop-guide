// PopGuide Background Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_SCREENSHOT') {
    handleScreenshotCapture(sender.tab.id, sendResponse);
    return true; // keep the message channel open for sendResponse
  }
});

async function handleScreenshotCapture(tabId, sendResponse) {
  try {
    // First, start area selection on the current tab
    const selectionResponse = await chrome.tabs.sendMessage(tabId, { 
      type: 'START_AREA_SELECTION' 
    });
    
    if (!selectionResponse || !selectionResponse.selectionData) {
      sendResponse({ error: 'Selection cancelled' });
      return;
    }
    
    const selection = selectionResponse.selectionData;
    
    // Capture the full visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { 
      format: 'png',
      quality: 100 
    });
    
    // Crop the image to the selected area
    const croppedDataUrl = await cropImage(dataUrl, selection);
    
    sendResponse({ screenshot: croppedDataUrl });
    
  } catch (error) {
    console.error('Screenshot capture error:', error);
    sendResponse({ error: error.message });
  }
}

function cropImage(dataUrl, selection) {
  return new Promise((resolve) => {
    const canvas = new OffscreenCanvas(selection.width, selection.height);
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      // Account for device pixel ratio
      const scale = selection.devicePixelRatio;
      
      ctx.drawImage(
        img,
        selection.x * scale,  // source x
        selection.y * scale,  // source y
        selection.width * scale,  // source width
        selection.height * scale, // source height
        0,  // destination x
        0,  // destination y
        selection.width,  // destination width
        selection.height  // destination height
      );
      
      canvas.convertToBlob({ type: 'image/png' }).then(blob => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    };
    
    img.src = dataUrl;
  });
} 