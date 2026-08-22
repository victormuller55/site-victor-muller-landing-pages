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
    initScrollStory();
    initScrollVideos();
    initSiteLoader();
    initContactForm();
    initVideoLightbox();

    function initNavScrollSpy() {
        var sectionIds = [
            "inicio",
            "sobre",
            "produtos",
            "time",
            "processo",
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
            ".nav__links .nav__link:not(.nav__link--cta):not(.nav__link--gestor)"
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
            var offset = window.innerWidth <= 1100 ? 88 : 104;
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

    function initScrollStory() {
        var section = document.querySelector(".scroll-story");
        if (!section) return;

        var lines = Array.prototype.slice.call(
            section.querySelectorAll("[data-story-line]")
        );
        var dots = Array.prototype.slice.call(
            section.querySelectorAll("[data-story-dot]")
        );
        if (!lines.length) return;

        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            section.classList.add("scroll-story--static");
            return;
        }

        var ticking = false;
        var count = lines.length;
        var lastActive = -1;
        var glow = section.querySelector(".scroll-story__glow");
        var title = section.querySelector(".scroll-story__title");

        function clamp01(value) {
            return Math.min(1, Math.max(0, value));
        }

        function remap(value, start, end) {
            if (end === start) return 1;
            return clamp01((value - start) / (end - start));
        }

        function lineOpacity(index, progress, total) {
            var slice = 1 / total;
            var fade = slice * 0.16;
            var gap = slice * 0.12;
            var start = index * slice + (index === 0 ? 0 : gap / 2);
            var end = (index + 1) * slice - (index === total - 1 ? 0 : gap / 2);

            if (index === total - 1) {
                end = 1;
            }

            if (progress < start || progress > end) {
                return 0;
            }

            if (progress < start + fade) {
                return (progress - start) / fade;
            }

            if (index !== total - 1 && progress > end - fade) {
                return (end - progress) / fade;
            }

            return 1;
        }

        function setLine(line, opacity) {
            var shown = opacity > 0.02;
            line.style.opacity = shown ? opacity.toFixed(3) : "0";
            line.style.visibility = shown ? "visible" : "hidden";
            line.style.transform =
                "translateY(" + ((1 - opacity) * 28).toFixed(2) + "px)";
            line.classList.toggle("is-active", opacity > 0.55);
        }

        function flashGlow() {
            if (!glow) return;
            glow.style.setProperty(
                "--glow-x",
                (12 + Math.random() * 76).toFixed(1) + "%"
            );
            glow.style.setProperty(
                "--glow-y",
                (14 + Math.random() * 70).toFixed(1) + "%"
            );
            glow.style.setProperty(
                "--glow-size",
                (34 + Math.random() * 22).toFixed(1) + "vw"
            );
            glow.classList.remove("is-on");
            void glow.offsetWidth;
            glow.classList.add("is-on");
        }

        function render() {
            ticking = false;
            var travel = section.offsetHeight - window.innerHeight;
            if (travel <= 0) return;

            var progress = clamp01(
                -section.getBoundingClientRect().top / travel
            );

            var shine = remap(progress, 0, 0.22);
            var messages = remap(progress, 0.22, 1);

            if (title) {
                title.style.setProperty(
                    "--shine",
                    (-80 + shine * 180).toFixed(1) + "%"
                );
            }

            if (messages <= 0) {
                lines.forEach(function (line) {
                    setLine(line, 0);
                });
                dots.forEach(function (dot, index) {
                    dot.classList.toggle("is-active", index === 0);
                });
                lastActive = -1;
                return;
            }

            var active = 0;
            var highest = -1;

            lines.forEach(function (line, index) {
                var opacity = lineOpacity(index, messages, count);
                setLine(line, opacity);
                if (opacity > highest) {
                    highest = opacity;
                    active = index;
                }
            });

            dots.forEach(function (dot, index) {
                dot.classList.toggle("is-active", index === active);
            });

            if (active !== lastActive) {
                if (lastActive !== -1) {
                    flashGlow();
                }
                lastActive = active;
            }
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(render);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        render();
    }

    function initScrollVideos() {
        var sections = Array.prototype.slice.call(
            document.querySelectorAll("[data-scroll-video]")
        );
        if (!sections.length) return;

        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        sections.forEach(function (section) {
            bindScrollVideo(section, reduced);
        });
    }

    function initSiteLoader() {
        var html = document.documentElement;
        var loader = document.getElementById("site-loader");
        if (!loader) {
            html.classList.remove("is-loading");
            return;
        }

        var bar = document.getElementById("site-loader-bar");
        var started = Date.now();
        var minMs = 800;
        var maxMs = 20000;
        var closed = false;
        var videos = Array.prototype.slice.call(
            document.querySelectorAll("[data-scroll-video] video[src]")
        );
        var totals = videos.map(function () {
            return 1;
        });
        var loaded = videos.map(function () {
            return 0;
        });

        function setProgress(pct) {
            if (!bar) return;
            bar.style.width = Math.max(6, Math.min(100, Math.round(pct))) + "%";
        }

        function updateBar() {
            if (!videos.length) {
                setProgress(100);
                return;
            }
            var sum = 0;
            var i;
            for (i = 0; i < videos.length; i += 1) {
                sum += Math.min(1, loaded[i] / totals[i]);
            }
            setProgress((sum / videos.length) * 92);
        }

        function closeLoader() {
            if (closed) return;
            closed = true;
            var wait = Math.max(0, minMs - (Date.now() - started));
            window.setTimeout(function () {
                setProgress(100);
                html.classList.remove("is-loading");
                loader.classList.add("is-done");
                loader.setAttribute("aria-busy", "false");
                loader.setAttribute("aria-hidden", "true");
                window.setTimeout(function () {
                    if (loader.parentNode) loader.parentNode.removeChild(loader);
                }, 650);
            }, wait);
        }

        function fetchBlob(url, index) {
            return fetch(url).then(function (res) {
                if (!res.ok) throw new Error("video");
                var size = Number(res.headers.get("content-length")) || 0;
                if (size) totals[index] = size;

                if (!res.body || !res.body.getReader) {
                    return res.blob().then(function (blob) {
                        totals[index] = blob.size || totals[index];
                        loaded[index] = totals[index];
                        updateBar();
                        return blob;
                    });
                }

                var reader = res.body.getReader();
                var chunks = [];
                var received = 0;

                function pump() {
                    return reader.read().then(function (result) {
                        if (result.done) {
                            totals[index] = received || totals[index];
                            loaded[index] = received;
                            updateBar();
                            return new Blob(chunks, { type: "video/webm" });
                        }
                        chunks.push(result.value);
                        received += result.value.byteLength;
                        loaded[index] = received;
                        if (!size) totals[index] = Math.max(received + 1, received);
                        updateBar();
                        return pump();
                    });
                }

                return pump();
            });
        }

        function attachBlob(video, blob) {
            video.src = URL.createObjectURL(blob);
            video.preload = "auto";
            return new Promise(function (resolve) {
                function done() {
                    video.pause();
                    try {
                        video.currentTime = 0;
                    } catch (err) {}
                    resolve();
                }
                if (video.readyState >= 3) {
                    done();
                    return;
                }
                video.addEventListener("canplaythrough", done, { once: true });
                video.addEventListener("error", done, { once: true });
                video.load();
            });
        }

        function waitNative(video) {
            video.preload = "auto";
            return new Promise(function (resolve) {
                if (video.readyState >= 3) {
                    resolve();
                    return;
                }
                video.addEventListener("canplaythrough", resolve, { once: true });
                video.addEventListener("error", resolve, { once: true });
                try {
                    video.load();
                } catch (err) {}
            });
        }

        setProgress(8);
        window.setTimeout(closeLoader, maxMs);

        var tasks = videos.map(function (video, index) {
            var src = video.getAttribute("src");
            if (!src) return Promise.resolve();
            return fetchBlob(src, index)
                .then(function (blob) {
                    return attachBlob(video, blob);
                })
                .catch(function () {
                    loaded[index] = totals[index];
                    updateBar();
                    return waitNative(video);
                });
        });

        var hero = document.querySelector(".hero__photo");
        if (hero && !hero.complete) {
            tasks.push(
                new Promise(function (resolve) {
                    hero.addEventListener("load", resolve, { once: true });
                    hero.addEventListener("error", resolve, { once: true });
                })
            );
        }

        if (document.fonts && document.fonts.ready) {
            tasks.push(document.fonts.ready.catch(function () {}));
        }

        Promise.all(tasks).then(closeLoader);
    }

    function initContactForm() {
        var form = document.querySelector(".contato__form");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();
        });
    }

    function initVideoLightbox() {
        var trigger = document.querySelector("[data-video-lightbox]");
        var dialog = document.getElementById("video-lightbox");
        if (!trigger || !dialog || typeof dialog.showModal !== "function") return;

        var video = dialog.querySelector("video");
        var closeBtn = dialog.querySelector("[data-video-close]");
        if (!video) return;

        var still = trigger.querySelector("video");
        if (still) {
            still.pause();
            still.addEventListener("loadeddata", function () {
                still.pause();
            });
        }

        function openLightbox() {
            dialog.showModal();
            video.muted = false;
            video.currentTime = 0;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
            if (closeBtn) closeBtn.focus();
        }

        function closeLightbox() {
            video.pause();
            video.currentTime = 0;
            if (dialog.open) dialog.close();
        }

        trigger.addEventListener("click", openLightbox);

        if (closeBtn) {
            closeBtn.addEventListener("click", closeLightbox);
        }

        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) closeLightbox();
        });

        dialog.addEventListener("close", function () {
            video.pause();
            video.currentTime = 0;
        });
    }

    function bindScrollVideo(section, reduced) {
        var video = section.querySelector("video");
        if (!video) return;

        function applySource() {
            var mobile = window.matchMedia("(max-width: 768px)").matches;
            var mobileSrc = video.getAttribute("data-src-mobile");
            var desktopSrc = video.getAttribute("data-src-desktop");
            var nextSrc =
                mobile && mobileSrc
                    ? mobileSrc
                    : desktopSrc || video.getAttribute("src");
            if (nextSrc && video.getAttribute("src") !== nextSrc) {
                video.setAttribute("src", nextSrc);
            }
        }

        applySource();

        if (!video.getAttribute("src")) {
            section.classList.add("is-caption");
            return;
        }

        video.muted = true;
        video.loop = false;
        video.playsInline = true;
        video.preload = "auto";
        video.pause();

        var finished = false;

        function freezeLastFrame() {
            finished = true;
            video.pause();
            if (isFinite(video.duration) && video.duration > 0) {
                video.currentTime = Math.max(video.duration - 0.05, 0);
            }
        }

        function showCaption() {
            section.classList.add("is-caption");
        }

        function playVideo() {
            if (reduced || finished) return;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    showCaption();
                });
            }
        }

        function pauseVideo() {
            if (finished) return;
            video.pause();
        }

        video.addEventListener("ended", function () {
            freezeLastFrame();
            showCaption();
        });
        video.addEventListener("timeupdate", function () {
            if (video.currentTime >= 2) showCaption();
        });

        if (reduced) {
            showCaption();
            return;
        }

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(
                function (entries) {
                    var entry = entries[0];
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
                        playVideo();
                    } else {
                        pauseVideo();
                    }
                },
                { threshold: [0, 0.45, 0.7, 1] }
            ).observe(section);
        }
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
