'use client';

import { useState, useEffect, useRef } from 'react';

export default function FloatingText({
    text = "톡을 던져봐",
    subtext = "Drop Here"
}) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [velocity, setVelocity] = useState({ x: 0.5, y: 0.3 });
    const [rotation, setRotation] = useState(0);
    const containerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current?.parentElement;
        if (!container) return;

        const bounds = {
            width: container.clientWidth,
            height: container.clientHeight
        };

        // Initialize position at center
        setPosition({
            x: bounds.width / 2 - 150,
            y: bounds.height / 3
        });

        // Physics animation loop
        const animate = () => {
            setPosition(prev => {
                let newX = prev.x + velocity.x;
                let newY = prev.y + velocity.y;
                let newVelX = velocity.x;
                let newVelY = velocity.y;

                // Bounce off walls
                if (newX <= 0 || newX >= bounds.width - 300) {
                    newVelX = -velocity.x * 0.9;
                    newX = Math.max(0, Math.min(bounds.width - 300, newX));
                }
                if (newY <= 0 || newY >= bounds.height - 150) {
                    newVelY = -velocity.y * 0.9;
                    newY = Math.max(0, Math.min(bounds.height - 150, newY));
                }

                setVelocity({ x: newVelX, y: newVelY });
                setRotation(prev => prev + newVelX * 0.1);

                return { x: newX, y: newY };
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        // Gyroscope support
        const handleOrientation = (event) => {
            const gamma = event.gamma || 0;
            const beta = event.beta || 0;

            setVelocity({
                x: gamma / 30,
                y: beta / 30
            });
        };

        if (window.DeviceOrientationEvent) {
            // Request permission on iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Will need user gesture to request
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        }

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [velocity]);

    return (
        <div
            ref={containerRef}
            className="neon-title"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `rotate(${rotation}deg)`,
                animation: 'none'
            }}
        >
            <div>{text}</div>
            <div style={{
                fontSize: '0.4em',
                opacity: 0.7,
                marginTop: '0.5rem',
                letterSpacing: '0.2em'
            }}>
                {subtext}
            </div>
        </div>
    );
}
