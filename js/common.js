import { getOffset } from "./utils.js";
if (!Math.clamp) {
    Math.clamp = (value, min, max) => {
        return Math.max(min, Math.min(max, value));
    }
}

if (!HTMLElement.prototype.removeStyle) {
    HTMLElement.prototype.removeStyle = function (property) {
        this.style[property] = null;
        if (this.style.length === 0) {
            this.removeAttribute('style');
        }
    }
}


(function () {
    const _addEventListener = HTMLElement.prototype.addEventListener;
    const _removeEventListener = HTMLElement.prototype.removeEventListener;

    const addEventListener = function (type, listener, options) {
        if (type === 'touch') {
            function touchstart() {
                _addEventListener.call(this, 'touchend', (e) => {
                    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = getOffset(this);
                    const relativeX = e.changedTouches[0].pageX - offsetLeft;
                    const relativeY = e.changedTouches[0].pageY - offsetTop;
                    if (0 <= relativeX && relativeX <= offsetWidth && 0 <= relativeY && relativeY <= offsetHeight && !e.touched) {
                        const event = new UIEvent('touch', {
                            bubbles: true,
                            composed: true,
                        });
                        event.changedTouches = e.changedTouches;
                        e.target.dispatchEvent(event);
                        e.touched = true;
                    }
                }, { once: true });
            }
            _addEventListener.call(this, 'touchstart', touchstart, options);
            this.touchSubs = this.touchSubs || new Map;
            this.touchSubs.set(listener, touchstart);
        } else if (type === 'dbltouch') {
            var firstTouch = false;
            addEventListener.call(this, 'touch', (e) => {
                if (firstTouch) {
                    const event = new UIEvent(type, {
                        bubbles: true,
                        composed: true,
                    });
                    event.changedTouches = e.changedTouches;
                    e.target.dispatchEvent(event);
                    firstTouch = false;
                } else {
                    firstTouch = true;
                    setTimeout(() => {
                        firstTouch = false;
                    }, 300);
                }
            })

        } else if (type === 'longtouch' || type === 'longlongtouch') {
            const duration = type === 'longtouch' ? 300 : 600;
            function touchstart(e) {
                const touched = type === 'longtouch' ? e.longtouched : e.longlongtouched;
                const timer = setTimeout(() => {
                    if (!touched) {
                        const event = new UIEvent(type, {
                            bubbles: true,
                            composed: true,
                        });
                        event.changedTouches = e.changedTouches;
                        e.target.dispatchEvent(event);
                        e.longtouched = true;
                    }
                }, duration);

                _addEventListener.call(this, 'touchend', () => {
                    clearTimeout(timer);
                }, { once: true })
            }
            _addEventListener.call(this, 'touchstart', touchstart, options);
            if (type === 'longtouch') {
                this.longtouchSubs = this.longtouchSubs || new Map;
                this.longtouchSubs.set(listener, touchstart);
            } else {
                this.longlongtouchSubs = this.longlongtouchSubs || new Map;
                this.longlongtouchSubs.set(listener, touchstart);
            }
        }
        _addEventListener.call(this, type, listener, options);
    }

    const removeEventListener = function (type, listener, options) {
        if (type === 'touch' && this.touchSubs) {
            _removeEventListener.call(this, 'touchstart', this.touchSubs.get(listener), options);
            this.touchSubs.delete(listener);
        } else if (type === 'longtouch' && this.longtouchSubs) {
            _removeEventListener.call(this, 'touchstart', this.longtouchSubs[listener], options);
            this.longtouchSubs.delete(listener);
        } else if (type === 'longlongtouch' && this.longlongtouchSubs) {
            _removeEventListener.call(this, 'touchstart', this.longlongtouchSubs[listener], options);
            this.longlongtouchSubs.delete(listener);
        }
        _removeEventListener.call(this, type, listener, options);
    }

    HTMLElement.prototype.addEventListener = addEventListener;
    HTMLElement.prototype.removeEventListener = removeEventListener;
})()