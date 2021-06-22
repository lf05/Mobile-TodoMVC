export function addWaveTouch() {
    this.addEventListener('touchstart', function (e) {
        const { position, zIndex, overflow } = window.getComputedStyle(this);
        const { style } = this;
        const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = getOffset(this);
        function init() {
            style.position = position === 'static' ? 'relative' : position;
            style.zIndex = zIndex === 'auto' ? 0 : zIndex;
            style.overflow = overflow !== 'hidden' ? 'hidden' : overflow;
        }

        function reset() {
            style.position = position;
            style.zIndex = zIndex;
            style.overflow = overflow;
        }

        const span = document.createElement('span');
        span.classList.add('wave');
        this.appendChild(span);
        transition.call(span, 'wave-enter', 300, {
            nextFrame: () => {
                span.style.left = `${e.changedTouches[0].clientX - offsetLeft}px`;
                span.style.top = `${e.changedTouches[0].clientY - offsetTop}px`;
            }
        })

        setTimeout(() => {
            init();
            const diameter = `${Math.max(offsetWidth, offsetHeight) * Math.sqrt(2) * 2}px`;
            span.style.width = diameter;
            span.style.height = diameter;
            span.classList.remove('wave-enter');
        }, 16)

        this.addEventListener('touchend', function remove(e) {
            this.removeChild(span);
            this.removeEventListener('touchend', remove);
            reset();
        })
    })
}

export function addCancellableTouch(notCancelledCallback, cancelledCallback) {
    this.addEventListener('touchend', function (e) {
        const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = getOffset(this);
        const relativeX = e.changedTouches[0].clientX - offsetLeft;
        const relativeY = e.changedTouches[0].clientY - offsetTop;

        if (0 <= relativeX && relativeX <= offsetWidth && 0 <= relativeY && relativeY <= offsetHeight) {
            toFunction(notCancelledCallback)();
        } else {
            toFunction(cancelledCallback)();
        }
    })
}

export function getOffset(element) {
    var { offsetTop, offsetLeft, offsetWidth, offsetHeight } = element;
    while (element.offsetParent != null) {
        element = element.offsetParent;
        offsetLeft += element.offsetLeft;
        offsetTop += element.offsetTop;
    }
    return { offsetTop, offsetLeft, offsetWidth, offsetHeight };
}

export function transition(name, duration = 0, callback = {}) {
    this.classList.add(`${name}`);
    this.classList.add(`${name}-active`);
    toFunction(callback.firstFrame)();
    setTimeout(() => {
        this.classList.add(`${name}-to`);
        this.classList.remove(`${name}`);
        toFunction(callback.nextFrame)();
        setTimeout(() => {
            this.classList.remove(`${name}-to`);
            this.classList.remove(`${name}-active`);
            toFunction(callback.lastFrame)();
        }, duration);
    }, 16);
}

const empty = () => { }
function toFunction(func) {
    return func && typeof func === 'function' ? func : empty;
}