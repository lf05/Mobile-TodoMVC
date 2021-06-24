export default class CheckBox extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            .checkbox {
                width: 16px;
                height: 16px;
                border: 2px solid;
                border-color: inherit;
                border-radius: 2px;
                position: relative;
                z-index: 0;
                background: inherit;
                box-sizing: border-box;
                display: inline-block;
                overflow: hidden;
                transition: border-width 0.3s ease-out;
            }

            :host([disabled]) .checkbox{
                border-radius: 50%;
                border: 8px solid;
                border-color: inherit;
            }
        
            .checkbox::before {
                content: "";
                width: 33.33%;
                height: 66.66%;
                display: inline-block;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                z-index: -1;
                border: inherit;
                border-left: none;
                border-top: none;
            }

            :host([disabled]) .checkbox::before{
                display: none;
            }
        
            .checkbox::after {
                content: "";
                width: 100%;
                height: 100%;
                background: #f8f8f8;
                display: block;
                float: right;
            }
        
            :host([checked]) .checkbox::after {
                width: 0;
                transition: width 0.15s ease-out 0.05s;
            }

            :host([disabled]) .checkbox::after{
                display: none;
            }
        </style>
        <i class="checkbox" id="checkbox"></i>
        `
    }

    get disabled() {
        return this.getAttribute('disabled') !== null;
    }

    set disabled(value) {
        if (value === null || value === false) {
            this.removeAttribute('disabled');
        } else {
            this.setAttribute('disabled', '');
        }
    }

    get checked() {
        return this.getAttribute('checked') !== null;
    }

    set checked(value) {
        if (value === null || value === false) {
            this.removeAttribute('checked');
        } else {
            this.setAttribute('checked', '');
        }
    }

    connectedCallback() {
        this.touch = function (e) {
            e.stopPropagation();
            const event = new CustomEvent('select', {
                bubbles: true,
                composed: true,
                detail: {
                    selected: !this.checked
                }
            });
            this.dispatchEvent(event);

        }
        this.addEventListener('touch', this.touch);
    }

    disconnectedCallback() {
        this.removeEventListener('touch', this.touch);
    }
}

if (!customElements.get('check-box')) {
    customElements.define('check-box', CheckBox);
}