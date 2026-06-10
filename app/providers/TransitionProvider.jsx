"use client";
import { useRef, useEffect } from "react";
import { TransitionRouter } from "next-transition-router";

import gsap from "gsap";

const ROWS = 4;
const COLS = 16;

const TransitionProvider = ({ children }) => {
    const transitionGridRef = useRef(null);
    const blocksRef = useRef([]);

    const createTransitionGrid = () => {
        if (!transitionGridRef.current) return;

        const container = transitionGridRef.current;
        container.innerHTML = "";
        blocksRef.current = [];

        const blockWidth = window.innerWidth / COLS;
        const blockHeight = window.innerHeight / ROWS;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const block = document.createElement("div");
                block.className = "transition-block";
                block.style.cssText = `
                    width: ${blockWidth + 1}px;
                    height: ${blockHeight + 1}px;
                    left: ${col * blockWidth}px;
                    top: ${row * blockHeight}px;
                    transform-origin: ${row % 2 === 0 ? "left" : "right"} center;
                `;

                container.appendChild(block);
                blocksRef.current.push(block);
            }
        }

        gsap.set(blocksRef.current, { scaleX: 0 });
    };

    useEffect(() => {
        createTransitionGrid();

        const resizeHandler = () => createTransitionGrid();
        window.addEventListener("resize", resizeHandler);

        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);

    const getRowBlocks = (row) => {
        return blocksRef.current.slice(row * COLS, row * COLS + COLS);
    };

    const animateIn = (onComplete) => {
        const tl = gsap.timeline({ onComplete });

        [0, 1, 2, 3].forEach((row) => {
            const blocks = getRowBlocks(row);

            tl.to(
                blocks,
                {
                    scaleX: 1,
                    duration: 0.6,
                    ease: "power3.inOut",
                    stagger: {
                        each: 0.025,
                        from: row % 2 === 0 ? "start" : "end",
                    },
                },
                "<"
            );
        });

        return tl;
    };

    const animateOut = (onComplete) => {
        const tl = gsap.timeline({ onComplete });

        [0, 1, 2, 3].forEach((row) => {
            const blocks = getRowBlocks(row);

            tl.to(
                blocks,
                {
                    scaleX: 0,
                    duration: 0.6,
                    ease: "power3.inOut",
                    stagger: {
                        each: 0.025,
                        from: row % 2 === 0 ? "start" : "end",
                    },
                },
                "<"
            );
        });

        return tl;
    };

    return (
        <TransitionRouter
            auto
            leave={(next) => {
                const tl = animateIn(next);

                gsap.to("main", {
                    opacity: 0,
                    duration: 0.3,
                });

                return () => tl.kill();
            }}
            enter={(next) => {
                const tl = animateOut(next);
                return () => tl.kill();
            }}
        >
            <div ref={transitionGridRef} className="transition-grid" />
            {children}
        </TransitionRouter>
    );
};

export default TransitionProvider;
