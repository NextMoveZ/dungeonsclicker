import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface BossProps {
  name: string;
  bossTexture: string;
  health: number;
  maxHealth: number;
  position: [number, number, number];
  onClick: (x: number, y: number) => void;
  attackPower: number;
  isActive: boolean;
}

const Boss = ({ 
  name, 
  bossTexture, 
  health, 
  maxHealth, 
  position, 
  onClick,
  attackPower,
  isActive 
}: BossProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [beingHit, setBeingHit] = useState(false);
  const [bossScale, setBossScale] = useState<[number, number, number]>([1, 1, 1]);
  
  // Use textures from the public directory based on boss texture ID
  // Since we don't have actual boss textures, we'll use what we have
  let textureMap = "grass.png"; // Default texture
  
  if (bossTexture.includes("1")) textureMap = "grass.png";
  if (bossTexture.includes("2")) textureMap = "wood.jpg";
  if (bossTexture.includes("3")) textureMap = "asphalt.png";
  if (bossTexture.includes("4")) textureMap = "sand.jpg";
  if (bossTexture.includes("5")) textureMap = "sky.png";
  
  const texture = useTexture(`/textures/${textureMap}`);
  
  // Handle click on the boss
  const handleClick = (event: THREE.Event) => {
    if (!isActive) return;
    
    // Stop event propagation
    event.stopPropagation();
    
    // Get click position relative to the boss
    const x = event.point.x;
    const y = event.point.y;
    
    // Trigger hit animation
    setBeingHit(true);
    
    // Call the onClick callback
    onClick(x, y);
  };
  
  // Reset hit animation after a short delay
  useEffect(() => {
    if (beingHit) {
      const timer = setTimeout(() => {
        setBeingHit(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [beingHit]);
  
  // Update boss scale based on health
  useEffect(() => {
    const healthPercent = health / maxHealth;
    // Boss gets smaller as health decreases, but not too small
    const newScale = 0.8 + (healthPercent * 0.2);
    setBossScale([newScale, newScale, newScale]);
  }, [health, maxHealth]);
  
  // Animate the boss
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle floating motion
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.05;
    
    // If being hit, apply a quick shake
    if (beingHit) {
      meshRef.current.rotation.z = (Math.random() - 0.5) * 0.1;
    } else {
      // Slowly rotate back to normal
      meshRef.current.rotation.z *= 0.8;
    }
  });
  
  // Scale boss based on health percentage
  const healthPercent = health / maxHealth;
  
  return (
    <group position={position}>
      {/* Boss name tag */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {name}
      </Text>
      
      {/* Health bar */}
      <group position={[0, 1.2, 0]}>
        {/* Background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.2, 0.15]} />
          <meshBasicMaterial color="black" transparent opacity={0.5} />
        </mesh>
        
        {/* Filled part */}
        <mesh position={[-0.6 + (0.6 * healthPercent), 0, 0.01]} scale={[healthPercent, 1, 1]}>
          <planeGeometry args={[1.2, 0.15]} />
          <meshBasicMaterial 
            color={
              healthPercent > 0.6 ? "green" : 
              healthPercent > 0.3 ? "orange" : 
              "red"
            } 
          />
        </mesh>
      </group>
      
      {/* Boss body */}
      <mesh 
        ref={meshRef}
        position={[0, 0, 0]}
        scale={bossScale}
        onClick={handleClick}
        castShadow
      >
        {/* Use different geometry based on the boss */}
        {bossTexture.includes("1") && <boxGeometry args={[1.2, 1.2, 1.2]} />}
        {bossTexture.includes("2") && <sphereGeometry args={[0.8, 32, 32]} />}
        {bossTexture.includes("3") && <cylinderGeometry args={[0.6, 0.6, 1.5, 32]} />}
        {bossTexture.includes("4") && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
        {bossTexture.includes("5") && <coneGeometry args={[0.7, 1.4, 32]} />}
        
        <meshStandardMaterial 
          map={texture} 
          color={beingHit ? "red" : "white"} 
        />
      </mesh>
    </group>
  );
};

export default Boss;
