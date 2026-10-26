(() => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Toggle navigation",
            );
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    if (!window.gsap) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
    });

    intro
        .from(".navbar", {
            y: -20,
            opacity: 0,
            duration: 0.7,
        })
        .from(
            ".hero-top span",
            {
                y: 12,
                opacity: 0,
                duration: 0.5,
                stagger: 0.12,
            },
            "-=0.3",
        )
        .from(
            ".hero-title > span",
            {
                yPercent: 110,
                opacity: 0,
                duration: 0.9,
                stagger: 0.16,
            },
            "-=0.15",
        )
        .from(
            ".hero-orb",
            {
                scale: 0.5,
                opacity: 0,
                rotation: -35,
                duration: 1.1,
            },
            "-=0.7",
        )
        .from(
            ".hero-bottom > *",
            {
                y: 18,
                opacity: 0,
                duration: 0.65,
                stagger: 0.12,
            },
            "-=0.5",
        );

    gsap.to(".orb-ring-one", {
        rotation: 335,
        duration: 18,
        ease: "none",
        repeat: -1,
    });

    gsap.to(".orb-ring-two", {
        rotation: -320,
        duration: 24,
        ease: "none",
        repeat: -1,
    });

    gsap.to(".orb-core", {
        borderRadius: "57% 43% 36% 64% / 35% 55% 45% 65%",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
    });

    // Subtle pointer parallax for the orbital artwork.
    const orb = document.querySelector(".hero-orb");

    if (orb && window.matchMedia("(hover: hover)").matches) {
        window.addEventListener("pointermove", (event) => {
            const x = (event.clientX / window.innerWidth - 0.5) * 18;
            const y = (event.clientY / window.innerHeight - 0.5) * 18;

            gsap.to(orb, {
                x,
                y,
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto",
            });
        });
    }
})();
