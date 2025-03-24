import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface DungeonSceneProps {
  background: string;
}

const DungeonScene = ({ background }: DungeonSceneProps) => {
  // Load texture based on background parameter
  const floorTexture = useTexture(`/textures/${background}`);
  const wallTexture = useTexture("/textures/asphalt.png");
  
  // Make textures repeat
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4, 4);
  
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(2, 1);
  
  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          map={floorTexture} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Back wall */}
      <mesh position={[0, 1.5, -5]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial 
          map={wallTexture} 
          color="#333"
          roughness={0.7}
        />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial 
          map={wallTexture}
          color="#444"
          roughness={0.7}
        />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[5, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial 
          map={wallTexture}
          color="#444"
          roughness={0.7}
        />
      </mesh>
      
      {/* Add some torches or decorations */}
      <pointLight position={[-3, 2, -3]} intensity={0.5} color="#ff7700" />
      <pointLight position={[3, 2, -3]} intensity={0.5} color="#ff7700" />
      
      {/* Simple torch objects */}
      <mesh position={[-3, 1, -4.8]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      
      <mesh position={[3, 1, -4.8]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      
      {/* Flame effects */}
      <mesh position={[-3, 1.3, -4.8]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff7700" emissive="#ff5500" emissiveIntensity={2} />
      </mesh>
      
      <mesh position={[3, 1.3, -4.8]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff7700" emissive="#ff5500" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

export default DungeonScene;
