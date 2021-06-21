import "./checkbox.js";
import { addTouchWave } from "./utils.js";
export class TodoItem extends HTMLElement {
    static get observedAttributes() { return ['selecting'] }
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            @import url("index.css");
            .todo-item {
                height: 60px;
                background: #f8f8f8;
                border-bottom: 1px solid #d9d9d9;
                display: flex;
                align-items: center;
            }

            check-box{
                display: flex;
            }
        
            .prefix {
                padding: 22px;
                flex-shrink: 0;
                display: flex;
                position: relative;
                z-index: 0;
                overflow: hidden;
            }

            .main {
                height: 100%;
                width: 100%;
            }

            .dot {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 8px solid;
                border-color: inherit;
                display: inline-block;
                box-sizing: border-box;
                
            }
            :host([select]) .dot{
                border-radius: 2px;
                border: 2px solid;
            }

        </style>
        <div class="todo-item" id="todo-item">
            <div class="prefix" id="prefix">
                <check-box id="check-box"></check-box>
            </div>
            <div class="main" id="main"></div>
        </div>
        `
    }

    get selecting(){
        return this.getAttribute('selecting')!==null;
    }

    set selecting(value) {
        if (value === null || value === false) {
            this.removeAttribute('selecting');
        } else {
            this.setAttribute('selecting', '');
        }
    }

    connectedCallback() {
        this.todoitem = this.shadowRoot.getElementById('todo-item');
        this.checkbox = this.shadowRoot.getElementById('check-box');
        this.checkbox.disabled = true;

        addTouchWave.call(this.shadowRoot.getElementById('prefix'));
        addTouchWave.call(this.shadowRoot.getElementById('main'));
    }

    attributeChangedCallback (name) {
        if(name === 'selecting'){
            this.checkbox.disabled = !this.selecting;
        }
    }
}

if (!customElements.get('todo-item')) {
    customElements.define('todo-item', TodoItem);
}

export class TodoItemList extends HTMLElement {
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <slot></slot>
        `
    }
    connectedCallback() {
        this.addEventListener('touchstart', (e) => {
            const timer = setTimeout(() => {
                Array.from(this.children).forEach(todoItem => {
                    todoItem.selecting = true;
                });
            }, 300);

            this.addEventListener('touchend', function touchend() {
                clearTimeout(timer);
                this.removeEventListener('touchend', touchend);
            })
        })
    }
}

if (!customElements.get('todo-item-list')) {
    customElements.define('todo-item-list', TodoItemList);
}