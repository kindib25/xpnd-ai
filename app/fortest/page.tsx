"use client";

import React, { useEffect, useRef, useState, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Sparkles,
  Line,
  RoundedBox,
  Grid,
  Float,
  MeshDistortMaterial,
  Stars,
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useInView, animate, useReducedMotion } from 'framer-motion';

/* ==================== CONSTANTS ==================== */
const COLORS = {
  electricBlue: '#4F7DFF',
  purple: '#7C5CFF',
  lime: '#B6FF3B',
  green: '#7EEB2A',
  violet: '#A855F7',
  darkNavy: '#080A18',
  offWhite: '#F5F7FF',
};

/* ==================== HOOKS ==================== */

// Detect if mobile/touch device
function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// Magnetic hover effect for elements (only works on devices with hover)
function useMagnetic<T extends HTMLElement = HTMLDivElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !window.matchMedia('(hover: hover)').matches) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    x.set(0);
    y.set(0);
  };

  return { ref, x: springX, y: springY, handleMouseMove, handleMouseLeave };
}

// Counter animation
function useCounter(target: number, duration = 2) {
  const [value, setValue] = useState(0);
  const inView = useInView(useRef<HTMLSpanElement>(null), { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => setValue(Math.round(latest * 100) / 100),
    });
    return () => controls.stop();
  }, [inView, target, duration, prefersReducedMotion]);

  return value;
}

// Tilt card component
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(x, [-0.5, 0.5], ['-7deg', '7deg']);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !window.matchMedia('(hover: hover)').matches) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ==================== 3D COMPONENTS ==================== */

// Central financial orb
function FinancialOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color={COLORS.electricBlue}
          emissive={COLORS.purple}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshBasicMaterial color={COLORS.lime} transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

// Floating glass cards
function FloatingCards({ count = 5, isMobile = false }: { count?: number; isMobile?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const actualCount = isMobile ? Math.min(count, 3) : count;

  const cards = useMemo(() => {
    return Array.from({ length: actualCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3 - 2,
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      scale: 0.8 + Math.random() * 0.5,
    }));
  }, [actualCount]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      {cards.map((card, i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.2} floatIntensity={0.5}>
          <RoundedBox
            args={[1.2, 1.8, 0.1]}
            radius={0.05}
            smoothness={4}
            position={card.position}
            rotation={card.rotation}
            scale={card.scale}
          >
            <meshPhysicalMaterial
              color={i % 2 === 0 ? COLORS.electricBlue : COLORS.purple}
              emissive={i % 3 === 0 ? COLORS.lime : COLORS.violet}
              emissiveIntensity={0.2}
              roughness={0.1}
              metalness={0.5}
              transparent
              opacity={0.3}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </RoundedBox>
          <Line
            points={[
              [-0.6, -0.9, 0.05],
              [0.6, -0.9, 0.05],
              [0.6, 0.9, 0.05],
              [-0.6, 0.9, 0.05],
              [-0.6, -0.9, 0.05],
            ]}
            color={COLORS.lime}
            lineWidth={1}
            transparent
            opacity={0.5}
            position={card.position}
            rotation={card.rotation}
            scale={card.scale}
          />
        </Float>
      ))}
    </group>
  );
}

// Neural network effect
function NeuralNetwork({ isMobile = false }: { isMobile?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const nodeCount = isMobile ? 15 : 25;

  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      ),
    }));
  }, [nodeCount]);

  const linePositions = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].position.distanceTo(nodes[j].position) < 4) {
          pairs.push([i, j]);
        }
      }
    }
    return pairs;
  }, [nodes]);

  useFrame((state) => {
    if (!groupRef.current) return;
    nodes.forEach((node) => {
      node.position.add(node.velocity);
      (['x', 'y', 'z'] as const).forEach((axis) => {
        if (Math.abs(node.position[axis]) > 5) {
          node.velocity[axis] *= -1;
        }
      });
    });

    if (lineRef.current) {
      const positions: number[] = [];
      linePositions.forEach(([i, j]) => {
        positions.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
        positions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geometry;
    }

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(nodes.flatMap((n) => [n.position.x, n.position.y, n.position.z])), 3]}
          />
        </bufferGeometry>
        <pointsMaterial color={COLORS.electricBlue} size={0.05} transparent opacity={0.8} />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial color={COLORS.purple} transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

// Main 3D scene
function FinancialScene({ isMobile = false }: { isMobile?: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (!prefersReducedMotion) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.current.x * 0.1,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouse.current.y * 0.05,
        0.05
      );
    }
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollY / maxScroll;
    camera.position.z = 8 - progress * (isMobile ? 2 : 4);
    camera.position.y = progress * (isMobile ? 1 : 2);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} color={COLORS.electricBlue} />
      <pointLight position={[-5, -3, 2]} intensity={1} color={COLORS.purple} />
      <pointLight position={[0, 3, -3]} intensity={0.8} color={COLORS.lime} />
      <FinancialOrb />
      <FloatingCards count={isMobile ? 3 : 6} isMobile={isMobile} />
      <NeuralNetwork isMobile={isMobile} />
      <Sparkles count={isMobile ? 40 : 100} scale={12} size={2} speed={0.4} color={COLORS.lime} opacity={0.6} />
      <Sparkles count={isMobile ? 20 : 50} scale={8} size={1.5} speed={0.3} color={COLORS.electricBlue} opacity={0.5} />
      <Grid
        position={[0, -3, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor={COLORS.purple}
        sectionSize={2}
        sectionThickness={1}
        sectionColor={COLORS.electricBlue}
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />
      <Stars radius={20} depth={10} count={isMobile ? 800 : 2000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

/* ==================== UI COMPONENTS ==================== */

// Simple SVG Icons
const IconAI = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 1 4 4c0 .35-.04.7-.12 1.03A6 6 0 0 1 21 12c0 .35-.03.7-.09 1.03A4 4 0 0 1 17 20a4 4 0 0 1-4-4c0-.35.04-.7.12-1.03A6 6 0 0 1 3 12c0-.35.03-.7.09-1.03A4 4 0 0 1 7 4a4 4 0 0 1 4 4c0 .35-.04.7-.12 1.03A6 6 0 0 1 15 12c0 .35-.03.7-.09 1.03A4 4 0 0 1 17 20" />
  </svg>
);

const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 15l3-4 4 3 5-7" />
  </svg>
);

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconWallet = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const IconChat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Magnetic button component (only for Log In / Sign Up)
function MagneticButton({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  const { ref, x, y, handleMouseMove, handleMouseLeave } = useMagnetic<HTMLButtonElement>(0.2);
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`magnetic-btn ${variant}`}
    >
      {children}
    </motion.button>
  );
}

/* ==================== SECTIONS ==================== */

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="navbar"
    >
      <div className="logo">Xpnd AI</div>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#analytics">Analytics</a>
        <a href="#ai-assistant">AI Assistant</a>
        <a href="#pricing">Pricing</a>
      </div>
      <div className="nav-actions">
        <MagneticButton variant="secondary">Log In</MagneticButton>
        <MagneticButton variant="primary">Sign Up</MagneticButton>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section style={{ y, opacity }} className="hero">
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hero-title"
      >
        Track expenses with <span className="gradient-text">AI precision</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="hero-subtitle"
      >
        Automate categorization, predict cash flow, and get real-time insights — all in one beautiful dashboard.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="hero-stats"
      >
        <div className="stat-item">
          <span className="stat-value"><Counter target={98} />%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-item">
          <span className="stat-value"><Counter target={2} />M+</span>
          <span className="stat-label">Transactions</span>
        </div>
        <div className="stat-item">
          <span className="stat-value"><Counter target={40} />%</span>
          <span className="stat-label">Savings</span>
        </div>
      </motion.div>
    </motion.section>
  );
}

function Counter({ target, duration }: { target: number; duration?: number }) {
  const value = useCounter(target, duration);
  return <>{value}</>;
}

function Features() {
  const features = [
    { icon: <IconAI />, title: 'AI Categorization', desc: 'Automatically tag every expense with 98% accuracy, learning your habits.' },
    { icon: <IconChart />, title: 'Real-time Analytics', desc: 'Interactive charts and forecasts update instantly as transactions happen.' },
    { icon: <IconShield />, title: 'Fraud Detection', desc: 'AI monitors anomalies and alerts you to suspicious spending in seconds.' },
    { icon: <IconWallet />, title: 'Smart Budgets', desc: 'Dynamic budgets that adapt to your spending patterns and goals.' },
  ];

  return (
    <section id="features" className="section">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="section-title"
      >
        Intelligent features
      </motion.h2>
      <div className="features-grid">
        {features.map((f, i) => (
          <TiltCard key={i}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="feature-card glass-card"
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}

function AnalyticsSection() {
  const bars = [35, 50, 45, 70, 60, 80, 75, 90, 85, 100];
  return (
    <section id="analytics" className="section">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="section-title"
      >
        Real-time expense dashboard
      </motion.h2>
      <div className="analytics-wrapper">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="dashboard glass-card"
        >
          <div className="dashboard-header">
            <span>Monthly Overview</span>
            <span className="dashboard-badge">Live</span>
          </div>
          <div className="chart-bars">
            {bars.map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${height}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                className="chart-bar"
                style={{ background: `linear-gradient(to top, ${COLORS.electricBlue}, ${COLORS.purple})` }}
              />
            ))}
          </div>
          <div className="dashboard-stats">
            <div><span>Total Spent</span><strong>$4,289</strong></div>
            <div><span>Budget</span><strong>$5,000</strong></div>
            <div><span>Savings</span><strong>$711</strong></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AIChatSection() {
  const messages = [
    { role: 'user', text: 'How much did I spend on dining this month?' },
    { role: 'ai', text: 'You spent $482.30 on dining, which is 12% less than last month. Great job staying under budget!' },
    { role: 'user', text: 'What are my top categories?' },
    { role: 'ai', text: 'Here are your top categories: Housing ($1,200), Groceries ($345), Transport ($280).' },
  ];

  return (
    <section id="ai-assistant" className="section">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="section-title"
      >
        Meet your AI financial assistant
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.7 }}
        className="chat-container glass-card"
      >
        <div className="chat-header">
          <span className="chat-status-dot" />
          <span>Xpnd AI Assistant</span>
        </div>
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
              className={`chat-message ${msg.role}`}
            >
              {msg.text}
            </motion.div>
          ))}
        </div>
        <div className="chat-input">
          <input type="text" placeholder="Ask about your expenses..." disabled />
          <span className="chat-send-icon">➤</span>
        </div>
      </motion.div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="pricing" className="section cta-section">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="cta-card glass-card"
      >
        <h2>Ready to take control of your finances?</h2>
        <p>Join thousands who saved an average of 40% more with Xpnd AI.</p>
        <div className="cta-buttons">
          <MagneticButton variant="primary">Sign Up Free</MagneticButton>
          <MagneticButton variant="secondary">Log In</MagneticButton>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">Xpnd AI</div>
      <div className="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Security</a>
        <a href="#">Contact</a>
      </div>
      <p>© 2026 Xpnd AI. All rights reserved.</p>
    </footer>
  );
}

/* ==================== MAIN APP ==================== */

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMobile();

  return (
    <div className="app">
      {/* Fixed 3D background */}
      <div className="canvas-container">
        <Canvas
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          camera={{ position: [0, 0, 8], fov: isMobile ? 55 : 45 }}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <FinancialScene isMobile={isMobile} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="content">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <AnalyticsSection />
          <AIChatSection />
          <CTASection />
        </main>
        <Footer />
      </div>

      {/* Cursor glow (only on devices with hover) */}
      {!prefersReducedMotion && window.matchMedia('(hover: hover)').matches && <CursorGlow />}

      <style>{`
        :root {
          --electric-blue: #4F7DFF;
          --purple: #7C5CFF;
          --lime: #B6FF3B;
          --green: #7EEB2A;
          --violet: #A855F7;
          --dark-navy: #080A18;
          --off-white: #F5F7FF;
          --glass-bg: rgba(255, 255, 255, 0.04);
          --glass-border: rgba(255, 255, 255, 0.1);
          --spacing: 1.5rem;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark-navy);
          color: var(--off-white);
          overflow-x: hidden;
          cursor: default;
          line-height: 1.5;
          font-size: 1rem;
          touch-action: manipulation;
        }

        .app {
          position: relative;
          min-height: 100vh;
        }

        .canvas-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: 0 1rem;
          max-width: 100%;
          margin: 0 auto;
        }

        /* Mobile-first base styles (small screens) */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .logo {
          font-size: 1.6rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--electric-blue), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: none; /* hidden on mobile */
        }

        .nav-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .magnetic-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 9999px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.85rem;
          white-space: nowrap;
          touch-action: manipulation;
        }

        .magnetic-btn.primary {
          background: linear-gradient(135deg, var(--electric-blue), var(--purple));
          color: white;
          box-shadow: 0 0 15px rgba(79, 125, 255, 0.3);
        }

        .magnetic-btn.secondary {
          background: transparent;
          color: var(--off-white);
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
        }

        .magnetic-btn.primary:hover {
          box-shadow: 0 0 25px rgba(79, 125, 255, 0.6);
        }

        .magnetic-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Hero */
        .hero {
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 3rem 0;
        }

        .hero-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--electric-blue), var(--purple), var(--lime));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1rem;
          opacity: 0.85;
          max-width: 100%;
          margin-bottom: 2rem;
        }

        .hero-stats {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        /* Sections */
        .section {
          padding: 4rem 0;
        }

        .section-title {
          font-size: 1.8rem;
          text-align: center;
          margin-bottom: 2rem;
          line-height: 1.3;
        }

        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: 1.2rem;
          padding: 1.5rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: 1fr; /* single column on mobile */
          gap: 1.5rem;
        }

        .feature-card {
          height: 100%;
          transition: transform 0.3s;
        }

        .feature-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(79, 125, 255, 0.15);
          color: var(--electric-blue);
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          margin-bottom: 0.5rem;
          font-size: 1.15rem;
        }

        .feature-card p {
          opacity: 0.75;
          font-size: 0.9rem;
        }

        /* Analytics */
        .analytics-wrapper {
          max-width: 100%;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .dashboard-badge {
          background: var(--lime);
          color: var(--dark-navy);
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 150px;
          margin-bottom: 1.5rem;
        }

        .chart-bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          min-height: 10px;
        }

        .dashboard-stats {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-stats div {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dashboard-stats span {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .dashboard-stats strong {
          font-size: 1.2rem;
        }

        /* Chat */
        .chat-container {
          max-width: 100%;
          padding: 1.2rem;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 0.8rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .chat-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 8px var(--green);
        }

        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-bottom: 1rem;
        }

        .chat-message {
          max-width: 90%;
          padding: 0.7rem 0.9rem;
          border-radius: 0.9rem;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .chat-message.user {
          align-self: flex-end;
          background: rgba(79, 125, 255, 0.2);
          border: 1px solid rgba(79, 125, 255, 0.3);
        }

        .chat-message.ai {
          align-self: flex-start;
          background: rgba(124, 92, 255, 0.15);
          border: 1px solid rgba(124, 92, 255, 0.3);
        }

        .chat-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.05);
          border-radius: 9999px;
          padding: 0.4rem 0.8rem;
        }

        .chat-input input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--off-white);
          font-size: 0.85rem;
        }

        .chat-send-icon {
          color: var(--lime);
          cursor: pointer;
          font-size: 0.9rem;
        }

        /* CTA */
        .cta-section {
          padding: 3rem 0;
        }

        .cta-card {
          text-align: center;
          padding: 2.5rem 1.5rem;
        }

        .cta-card h2 {
          font-size: 1.8rem;
          margin-bottom: 0.8rem;
        }

        .cta-card p {
          opacity: 0.8;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .cta-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          align-items: center;
        }

        /* Footer */
        .footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          text-align: center;
        }

        .footer-logo {
          font-weight: 700;
          background: linear-gradient(135deg, var(--electric-blue), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.2rem;
        }

        .footer-links {
          display: flex;
          gap: 1.2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-links a {
          color: var(--off-white);
          opacity: 0.7;
          text-decoration: none;
          font-size: 0.85rem;
        }

        .footer p {
          opacity: 0.6;
          font-size: 0.8rem;
        }

        /* Cursor glow */
        .cursor-glow {
          position: fixed;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(79,125,255,0.6), rgba(124,92,255,0.2), transparent);
          z-index: 9999;
          mix-blend-mode: screen;
          transform: translate(-50%, -50%);
        }

        /* Desktop / tablet enhancements (min-width: 768px) */
        @media (min-width: 768px) {
          .content {
            padding: 0 2rem;
            max-width: 1200px;
          }

          .navbar {
            padding: 1.5rem 0;
            flex-wrap: nowrap;
            gap: 0;
          }

          .logo {
            font-size: 1.8rem;
          }

          .nav-links {
            display: flex;
            gap: 2rem;
          }

          .nav-links a {
            color: var(--off-white);
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.3s;
            font-size: 0.95rem;
          }

          .nav-links a:hover {
            opacity: 1;
          }

          .nav-actions {
            gap: 1rem;
          }

          .magnetic-btn {
            padding: 0.7rem 1.5rem;
            font-size: 0.9rem;
          }

          .hero {
            min-height: 80vh;
            padding: 4rem 0;
          }

          .hero-title {
            font-size: clamp(2.5rem, 6vw, 5rem);
            max-width: 800px;
            margin-bottom: 1.5rem;
          }

          .hero-subtitle {
            font-size: 1.25rem;
            max-width: 600px;
            margin-bottom: 2.5rem;
          }

          .hero-stats {
            gap: 3rem;
          }

          .stat-value {
            font-size: 2rem;
          }

          .stat-label {
            font-size: 0.9rem;
          }

          .section {
            padding: 6rem 0;
          }

          .section-title {
            font-size: clamp(1.8rem, 4vw, 2.8rem);
            margin-bottom: 3rem;
          }

          .features-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 2rem;
          }

          .feature-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 1.5rem;
          }

          .feature-card h3 {
            font-size: 1.3rem;
          }

          .feature-card p {
            font-size: 1rem;
          }

          .analytics-wrapper {
            max-width: 700px;
            margin: 0 auto;
          }

          .chart-bars {
            height: 200px;
          }

          .dashboard-stats strong {
            font-size: 1.5rem;
          }

          .chat-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
          }

          .chat-message {
            max-width: 80%;
            padding: 0.8rem 1rem;
            font-size: 1rem;
          }

          .cta-card {
            padding: 4rem 2rem;
          }

          .cta-card h2 {
            font-size: 2.5rem;
          }

          .cta-buttons {
            flex-direction: row;
            gap: 1rem;
            justify-content: center;
          }

          .footer {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 0;
            text-align: left;
          }

          .footer-logo {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}

// Cursor glow component
function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 30 });
  const springY = useSpring(y, { stiffness: 400, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  return <motion.div className="cursor-glow" style={{ left: springX, top: springY }} />;
}