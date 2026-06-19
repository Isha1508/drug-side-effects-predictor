import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import { RotateCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import * as THREE from "three";
import type { Drug } from "@/types/drug";
import { CPK_COLORS, ELEMENT_RADIUS } from "@/types/drug";

function Molecule({ atoms, bonds }: { atoms: Drug["atoms"]; bonds: Drug["bonds"] }) {
  const groupRef = useRef<THREE.Group>(null);

  const center = useMemo(() => {
    const c = new THREE.Vector3();
    atoms.forEach((a) => c.add(new THREE.Vector3(a.x, a.y, a.z)));
    c.divideScalar(atoms.length);
    return c;
  }, [atoms]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[-center.x, -center.y, -center.z]}>
      {atoms.map((atom) => (
        <mesh key={atom.id} position={[atom.x, atom.y, atom.z]}>
          <sphereGeometry args={[ELEMENT_RADIUS[atom.element] || 0.3, 32, 32]} />
          <meshStandardMaterial
            color={CPK_COLORS[atom.element] || "#cccccc"}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
      ))}
      {bonds.map((bond, i) => {
        const a1 = atoms.find((a) => a.id === bond.atom1)!;
        const a2 = atoms.find((a) => a.id === bond.atom2)!;
        const start = new THREE.Vector3(a1.x, a1.y, a1.z);
        const end = new THREE.Vector3(a2.x, a2.y, a2.z);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const dir = end.clone().sub(start);
        const length = dir.length();
        const orientation = new THREE.Quaternion();
        orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

        return (
          <mesh key={i} position={mid} quaternion={orientation}>
            <cylinderGeometry args={[0.06, 0.06, length, 8]} />
            <meshStandardMaterial color="#4a5568" roughness={0.5} metalness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

interface MolecularViewerProps {
  drug: any;
}

export default function MolecularViewer({ drug }: MolecularViewerProps) {
  const [key, setKey] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card-hover overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h3 className="text-lg font-semibold gradient-text">Molecular Structure</h3>
        <div className="flex gap-1">
          {[
            { icon: RotateCw, label: "Reset", action: () => setKey((k) => k + 1) },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px] bg-background/50">
        <Canvas key={key} camera={{ position: [0, 0, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          <Molecule atoms={drug.atoms} bonds={drug.bonds} />
          <OrbitControls enablePan={false} />
          <gridHelper args={[20, 20, "#1a2332", "#0f1722"]} position={[0, -3, 0]} />
        </Canvas>
      </div>

      <div className="p-4 space-y-2 border-t border-border/30">
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SMILES</span>
          <div className="code-block mt-1 text-primary">{drug.smiles}</div>
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">InChI Key</span>
          <div className="code-block mt-1 text-secondary">{drug.inchiKey}</div>
        </div>
      </div>
    </motion.div>
  );
}
