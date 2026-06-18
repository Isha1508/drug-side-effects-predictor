import { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import { getSideEffectDescription } from '../utils/sideEffectDescriptions';

interface SideEffectPill3DProps {
  sideEffect: string;
  tendency: 'high' | 'moderate' | 'low';
  index: number;
  description?: string;
}

const RISK_COLORS = {
  high: '#EF4444',
  moderate: '#F59E0B',
  low: '#10B981',
};

function PillMesh({ color, tendency, index }: { color: string; tendency: string; index: number }) {
  const meshRef = useRef<Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main pill body */}
      <RoundedBox args={[2, 0.8, 0.8]} radius={0.2} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </RoundedBox>
      
      {/* Glow effect */}
      <pointLight position={[0, 0, 0]} intensity={0.5} color={color} />
    </group>
  );
}

export default function SideEffectPill3D({ sideEffect, tendency, index: propIndex, description: propDescription }: SideEffectPill3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const color = RISK_COLORS[tendency];
  const description = propDescription ?? getSideEffectDescription(sideEffect);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: propIndex * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="glass-card rounded-xl p-4 cursor-pointer transition-all duration-300"
    >
      <div className="flex flex-col items-center gap-3">
        {/* 3D Pill Visualization */}
        <div className="w-full h-32 relative">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <PillMesh color={color} tendency={tendency} index={propIndex} />
            <OrbitControls
              enabled={isHovered}
              enableZoom={false}
              enablePan={false}
              autoRotate={!isHovered}
              autoRotateSpeed={2}
            />
          </Canvas>
        </div>

        {/* Side Effect Name and Description */}
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            {sideEffect}
          </p>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2" title={description}>
            {description}
          </p>
          <div
            className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {tendency.toUpperCase()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
