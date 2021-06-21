export function addTouchWave() {
    this.addEventListener('touchstart', function (e) {
        const { position, zIndex, overflow } = window.getComputedStyle(this);
        const { style } = this;
        function init(){
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
        span.classList.add('wave-enter-active');
        span.classList.add('wave-enter');
        span.style.left = `${e.changedTouches[0].clientX - this.offsetLeft}px`;
        span.style.top = `${e.changedTouches[0].clientY - this.offsetTop}px`;
        this.appendChild(span);

        setTimeout(() => {
            init();
            const diameter = `${Math.max(this.offsetWidth, this.offsetHeight) * Math.sqrt(2) * 2}px`;
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