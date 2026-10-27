(() => {
    const ROWS = 4;
    const COLS = 16;

    const grid = document.querySelector(".transition-grid");
    if (!grid || !window.gsap) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    let blocks = [];
    let activeTimeline = null;
    let navigating = false;

    gsap.config({
        nullTargetWarn: false,
    });

    function createGrid() {
        grid.innerHTML = "";
        blocks = [];

        const blockWidth = window.innerWidth / COLS;
        const blockHeight = window.innerHeight / ROWS;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const block = document.createElement("div");

                block.className = "transition-block";
                block.style.width = `${blockWidth + 1}px`;
                block.style.height = `${blockHeight + 1}px`;
                block.style.left = `${col * blockWidth}px`;
                block.style.top = `${row * blockHeight}px`;
                block.style.transformOrigin =
                    row % 2 === 0 ? "left center" : "right center";

                grid.appendChild(block);
                blocks.push(block);
            }
        }

        gsap.set(blocks, { scaleX: 0 });
    }

    function getRow(row) {
        return blocks.slice(row * COLS, (row + 1) * COLS);
    }

    function coverScreen() {
        const tl = gsap.timeline();

        for (let row = 0; row < ROWS; row++) {
            tl.to(
                getRow(row),
                {
                    scaleX: 1,
                    duration: 0.48,
                    ease: "power3.inOut",
                    stagger: {
                        each: 0.022,
                        from: row % 2 === 0 ? "start" : "end",
                    },
                },
                0,
            );
        }

        return tl;
    }

    function revealScreen() {
        const tl = gsap.timeline();

        for (let row = 0; row < ROWS; row++) {
            tl.to(
                getRow(row),
                {
                    scaleX: 0,
                    duration: 0.42,
                    ease: "power3.inOut",
                    stagger: {
                        each: 0.018,
                        from: row % 2 === 0 ? "end" : "start",
                    },
                },
                row * 0.045,
            );
        }

        return tl;
    }

    function navigate(url) {
        if (navigating) return;

        navigating = true;

        if (reducedMotion) {
            window.location.href = url;
            return;
        }

        activeTimeline = coverScreen();

        activeTimeline.eventCallback("onComplete", () => {
            window.location.href = url;
        });
    }

    // Animate the current page in when it loads.
    if (reducedMotion) {
        gsap.set(blocks, { scaleX: 0 });
    } else {
        gsap.set(blocks, { scaleX: 1 });
        revealScreen();
    }

    document.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-transition]");
        if (!link) return;

        // Preserve browser behavior for special clicks.
        if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0 ||
            link.target === "_blank" ||
            link.hasAttribute("download")
        ) {
            return;
        }

        const destination = new URL(link.href, window.location.href);

        if (destination.origin !== window.location.origin) return;

        // Do not animate a reload of the same URL.
        if (destination.href === window.location.href) return;

        event.preventDefault();
        navigate(destination.href);
    });

    // Keep the grid sized correctly without interrupting an active transition.
    let resizeFrame;

    window.addEventListener("resize", () => {
        cancelAnimationFrame(resizeFrame);

        resizeFrame = requestAnimationFrame(() => {
            if (navigating) return;

            activeTimeline?.kill();
            createGrid();
        });
    });

    createGrid();

    // Start with the grid hidden and reveal the page.
    if (blocks.length && !reducedMotion) {
        gsap.set(blocks, { scaleX: 1 });
        activeTimeline = revealScreen();
    }
})();
