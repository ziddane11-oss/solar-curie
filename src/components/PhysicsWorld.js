'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';

const { Engine, Render, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter;

export default function PhysicsWorld({
    objects = [],
    gravityType = 'normal',
    onObjectClick = () => { },
    onObjectPop = () => { }
}) {
    const sceneRef = useRef(null);
    const canvasOverlayRef = useRef(null);
    const engineRef = useRef(null);
    const renderRef = useRef(null);
    const runnerRef = useRef(null);
    const bodiesRef = useRef([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Enhanced color mapping with gradients and emojis
    const getObjectStyle = useCallback((type, sentiment) => {
        const styles = {
            bubble: {
                fillStyle: sentiment === 'positive' ? '#ff0099' : '#39ff14',
                strokeStyle: 'rgba(255, 255, 255, 0.5)',
                lineWidth: 3,
                glowColor: sentiment === 'positive' ? 'rgba(255, 0, 153, 0.8)' : 'rgba(57, 255, 20, 0.8)',
                emoji: sentiment === 'positive' ? '💗' : '✨'
            },
            brick: {
                fillStyle: sentiment === 'negative' ? '#444444' : '#8b0000',
                strokeStyle: 'rgba(100, 100, 100, 0.5)',
                lineWidth: 2,
                glowColor: 'rgba(50, 50, 50, 0.5)',
                emoji: sentiment === 'negative' ? '💔' : '🔥'
            },
            secretBox: {
                fillStyle: '#ffd700',
                strokeStyle: '#ffaa00',
                lineWidth: 3,
                glowColor: 'rgba(255, 215, 0, 0.8)',
                emoji: '🎁'
            }
        };
        return styles[type] || styles.bubble;
    }, []);

    // Create physics body based on object type
    const createBody = useCallback((obj, index) => {
        const x = Math.random() * (dimensions.width - 100) + 50;
        const y = gravityType === 'anti' ? dimensions.height + 50 : -50 - (index * 80);

        let body;
        const style = getObjectStyle(obj.type, obj.sentiment);

        if (obj.type === 'bubble') {
            body = Bodies.circle(x, y, 40 + Math.random() * 10, {
                restitution: 0.9,
                friction: 0.01,
                frictionAir: 0.015,
                density: 0.0008,
                render: { visible: false },
                label: obj.text,
                objectData: { ...obj, style }
            });
        } else if (obj.type === 'brick') {
            body = Bodies.rectangle(x, y, 110 + Math.random() * 30, 55 + Math.random() * 15, {
                restitution: 0.4,
                friction: 0.7,
                density: 0.04,
                render: { visible: false },
                label: obj.text,
                objectData: { ...obj, style },
                chamfer: { radius: 8 }
            });
        } else if (obj.type === 'secretBox') {
            body = Bodies.rectangle(x, y, 75, 75, {
                restitution: 0.6,
                friction: 0.4,
                density: 0.02,
                render: { visible: false },
                label: '?',
                objectData: { ...obj, style },
                chamfer: { radius: 12 }
            });
        }

        // Add random initial velocity
        const velocityX = (Math.random() - 0.5) * 8;
        const velocityY = gravityType === 'anti' ? -(Math.random() * 5 + 3) : (Math.random() * 3 + 1);
        Body.setVelocity(body, { x: velocityX, y: velocityY });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);

        return body;
    }, [dimensions, gravityType, getObjectStyle]);

    // Custom render function for premium visuals
    const customRender = useCallback(() => {
        const canvas = canvasOverlayRef.current;
        if (!canvas || !engineRef.current) return;

        const ctx = canvas.getContext('2d');
        const bodies = Composite.allBodies(engineRef.current.world);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bodies.forEach(body => {
            if (!body.objectData || body.label === 'wall') return;

            const { style } = body.objectData;
            const pos = body.position;
            const angle = body.angle;

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(angle);

            // Glow effect
            ctx.shadowColor = style.glowColor;
            ctx.shadowBlur = 25;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            if (body.objectData.type === 'bubble') {
                const radius = body.circleRadius || 40;

                // Outer glow
                ctx.beginPath();
                ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
                ctx.fillStyle = style.glowColor;
                ctx.fill();

                // Main circle with gradient
                const gradient = ctx.createRadialGradient(
                    -radius * 0.3, -radius * 0.3, 0,
                    0, 0, radius
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.3, style.fillStyle);
                gradient.addColorStop(1, style.fillStyle + '88');

                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Shine highlight
                ctx.beginPath();
                ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.25, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fill();

                // Border
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.strokeStyle = style.strokeStyle;
                ctx.lineWidth = style.lineWidth;
                ctx.stroke();

                // Emoji
                ctx.shadowBlur = 0;
                ctx.font = `${radius * 0.7}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(style.emoji, 0, 2);

            } else {
                // Rectangle (brick or secretBox)
                const width = body.bounds.max.x - body.bounds.min.x;
                const height = body.bounds.max.y - body.bounds.min.y;
                const radius = body.objectData.type === 'secretBox' ? 12 : 8;

                // Glow
                ctx.beginPath();
                ctx.roundRect(-width / 2 - 3, -height / 2 - 3, width + 6, height + 6, radius + 3);
                ctx.fillStyle = style.glowColor;
                ctx.fill();

                // Main rectangle with gradient
                const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
                gradient.addColorStop(0, style.fillStyle);
                gradient.addColorStop(0.5, style.fillStyle + 'dd');
                gradient.addColorStop(1, style.fillStyle + '99');

                ctx.beginPath();
                ctx.roundRect(-width / 2, -height / 2, width, height, radius);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Border
                ctx.strokeStyle = style.strokeStyle;
                ctx.lineWidth = style.lineWidth;
                ctx.stroke();

                // Text or Emoji
                ctx.shadowBlur = 0;
                if (body.objectData.type === 'secretBox') {
                    ctx.font = `${height * 0.6}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(style.emoji, 0, 2);
                } else {
                    ctx.font = `bold ${Math.min(width * 0.15, 14)}px 'Inter', sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(body.label, 0, 0);

                    // Small emoji
                    ctx.font = `${height * 0.35}px Arial`;
                    ctx.fillText(style.emoji, width * 0.35, -height * 0.25);
                }
            }

            ctx.restore();
        });

        requestAnimationFrame(customRender);
    }, []);

    // Initialize physics engine
    useEffect(() => {
        if (!sceneRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        setDimensions({ width, height });

        // Create engine
        const engine = Engine.create({
            gravity: { x: 0, y: gravityType === 'anti' ? -0.5 : 1 }
        });
        engineRef.current = engine;

        // Create renderer (invisible - we use custom canvas)
        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width,
                height,
                wireframes: false,
                background: 'transparent',
                pixelRatio: window.devicePixelRatio || 1
            }
        });
        renderRef.current = render;
        render.canvas.style.display = 'none'; // Hide Matter.js canvas

        // Setup overlay canvas
        if (canvasOverlayRef.current) {
            canvasOverlayRef.current.width = width * (window.devicePixelRatio || 1);
            canvasOverlayRef.current.height = height * (window.devicePixelRatio || 1);
            canvasOverlayRef.current.style.width = width + 'px';
            canvasOverlayRef.current.style.height = height + 'px';
            const ctx = canvasOverlayRef.current.getContext('2d');
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }

        // Create walls (invisible boundaries)
        const wallThickness = 100;
        const walls = [
            Bodies.rectangle(width / 2, height + wallThickness / 2, width + 200, wallThickness, {
                isStatic: true, render: { visible: false }, label: 'wall'
            }),
            Bodies.rectangle(width / 2, -wallThickness / 2, width + 200, wallThickness, {
                isStatic: true, render: { visible: false }, label: 'wall'
            }),
            Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + 200, {
                isStatic: true, render: { visible: false }, label: 'wall'
            }),
            Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + 200, {
                isStatic: true, render: { visible: false }, label: 'wall'
            })
        ];
        Composite.add(engine.world, walls);

        // Add mouse control
        const mouse = Mouse.create(canvasOverlayRef.current);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Composite.add(engine.world, mouseConstraint);

        // Handle click events
        Events.on(mouseConstraint, 'mousedown', (event) => {
            const body = event.source.body;
            if (body && body.objectData) {
                onObjectClick(body.objectData, body);
            }
        });

        // Handle double click for popping
        let lastClickTime = 0;
        Events.on(mouseConstraint, 'mouseup', (event) => {
            const now = Date.now();
            const body = event.source.body;
            if (body && body.objectData && body.objectData.type === 'bubble') {
                if (now - lastClickTime < 300) {
                    Composite.remove(engine.world, body);
                    onObjectPop(body.objectData);
                }
            }
            lastClickTime = now;
        });

        // Run engine
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);
        Render.run(render);

        // Start custom rendering
        customRender();

        // Handle resize
        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            setDimensions({ width: newWidth, height: newHeight });
            if (canvasOverlayRef.current) {
                canvasOverlayRef.current.width = newWidth * (window.devicePixelRatio || 1);
                canvasOverlayRef.current.height = newHeight * (window.devicePixelRatio || 1);
                canvasOverlayRef.current.style.width = newWidth + 'px';
                canvasOverlayRef.current.style.height = newHeight + 'px';
                const ctx = canvasOverlayRef.current.getContext('2d');
                ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
            }
        };
        window.addEventListener('resize', handleResize);

        // Gyroscope support
        const handleOrientation = (event) => {
            const gamma = event.gamma || 0;
            const beta = event.beta || 0;
            const gravityX = gamma / 90 * 2;
            const gravityY = gravityType === 'anti'
                ? -(Math.abs(beta) / 90 * 0.5 + 0.3)
                : (beta / 90 * 1.5 + 0.5);
            engine.gravity.x = Math.max(-2, Math.min(2, gravityX));
            engine.gravity.y = Math.max(-2, Math.min(2, gravityY));
        };
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('deviceorientation', handleOrientation);
            Render.stop(render);
            Runner.stop(runner);
            Engine.clear(engine);
            render.canvas.remove();
        };
    }, [gravityType, onObjectClick, onObjectPop, customRender]);

    // Add objects to world
    useEffect(() => {
        if (!engineRef.current || objects.length === 0) return;

        const engine = engineRef.current;
        const newBodies = objects.map((obj, index) => createBody(obj, index));
        bodiesRef.current = newBodies;

        newBodies.forEach((body, index) => {
            setTimeout(() => {
                Composite.add(engine.world, body);
            }, index * 200);
        });

        return () => {
            newBodies.forEach(body => {
                if (Composite.get(engine.world, body.id, 'body')) {
                    Composite.remove(engine.world, body);
                }
            });
        };
    }, [objects, createBody]);

    // Update gravity
    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.gravity.y = gravityType === 'anti' ? -0.5 : 1;
        }
    }, [gravityType]);

    return (
        <div
            ref={sceneRef}
            className="physics-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1
            }}
        >
            <canvas
                ref={canvasOverlayRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'auto'
                }}
            />
        </div>
    );
}

