class FloatingWindow extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            @import url("css/index.css");
            :host(:not([visible])){
                display: none;
            }

            #mask {
                width: 100%;
                height: 100%;
                position: fixed;
                top: 0;
                left: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .floating-window {
                width: 90%;
                background: #f8f8f8;
                border-radius: 30px;
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
                overflow: hidden;
            }

            #mask.enter-active,
            #mask.enter-active .floating-window,
            #mask.leave-active,
            #mask.leave-active .floating-window{
                transition: all 0.3s linear;
            }

            #mask,
            #mask.leave,
            #mask.enter-to {
                background: rgba(0, 0, 0, 0.2);
            }

            .floating-window,
            #mask.leave .floating-window,
            #mask.enter-to .floating-window {
                transform: translate3d(0, 0, 0);
                opacity: 1;
            }

            #mask.leave-to,
            #mask.enter {
                background: rgba(0, 0, 0, 0);
            }

            #mask.leave-to .floating-window,
            #mask.enter .floating-window {
                transform: translate3d(0, -20px, 0);
                opacity: 0;
            }

            .footer {
                display: flex;
            }

            button {
                background: inherit;
                border: 1px solid rgba(0, 0, 0, 0.03);
                outline: none;
                flex: 1;
                font-size: 18px;
                font-weight: bold;
                padding: 14px 0;
            }
        
            #confirm{
                color: rgba(60, 60, 217, 0.8);
            }
        
            #cancel{
                color: #bdbdbd;
            }

        </style>
        <div class="mask" id="mask">
            <div class="floating-window">
                <slot></slot>
                <div class="footer">
                    <button id="confirm">确认</button>
                    <button id="cancel">取消</button>
                </div>
            </div>
        </div>
        `
    }

    get visible() {
        return this.getAttribute('visible') !== null;
    }

    set visible(value) {
        if (value === null || value === false) {
            transition.call(this.mask, 'leave', 300, {
                lastFrame: () => {
                    this.removeAttribute('visible');
                }
            });

        } else {
            transition.call(this.mask, 'enter', 300, {
                firstFrame: () => {
                    this.setAttribute('visible', '');
                }
            });
        }
    }

    connectedCallback() {
        const confirm = this.shadowRoot.getElementById('confirm');
        confirm.addEventListener('touch', () => {
            const child = this.children[0];
            if (!child.confirm || child.confirm && child.confirm()) {
                const event = new CustomEvent('confirm')
                this.dispatchEvent(event);
            }
        })
        addWaveTouch.call(confirm);

        const cancel = this.shadowRoot.getElementById('cancel');
        cancel.addEventListener('touch', () => {
            const event = new CustomEvent('cancel')
            this.dispatchEvent(event);
        });
        addWaveTouch.call(cancel);

        this.mask = this.shadowRoot.getElementById('mask');
        this.mask.addEventListener('touchmove', (e) => {
            e.preventDefault();
        })
    }
}

if (!customElements.get('floating-window')) {
    customElements.define('floating-window', FloatingWindow);
}