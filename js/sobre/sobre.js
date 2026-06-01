(function () {
    "use strict";

    var ano = document.getElementById("ano-atual");
    if (ano) {
        ano.textContent = String(new Date().getFullYear());
    }

    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        items.forEach(function (el) {
            el.classList.add("is-visible");
        });
        return;
    }

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    items.forEach(function (el, i) {
        el.style.transitionDelay = i * 80 + "ms";
        observer.observe(el);
    });
})();
