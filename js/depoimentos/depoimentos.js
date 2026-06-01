(function () {
    "use strict";

    var scrollEl = document.getElementById("depoimentos-scroll");
    if (!scrollEl) return;

    var list = scrollEl.querySelector(".depoimentos__list");
    if (!list) return;

    var originals = Array.prototype.slice.call(list.children);
    if (!originals.length) return;

    originals.forEach(function (item) {
        list.appendChild(item.cloneNode(true));
        list.appendChild(item.cloneNode(true));
    });

    var setWidth = 0;
    var isJumping = false;

    var isDragging = false;
    var startX = 0;
    var startScrollLeft = 0;
    var dragSamples = [];
    var momentumId = null;
    var velocity = 0;
    var lastMomentumTime = 0;

    var FRICTION = 0.9;
    var MIN_VELOCITY = 0.015;

    function measureSetWidth() {
        setWidth = list.scrollWidth / 3;
    }

    function normalizeScroll() {
        if (isJumping || setWidth <= 0) return;

        if (scrollEl.scrollLeft >= setWidth * 2 - 2) {
            isJumping = true;
            scrollEl.scrollLeft -= setWidth;
            isJumping = false;
        } else if (scrollEl.scrollLeft <= 2) {
            isJumping = true;
            scrollEl.scrollLeft += setWidth;
            isJumping = false;
        }
    }

    function initPosition() {
        measureSetWidth();
        if (setWidth > 0) {
            scrollEl.scrollLeft = setWidth;
        }
    }

    function stopMomentum() {
        if (momentumId) {
            cancelAnimationFrame(momentumId);
            momentumId = null;
        }
        velocity = 0;
    }

    function momentumStep(now) {
        if (!lastMomentumTime) {
            lastMomentumTime = now;
        }

        var dt = Math.min(now - lastMomentumTime, 32);
        lastMomentumTime = now;

        scrollEl.scrollLeft += velocity * dt;
        normalizeScroll();

        velocity *= Math.pow(FRICTION, dt / 16);

        if (Math.abs(velocity) < MIN_VELOCITY) {
            stopMomentum();
            normalizeScroll();
            return;
        }

        momentumId = requestAnimationFrame(momentumStep);
    }

    function startMomentum(initialVelocity) {
        stopMomentum();

        if (Math.abs(initialVelocity) < MIN_VELOCITY) return;

        velocity = initialVelocity;
        lastMomentumTime = 0;
        momentumId = requestAnimationFrame(momentumStep);
    }

    function getReleaseVelocity() {
        if (dragSamples.length < 2) return 0;

        var now = performance.now();
        var recent = dragSamples.filter(function (s) {
            return now - s.t < 120;
        });

        if (recent.length < 2) {
            recent = dragSamples.slice(-2);
        }

        var first = recent[0];
        var last = recent[recent.length - 1];
        var dt = last.t - first.t;

        if (dt <= 0) return 0;

        return -(last.x - first.x) / dt;
    }

    requestAnimationFrame(initPosition);

    window.addEventListener("resize", function () {
        stopMomentum();
        var ratio = setWidth > 0 ? scrollEl.scrollLeft / setWidth : 1;
        measureSetWidth();
        scrollEl.scrollLeft = setWidth * Math.max(1, Math.min(2, ratio));
        normalizeScroll();
    });

    scrollEl.addEventListener("scroll", normalizeScroll, { passive: true });

    scrollEl.addEventListener(
        "wheel",
        function (e) {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

            stopMomentum();
            e.preventDefault();
            scrollEl.scrollLeft += e.deltaY;
            normalizeScroll();
        },
        { passive: false }
    );

    scrollEl.addEventListener("mousedown", function (e) {
        if (e.button !== 0) return;

        stopMomentum();
        isDragging = true;
        startX = e.pageX;
        startScrollLeft = scrollEl.scrollLeft;
        dragSamples = [{ x: e.pageX, t: performance.now() }];
        scrollEl.classList.add("is-dragging");
    });

    document.addEventListener("mousemove", function (e) {
        if (!isDragging) return;

        e.preventDefault();
        scrollEl.scrollLeft = startScrollLeft - (e.pageX - startX);
        normalizeScroll();

        dragSamples.push({ x: e.pageX, t: performance.now() });
        if (dragSamples.length > 12) {
            dragSamples.shift();
        }
    });

    function endDrag() {
        if (!isDragging) return;

        isDragging = false;
        scrollEl.classList.remove("is-dragging");

        var releaseVelocity = getReleaseVelocity();
        dragSamples = [];

        if (Math.abs(releaseVelocity) >= MIN_VELOCITY) {
            startMomentum(releaseVelocity);
        } else {
            normalizeScroll();
        }
    }

    document.addEventListener("mouseup", endDrag);
})();
