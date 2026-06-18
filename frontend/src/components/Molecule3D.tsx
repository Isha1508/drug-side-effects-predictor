import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere, Cylinder, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Group, Vector3, Quaternion } from 'three';
import { motion } from 'framer-motion';

interface Atom {
  element: string;
  x: number;
  y: number;
  z: number;
  index: number;
}

interface Bond {
  begin: number;
  end: number;
  order: number;
}

interface Molecule3DProps {
  coordinates: {
    atoms: Atom[];
    bonds: Bond[];
  };
}

// Element colors based on CPK coloring scheme
const ELEMENT_COLORS: Record<string, string> = {
  H: '#ffffff',
  C: '#909090',
  N: '#3050f8',
  O: '#ff0d0d',
  F: '#90e050',
  P: '#ff8000',
  S: '#ffff30',
  Cl: '#1ff01f',
  Br: '#a62929',
  I: '#940094',
  default: '#ff69b4',
};

const ELEMENT_RADII: Record<string, number> = {
  H: 0.31,
  C: 0.77,
  N: 0.75,
  O: 0.73,
  F: 0.72,
  P: 1.1,
  S: 1.03,
  Cl: 0.99,
  Br: 1.14,
  I: 1.33,
  default: 0.8,
};

function AtomSphere({ atom, position }: { atom: Atom; position: [number, number, number] }) {
  const color = ELEMENT_COLORS[atom.element] || ELEMENT_COLORS.default;
  const radius = (ELEMENT_RADII[atom.element] || ELEMENT_RADII.default) * 0.5;

  return (
    <group position={position}>
      <Sphere args={[radius, 32, 32]}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </Sphere>
    </group>
  );
}

function BondCylinder({ start, end }: { start: Vector3; end: Vector3 }) {
  const direction = new Vector3().subVectors(end, start);
  const length = direction.length();
  const midpoint = new Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  // Normalize direction
  const normalizedDir = direction.clone().normalize();
  
  // Calculate rotation to align cylinder along bond direction
  // Simple approach: align Y-axis to bond direction
  const defaultAxis = new Vector3(0, 1, 0);
  const quaternion = new Quaternion().setFromUnitVectors(defaultAxis, normalizedDir);

  return (
    <group 
      position={[midpoint.x, midpoint.y, midpoint.z]} 
      quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
    >
      <Cylinder args={[0.1, 0.1, length, 8]}>
        <meshStandardMaterial color="#cccccc" metalness={0.2} roughness={0.6} />
      </Cylinder>
    </group>
  );
}

function MoleculeModel({ atoms, bonds }: { atoms: Atom[]; bonds: Bond[] }) {
  const groupRef = useRef<Group>(null);

  // Auto-rotate animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Calculate center for positioning
  const center = atoms.reduce(
    (acc, atom) => ({
      x: acc.x + atom.x,
      y: acc.y + atom.y,
      z: acc.z + atom.z,
    }),
    { x: 0, y: 0, z: 0 }
  );
  const centerVec = new Vector3(
    center.x / atoms.length,
    center.y / atoms.length,
    center.z / atoms.length
  );

  return (
    <group ref={groupRef} position={[-centerVec.x, -centerVec.y, -centerVec.z]}>
      {/* Render bonds first */}
      {bonds.map((bond, idx) => {
        const atom1 = atoms[bond.begin];
        const atom2 = atoms[bond.end];
        if (!atom1 || !atom2) return null;
        
        const start = new Vector3(atom1.x, atom1.y, atom1.z);
        const end = new Vector3(atom2.x, atom2.y, atom2.z);
        
        return <BondCylinder key={`bond-${idx}`} start={start} end={end} />;
      })}
      
      {/* Render atoms on top */}
      {atoms.map((atom) => (
        <AtomSphere
          key={`atom-${atom.index}`}
          atom={atom}
          position={[atom.x, atom.y, atom.z]}
        />
      ))}
    </group>
  );
}

export default function Molecule3D({ coordinates }: Molecule3DProps) {
  if (!coordinates || !coordinates.atoms || coordinates.atoms.length === 0) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-20">
        3D coordinates not available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full"
      style={{ height: '500px' }}
    >
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          <MoleculeModel atoms={coordinates.atoms} bonds={coordinates.bonds} />
          
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
