// content.js
// Placeholder for future content script logic (e.g., context menu, DOM scraping)

// PopGuide Content Script - Screenshot Area Selection
class PopGuideScreenshotSelector {
  constructor() {
    this.isSelecting = false;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.overlay = null;
    this.selectionBox = null;
    this.selectionInfo = null;
    this.captureButton = null;
    this.cancelButton = null;
    this.instructions = null;
    this.onComplete = null;
  }

  startSelection(callback) {
    if (this.isSelecting) return;
    
    this.isSelecting = true;
    this.onComplete = callback;
    this.createOverlay();
    this.bindEvents();
  }

  createOverlay() {
    // Main overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'popguide-screenshot-overlay';
    
    // Selection box
    this.selectionBox = document.createElement('div');
    this.selectionBox.className = 'popguide-selection-box';
    this.selectionBox.style.display = 'none';
    
    // Selection info
    this.selectionInfo = document.createElement('div');
    this.selectionInfo.className = 'popguide-selection-info';
    this.selectionInfo.style.display = 'none';
    
    // Instructions
    this.instructions = document.createElement('div');
    this.instructions.className = 'popguide-instructions';
    this.instructions.textContent = 'Click and drag to select the area you want to capture';
    
    // Capture button
    this.captureButton = document.createElement('button');
    this.captureButton.className = 'popguide-capture-button';
    this.captureButton.textContent = '📸 Capture Selected Area';
    this.captureButton.style.display = 'none';
    
    // Cancel button
    this.cancelButton = document.createElement('button');
    this.cancelButton.className = 'popguide-cancel-button';
    this.cancelButton.textContent = '✕ Cancel';
    
    // Add to overlay
    this.overlay.appendChild(this.selectionBox);
    this.overlay.appendChild(this.selectionInfo);
    this.overlay.appendChild(this.instructions);
    this.overlay.appendChild(this.captureButton);
    this.overlay.appendChild(this.cancelButton);
    
    // Add to document
    document.body.appendChild(this.overlay);
  }

  bindEvents() {
    // Mouse events for selection
    this.overlay.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.overlay.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.overlay.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Button events
    this.captureButton.addEventListener('click', this.captureSelection.bind(this));
    this.cancelButton.addEventListener('click', this.cancelSelection.bind(this));
    
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  onMouseDown(e) {
    if (e.target !== this.overlay) return;
    
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.endX = e.clientX;
    this.endY = e.clientY;
    
    this.selectionBox.style.display = 'block';
    this.selectionInfo.style.display = 'block';
    this.instructions.textContent = 'Drag to select area, then click Capture';
    
    this.updateSelection();
  }

  onMouseMove(e) {
    if (this.selectionBox.style.display === 'none') return;
    
    this.endX = e.clientX;
    this.endY = e.clientY;
    this.updateSelection();
  }

  onMouseUp(e) {
    if (this.selectionBox.style.display === 'none') return;
    
    const width = Math.abs(this.endX - this.startX);
    const height = Math.abs(this.endY - this.startY);
    
    if (width > 10 && height > 10) {
      this.captureButton.style.display = 'block';
      this.instructions.textContent = 'Area selected! Click "Capture Selected Area" to proceed';
    }
  }

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.cancelSelection();
    }
  }

  updateSelection() {
    const left = Math.min(this.startX, this.endX);
    const top = Math.min(this.startY, this.endY);
    const width = Math.abs(this.endX - this.startX);
    const height = Math.abs(this.endY - this.startY);
    
    this.selectionBox.style.left = left + 'px';
    this.selectionBox.style.top = top + 'px';
    this.selectionBox.style.width = width + 'px';
    this.selectionBox.style.height = height + 'px';
    
    // Update info
    this.selectionInfo.textContent = `${width} × ${height}px`;
    this.selectionInfo.style.left = (left + width + 10) + 'px';
    this.selectionInfo.style.top = top + 'px';
    
    // Adjust info position if it goes off screen
    if (left + width + 150 > window.innerWidth) {
      this.selectionInfo.style.left = (left - 100) + 'px';
    }
  }

  captureSelection() {
    const left = Math.min(this.startX, this.endX);
    const top = Math.min(this.startY, this.endY);
    const width = Math.abs(this.endX - this.startX);
    const height = Math.abs(this.endY - this.startY);
    
    const selectionData = {
      x: left,
      y: top,
      width: width,
      height: height,
      devicePixelRatio: window.devicePixelRatio || 1
    };
    
    this.cleanup();
    
    if (this.onComplete) {
      this.onComplete(selectionData);
    }
  }

  cancelSelection() {
    this.cleanup();
    
    if (this.onComplete) {
      this.onComplete(null);
    }
  }

  cleanup() {
    this.isSelecting = false;
    
    // Remove event listeners
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    
    // Remove overlay
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    
    // Reset properties
    this.overlay = null;
    this.selectionBox = null;
    this.selectionInfo = null;
    this.captureButton = null;
    this.cancelButton = null;
    this.instructions = null;
    this.onComplete = null;
  }
}

// Global instance
let screenshotSelector = new PopGuideScreenshotSelector();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_AREA_SELECTION') {
    screenshotSelector.startSelection((selectionData) => {
      sendResponse({ selectionData: selectionData });
    });
    return true; // Keep message channel open
  }
}); 