document.addEventListener("DOMContentLoaded", () => {
    const ROWS = 4;
    const COLS = 16;

    const grid = document.querySelector(".transition-grid");

    if (!grid || !window.gsap) return;

    const gsap = window.gsap;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    let blocks = [];
    let activeTimeline = null;
    let navigating = false;
    let resizeFrame = null;
    let pageRevealed = false;

    gsap.config({
        nullTargetWarn: false,
    });

    // Build the transition grid before starting any animation.
    function createGrid() {
        grid.innerHTML = "";
        blocks = [];

        // Use the layout viewport to avoid unnecessary changes
        // caused by mobile browser toolbar movement.
        const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;

        const blockWidth = width / COLS;
        const blockHeight = height / ROWS;

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

        gsap.set(blocks, {
            scaleX: 0,
        });
    }

    function getRow(row) {
        return blocks.slice(row * COLS, (row + 1) * COLS);
    }

    function coverScreen() {
        const timeline = gsap.timeline();

        for (let row = 0; row < ROWS; row++) {
            timeline.to(
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

        return timeline;
    }

    function revealScreen() {
        const timeline = gsap.timeline({
            onComplete: () => {
                pageRevealed = true;
                activeTimeline = null;
            },
        });

        for (let row = 0; row < ROWS; row++) {
            timeline.to(
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

        return timeline;
    }

    function navigate(url) {
        if (navigating) return;

        navigating = true;

        // Do not let a pending resize interrupt the exit animation.
        if (resizeFrame !== null) {
            cancelAnimationFrame(resizeFrame);
            resizeFrame = null;
        }

        if (reducedMotion) {
            window.location.assign(url);
            return;
        }

        // Make sure the current grid is ready to cover the screen.
        gsap.set(blocks, {
            scaleX: 0,
        });

        pageRevealed = false;

        activeTimeline = coverScreen();

        activeTimeline.eventCallback("onComplete", () => {
            window.location.assign(url);
        });
    }

    // Build first, then start exactly one entry animation.
    createGrid();

    if (reducedMotion) {
        pageRevealed = true;
    } else {
        gsap.set(blocks, {
            scaleX: 1,
        });

        activeTimeline = revealScreen();
    }

    // Intercept only ordinary same-tab navigation.
    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const link = target.closest("a[data-transition]");

        if (!link) return;

        if (
            event.defaultPrevented ||
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
        if (destination.href === window.location.href) return;

        event.preventDefault();
        navigate(destination.href);
    });

    // Mobile browser bars can trigger frequent resize events.
    // Never rebuild the grid while an animation is in progress.
    function handleResize() {
        if (navigating || !pageRevealed) return;

        if (resizeFrame !== null) {
            cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;

            if (navigating || !pageRevealed) return;

            createGrid();
        });
    }

    window.addEventListener("resize", handleResize, {
        passive: true,
    });

    // Restore a clean state if the browser restores this page
    // from its back-forward cache.
    window.addEventListener("pageshow", (event) => {
        if (!event.persisted) return;

        navigating = false;
        activeTimeline?.kill();
        activeTimeline = null;

        createGrid();

        gsap.set(blocks, {
            scaleX: 0,
        });

        pageRevealed = true;
    });
});
