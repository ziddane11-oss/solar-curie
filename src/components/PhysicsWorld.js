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
    const engineRef = useRef(null);
    const renderRef = useRef(null);
    const runnerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Color mapping for object types
    const getObjectStyle = useCallback((type, sentiment) => {
        const styles = {
            bubble: {
                fillStyle: sentiment === 'positive' ? '#ff0099' : '#39ff14',
                strokeStyle: 'rgba(255, 255, 255, 0.3)',
                lineWidth: 2
            },
            brick: {
                fillStyle: sentiment === 'negative' ? '#555555' : '#8b0000',
                strokeStyle: 'rgba(0, 0, 0, 0.5)',
                lineWidth: 1
            },
            secretBox: {
                fillStyle: '#ffd700',
                strokeStyle: '#ffaa00',
                lineWidth: 3
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
            body = Bodies.circle(x, y, 35 + Math.random() * 15, {
                restitution: 0.8,
                friction: 0.01,
                frictionAir: 0.02,
                density: 0.001,
                render: style,
                label: obj.text,
                objectData: obj
            });
        } else if (obj.type === 'brick') {
            body = Bodies.rectangle(x, y, 100 + Math.random() * 40, 50 + Math.random() * 20, {
                restitution: 0.3,
                friction: 0.8,
                density: 0.05,
                render: style,
                label: obj.text,
                objectData: obj,
                chamfer: { radius: 5 }
            });
        } else if (obj.type === 'secretBox') {
            body = Bodies.rectangle(x, y, 70, 70, {
                restitution: 0.5,
                friction: 0.5,
                density: 0.02,
                render: style,
                label: '?',
                objectData: obj,
                chamfer: { radius: 10 }
            });
        }

        // Add random initial velocity
        const velocityX = (Math.random() - 0.5) * 10;
        const velocityY = gravityType === 'anti' ? -(Math.random() * 5 + 3) : (Math.random() * 3 + 1);
        Body.setVelocity(body, { x: velocityX, y: velocityY });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);

        return body;
    }, [dimensions, gravityType, getObjectStyle]);

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

        // Create renderer
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

        // Create walls (invisible boundaries)
        const wallThickness = 100;
        const walls = [
            // Bottom
            Bodies.rectangle(width / 2, height + wallThickness / 2, width + 200, wallThickness, {
                isStatic: true,
                render: { visible: false },
                label: 'wall'
            }),
            // Top
            Bodies.rectangle(width / 2, -wallThickness / 2, width + 200, wallThickness, {
                isStatic: true,
                render: { visible: false },
                label: 'wall'
            }),
            // Left
            Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + 200, {
                isStatic: true,
                render: { visible: false },
                label: 'wall'
            }),
            // Right
            Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + 200, {
                isStatic: true,
                render: { visible: false },
                label: 'wall'
            })
        ];
        Composite.add(engine.world, walls);

        // Add mouse control for dragging
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Composite.add(engine.world, mouseConstraint);

        // Handle click events on bodies
        Events.on(mouseConstraint, 'mousedown', (event) => {
            const body = event.source.body;
            if (body && body.objectData) {
                onObjectClick(body.objectData, body);
            }
        });

        // Handle double click for popping bubbles
        let lastClickTime = 0;
        Events.on(mouseConstraint, 'mouseup', (event) => {
            const now = Date.now();
            const body = event.source.body;
            if (body && body.objectData && body.objectData.type === 'bubble') {
                if (now - lastClickTime < 300) {
                    // Double click - pop the bubble
                    Composite.remove(engine.world, body);
                    onObjectPop(body.objectData);
                }
            }
            lastClickTime = now;
        });

        // Sync mouse with renderer
        render.mouse = mouse;

        // Run engine and renderer
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);
        Render.run(render);

        // Handle window resize
        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            setDimensions({ width: newWidth, height: newHeight });
            render.canvas.width = newWidth;
            render.canvas.height = newHeight;
            render.options.width = newWidth;
            render.options.height = newHeight;
        };
        window.addEventListener('resize', handleResize);

        // Gyroscope support for mobile
        const handleOrientation = (event) => {
            const gamma = event.gamma || 0; // Left-right tilt
            const beta = event.beta || 0;   // Front-back tilt

            // Adjust gravity based on device orientation
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
    }, [gravityType, onObjectClick, onObjectPop]);

    // Add objects to the world
    useEffect(() => {
        if (!engineRef.current || objects.length === 0) return;

        const engine = engineRef.current;
        const bodies = objects.map((obj, index) => createBody(obj, index));

        // Add bodies with staggered timing for dramatic effect
        bodies.forEach((body, index) => {
            setTimeout(() => {
                Composite.add(engine.world, body);
            }, index * 150);
        });

        return () => {
            // Clean up bodies when objects change
            bodies.forEach(body => {
                if (Composite.get(engine.world, body.id, 'body')) {
                    Composite.remove(engine.world, body);
                }
            });
        };
    }, [objects, createBody]);

    // Update gravity when type changes
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
        />
    );
}
