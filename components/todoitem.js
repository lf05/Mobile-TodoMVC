class TodoItem extends HTMLElement {
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            @import url("css/common.css");
            #todo-item {
                height: 60px;
                background: #f8f8f8;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                overflow: hidden;
            }

            #todo-item.leave-to,
            #todo-item.enter{
                height: 0;
            }

            #todo-item.leave-active,
            #todo-item.enter-active{
                transition: height 0.3s ease-in-out;
            }

            #todo-item.leave,
            #todo-item.enter-to{
                height: 60px;
            }

            #check-box{
                display: flex;
                padding: 22px;
                flex-shrink: 0;
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

            :host([finished]) #main{
                text-decoration: line-through;
                color: #bdbdbd;
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
            <check-box id="check-box"></check-box>
            <p id="main"><slot></slot></p>
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
        return this.checkbox.style.borderColor || "#000000";
    }

    set color(value) {
        this.checkbox.style.borderColor = value;
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
        this.checkbox.disabled = !this.selecting;
    }

    get finished() {
        return this.getAttribute('finished') !== null;
    }

    set finished(value) {
        this.checkbox.checked = false;
        if (value === null || value === false) {
            this.removeAttribute('finished');
        } else {
            this.setAttribute('finished', '');
        }
    }

    reset() {
        this.removeStyle('top');
    }

    onSelect(selected) {
        if (this.checkbox.checked !== selected && this.parentElement instanceof TodoItemList) {
            this.parentElement.onChildSelect(selected);
        }
        this.checkbox.checked = selected;
        return [this];
    }

    onDelete() {
        if (this.parentElement instanceof TodoItemList) {
            this.parentElement.onChildDelete(this.checkbox.checked);
        }
        transition.call(this.todoItem, "leave", 300, {
            lastFrame: () => {
                this.parentElement.removeChild(this);
            }
        })
    }

    getPreviousTodo() {
        if (this.previousElementSibling) {
            var element = this.previousElementSibling;
            if (element instanceof TodoItem) {
                return element;
            } else if (element instanceof TodoItemList) {
                if (element.expanded) {
                    return element.lastElementChild || element;
                } else {
                    return element;
                }
            }
        } else if (this.parentElement instanceof TodoItemList) {
            return this.parentElement;
        }
        return null;
    }

    getNextTodo() {
        if (this.nextElementSibling) {
            var element = this.nextElementSibling;
            if (element instanceof TodoItem) {
                return element;
            } else if (element instanceof TodoItemList) {
                return element;
            }
        } else if (this.parentElement instanceof TodoItemList) {
            return this.parentElement.nextElementSibling;
        }
        return null;
    }

    connectedCallback() {
        this.todoItem = this.shadowRoot.getElementById('todo-item');
        addWaveTouch.call(this.todoItem);

        this.main = this.shadowRoot.getElementById('main');
        this.checkbox = this.shadowRoot.getElementById('check-box');
        this.checkbox.disabled = true;
    }
}

if (!customElements.get('todo-item')) {
    customElements.define('todo-item', TodoItem);
}

class TodoItemList extends HTMLElement {
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            #header{
                background: #f8f8f8;
                position: relative;
                display: flex;
            }

            #name{
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

            .arrow {
                width: 60px;
                height: 60px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .arrow::before {
                content: "";
                display: block;
                width: 11.31px;
                height: 11.31px;
                border: 3px solid #bdbdbd;
                border-left: none;
                border-top: none;
                transform: rotate(-45deg);
                transition: transform 0.3s ease-in-out;
            }

            :host([expanded]) .arrow::before {
                transform: rotate(45deg);
            }

            check-box {
                padding: 22px;
                width: 60px;
                box-sizing: border-box;
                flex-shrink: 0;
                display: flex;
                background: inherit;
                overflow: hidden;
                transition: all 0.3s ease-out;
            }

            :host(:not([selecting])) check-box {
                width: 0;
                padding: 22px 0;
            }

            #container {
                overflow: hidden;
                position: relative;
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
                z-index: 0;
            }

            .enter,
            .leave-to,
            :host(:not([expanded])) #container{
                height: 0;
            }

            .add-active,
            .virtual-active,
            .enter-active,
            .leave-active {
                transition: all 0.3s ease-in-out;
            }

            #virtual-container{
                height: 100%;
                width: 100%;
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1;
            }
        </style>
        <div id="header">
            <check-box id="check-box"></check-box>
            <p id="name">李舜生</p>
            <i class="arrow"></i>
        </div>
        <div id="container">
            <slot></slot>
            <div id="virtual-container"></div>
        </div>
        `
    }

    get selecting() {
        return this.getAttribute('selecting') !== null;
    }

    set selecting(value) {
        if (value === null || value === false) {
            this.removeAttribute('selecting');
            Array.from(this.children).forEach((element) => {
                element.selecting = false;
            })
        } else {
            this.setAttribute('selecting', '');
            Array.from(this.children).forEach((element) => {
                element.selecting = true;
            })
        }
    }

    get expanded() {
        return this.getAttribute('expanded') !== null;
    }

    set expanded(value) {
        if (value === null || value === false) {
            this.removeAttribute('expanded');
            transition.call(this.container, 'leave', 300, {
                firstFrame: () => {
                    this.container.style.height = `${this.children.length * 60}px`;
                },
                nextFrame: () => {
                    this.container.removeStyle('height');
                }
            });
        } else {
            this.setAttribute('expanded', '');
            transition.call(this.container, 'enter', 300, {
                nextFrame: () => {
                    this.container.style.height = `${this.children.length * 60}px`;
                },
                lastFrame: () => {
                    this.container.removeStyle('height');
                }
            });
        }
    }

    get value() {
        return this.name.innerHTML;
    }

    set value(value) {
        this.name.innerHTML = value;
    }

    addItem(item) {
        this.appendChild(item);
        if (this.expanded) {
            transition.call(this.container, 'add', 300, {
                firstFrame: () => {
                    this.container.style.height = `${(this.children.length - 1) * 60}px`;
                },
                nextFrame: () => {
                    this.container.style.height = `${this.children.length * 60}px`;
                },
                lastFrame: () => {
                    this.container.style.height = null;
                }
            });
        } else {
            this.expanded = true;
        }
    }

    enableContainerOverflow() {
        this.container.style.overflow = 'visible';
    }

    virtualAppendItem() {
        this.enableContainerOverflow();
        this.container.style.boxShadow = 'none';
        this.virtualContainer.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.25)';
        const top = parseFloat(getComputedStyle(this.virtualContainer).top);
        transition.call(this.virtualContainer, 'virtual', 300, {
            firstFrame: () => {
                this.virtualContainer.style.top = `${top}px`;
            },
            nextFrame: () => {
                this.virtualContainer.style.top = `${top + 60}px`;
            }
        })

    }

    virtualPrependItem() {
        this.enableContainerOverflow();
        const top = parseFloat(getComputedStyle(this.header).top);
        transition.call(this.header, 'virtual', 300, {
            firstFrame: () => {
                this.header.style.top = `${top}px`;
            },
            nextFrame: () => {
                this.header.style.top = `${top - 60}px`;
            }
        })
    }

    virtualRemoveFrontItem() {
        const top = parseFloat(getComputedStyle(this.header).top);
        return new Promise((reslove) => {
            transition.call(this.header, 'virtual', 300, {
                firstFrame: () => {
                    this.header.style.top = `${top}px`;
                },
                nextFrame: () => {
                    this.header.style.top = `${top + 60}px`;
                },
                lastFrame: () => {
                    reslove();
                }
            })
        })

    }

    virtualRemoveBackItem() {
        return new Promise((reslove) => {
            this.container.style.boxShadow = 'none';
            this.virtualContainer.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.25)';
            const top = parseFloat(getComputedStyle(this.virtualContainer).top);
            transition.call(this.virtualContainer, 'virtual', 300, {
                firstFrame: () => {
                    this.virtualContainer.style.top = `${top}px`;
                },
                nextFrame: () => {
                    this.virtualContainer.style.top = `${top - 60}px`;
                },
                lastFrame: () => {
                    reslove();
                }
            })
        })
    }

    getPreviousTodo() {
        var element = this.previousElementSibling;
        if (element instanceof TodoItem) {
            return element;
        } else if (element instanceof TodoItemList) {
            if (element.expanded) {
                return element.lastElementChild || element;
            } else {
                return element;
            }
        }
        return null;
    }

    getNextTodo() {
        if (this.expanded) {
            return this.firstElementChild || this.nextElementSibling;
        } else {
            return this.nextElementSibling;
        }
    }

    reset() {
        this.container.style.overflow = 'hidden';
        this.container.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.25)';
        this.virtualContainer.style.boxShadow = 'none';
        this.virtualContainer.style.top = 0;
        this.header.style.top = 0;
        this.removeStyle('top');
        Array.from(this.children).forEach(child => {
            child.reset();
        })
    }

    onDelete() {
        transition.call(this.header, 'leave', 300, {
            firstFrame: () => {
                this.header.style.top = 0;
            },
            lastFrame: () => {
                this.parentElement.removeChild(this);
            }
        })
    }

    onSelect(selected) {
        this.checkbox.checked = selected;
        const children = Array.from(this.children);
        children.forEach(child => {
            child.onSelect(selected);
        })
        this.selectedCount = selected ? children.length : 0;
        return children;
    }

    onChildSelect(selected) {
        if (selected) {
            this.selectedCount++;
        } else {
            this.selectedCount--;
        }

        if (this.children.length > 0 && this.selectedCount === this.children.length) {
            this.checkbox.checked = true;
        } else {
            this.checkbox.checked = false;
        }
    }

    onChildDelete(selected) {
        if (selected) {
            this.selectedCount--;
        }

        if (this.selectedCount === this.children.length) {
            this.checkbox.checked = true;
        } else {
            this.checkbox.checked = false;
        }
    }

    connectedCallback() {
        this.container = this.shadowRoot.getElementById('container');
        this.virtualContainer = this.shadowRoot.getElementById('virtual-container');
        this.name = this.shadowRoot.getElementById('name');
        this.header = this.shadowRoot.getElementById('header');
        this.checkbox = this.shadowRoot.getElementById('check-box');
        this.selectedCount = 0;
    }

}

if (!customElements.get('todo-item-list')) {
    customElements.define('todo-item-list', TodoItemList);
}

class TodoItemEditor extends HTMLElement {
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
                transition: top 0.3s ease-in-out;
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
                width: 100%;
            }

            .shake {
                animation: shake 0.3s ease-in-out;
            }

            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(+2px, 0, 0); }
                30%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(+4px, 0, 0); }
                50% { transform: translate3d(-4px, 0, 0); }
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

    set color(value) {
        TodoItemEditor.priority2color.some((color, i) => {
            if (color === value) {
                this.prefixColumn.style.top = `${i * -60}px`;
                this.index = i;
                return true;
            }
        })
    }

    confirm() {
        if (!this.value) {
            this.input.classList.add('shake');
            setTimeout(() => { this.input.classList.remove('shake') }, 300);
            return false;
        }
        return true;
    }

    connectedCallback() {
        this.input = this.shadowRoot.getElementById('input');
        this.index = Math.floor(TodoItemEditor.priority2color.length / 2);

        this.prefixColumn = this.shadowRoot.getElementById('prefix-column');
        const prefixColumn = this.prefixColumn;
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
            const startY = e.changedTouches[0].pageY;
            const touchmove = (e) => {
                const curY = e.changedTouches[0].pageY;
                var curTop = startTop + curY - startY;
                curTop = Math.clamp(curTop, minTop, maxTop);
                prefixColumn.style.top = `${curTop}px`;
            };


            window.addEventListener('touchmove', touchmove);
            window.addEventListener('touchend', (e) => {
                window.removeEventListener('touchmove', touchmove);

                const curY = e.changedTouches[0].pageY;
                var roundTop = startTop + curY - startY;
                roundTop = Math.round(roundTop / 60) * 60;
                roundTop = Math.clamp(roundTop, minTop, maxTop);
                transition.call(prefixColumn, 'enter', 300, {
                    nextFrame: () => {
                        prefixColumn.style.top = `${roundTop}px`;
                    }
                });

                this.index = Math.abs(roundTop / 60);
            }, { once: true })
        })
    }
}

if (!customElements.get('todo-item-editor')) {
    customElements.define('todo-item-editor', TodoItemEditor);
}

class TodoListEditor extends HTMLElement {
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
        
            #input {
                outline: none;
                border: none;
                background: inherit;
                padding: 0 22px;
                font-size: 18px;
                color: rgba(0, 0, 0, 0.6);
                width: 100%;
                height: 60px;
                border: 2px solid #d9d9d9;
                border-left: none;
                border-right: none;
            }
        </style>
        <div class="todo-item-editor">
            <input id="input" placeholder="Enter what you want to do!">
        </div>
        `
    }

    get value() {
        return this.input.value || this.input.getAttribute('placeholder');
    }

    set value(value) {
        this.input.value = value;
    }

    confirm() {
        return !!this.value;
    }

    connectedCallback() {
        this.input = this.shadowRoot.getElementById('input');

        const date = new Date();
        this.input.setAttribute('placeholder', `${date.getMonth() + 1}月${date.getDate()}日`)
    }
}

if (!customElements.get('todo-list-editor')) {
    customElements.define('todo-list-editor', TodoListEditor);
}