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
                background: white;
                box-sizing: border-box;
                display: inline-block;
                transition: border-width 0.3s ease-out;
            }

            :host([disabled]) .checkbox{
                border-radius: 50%;
                border: 8px solid;
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
                background: inherit;
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
        this.event.initEvent("change", false, true);
        if (value === null || value === false) {
            this.removeAttribute('checked');
            this.event.data = { "checked": false }
        } else {
            this.setAttribute('checked', '');
            this.event.data = { "checked": true }
        }
        this.dispatchEvent(this.event);
    }

    connectedCallback() {
        this.addEventListener('touchstart', () => {
            this.checked = !this.checked;
        })

        this.event = document.createEvent("HTMLEvents");
    }
}

if (!customElements.get('check-box')) {
    customElements.define('check-box', CheckBox);
}