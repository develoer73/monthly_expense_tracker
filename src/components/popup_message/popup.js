export class PopupMessage {
    static async init() {
        if (!document.getElementById('popupTemplate')) {
            // Instead of fetching HTML, use inline template
            const template = `
                <template id="popupTemplate">
                    <div class="popup-overlay">
                        <div class="popup-container">
                            <div class="popup-content">
                                <div class="popup-header">
                                    <div class="popup-icon-wrapper">
                                        <div class="popup-icon" role="img"></div>
                                    </div>
                                    <div class="popup-header-text">
                                        <h3 class="popup-title"></h3>
                                        <div class="popup-subtitle"></div>
                                    </div>
                                </div>
                                <div class="popup-body">
                                    <p class="popup-message"></p>
                                </div>
                                <div class="popup-actions">
                                    <button class="popup-button primary" type="button"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            `;
            document.body.insertAdjacentHTML('beforeend', template);
        }
    }

    static async show(message, type = 'error') {
        await this.init();
        const existingPopup = document.querySelector('.popup-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        const icons = {
            error: '×',
            success: '✓',
            warning: '!'
        };

        const titles = {
            error: 'Error',
            success: 'Success',
            warning: 'Notice'
        };

        const buttonText = {
            error: 'Close',
            success: 'OK',
            warning: 'Got it'
        };

        const subtitles = {
            error: 'Something went wrong',
            success: 'Operation completed',
            warning: 'Please note'
        };

        const template = document.getElementById('popupTemplate');
        if (!template) {
            console.error('Popup template not found');
            return;
        }

        const popup = template.content.cloneNode(true).firstElementChild;
        const container = popup.querySelector('.popup-container');
        
        // Safe element selection with error checking
        const elements = {
            icon: popup.querySelector('.popup-icon'),
            title: popup.querySelector('.popup-title'),
            subtitle: popup.querySelector('.popup-subtitle'),
            message: popup.querySelector('.popup-message'),
            button: popup.querySelector('.popup-button')
        };

        // Check if all elements exist before setting content
        if (Object.values(elements).some(el => !el)) {
            console.error('Required popup elements not found');
            return;
        }

        container.classList.add(type);
        elements.icon.textContent = icons[type];
        elements.title.textContent = titles[type];
        elements.subtitle.textContent = subtitles[type];
        elements.message.textContent = message;
        elements.button.textContent = buttonText[type];

        // Add fade-in animation
        document.body.appendChild(popup);
        popup.style.opacity = '0';
        requestAnimationFrame(() => {
            popup.style.opacity = '1';
            popup.classList.add('active');
        });

        const closeBtn = elements.button;
        const closePopup = () => {
            popup.classList.remove('active');
            setTimeout(() => popup.remove(), 200);
        };

        closeBtn.onclick = closePopup;
        popup.onclick = (e) => {
            if (e.target === popup) closePopup();
        };

        const autoClose = setTimeout(closePopup, 4000);
        closeBtn.addEventListener('click', () => clearTimeout(autoClose));

        return {
            close: closePopup
        };
    }
}
