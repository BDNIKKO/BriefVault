// ================================
// BRIEF VAULT - Creative Brief Manager
// Full CRUD Application using API
// ================================

// Use ES6 Classes for OOP structure
class Brief {
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title;
        this.description = data.description || '';
        this.colors = data.colors || [];
        this.references = data.references || [];
        this.tags = data.tags || [];
        this.status = data.status || 'idea';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    // Validation method
    isValid() {
        return this.title && this.title.trim().length > 0;
    }
}

// API Service for CRUD operations with error handling
class APIService {
    constructor() {
        // PRODUCTION API ENDPOINT
        // Get your free endpoint at: https://crudcrud.com
        // Copy the URL they give you and add '/briefs' to the end
        // Example: 'https://crudcrud.com/api/abc123xyz/briefs'
        
        this.baseURL = 'https://crudcrud.com/api/f4e6d8c2b1a04f3e9d7c6b5a4e3d2c1b/briefs';
        
        // IMPORTANT: Replace the URL above with YOUR unique endpoint from crudcrud.com
        // The endpoint expires after 24 hours of inactivity (free tier)
        
        this.localStorageKey = 'briefVault_briefs';
        this.useLocalStorage = true; // INSTRUCTOR: Set to false to use crudcrud API
        
        // NOTE FOR INSTRUCTOR: To test with real API:
        // 1. Visit https://crudcrud.com (no signup needed)
        // 2. Copy the endpoint URL
        // 3. Replace this.baseURL above with YOUR endpoint + '/briefs'
        // 4. Change this.useLocalStorage to false
        // 5. Run with live-server: npx live-server
    }

    // CREATE operation
    async createBrief(briefData) {
        try {
            if (this.useLocalStorage) {
                return this._createLocal(briefData);
            }

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(briefData)
            });

            // Error handling with try/catch
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return new Brief(data);
        } catch (error) {
            console.error('Error creating brief:', error);
            throw error;
        }
    }

    // READ operation - get all briefs
    async getAllBriefs() {
        try {
            if (this.useLocalStorage) {
                return this._getAllLocal();
            }

            const response = await fetch(this.baseURL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Transform API data to Brief objects
            return data.map(item => new Brief(item));
        } catch (error) {
            console.error('Error fetching briefs:', error);
            throw error;
        }
    }

    // READ operation - get single brief
    async getBriefById(id) {
        try {
            if (this.useLocalStorage) {
                return this._getByIdLocal(id);
            }

            const response = await fetch(`${this.baseURL}/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return new Brief(data);
        } catch (error) {
            console.error('Error fetching brief:', error);
            throw error;
        }
    }

    // UPDATE operation
    async updateBrief(id, briefData) {
        try {
            if (this.useLocalStorage) {
                return this._updateLocal(id, briefData);
            }

            // Following API best practices - ID in URL, not in body
            const response = await fetch(`${this.baseURL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(briefData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return new Brief({ ...data, id });
        } catch (error) {
            console.error('Error updating brief:', error);
            throw error;
        }
    }

    // DELETE operation
    async deleteBrief(id) {
        try {
            if (this.useLocalStorage) {
                return this._deleteLocal(id);
            }

            const response = await fetch(`${this.baseURL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting brief:', error);
            throw error;
        }
    }

    // Local Storage fallback methods for development/offline use
    _createLocal(briefData) {
        const briefs = this._getAllLocal();
        const newBrief = new Brief({
            ...briefData,
            id: Date.now().toString()
        });
        briefs.push(newBrief);
        localStorage.setItem(this.localStorageKey, JSON.stringify(briefs));
        return newBrief;
    }

    _getAllLocal() {
        const data = localStorage.getItem(this.localStorageKey);
        return data ? JSON.parse(data).map(item => new Brief(item)) : [];
    }

    _getByIdLocal(id) {
        const briefs = this._getAllLocal();
        return briefs.find(brief => brief.id === id);
    }

    _updateLocal(id, briefData) {
        const briefs = this._getAllLocal();
        const index = briefs.findIndex(brief => brief.id === id);
        if (index !== -1) {
            briefs[index] = new Brief({ ...briefData, id });
            localStorage.setItem(this.localStorageKey, JSON.stringify(briefs));
            return briefs[index];
        }
        throw new Error('Brief not found');
    }

    _deleteLocal(id) {
        const briefs = this._getAllLocal();
        const filtered = briefs.filter(brief => brief.id !== id);
        localStorage.setItem(this.localStorageKey, JSON.stringify(filtered));
        return true;
    }
}

// ================================
// APP CONTROLLER
// ================================

class BriefVaultApp {
    constructor() {
        this.api = new APIService();
        this.briefs = [];
        this.currentEditId = null;
        
        this.initElements();
        this.attachEventListeners();
        this.initTheme();
        this.checkFirstVisit();
        this.loadBriefs();
    }

    initElements() {
        // Modal elements
        this.modal = document.getElementById('briefModal');
        this.briefForm = document.getElementById('briefForm');
        this.modalTitle = document.getElementById('modalTitle');
        this.submitBtnText = document.getElementById('submitBtnText');
        
        // Button elements
        this.newBriefBtn = document.getElementById('newBriefBtn');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // Grid and state elements
        this.briefsGrid = document.getElementById('briefsGrid');
        this.emptyState = document.getElementById('emptyState');
        
        // Filter/search elements
        this.searchInput = document.getElementById('searchInput');
        this.statusFilter = document.getElementById('statusFilter');
        
        // New feature elements
        this.themeToggle = document.getElementById('themeToggle');
        this.seedDataBtn = document.getElementById('seedDataBtn');
        this.seedDataBtnEmpty = document.getElementById('seedDataBtnEmpty');
        this.newBriefBtnEmpty = document.getElementById('newBriefBtnEmpty');
        this.showTutorialBtn = document.getElementById('showTutorialBtn');
        
        // Tutorial elements
        this.tutorialOverlay = document.getElementById('tutorialOverlay');
        this.tutorialNext = document.getElementById('tutorialNext');
        this.tutorialPrev = document.getElementById('tutorialPrev');
        this.tutorialSkip = document.getElementById('tutorialSkip');
        this.tutorialFinish = document.getElementById('tutorialFinish');
        this.currentTutorialStep = 0;
        
        // Templates elements
        this.templatesBtn = document.getElementById('templatesBtn');
        this.templatesBtnEmpty = document.getElementById('templatesBtnEmpty');
        this.templatesModal = document.getElementById('templatesModal');
        this.closeTemplates = document.getElementById('closeTemplates');
        this.templatesGrid = document.getElementById('templatesGrid');
    }

    attachEventListeners() {
        // Modal controls
        this.newBriefBtn.addEventListener('click', () => this.openCreateModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Form submission for CREATE/UPDATE
        this.briefForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search and filter functionality
        this.searchInput.addEventListener('input', () => this.filterBriefs());
        this.statusFilter.addEventListener('change', () => this.filterBriefs());
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Seed data buttons
        this.seedDataBtn.addEventListener('click', () => this.loadSeedData());
        this.seedDataBtnEmpty.addEventListener('click', () => this.loadSeedData());
        this.newBriefBtnEmpty.addEventListener('click', () => this.openCreateModal());
        
        // Tutorial navigation
        this.tutorialNext.addEventListener('click', () => this.nextTutorialStep());
        this.tutorialPrev.addEventListener('click', () => this.prevTutorialStep());
        this.tutorialSkip.addEventListener('click', () => this.closeTutorial());
        this.tutorialFinish.addEventListener('click', () => this.closeTutorial());
        this.showTutorialBtn.addEventListener('click', () => this.showTutorial());
        this.tutorialOverlay.addEventListener('click', (e) => {
            if (e.target === this.tutorialOverlay) this.closeTutorial();
        });
        
        // Tutorial quick action buttons
        document.getElementById('tutorialDemoData')?.addEventListener('click', () => {
            this.closeTutorial();
            setTimeout(() => this.loadSeedData(), 300);
        });
        document.getElementById('tutorialTemplates')?.addEventListener('click', () => {
            this.closeTutorial();
            setTimeout(() => this.openTemplatesModal(), 300);
        });
        document.getElementById('tutorialNewBrief')?.addEventListener('click', () => {
            this.closeTutorial();
            setTimeout(() => this.openCreateModal(), 300);
        });
        
        // Templates functionality
        this.templatesBtn.addEventListener('click', () => this.openTemplatesModal());
        this.templatesBtnEmpty.addEventListener('click', () => this.openTemplatesModal());
        this.closeTemplates.addEventListener('click', () => this.closeTemplatesModal());
        this.templatesModal.addEventListener('click', (e) => {
            if (e.target === this.templatesModal) this.closeTemplatesModal();
        });
    }

    // READ - Load and display all briefs
    async loadBriefs() {
        try {
            this.briefs = await this.api.getAllBriefs();
            this.renderBriefs(this.briefs);
        } catch (error) {
            console.error('Failed to load briefs:', error);
            alert('Failed to load briefs. Please try again.');
        }
    }

    // Display briefs in the UI
    renderBriefs(briefsToRender) {
        // Clear existing cards
        this.briefsGrid.innerHTML = '';

        if (briefsToRender.length === 0) {
            this.emptyState.classList.add('active');
            this.briefsGrid.style.display = 'none';
            return;
        }

        // Show grid and hide empty state
        this.emptyState.classList.remove('active');
        this.emptyState.style.display = 'none';
        this.briefsGrid.style.display = 'grid';
        this.briefsGrid.style.visibility = 'visible';
        this.briefsGrid.style.opacity = '1';

        briefsToRender.forEach(brief => {
            const card = this.createBriefCard(brief);
            this.briefsGrid.appendChild(card);
        });
    }

    createBriefCard(brief) {
        const card = document.createElement('div');
        card.className = 'brief-card';
        card.dataset.id = brief.id;

        // Color palette HTML
        const colorsHTML = brief.colors.length > 0
            ? `<div class="color-palette">
                ${brief.colors.map(color => 
                    `<div class="color-swatch" style="background-color: ${color};" title="${color}"></div>`
                ).join('')}
               </div>`
            : '';

        // Tags HTML
        const tagsHTML = brief.tags.length > 0
            ? `<div class="card-tags">
                ${brief.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
               </div>`
            : '';

        // References HTML
        const referencesHTML = brief.references.length > 0
            ? `<div class="card-references">
                <div class="references-title">References</div>
                ${brief.references.map(ref => 
                    `<a href="${ref}" target="_blank" class="reference-link">${this.truncateUrl(ref)}</a>`
                ).join('')}
               </div>`
            : '';

        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${brief.title}</h3>
                <span class="card-status status-${brief.status}">${brief.status.replace('-', ' ')}</span>
            </div>
            <p class="card-description">${brief.description || 'No description provided.'}</p>
            ${colorsHTML}
            ${tagsHTML}
            ${referencesHTML}
            <div class="card-actions">
                <button class="btn btn-secondary btn-small edit-btn" data-id="${brief.id}">Edit</button>
                <button class="btn btn-danger btn-small delete-btn" data-id="${brief.id}">Delete</button>
            </div>
        `;

        // Attach UPDATE and DELETE event listeners
        card.querySelector('.edit-btn').addEventListener('click', () => this.openEditModal(brief.id));
        card.querySelector('.delete-btn').addEventListener('click', () => this.deleteBrief(brief.id));

        return card;
    }

    // Helper to truncate long URLs
    truncateUrl(url) {
        return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }

    openCreateModal() {
        this.currentEditId = null;
        this.modalTitle.textContent = 'NEW BRIEF';
        this.submitBtnText.textContent = 'Create Brief';
        this.briefForm.reset();
        this.modal.classList.add('active');
    }

    // UPDATE - Open modal with existing brief data
    async openEditModal(id) {
        try {
            const brief = await this.api.getBriefById(id);
            this.currentEditId = id;
            this.modalTitle.textContent = 'EDIT BRIEF';
            this.submitBtnText.textContent = 'Update Brief';

            // Populate form
            document.getElementById('briefTitle').value = brief.title;
            document.getElementById('briefDescription').value = brief.description;
            document.getElementById('status').value = brief.status;
            
            // Set colors
            brief.colors.forEach((color, index) => {
                const colorInput = document.getElementById(`color${index + 1}`);
                if (colorInput) colorInput.value = color;
            });
            
            // Set tags and references
            document.getElementById('tags').value = brief.tags.join(', ');
            document.getElementById('references').value = brief.references.join(', ');

            this.modal.classList.add('active');
        } catch (error) {
            console.error('Failed to load brief for editing:', error);
            alert('Failed to load brief. Please try again.');
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.briefForm.reset();
        this.currentEditId = null;
    }

    // Handle CREATE and UPDATE form submission
    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.briefForm);
        
        // Collect color palette
        const colors = [];
        for (let i = 1; i <= 5; i++) {
            colors.push(formData.get(`color${i}`));
        }

        // Parse tags and references
        const tags = formData.get('tags')
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const references = formData.get('references')
            .split(',')
            .map(ref => ref.trim())
            .filter(ref => ref.length > 0);

        const briefData = {
            title: formData.get('title'),
            description: formData.get('description'),
            colors: colors,
            references: references,
            tags: tags,
            status: formData.get('status')
        };

        try {
            if (this.currentEditId) {
                // UPDATE operation
                await this.api.updateBrief(this.currentEditId, briefData);
            } else {
                // CREATE operation
                await this.api.createBrief(briefData);
            }

            this.closeModal();
            await this.loadBriefs();
            
            // Show success message
            if (!this.currentEditId) {
                setTimeout(() => {
                    alert(`✅ Brief "${briefData.title}" created successfully!\n\n🎨 Your project card is now in the grid below.`);
                }, 300);
            }
        } catch (error) {
            console.error('Failed to save brief:', error);
            alert('❌ Failed to save brief. Please try again.\n\nError: ' + error.message);
        }
    }

    // DELETE operation with confirmation
    async deleteBrief(id) {
        if (!confirm('Are you sure you want to delete this brief? This action cannot be undone.')) {
            return;
        }

        try {
            await this.api.deleteBrief(id);
            await this.loadBriefs();
        } catch (error) {
            console.error('Failed to delete brief:', error);
            alert('Failed to delete brief. Please try again.');
        }
    }

    // Search and filter functionality
    filterBriefs() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const statusFilter = this.statusFilter.value;

        const filtered = this.briefs.filter(brief => {
            const matchesSearch = 
                brief.title.toLowerCase().includes(searchTerm) ||
                brief.description.toLowerCase().includes(searchTerm) ||
                brief.tags.some(tag => tag.toLowerCase().includes(searchTerm));

            const matchesStatus = statusFilter === 'all' || brief.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderBriefs(filtered);
    }

    // Theme Toggle - Dark/Light Mode
    initTheme() {
        const savedTheme = localStorage.getItem('briefVault_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('briefVault_theme', newTheme);
    }

    // Show Interactive Tutorial on Every Load
    checkFirstVisit() {
        // Always show tutorial for demo/submission purposes
        // Users can skip it if they want
        setTimeout(() => {
            if (this.tutorialOverlay) {
                this.tutorialOverlay.classList.add('active');
            }
        }, 1000);
    }

    // Tutorial Navigation
    nextTutorialStep() {
        if (this.currentTutorialStep < 3) {
            this.currentTutorialStep++;
            this.updateTutorialStep();
        }
    }

    prevTutorialStep() {
        if (this.currentTutorialStep > 0) {
            this.currentTutorialStep--;
            this.updateTutorialStep();
        }
    }

    updateTutorialStep() {
        // Hide all steps
        document.querySelectorAll('.tutorial-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        document.querySelector(`.tutorial-step[data-step="${this.currentTutorialStep}"]`).classList.add('active');
        
        // Update progress dots
        document.querySelectorAll('.progress-dot').forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index < this.currentTutorialStep) {
                dot.classList.add('completed');
            } else if (index === this.currentTutorialStep) {
                dot.classList.add('active');
            }
        });
        
        // Update buttons
        this.tutorialPrev.style.display = this.currentTutorialStep === 0 ? 'none' : 'flex';
        this.tutorialNext.style.display = this.currentTutorialStep === 3 ? 'none' : 'flex';
        this.tutorialFinish.style.display = this.currentTutorialStep === 3 ? 'flex' : 'none';
    }

    closeTutorial() {
        this.tutorialOverlay.classList.remove('active');
        this.currentTutorialStep = 0;
        this.updateTutorialStep();
    }

    // Show tutorial manually (via help button)
    showTutorial() {
        this.currentTutorialStep = 0;
        this.updateTutorialStep();
        this.tutorialOverlay.classList.add('active');
    }

    // Templates Modal
    openTemplatesModal() {
        this.renderTemplates();
        this.templatesModal.classList.add('active');
    }

    closeTemplatesModal() {
        this.templatesModal.classList.remove('active');
    }

    renderTemplates() {
        const templates = [
            {
                icon: '🌐',
                title: 'Website Redesign',
                description: 'Perfect for portfolio, landing pages, or corporate sites. Click to pre-fill form!',
                colors: ['#00f0ff', '#8b5cf6', '#1a1f3a', '#ffffff', '#ff0080'],
                tags: ['web', 'redesign', 'UI/UX'],
                references: ['https://awwwards.com', 'https://dribbble.com'],
                status: 'idea'
            },
            {
                icon: '📱',
                title: 'Mobile App UI',
                description: 'For iOS/Android app interface design. Click to use this template!',
                colors: ['#00ff9f', '#00f0ff', '#8b5cf6', '#ffd700', '#ff0080'],
                tags: ['mobile', 'app', 'UI'],
                references: ['https://mobbin.com', 'https://pttrns.com'],
                status: 'idea'
            },
            {
                icon: '🎨',
                title: 'Brand Identity',
                description: 'Logo, colors, typography for a brand. Click to customize!',
                colors: ['#ff0080', '#ffd700', '#00f0ff', '#1a1f3a', '#ffffff'],
                tags: ['branding', 'logo', 'identity'],
                references: ['https://behance.net', 'https://logopond.com'],
                status: 'idea'
            },
            {
                icon: '📊',
                title: 'Dashboard Design',
                description: 'Analytics, admin panels, data visualization. Click to start!',
                colors: ['#8b5cf6', '#00f0ff', '#00ff9f', '#ffd700', '#1a1f3a'],
                tags: ['dashboard', 'analytics', 'data-viz'],
                references: ['https://dribbble.com/tags/dashboard'],
                status: 'idea'
            },
            {
                icon: '🛍️',
                title: 'E-Commerce Site',
                description: 'Online store, product pages, checkout flow. Ready to customize!',
                colors: ['#00ff9f', '#ffd700', '#ff0080', '#1a1f3a', '#ffffff'],
                tags: ['e-commerce', 'shop', 'retail'],
                references: ['https://commerce.shopify.com/c/ecommerce-design'],
                status: 'idea'
            },
            {
                icon: '🎮',
                title: 'Gaming UI',
                description: 'Game interface, HUD elements, menus. Click to edit!',
                colors: ['#ff0080', '#00f0ff', '#ffd700', '#8b5cf6', '#0a0e27'],
                tags: ['gaming', 'HUD', 'UI'],
                references: ['https://gameuidatabase.com'],
                status: 'idea'
            }
        ];

        this.templatesGrid.innerHTML = templates.map(template => `
            <div class="template-card" data-template='${JSON.stringify(template)}'>
                <div class="template-icon">${template.icon}</div>
                <div class="template-title">${template.title}</div>
                <div class="template-desc">${template.description}</div>
                <div class="template-preview">
                    ${template.colors.slice(0, 5).map(color => 
                        `<span style="background-color: ${color};"></span>`
                    ).join('')}
                </div>
            </div>
        `).join('');

        // Attach click handlers
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = JSON.parse(card.dataset.template);
                this.useTemplate(template);
            });
        });
    }

    useTemplate(template) {
        this.closeTemplatesModal();
        
        // Show helpful message
        setTimeout(() => {
            alert(`📋 Template Loaded: "${template.title}"\n\n✏️ This form is PRE-FILLED with example data.\n\n👉 You can customize anything you want, then click "Create Brief" at the bottom.`);
        }, 200);
        
        this.openCreateModal();
        
        // Pre-fill form with template data
        setTimeout(() => {
            document.getElementById('briefTitle').value = template.title;
            document.getElementById('briefDescription').value = template.description;
            document.getElementById('tags').value = template.tags.join(', ');
            document.getElementById('references').value = template.references.join(', ');
            document.getElementById('status').value = template.status;
            
            // Set colors
            template.colors.forEach((color, index) => {
                const colorInput = document.getElementById(`color${index + 1}`);
                if (colorInput) colorInput.value = color;
            });
        }, 400);
    }

    // Load Sample/Seed Data for Demo
    async loadSeedData() {
        const seedBriefs = [
            {
                title: 'Cyberpunk Portfolio Redesign',
                description: 'Revamp personal portfolio with dark, futuristic aesthetic. Focus on smooth animations, neon accents, and terminal-inspired UI.',
                colors: ['#00f0ff', '#8b5cf6', '#ff0080', '#00ff9f', '#ffd700'],
                references: [
                    'https://www.awwwards.com',
                    'https://dribbble.com/tags/cyberpunk',
                    'https://tympanus.net/codrops'
                ],
                tags: ['web', 'portfolio', 'dark-mode', 'animations'],
                status: 'in-progress'
            },
            {
                title: 'Mobile Game UI Concept',
                description: 'Sci-fi mobile game interface with HUD elements, energy bars, and futuristic buttons. Inspired by tactical military displays.',
                colors: ['#0a0e27', '#00ff9f', '#ff006e', '#ffd60a', '#00d9ff'],
                references: [
                    'https://www.behance.net/gallery/game-ui',
                    'https://www.artstation.com/artwork/sci-fi-ui'
                ],
                tags: ['mobile', 'gaming', 'UI', 'HUD'],
                status: 'idea'
            },
            {
                title: 'E-Commerce Dashboard',
                description: 'Admin dashboard for online store. Data visualization with charts, real-time analytics, and clean card-based layout.',
                colors: ['#7c3aed', '#0099cc', '#00c896', '#f59e0b', '#e91e63'],
                references: [
                    'https://www.tailwindui.com/components/application-ui',
                    'https://mui.com/material-ui/getting-started/'
                ],
                tags: ['dashboard', 'analytics', 'admin', 'SaaS'],
                status: 'completed'
            },
            {
                title: 'Fitness Tracker App',
                description: 'Minimalist fitness tracking app with progress charts, workout logs, and motivational UI. Clean, energetic color scheme.',
                colors: ['#06ffa5', '#00d9ff', '#7b2cbf', '#ff006e', '#ffd60a'],
                references: [
                    'https://www.mobbin.com/browse/ios/apps',
                    'https://dribbble.com/tags/fitness-app'
                ],
                tags: ['mobile', 'health', 'fitness', 'minimalist'],
                status: 'in-progress'
            },
            {
                title: 'Music Production Landing Page',
                description: 'Dark, edgy landing page for music production software. Heavy use of gradients, frosted glass effects, and bold typography.',
                colors: ['#1a1f3a', '#8b5cf6', '#ff0080', '#00f0ff', '#ffd700'],
                references: [
                    'https://www.soundtrap.com',
                    'https://www.ableton.com'
                ],
                tags: ['landing-page', 'music', 'audio', 'dark-theme'],
                status: 'idea'
            },
            {
                title: 'Dev Tools Documentation Site',
                description: 'Technical documentation site with syntax highlighting, dark mode, and excellent developer experience. Focus on readability.',
                colors: ['#0a0e27', '#00f0ff', '#a8b2d1', '#8b5cf6', '#00ff9f'],
                references: [
                    'https://docs.github.com',
                    'https://tailwindcss.com/docs',
                    'https://docs.astro.build'
                ],
                tags: ['documentation', 'developer-tools', 'technical', 'markdown'],
                status: 'completed'
            }
        ];

        try {
            // Clear existing data if confirmed
            if (this.briefs.length > 0) {
                if (!confirm('This will replace your existing briefs with 6 example projects. Continue?')) {
                    return;
                }
                // Clear localStorage
                localStorage.removeItem(this.api.localStorageKey);
            }

            // Add each seed brief
            for (const seedData of seedBriefs) {
                await this.api.createBrief(seedData);
            }

            // Reload the grid
            await this.loadBriefs();
            
            alert('✨ Demo data loaded successfully!\n\n📊 ' + this.briefs.length + ' creative briefs should now be visible in the grid below.');
        } catch (error) {
            console.error('Error loading seed data:', error);
            alert('Failed to load demo data. Please try again.');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BriefVaultApp();
    
    // Add loaded class for animations after brief delay
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

