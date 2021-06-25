function addWaveTouch() {
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
        span.style.left = `${e.changedTouches[0].pageX - offsetLeft}px`;
        span.style.top = `${e.changedTouches[0].pageY - offsetTop}px`;
        this.appendChild(span);

        init();
        const diameter = `${Math.sqrt(offsetWidth * offsetWidth + offsetHeight * offsetHeight) * 2}px`;
        transition.call(span, 'wave-enter', 300, {
            nextFrame: () => {
                span.style.width = diameter;
                span.style.height = diameter;
            }
        })

        this.addEventListener('touchend', (e) => {
            this.removeChild(span);
            reset();
        }, { once: true })
    })
}

function getOffset(element) {
    var { offsetTop, offsetLeft, offsetWidth, offsetHeight } = element;
    var fixed = false;
    while (element.offsetParent != null) {
        if (getComputedStyle(element).position === 'fixed') {
            fixed = true;
        }
        element = element.offsetParent;
        offsetLeft += element.offsetLeft;
        offsetTop += element.offsetTop;
    }
    if (fixed) {
        offsetTop += window.scrollY;
    }
    return {
        offsetTop, offsetLeft, offsetWidth, offsetHeight
    };
}

function transition(name, duration = 0, callback = {}) {

    toFunction(callback.firstFrame)();
    this.classList.add(`${name}`);
    this.classList.add(`${name}-active`);

    nextKFrame(() => {
        toFunction(callback.nextFrame)();
        this.classList.add(`${name}-to`);
        this.classList.remove(`${name}`);

        setTimeout(() => {
            toFunction(callback.lastFrame)();
            this.classList.remove(`${name}-to`);
            this.classList.remove(`${name}-active`);
            if (this.classList.length === 0) {
                this.removeAttribute('class');
            }
        }, duration);
    })
}

const empty = () => { }
function toFunction(func) {
    return func && typeof func === 'function' ? func : empty;
}

function nextKFrame(callback, k = 2) {
    callback = toFunction(callback);
    //setTimeout(callback, 1000);
    if (window.requestAnimationFrame) {
        const frame = () => {
            k--;
            if (k == 0) {
                callback();
            } else {
                window.requestAnimationFrame(frame);
            }
        }
        window.requestAnimationFrame(frame);
    } else {
        setTimeout(callback, 16);
    }
}