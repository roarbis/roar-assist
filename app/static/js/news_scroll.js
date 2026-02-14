// Auto-hide header on scroll for mobile
let lastScrollTop = 0;
const newsHeader = document.querySelector('.news-header');
const scrollThreshold = 100;

if (newsHeader && window.innerWidth <= 768) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            // Scrolling down
            newsHeader.classList.add('hidden');
        } else {
            // Scrolling up
            newsHeader.classList.remove('hidden');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
}
