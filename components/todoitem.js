import "./checkbox.js";
import { addWaveTouch, transition } from "../utils.js";
export class TodoItem extends HTMLElement {
    static get observedAttributes() { return ['selecting'] }
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            @import url("index.css");
            #todo-item {
                height: 60px;
                background: #f8f8f8;
                border-bottom: 1px solid #d9d9d9;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                overflow: hidden;
            }

            #todo-item.enter{
                height: 0;
            }

            #todo-item.enter-active{
                transition: height 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            }

            #todo-item.enter-to{
                height: 60px;
            }

            #check-box{
                display: flex;
                border-color: inherit;
            }
        
            #prefix {
                padding: 22px;
                flex-shrink: 0;
            }

            #main {
                height: 100%;
                width: 100%;
                font-size: 18px;
                color: rgba(0, 0, 0, 0.75);
                line-height: 60px;
                padding: 0 22px;
                margin: 0;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
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
        <div id="todo-item">
            <div id="prefix">
                <check-box id="check-box"></check-box>
            </div>
            <p id="main">李舜生</p>
        </div>
        `
    }

    get value() {
        return this.main.innerHTML;
    }

    set value(value) {
        return this.main.innerHTML = value;
    }

    get color() {
        return this._prefix.style.borderColor || "#000000";
    }

    set color(value) {
        this._prefix.style.borderColor = value;
    }

    get selecting() {
        return this.getAttribute('selecting') !== null;
    }

    set selecting(value) {
        if (value === null || value === false) {
            this.removeAttribute('selecting');
        } else {
            this.setAttribute('selecting', '');
        }
    }

    connectedCallback() {
        var todoItem = this.shadowRoot.getElementById('todo-item');
        transition.call(todoItem, 'enter', 300);

        this.main = this.shadowRoot.getElementById('main');
        this._prefix = this.shadowRoot.getElementById('prefix');
        this.checkbox = this.shadowRoot.getElementById('check-box');
        this.checkbox.disabled = true;

        addWaveTouch.call(this._prefix);
        addWaveTouch.call(this.main);
    }

    attributeChangedCallback(name) {
        if (name === 'selecting') {
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

export class TodoItemEditor extends HTMLElement {
    static priority2color = ['red', 'orange', 'yellow', 'lightgreen', 'cyan', 'blue', 'purple'];
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            .todo-item-editor {
                width: 100%;
                height: 300px;
                display: flex;
                align-items: center;
                background: #f8f8f8;
                position: relative;
                overflow: hidden;
                z-index: 0;
            }
        
            .todo-item-editor::before,
            .todo-item-editor::after {
                content: "";
                width: 100%;
                height: 120px;
                display: block;
                position: absolute;
                z-index: 1;
            }
        
            .todo-item-editor::before {
                top: 0;
                right: 0;
                background: linear-gradient(#f8f8f8, #f8f8f862);
            }
        
            .todo-item-editor::after {
                bottom: 0;
                right: 0;
                background: linear-gradient(#f8f8f862, #f8f8f8);
            }

            .editor {
                width: 100%;
                height: 60px;
                display: flex;
                border: 2px solid #d9d9d9;
                border-left: none;
                border-right: none;
            }
        
            #prefix-column {
                flex-shrink: 0;
                width: 60px;
                position: relative;
                list-style-type: none;
                margin: 0;
                padding: 0;
                top: 0;
            }
        
            #prefix-column.enter-active {
                transition: top 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            }

            #virtual-prefix-column {
                width: 60px;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
            }
        
            .prefix {
                padding: 22px;
            }
        
            .prefix .dot {
                display: block;
                width: 16px;
                height: 16px;
                border-radius: 50%;
            }
        
            #input {
                outline: none;
                border: none;
                background: inherit;
                padding: 0 22px;
                font-size: 18px;
                color: rgba(0, 0, 0, 0.6);
            }
        </style>
        <div class="todo-item-editor">
            <div class="editor">
                <ol id="prefix-column"></ol>
                <input id="input" placeholder="Enter what you want to do!">
            </div>
            <div id="virtual-prefix-column"></div>
        </div>
        `
    }

    get value() {
        return this.input.value;
    }

    set value(value) {
        this.input.value = value;
    }

    get color() {
        return TodoItemEditor.priority2color[this.index];
    }

    connectedCallback() {
        this.input = this.shadowRoot.getElementById('input');
        this.index = Math.floor(TodoItemEditor.priority2color.length / 2);

        const prefixColumn = this.shadowRoot.getElementById('prefix-column');
        TodoItemEditor.priority2color.forEach((color) => {
            const item = document.createElement('li');
            item.classList.add("prefix");
            item.innerHTML = `<span class="dot" style="background: ${color}"></span>`;
            prefixColumn.appendChild(item);
        })
        prefixColumn.style.top = `${this.index * -60}px`;

        const minTop = -60 * (TodoItemEditor.priority2color.length - 1);
        const maxTop = 0;
        this.shadowRoot.getElementById('virtual-prefix-column').addEventListener('touchstart', (e) => {
            const startTop = parseFloat(window.getComputedStyle(prefixColumn).top);
            const startY = e.changedTouches[0].clientY;
            const touchmove = (e) => {
                const curY = e.changedTouches[0].clientY;
                var curTop = startTop + curY - startY;
                curTop = Math.clamp(curTop, minTop, maxTop);
                prefixColumn.style.top = `${curTop}px`;
            };


            window.addEventListener('touchmove', touchmove);
            window.addEventListener('touchend', function touchend(e) {
                window.removeEventListener('touchmove', touchmove);
                window.removeEventListener('touchend', touchend);

                const curY = e.changedTouches[0].clientY;
                var roundTop = startTop + curY - startY;
                roundTop = Math.round(roundTop / 60) * 60;
                roundTop = Math.clamp(roundTop, minTop, maxTop);
                prefixColumn.style.top = `${roundTop}px`;

                transition.call(prefixColumn, 'enter', 300, {
                    nextFrame: () => {
                        prefixColumn.style.top = `${roundTop}px`;
                    }
                });

                this.index = Math.abs(roundTop / 60);
            })
        })
    }
}

if (!customElements.get('todo-item-editor')) {
    customElements.define('todo-item-editor', TodoItemEditor);
}