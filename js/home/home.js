(function () {
    "use strict";

    function buildWhatsAppUrl() {
        var number = (window.WHATSAPP_NUMBER || "").replace(/\D/g, "");
        if (!number) return null;

        var message = encodeURIComponent(window.WHATSAPP_MESSAGE || "Olá! Vim pelo site.");
        return "https://wa.me/" + number + "?text=" + message;
    }

    function initWhatsApp() {
        var url = buildWhatsAppUrl();
        var links = document.querySelectorAll(".js-whatsapp");

        links.forEach(function (link) {
            if (url) {
                var custom = link.getAttribute("data-whatsapp-message");
                if (custom) {
                    var number = (window.WHATSAPP_NUMBER || "").replace(/\D/g, "");
                    link.href =
                        "https://wa.me/" +
                        number +
                        "?text=" +
                        encodeURIComponent(custom);
                } else {
                    link.href = url;
                }
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            } else {
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    alert("Configure o número em js/config/whatsapp.config.js");
                });
            }
        });
    }

    var repositionNavIndicator = function () {};

    initWhatsApp();
    initMobileNav();
    initNavScrollSpy();

    function initNavScrollSpy() {
        var sectionIds = [
            "inicio",
            "sobre",
            "time",
            "processo",
            "confianca",
            "planos",
            "contato",
        ];
        var sections = sectionIds
            .map(function (id) {
                return document.getElementById(id);
            })
            .filter(Boolean);

        if (!sections.length) return;

        var desktopLinks = document.querySelectorAll(
            ".nav__links .nav__link:not(.nav__link--cta)"
        );
        var drawerLinks = document.querySelectorAll(".nav-drawer__link");
        var indicator = document.querySelector(".nav__indicator");
        var linksTrack = document.querySelector(".nav__links-track");
        var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var activeId = "";
        var scrollTicking = false;
        var resizeTimer;

        function moveIndicator(activeLink) {
            if (!indicator || !linksTrack || !activeLink) return;

            var trackRect = linksTrack.getBoundingClientRect();
            var linkRect = activeLink.getBoundingClientRect();

            indicator.style.width = linkRect.width + "px";
            indicator.style.transform =
                "translateY(-50%) translateX(" + (linkRect.left - trackRect.left) + "px)";
            linksTrack.classList.add("nav__links-track--ready");
        }

        function setActive(id) {
            if (!id || id === activeId) return;
            activeId = id;

            desktopLinks.forEach(function (link) {
                var isActive = link.getAttribute("href") === "#" + id;
                link.classList.toggle("nav__link--active", isActive);
                if (isActive) {
                    link.setAttribute("aria-current", "true");
                    moveIndicator(link);
                } else {
                    link.removeAttribute("aria-current");
                }
            });

            drawerLinks.forEach(function (link) {
                var isActive = link.getAttribute("href") === "#" + id;
                link.classList.toggle("nav-drawer__link--active", isActive);
                if (isActive) {
                    link.setAttribute("aria-current", "true");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }

        function getActiveSectionId() {
            var offset = window.innerWidth <= 768 ? 88 : 104;
            var scrollPos = window.scrollY + offset;
            var currentId = sectionIds[0];

            sections.forEach(function (section) {
                if (section.offsetTop <= scrollPos) {
                    currentId = section.id;
                }
            });

            var atBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 4;

            if (atBottom) {
                currentId = sectionIds[sectionIds.length - 1];
            }

            return currentId;
        }

        function updateActiveSection() {
            setActive(getActiveSectionId());
        }

        function onScroll() {
            if (scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(function () {
                updateActiveSection();
                scrollTicking = false;
            });
        }

        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var activeLink = document.querySelector(".nav__link--active");
                if (activeLink) {
                    moveIndicator(activeLink);
                }
                updateActiveSection();
            }, 120);
        }

        if (prefersReduced && indicator) {
            indicator.style.transition = "none";
        }

        document.querySelectorAll('.nav__link[href^="#"], .nav-drawer__link[href^="#"]').forEach(
            function (link) {
                link.addEventListener("click", function () {
                    var href = link.getAttribute("href");
                    if (!href || href === "#") return;
                    var id = href.slice(1);
                    if (sectionIds.indexOf(id) !== -1) {
                        setActive(id);
                    }
                });
            }
        );

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        window.addEventListener("load", updateActiveSection);
        updateActiveSection();

        repositionNavIndicator = function () {
            var activeLink = document.querySelector(".nav__link--active");
            if (activeLink) {
                moveIndicator(activeLink);
            }
        };
    }

    function initMobileNav() {
        var toggle = document.getElementById("nav-toggle");
        var closeBtn = document.getElementById("nav-close");
        var drawer = document.getElementById("nav-drawer");
        var backdrop = document.getElementById("nav-backdrop");

        if (!toggle || !drawer || !backdrop) return;

        function setOpen(open) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
            drawer.setAttribute("aria-hidden", open ? "false" : "true");
            backdrop.setAttribute("aria-hidden", open ? "false" : "true");

            if (open) {
                toggle.classList.add("is-open");
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        document.body.classList.add("nav-menu-open");
                    });
                });
            } else {
                toggle.classList.remove("is-open");
                document.body.classList.remove("nav-menu-open");
            }
        }

        toggle.addEventListener("click", function () {
            setOpen(toggle.getAttribute("aria-expanded") !== "true");
        });

        closeBtn?.addEventListener("click", function () {
            setOpen(false);
        });

        backdrop.addEventListener("click", function () {
            setOpen(false);
        });

        drawer.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener("click", function () {
                setOpen(false);
            });
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                setOpen(false);
            }
        });
    }

    var heroBtn = document.getElementById("btn-whatsapp");
    var floatBtn = document.getElementById("btn-whatsapp-float");

    if (heroBtn && floatBtn && "IntersectionObserver" in window) {
        new IntersectionObserver(
            function (entries) {
                document.body.classList.toggle("whatsapp-is-floating", !entries[0].isIntersecting);
                window.setTimeout(repositionNavIndicator, 880);
            },
            {
                threshold: 0,
                rootMargin: "0px 0px -12% 0px",
            }
        ).observe(heroBtn);
    }

    document.getElementById("btn-orcamentos")?.addEventListener("click", function (e) {
        var planos = document.getElementById("planos");
        if (planos) {
            e.preventDefault();
            planos.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    var pageBg = document.querySelector(".page-bg");
    if (!pageBg) return;

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReduced || coarsePointer) {
        pageBg.classList.add("page-bg--static");
        return;
    }

    var targetX = window.innerWidth * 0.5;
    var targetY = window.innerHeight * 0.5;
    var currentX = targetX;
    var currentY = targetY;

    function setSpotlight(x, y) {
        pageBg.style.setProperty("--mx", x + "px");
        pageBg.style.setProperty("--my", y + "px");
    }

    function onPointerMove(x, y) {
        targetX = x;
        targetY = y;
    }

    document.addEventListener("mousemove", function (e) {
        onPointerMove(e.clientX, e.clientY);
    });

    document.addEventListener(
        "touchmove",
        function (e) {
            if (e.touches[0]) {
                onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        },
        { passive: true }
    );

    document.addEventListener("mouseleave", function () {
        targetX = window.innerWidth * 0.5;
        targetY = window.innerHeight * 0.5;
    });

    function tick() {
        currentX += (targetX - currentX) * 0.14;
        currentY += (targetY - currentY) * 0.14;
        setSpotlight(currentX, currentY);
        requestAnimationFrame(tick);
    }

    setSpotlight(currentX, currentY);
    requestAnimationFrame(tick);
})();
