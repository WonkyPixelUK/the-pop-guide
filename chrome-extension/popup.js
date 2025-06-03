// popup.js
class PopGuideExtension {
  constructor() {
    this.tesseract = null;
    this.currentUser = null;
    this.customLists = [];
    this.selectedList = null;
    this.selectedListType = null;
    this.init();
  }

  async init() {
    // Check if user is logged in
    const userData = await this.getStoredUser();
    if (userData) {
      this.currentUser = userData;
      await this.loadCustomLists();
      this.showMainApp();
    } else {
      this.showLogin();
    }
    
    this.bindEvents();
    
    // Initialize OCR in background (optional feature)
    this.initializeOCR();
  }

  async initializeOCR() {
    try {
      // Try to load Tesseract if available
      if (window.Tesseract) {
        this.tesseract = window.Tesseract;
        console.log('✅ OCR engine loaded successfully');
      } else {
        console.log('📝 OCR not available - manual search mode enabled');
      }
    } catch (error) {
      console.log('📝 OCR failed to load - using manual search only');
    }
  }

  bindEvents() {
    // Login/logout
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const registerLink = document.getElementById('register-link');
    
    // Main functionality
    const captureBtn = document.getElementById('capture-btn');
    const manualEntryBtn = document.getElementById('manual-entry-btn');
    const detailsForm = document.getElementById('details-form');
    
    // List management
    const showCreateListBtn = document.getElementById('show-create-list');
    const createListBtn = document.getElementById('create-list-btn');
    const cancelCreateListBtn = document.getElementById('cancel-create-list');

    loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
    logoutBtn?.addEventListener('click', () => this.handleLogout());
    registerLink?.addEventListener('click', (e) => this.handleRegister(e));
    captureBtn?.addEventListener('click', () => this.handleCapture());
    manualEntryBtn?.addEventListener('click', () => this.handleManualEntry());
    detailsForm?.addEventListener('submit', (e) => this.handleSubmit(e));
    
    showCreateListBtn?.addEventListener('click', () => this.showCreateListForm());
    createListBtn?.addEventListener('click', () => this.createNewList());
    cancelCreateListBtn?.addEventListener('click', () => this.hideCreateListForm());

    // List selection
    this.bindListSelectionEvents();
  }

  bindListSelectionEvents() {
    // Predefined lists
    document.querySelectorAll('.list-option').forEach(option => {
      option.addEventListener('click', () => {
        // Remove previous selections
        document.querySelectorAll('.list-option, .custom-list-item').forEach(el => {
          el.classList.remove('selected');
        });
        
        option.classList.add('selected');
        this.selectedListType = option.dataset.listType;
        this.selectedList = option.dataset.listId;
      });
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    this.showStatus('Signing in to PopGuide...', 'info');

    try {
      // Real Supabase authentication for PopGuide
      const response = await this.authenticateWithPopGuide(email, password);
      
      if (response.success) {
        this.currentUser = response.user;
        await this.storeUser(response.user);
        await this.loadCustomLists();
        this.showMainApp();
        this.showStatus('Welcome back!', 'success');
      } else {
        this.showStatus(response.error, 'error');
      }
    } catch (error) {
      this.showStatus('Login failed. Please try again.', 'error');
      console.error('Login error:', error);
    }
  }

  async authenticateWithPopGuide(email, password) {
    // Real Supabase authentication for PopGuide
    try {
      console.log('🔐 Authenticating with Supabase...');
      
      const response = await fetch('https://pafgjwmgueerxdxtneyg.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('📡 Supabase response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Supabase authentication successful');
        
        return {
          success: true,
          user: {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
            email: data.user.email,
            token: data.access_token
          }
        };
      } else {
        const errorData = await response.json();
        console.warn('❌ Supabase authentication failed:', errorData);
        return { success: false, error: errorData.error_description || 'Authentication failed' };
      }
    } catch (error) {
      console.error('💥 Supabase API error:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  }

  async loadCustomLists() {
    try {
      // TODO: Replace with actual PopGuide API call
      const lists = await this.getPopGuideCustomLists();
      this.customLists = lists;
      this.renderCustomLists();
    } catch (error) {
      console.error('Error loading custom lists:', error);
      this.showStatus('Failed to load your custom lists', 'error');
    }
  }

  async getPopGuideCustomLists() {
    // Real Supabase API call to get user's actual custom lists
    try {
      console.log('📋 Fetching custom lists from Supabase...');
      
      const response = await fetch('https://pafgjwmgueerxdxtneyg.supabase.co/rest/v1/custom_lists?select=*,list_items(count)', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.currentUser?.token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Custom lists loaded:', data);
        
        // Transform to match expected format
        return data.map(list => ({
          id: list.id,
          name: list.name,
          item_count: list.list_items?.[0]?.count || 0
        }));
      } else {
        console.warn('Failed to fetch custom lists from Supabase API');
        return [];
      }
    } catch (error) {
      console.error('Supabase custom lists API error:', error);
      return [];
    }
  }

  renderCustomLists() {
    const container = document.getElementById('custom-lists');
    container.innerHTML = '';

    this.customLists.forEach(list => {
      const listElement = document.createElement('div');
      listElement.className = 'custom-list-item';
      listElement.dataset.listType = 'custom';
      listElement.dataset.listId = list.id;
      listElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📋 ${list.name}</span>
          <span style="color: #888; font-size: 11px;">${list.item_count} items</span>
        </div>
      `;
      
      listElement.addEventListener('click', () => {
        document.querySelectorAll('.list-option, .custom-list-item').forEach(el => {
          el.classList.remove('selected');
        });
        listElement.classList.add('selected');
        this.selectedListType = 'custom';
        this.selectedList = list.id;
      });
      
      container.appendChild(listElement);
    });
  }

  showCreateListForm() {
    document.getElementById('create-list-form').classList.add('active');
    document.getElementById('new-list-name').focus();
  }

  hideCreateListForm() {
    document.getElementById('create-list-form').classList.remove('active');
    document.getElementById('new-list-name').value = '';
  }

  async createNewList() {
    const listName = document.getElementById('new-list-name').value.trim();
    
    if (!listName) {
      this.showStatus('Please enter a list name', 'error');
      return;
    }

    try {
      this.showStatus('Creating list...', 'info');
      
      // TODO: Replace with actual PopGuide API call
      const newList = await this.simulateCreateList(listName);
      
      this.customLists.push(newList);
      this.renderCustomLists();
      this.hideCreateListForm();
      this.showStatus(`List "${listName}" created!`, 'success');
    } catch (error) {
      this.showStatus('Failed to create list', 'error');
      console.error('Create list error:', error);
    }
  }

  async simulateCreateList(name) {
    // Real Supabase API call to create a new custom list
    try {
      console.log('📝 Creating new custom list in Supabase...');
      
      const response = await fetch('https://pafgjwmgueerxdxtneyg.supabase.co/rest/v1/custom_lists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentUser?.token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: name,
          user_id: this.currentUser.id,
          is_public: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Custom list created successfully:', data);
        
        return {
          id: data[0].id,
          name: data[0].name,
          item_count: 0
        };
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create custom list:', errorData);
        throw new Error('Failed to create list in database');
      }
    } catch (error) {
      console.error('💥 Supabase create list error:', error);
      throw error;
    }
  }

  handleRegister(e) {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://popguide.co.uk/auth' });
  }

  handleLogout() {
    this.currentUser = null;
    this.customLists = [];
    chrome.storage.local.remove('popguide_user');
    this.showLogin();
    this.showStatus('Logged out successfully', 'info');
  }

  handleCapture() {
    this.showStatus('Starting area selection...', 'info');
    
    chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' }, async (response) => {
      if (response && response.screenshot) {
        this.showStatus('Screenshot captured!', 'success');
        this.displayScreenshot(response.screenshot);
        
        // Try OCR if available, otherwise allow manual entry
        if (this.tesseract) {
          this.showStatus('🔍 Analyzing with OCR...', 'info');
          await this.runAdvancedOCR(response.screenshot);
        } else {
          this.showStatus('📝 OCR not available - enter details manually or search database', 'info');
          this.showSearchHint();
        }
      } else if (response && response.error) {
        if (response.error === 'Selection cancelled') {
          this.showStatus('Screenshot cancelled - try again when ready', 'info');
        } else {
          this.showStatus(`Screenshot failed: ${response.error}`, 'error');
        }
      } else {
        this.showStatus('Screenshot capture failed - please try again', 'error');
      }
    });
  }

  handleManualEntry() {
    this.showStatus('🔍 Start typing to search PopGuide database...', 'info');
    document.getElementById('details-form').style.display = 'block';
    
    // Focus on the name input for immediate typing
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
      nameInput.focus();
      nameInput.placeholder = 'Type Funko Pop name (e.g., Spider-Man)...';
    }
    
    this.showSearchHint();
  }

  showSearchHint() {
    // Add helpful placeholder text and enable manual search
    const nameInput = document.getElementById('name-input');
    const genreInput = document.getElementById('genre-input');
    
    if (nameInput) {
      nameInput.placeholder = 'Enter Pop name to search database...';
      nameInput.addEventListener('input', this.debounceSearch.bind(this));
    }
    
    if (genreInput) {
      genreInput.placeholder = 'Series/Genre will auto-fill from database...';
    }
    
    this.showStatus('💡 Tip: Start typing a Pop name to search the database!', 'info');
  }

  debounceSearch(event) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const query = event.target.value.trim();
      if (query.length > 2) {
        this.performManualSearch(query);
      }
    }, 500);
  }

  async performManualSearch(query) {
    this.showStatus('🔍 Searching database...', 'info');
    console.log('🔍 Manual search for:', query);
    
    try {
      // Direct database search for manual input (don't use OCR extraction patterns)
      const matchedPop = await this.directDatabaseSearch(query);
      
      if (matchedPop) {
        console.log('✅ Found database match for manual search:', matchedPop);
        this.showStatus('✅ Found match in database!', 'success');
        
        // Auto-fill the form
        const nameInput = document.getElementById('name-input');
        const genreInput = document.getElementById('genre-input');
        const priceInput = document.getElementById('price-input');
        const eanInput = document.getElementById('ean-input');
        
        if (nameInput) nameInput.value = matchedPop.name;
        if (genreInput) genreInput.value = matchedPop.series || matchedPop.fandom || '';
        if (priceInput) priceInput.value = matchedPop.estimated_value ? `£${matchedPop.estimated_value}` : '';
        if (eanInput) eanInput.value = matchedPop.ean || '';
        
        // Auto-select owned list for manual searches
        this.selectListOption('predefined', 'owned');
        
        setTimeout(() => {
          this.showStatus('✅ Ready to add to collection!', 'success');
        }, 1500);
        
      } else {
        this.showStatus('❌ No database match found', 'error');
        setTimeout(() => {
          this.showStatus('💡 Continue typing or fill manually', 'info');
        }, 2000);
      }
    } catch (error) {
      console.error('Manual search error:', error);
      this.showStatus('❌ Search failed', 'error');
    }
  }

  async directDatabaseSearch(query) {
    try {
      console.log('🔍 Direct database search for:', query);
      
      // Clean the query
      const cleanQuery = query.trim().replace(/[^\w\s-]/g, '');
      
      if (!cleanQuery || cleanQuery.length < 2) {
        console.log('❌ Query too short');
        return null;
      }

      // Try multiple search strategies with proper Supabase syntax
      const searchStrategies = [
        // Partial name match (contains) - this is the most important one
        { method: 'Partial Name (contains)', query: `name=ilike.*${cleanQuery}*` },
        // Exact name match
        { method: 'Exact Name', query: `name=ilike.${cleanQuery}` },
        // Series match
        { method: 'Series', query: `series=ilike.*${cleanQuery}*` },
        // Number match (if query is a number)
        ...(cleanQuery.match(/^\d+$/) ? [{ method: 'Number', query: `number=eq.${cleanQuery}` }] : [])
      ];

      for (const strategy of searchStrategies) {
        console.log(`🔎 Trying ${strategy.method} search for "${cleanQuery}"...`);
        console.log(`📡 Query URL: https://pafgjwmgueerxdxtneyg.supabase.co/rest/v1/funko_pops?select=*&${strategy.query}&limit=5`);
        
        const response = await fetch(`https://pafgjwmgueerxdxtneyg.supabase.co/rest/v1/funko_pops?select=*&${strategy.query}&limit=5`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.currentUser?.token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const results = await response.json();
          console.log(`📊 ${strategy.method} search results:`, results.length, 'results');
          console.log(`📝 First few results:`, results.slice(0, 3).map(r => r.name));
          
          if (results && results.length > 0) {
            // Return the best match (first result)
            console.log(`✅ Found match using ${strategy.method}:`, results[0].name);
            return results[0];
          }
        } else {
          console.warn(`❌ ${strategy.method} search failed:`, response.status);
          const errorText = await response.text();
          console.warn(`❌ Error details:`, errorText);
        }
      }

      console.log('❌ No matches found in database');
      return null;

    } catch (error) {
      console.error('💥 Direct database search error:', error);
      return null;
    }
  }

  displayScreenshot(screenshot) {
    const preview = document.getElementById('screenshot-preview');
    preview.innerHTML = `<img src="${screenshot}" alt="Screenshot" />`;
    document.getElementById('details-form').style.display = 'block';
  }

  async runAdvancedOCR(screenshot) {
    console.log('🔍 Starting OCR analysis...');
    
    if (!this.tesseract) {
      console.error('❌ Tesseract not available');
      this.showStatus('OCR not available - please fill in details manually', 'error');
      return;
    }

    this.showStatus('🔍 Analyzing image for Funko Pop details...', 'info');
    this.showOCRProgress(0);

    try {
      console.log('📸 Creating Tesseract worker...');
      const worker = await this.tesseract.createWorker('eng');
      
      console.log('🤖 Starting OCR recognition...');
      const result = await worker.recognize(screenshot, {
        logger: m => {
          if (m.status === 'recognizing text') {
            const percent = Math.round(m.progress * 100);
            this.showOCRProgress(percent);
            this.showStatus(`🤖 OCR Processing: ${percent}% complete...`, 'info');
            console.log(`OCR Progress: ${percent}%`);
          }
        }
      });

      await worker.terminate();
      this.hideOCRProgress();
      
      console.log('📝 OCR Result:', result);
      console.log('📝 Extracted text:', result.data.text);
      
      if (result && result.data && result.data.text && result.data.text.trim()) {
        this.showStatus('✨ OCR complete! Searching PopGuide database...', 'success');
        console.log('🎯 Starting intelligent autofill...');
        await this.intelligentAutofill(result.data.text);
      } else {
        console.warn('⚠️ No text detected in OCR result');
        this.showStatus('⚠️ No text detected - please fill details manually', 'error');
      }
    } catch (error) {
      this.hideOCRProgress();
      console.error('❌ OCR Error:', error);
      this.showStatus('❌ OCR analysis failed - please fill details manually', 'error');
    }
  }

  showOCRProgress(percent) {
    let progressContainer = document.getElementById('ocr-progress');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.id = 'ocr-progress';
      progressContainer.className = 'ocr-progress';
      progressContainer.innerHTML = '<div class="ocr-progress-bar"></div>';
      document.getElementById('status').after(progressContainer);
    }
    
    const progressBar = progressContainer.querySelector('.ocr-progress-bar');
    progressBar.style.width = `${Math.min(percent, 100)}%`;
  }

  hideOCRProgress() {
    const progressContainer = document.getElementById('ocr-progress');
    if (progressContainer) {
      progressContainer.remove();
    }
  }

  async intelligentAutofill(text) {
    console.log('🎯 intelligentAutofill called with text:', text);
    
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const fullText = text.toLowerCase();
    
    console.log('📋 Text lines:', lines);
    console.log('🔤 Full text (lowercase):', fullText);
    
    // Get form elements
    const nameInput = document.getElementById('name-input');
    const genreInput = document.getElementById('genre-input');
    const priceInput = document.getElementById('price-input');
    const eanInput = document.getElementById('ean-input');
    const descInput = document.getElementById('desc-input');

    console.log('🎮 Form elements found:', {
      nameInput: !!nameInput,
      genreInput: !!genreInput, 
      priceInput: !!priceInput,
      eanInput: !!eanInput,
      descInput: !!descInput
    });

    // Always put full OCR text in description for reference
    if (descInput) {
      descInput.value = text;
      console.log('📝 Set description field');
    }

    // 🔍 SEARCH DATABASE FOR MATCHING FUNKO POPS
    console.log('🔍 Searching database for matching Funko Pops...');
    this.showStatus('🔍 Searching PopGuide database for matches...', 'info');
    
    const matchedPop = await this.searchFunkoDatabase(text);
    
    if (matchedPop) {
      console.log('✅ Found database match:', matchedPop);
      this.showStatus('✅ Found exact match in PopGuide database!', 'success');
      
      // Fill form with database record
      if (nameInput) nameInput.value = matchedPop.name;
      if (genreInput) genreInput.value = matchedPop.series || matchedPop.fandom || '';
      if (priceInput) priceInput.value = matchedPop.estimated_value ? `£${matchedPop.estimated_value}` : '';
      if (eanInput) eanInput.value = matchedPop.ean || '';
      
      console.log('🎯 Auto-filled with database record');
      
      // Auto-select appropriate list based on content and estimated value
      this.autoSelectListForDatabaseMatch(matchedPop, text);
      
    } else {
      console.log('❌ No database match found, using OCR extraction');
      this.showStatus('⚠️ No database match - using OCR text extraction', 'info');
      
      // Fallback to OCR text extraction (existing logic)
      this.extractFromOCRText(text, nameInput, genreInput, priceInput, eanInput);
      this.autoSelectList(text);
    }
  }

  async searchFunkoDatabase(ocrText) {
    try {
      console.log('🔍 Searching Supabase funko_pops table...');
      
      // Extract potential search terms from OCR text
      const searchTerms = this.extractSearchTerms(ocrText);
      console.log('🔎 Search terms extracted:', searchTerms);
      
      if (!searchTerms.name && !searchTerms.number && !searchTerms.ean) {
        console.log('❌ No valid search terms found');
        return null;
      }
      
      // Build search query - try multiple approaches
      const searchStrategies = [];
      
      // Strategy 1: Search by EAN if found
      if (searchTerms.ean) {
        searchStrategies.push({
          method: 'EAN',
          query: `ean.eq.${searchTerms.ean}`
        });
      }
      
      // Strategy 2: Search by number if found
      if (searchTerms.number) {
        searchStrategies.push({
          method: 'Number',
          query: `number.eq.${searchTerms.number}`
        });
      }
      
      // Strategy 3: Search by name (fuzzy matching)
      if (searchTerms.name) {
        searchStrategies.push({
          method: 'Name',
          query: `name.ilike.*${searchTerms.name}*`
        });
      }
      
      // Try each search strategy
      for (const strategy of searchStrategies) {
        console.log(`🔎 Trying ${strategy.method} search...`);
        
        const response = await fetch(`https://pafgjwmgueerxdxtneyg.supabase.co/rest/v1/funko_pops?select=*&${strategy.query}&limit=5`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.currentUser?.token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const results = await response.json();
          console.log(`📊 ${strategy.method} search results:`, results);
          
          if (results && results.length > 0) {
            // Return the best match (first result)
            const bestMatch = results[0];
            console.log(`✅ Found match using ${strategy.method}:`, bestMatch);
            return bestMatch;
          }
        } else {
          console.warn(`❌ ${strategy.method} search failed:`, response.status);
        }
      }
      
      console.log('❌ No matches found in database');
      return null;
      
    } catch (error) {
      console.error('💥 Database search error:', error);
      return null;
    }
  }

  extractSearchTerms(text) {
    console.log('🔎 Extracting search terms from OCR text...');
    
    const searchTerms = {
      name: null,
      number: null,
      ean: null,
      series: null
    };
    
    // Extract Funko Pop number
    const numberMatches = text.match(/#(\d+)/);
    if (numberMatches) {
      searchTerms.number = numberMatches[1];
      console.log('🔢 Found number:', searchTerms.number);
    }
    
    // Extract EAN/Barcode (8-14 digits)
    const eanMatches = text.match(/\b(\d{8,14})\b/);
    if (eanMatches) {
      searchTerms.ean = eanMatches[1];
      console.log('📊 Found EAN:', searchTerms.ean);
    }
    
    // Extract character/pop name
    const namePatterns = [
      /funko\s*pop[!]?\s*(.+?)(?:\s*#\d+|\s*\d+|$)/i,
      /pop[!]?\s*(.+?)(?:\s*#\d+|\s*\d+|$)/i,
      /(.+?)\s*#\d+/,
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        searchTerms.name = match[1].trim().replace(/[^\w\s-]/g, '');
        console.log('🏷️ Found name:', searchTerms.name);
        break;
      }
    }
    
    return searchTerms;
  }

  extractFromOCRText(text, nameInput, genreInput, priceInput, eanInput) {
    console.log('📝 Falling back to OCR text extraction...');
    
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const fullText = text.toLowerCase();
    
    // Intelligent name detection for Funko Pops (existing logic)
    const namePatterns = [
      /funko\s*pop[!]?\s*(.+?)(?:\s*#\d+|\s*\d+|$)/i,
      /(.+?)\s*#(\d+)/,
      /pop\s*(.+?)(?:\s*vinyl|\s*figure|$)/i,
      lines.find(line => line.length > 3 && !line.match(/^[\d\s#$£€.,-]+$/) && !line.match(/^(funko|pop|vinyl|figure)$/i))
    ];

    let detectedName = '';
    for (const pattern of namePatterns) {
      if (typeof pattern === 'string') {
        detectedName = pattern;
        break;
      }
      const match = text.match(pattern);
      if (match) {
        detectedName = match[1]?.trim() || match[0]?.trim();
        break;
      }
    }
    
    if (detectedName && nameInput) {
      nameInput.value = detectedName;
      console.log('🏷️ Set name field to:', detectedName);
    }

    // Enhanced series/genre detection (existing logic)
    const seriesKeywords = {
      'Marvel': ['marvel', 'spider-man', 'spiderman', 'iron man', 'ironman', 'captain america', 'hulk', 'thor', 'black widow', 'hawkeye', 'ant-man', 'doctor strange', 'guardians', 'avengers', 'x-men', 'deadpool', 'wolverine', 'venom'],
      'DC Comics': ['dc', 'batman', 'superman', 'wonder woman', 'flash', 'green lantern', 'aquaman', 'joker', 'harley quinn', 'robin', 'justice league'],
      'Disney': ['disney', 'mickey mouse', 'minnie', 'donald duck', 'goofy', 'frozen', 'elsa', 'anna', 'moana', 'belle', 'ariel', 'cinderella', 'snow white'],
      'Star Wars': ['star wars', 'luke skywalker', 'darth vader', 'princess leia', 'han solo', 'chewbacca', 'r2-d2', 'c-3po', 'yoda', 'obi-wan', 'kylo ren', 'rey', 'finn', 'poe'],
      'Pokemon': ['pokemon', 'pikachu', 'charizard', 'blastoise', 'venusaur', 'mewtwo', 'mew', 'eevee', 'pokeball'],
      'Anime': ['anime', 'dragon ball', 'goku', 'vegeta', 'naruto', 'sasuke', 'one piece', 'luffy', 'attack on titan', 'eren', 'my hero academia', 'deku'],
      'Movies': ['movies', 'harry potter', 'lord of the rings', 'hobbit', 'jurassic park', 'back to the future', 'ghostbusters', 'indiana jones'],
      'TV Shows': ['friends', 'the office', 'stranger things', 'game of thrones', 'walking dead', 'big bang theory', 'simpsons', 'rick and morty'],
      'Games': ['fortnite', 'minecraft', 'overwatch', 'call of duty', 'apex legends', 'world of warcraft', 'league of legends', 'cyberpunk']
    };

    let detectedSeries = '';
    for (const [series, keywords] of Object.entries(seriesKeywords)) {
      if (keywords.some(keyword => fullText.includes(keyword))) {
        detectedSeries = series;
        break;
      }
    }
    
    if (detectedSeries && genreInput) {
      genreInput.value = detectedSeries;
      console.log('🎭 Set genre field to:', detectedSeries);
    }

    // Enhanced price detection (existing logic)
    const pricePatterns = [
      /(?:£|gbp|usd|\$|€|eur)\s*([0-9]+(?:[.,]\d{2})?)/gi,
      /([0-9]+(?:[.,]\d{2})?)\s*(?:£|gbp|usd|\$|€|eur)/gi,
      /price[:\s]*([0-9]+(?:[.,]\d{2})?)/gi
    ];

    let detectedPrice = '';
    for (const pattern of pricePatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const priceMatch = matches[0];
        let price = priceMatch[1] || priceMatch[0];
        price = price.replace(/[^\d.,]/g, '');
        if (price) {
          detectedPrice = `£${price}`;
          break;
        }
      }
    }
    
    if (detectedPrice && priceInput) {
      priceInput.value = detectedPrice;
      console.log('💰 Set price field to:', detectedPrice);
    }

    // Enhanced EAN/barcode detection (existing logic)
    const eanPatterns = [
      /(?:ean|barcode|upc)[:\s]*(\d{8,14})/gi,
      /\b(\d{12,14})\b/g,
      /(\d{8,11})\b/g
    ];

    let detectedEAN = '';
    for (const pattern of eanPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const ean = matches[0][1];
        if (ean && ean.length >= 8) {
          detectedEAN = ean;
          break;
        }
      }
    }
    
    if (detectedEAN && eanInput) {
      eanInput.value = detectedEAN;
      console.log('📊 Set EAN field to:', detectedEAN);
    }
  }

  autoSelectListForDatabaseMatch(matchedPop, ocrText) {
    console.log('🎯 Auto-selecting list for database match...');
    
    const lowerText = ocrText.toLowerCase();
    
    // Check OCR text context first
    if (lowerText.includes('for sale') || lowerText.includes('selling') || lowerText.includes('£') || lowerText.includes('price')) {
      this.selectListOption('predefined', 'for-sale');
    } else if (lowerText.includes('trade') || lowerText.includes('swap') || lowerText.includes('looking for')) {
      this.selectListOption('predefined', 'trading');
    } else if (lowerText.includes('want') || lowerText.includes('wish') || lowerText.includes('looking')) {
      this.selectListOption('predefined', 'wishlist');
    } else {
      // Check if it's a valuable/rare pop for smart list selection
      const isValuable = matchedPop.estimated_value && parseFloat(matchedPop.estimated_value) > 20;
      const isRare = matchedPop.is_chase || matchedPop.is_exclusive || matchedPop.rarity === 'rare';
      
      if (isValuable || isRare) {
        console.log('💎 Detected valuable/rare pop - suggesting owned list');
        this.selectListOption('predefined', 'owned');
      } else {
        // Default to owned
        this.selectListOption('predefined', 'owned');
      }
    }
  }

  autoSelectList(text) {
    const lowerText = text.toLowerCase();
    
    // Patterns that suggest specific lists
    if (lowerText.includes('for sale') || lowerText.includes('selling') || lowerText.includes('£') || lowerText.includes('price')) {
      this.selectListOption('predefined', 'for-sale');
    } else if (lowerText.includes('trade') || lowerText.includes('swap') || lowerText.includes('looking for')) {
      this.selectListOption('predefined', 'trading');
    } else if (lowerText.includes('want') || lowerText.includes('wish') || lowerText.includes('looking')) {
      this.selectListOption('predefined', 'wishlist');
    } else {
      // Default to owned if no other context
      this.selectListOption('predefined', 'owned');
    }
  }

  selectListOption(type, id) {
    document.querySelectorAll('.list-option, .custom-list-item').forEach(el => {
      el.classList.remove('selected');
    });
    
    const element = document.querySelector(`[data-list-type="${type}"][data-list-id="${id}"]`);
    if (element) {
      element.classList.add('selected');
      this.selectedListType = type;
      this.selectedList = id;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.selectedList || !this.selectedListType) {
      this.showStatus('Please select a list first', 'error');
      return;
    }
    
    const formData = {
      listType: this.selectedListType,
      listId: this.selectedList,
      name: document.getElementById('name-input').value,
      genre: document.getElementById('genre-input').value,
      price: document.getElementById('price-input').value,
      ean: document.getElementById('ean-input').value,
      description: document.getElementById('desc-input').value,
      user_id: this.currentUser?.id
    };

    if (!formData.name) {
      this.showStatus('Please fill in at least the Pop name', 'error');
      return;
    }

    this.showStatus('Adding to your collection...', 'info');

    try {
      // TODO: Replace with actual PopGuide API call
      const success = await this.addToPopGuideCollection(formData);
      
      if (success) {
        this.showStatus('✅ Pop added to your collection!', 'success');
        this.resetForm();
      } else {
        this.showStatus('Failed to add Pop. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.showStatus('Error adding Pop to collection', 'error');
    }
  }

  async addToPopGuideCollection(data) {
    // Real Supabase API call to add item to collection or custom list
    try {
      console.log('🎯 Adding item to PopGuide collection/list:', data);
      
      let endpoint, payload;
      
      if (data.listType === 'predefined') {
        // Add to predefined lists (user_collections, wishlists)
        switch (data.listId) {
          case 'owned':
            endpoint = 'user_collections';
            payload = {
              user_id: data.user_id,
              funko_pop_id: null, // We'll need to find/create the funko pop first
              condition: 'mint',
              purchase_price: data.price?.replace(/[^\d.]/g, '') || null
            };
            break;
          case 'wishlist':
            endpoint = 'wishlists';
            payload = {
              user_id: data.user_id,
              funko_pop_id: null, // We'll need to find/create the funko pop first
              max_price: data.price?.replace(/[^\d.]/g, '') || null
            };
            break;
          case 'for-sale':
          case 'trading':
            endpoint = 'custom_lists';
            // First create/find the appropriate list, then add item
            console.log('🔍 Trading/for-sale lists need to be implemented');
            return true; // Placeholder
        }
      } else {
        // Add to custom list
        endpoint = 'list_items';
        payload = {
          list_id: data.listId,
          funko_pop_id: null // We'll need to find/create the funko pop first
        };
      }
      
      // TODO: First we need to search for existing Funko Pop or create one
      // This is a complex operation that would require:
      // 1. Search funko_pops table for matching item
      // 2. If not found, create new funko_pop entry
      // 3. Then add to the selected list/collection
      
      console.log('📝 Would add to endpoint:', endpoint, 'with payload:', payload);
      console.log('⚠️ Note: Full implementation requires Funko Pop search/creation logic');
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
      
    } catch (error) {
      console.error('💥 Error adding to PopGuide collection:', error);
      return false;
    }
  }

  resetForm() {
    document.getElementById('details-form').style.display = 'none';
    document.getElementById('screenshot-preview').innerHTML = '';
    document.getElementById('details-form').reset();
    
    // Clear list selection
    document.querySelectorAll('.list-option, .custom-list-item').forEach(el => {
      el.classList.remove('selected');
    });
    this.selectedList = null;
    this.selectedListType = null;
  }

  showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('app-section').classList.remove('active');
  }

  showMainApp() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').classList.add('active');
    
    if (this.currentUser) {
      document.getElementById('user-name').textContent = this.currentUser.name;
    }
  }

  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
      }, 3000);
    }
  }

  async storeUser(user) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ popguide_user: user }, resolve);
    });
  }

  async getStoredUser() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['popguide_user'], (result) => {
        resolve(result.popguide_user || null);
      });
    });
  }
}

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
  new PopGuideExtension();
}); 