export class Sidebar {
    constructor() {
        this.elements = {
            sidebar: null,
            toggleBtn: null,
            menuItems: null
        };
        this.init();
    }

    async init() {
        try {
            await this.loadSidebarContent();
            this.initializeElements();
            this.setupEventListeners();
            this.handleInitialResponsiveState();
        } catch (error) {
            console.error('Sidebar initialization failed:', error);
        }
    }

    async loadSidebarContent() {
        const response = await fetch('/src/components/sidebar/sidebar.html');
        if (!response.ok) throw new Error('Failed to load sidebar content');
        
        const html = await response.text();
        const wrapper = document.querySelector('.wrapper');
        if (!wrapper) throw new Error('Wrapper element not found');
        
        wrapper.insertAdjacentHTML('afterbegin', html);
    }

    initializeElements() {
        this.elements = {
            sidebar: document.querySelector('.sidebar'),
            toggleBtn: document.querySelector('.toggle-btn'),
            menuItems: document.querySelectorAll('.menu-item')
        };

        if (!this.elements.sidebar || !this.elements.toggleBtn) {
            throw new Error('Required sidebar elements not found');
        }
    }

    setupEventListeners() {
        this.setupToggleButton();
        this.setupMenuItemsInteraction();
        this.setupResponsiveHandling();
    }

    setupToggleButton() {
        const { toggleBtn, sidebar } = this.elements;
        
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            
            // Update ARIA attributes
            const isCollapsed = sidebar.classList.contains('collapsed');
            toggleBtn.setAttribute('aria-expanded', !isCollapsed);
            toggleBtn.setAttribute('aria-label', 
                isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            );
            
            // Store preference
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });

        // Restore user preference
        const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (wasCollapsed) {
            sidebar.classList.add('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        document.querySelector('.toggle-btn').addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
            sidebar.setAttribute('data-collapsed', !isCollapsed);
            this.setAttribute('aria-expanded', isCollapsed);
        });
    }

    setupMenuItemsInteraction() {
        this.elements.menuItems.forEach(item => {
            item.addEventListener('click', () => this.handleMenuItemClick(item));
        });
    }

    handleMenuItemClick(clickedItem) {
        this.elements.menuItems.forEach(item => {
            item.classList.toggle('active', item === clickedItem);
        });
    }

    setupResponsiveHandling() {
        window.addEventListener('resize', this.handleResponsiveLayout.bind(this));
    }

    handleInitialResponsiveState() {
        this.handleResponsiveLayout();
    }

    handleResponsiveLayout() {
        const isMobile = window.innerWidth <= 768;
        this.elements.sidebar.classList.toggle('collapsed', isMobile);
    }
}
