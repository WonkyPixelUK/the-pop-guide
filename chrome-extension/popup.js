// popup.js
const captureBtn = document.getElementById('capture-btn');
const screenshotPreview = document.getElementById('screenshot-preview');
const detailsForm = document.getElementById('details-form');
const statusDiv = document.getElementById('status');
const nameInput = document.getElementById('name-input');
const genreInput = document.getElementById('genre-input');
const priceInput = document.getElementById('price-input');
const descInput = document.getElementById('desc-input');
const eanInput = document.getElementById('ean-input');

captureBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' }, async (response) => {
    if (response && response.screenshot) {
      screenshotPreview.innerHTML = `<img src="${response.screenshot}" style="max-width:100%;" />`;
      detailsForm.style.display = 'block';
      statusDiv.textContent = 'Running OCR...';
      // OCR with Tesseract.js
      if (window.Tesseract) {
        const result = await window.Tesseract.recognize(response.screenshot, 'eng');
        statusDiv.textContent = 'OCR complete. Review and edit details.';
        // Basic autofill: put all text in description, try to guess name/price
        descInput.value = result.data.text;
        // Try to extract name (first line), price (first £ or $), EAN (first 8-14 digit number)
        const lines = result.data.text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines[0]) nameInput.value = lines[0];
        const priceMatch = result.data.text.match(/(£|\$)\s?([0-9]+(\.[0-9]{2})?)/);
        if (priceMatch) priceInput.value = priceMatch[0];
        const eanMatch = result.data.text.match(/\b\d{8,14}\b/);
        if (eanMatch) eanInput.value = eanMatch[0];
      } else {
        statusDiv.textContent = 'Tesseract.js not loaded.';
      }
    } else {
      statusDiv.textContent = 'Failed to capture screenshot.';
    }
  });
});

detailsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: Send data to PopGuide API
  statusDiv.textContent = 'Pop added to collection! (API integration not implemented)';
}); 