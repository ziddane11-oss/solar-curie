'use client';

import { useState, useEffect, useRef } from 'react';

export default function BlackHole({
    isActive = false,
    onAnimationEnd = () => { }
}) {
    const [scale, setScale] = useState(0);
    const [particles, setParticles] = useState([]);
    const holeRef = useRef(null);

    useEffect(() => {
        if (!isActive) {
            setScale(0);
            return;
        }

        // Generate spiral particles
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            angle: (i / 20) * Math.PI * 2,
            distance: 200 + Math.random() * 100,
            size: 3 + Math.random() * 5,
            speed: 0.5 + Math.random() * 0.5,
            color: Math.random() > 0.5 ? '#ff0099' : '#39ff14'
        }));
        setParticles(newParticles);

        // Animate scale
        let progress = 0;
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);

            // Easing function for dramatic effect
            const eased = 1 - Math.pow(1 - progress, 3);
            setScale(eased * 3);

            // Update particle positions
            setParticles(prev => prev.map(p => ({
                ...p,
                distance: Math.max(0, p.distance - p.speed * 10),
                angle: p.angle + p.speed * 0.1
            })));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(onAnimationEnd, 200);
            }
        };

        requestAnimationFrame(animate);
    }, [isActive, onAnimationEnd]);

    if (!isActive && scale === 0) return null;

    return (
        <div
            ref={holeRef}
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: '100px',
                height: '100px',
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: 100,
                pointerEvents: 'none'
            }}
        >
            {/* Particle ring */}
            {particles.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: '50%',
                        background: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                        transform: `
              translate(-50%, -50%) 
              rotate(${p.angle}rad) 
              translateX(${p.distance}px)
            `,
                        opacity: p.distance / 200
                    }}
                />
            ))}

            {/* Black hole core */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #1a0a20 0%, #000000 50%, transparent 70%)',
                    boxShadow: `
            0 0 60px 30px rgba(100, 0, 150, 0.3),
            0 0 100px 60px rgba(50, 0, 100, 0.2),
            inset 0 0 50px rgba(0, 0, 0, 1)
          `,
                    transform: 'translate(-50%, -50%)',
                    animation: 'spin 2s linear infinite'
                }}
            />

            {/* Accretion disk effect */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '150%',
                    height: '150%',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 0, 153, 0.3)',
                    boxShadow: '0 0 20px rgba(255, 0, 153, 0.2)',
                    transform: 'translate(-50%, -50%) rotateX(70deg)',
                    animation: 'spin 3s linear infinite reverse'
                }}
            />
        </div>
    );
}
