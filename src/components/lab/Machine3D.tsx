"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";

type ViewMode = "exterior" | "interior" | "exploded";
export type ComponentId = 
  | "cabinet" | "screen" | "medalInput" | "ticketOutput" | "controlPanel"
  | "pusherMotor" | "ticketMotor" | "controlBoard" | "sensor"
  | "medalTray" | "ticketRoll" | null;

interface Machine3DProps {
  viewMode: ViewMode;
  selectedComponent: ComponentId;
  onSelectComponent: (id: ComponentId) => void;
}

// Cabinet Component
function Cabinet({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) {
  return (
    <group onClick={onClick}>
      <Box args={[2, 3, 1.5]} position={[0, 1.5, 0]}>
        <meshStandardMaterial 
          color={isSelected ? "#22D3EE" : "#1a2332"} 
          metalness={0.3} 
          roughness={0.7}
          transparent
          opacity={isSelected ? 0.9 : 1}
        />
      </Box>
      {/* Frame highlights */}
      <Box args={[2.05, 0.05, 1.55]} position={[0, 3, 0]}>
        <meshStandardMaterial color="#22D3EE" />
      </Box>
    </group>
  );
}

// Screen Component
function Screen({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) {
  return (
    <group onClick={onClick}>
      <Box args={[1.6, 0.9, 0.1]} position={[0, 2.2, 0.76]}>
        <meshStandardMaterial 
          color={isSelected ? "#22D3EE" : "#0a1628"} 
          emissive={isSelected ? "#22D3EE" : "#1e3a5f"}
          emissiveIntensity={isSelected ? 0.8 : 0.3}
        />
      </Box>
    </group>
  );
}

// Medal Input
function MedalInput({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) {
  return (
    <group onClick={onClick}>
      <Cylinder args={[0.15, 0.15, 0.1, 16]} position={[0.6, 1.3, 0.76]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#4a5568"} metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 0.05, 16]} position={[0.6, 1.35, 0.76]}>
        <meshStandardMaterial color="#FFD700" metalness={1} />
      </Cylinder>
    </group>
  );
}

// Ticket Output
function TicketOutput({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) {
  return (
    <group onClick={onClick}>
      <Box args={[0.4, 0.08, 0.15]} position={[-0.6, 1.0, 0.76]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#0a1628"} metalness={0.5} />
      </Box>
    </group>
  );
}

// Control Panel
function ControlPanel({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) {
  return (
    <group onClick={onClick}>
      <Box args={[1.4, 0.3, 0.3]} position={[0, 1.7, 0.85]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#2d3748"} metalness={0.4} />
      </Box>
      {/* Buttons */}
      {[-0.4, 0, 0.4].map((x, i) => (
        <Cylinder key={i} args={[0.08, 0.08, 0.06, 16]} position={[x, 1.75, 0.92]}>
          <meshStandardMaterial color={["#EF4444", "#22C55E", "#F59E0B"][i]} />
        </Cylinder>
      ))}
    </group>
  );
}

// Pusher Motor (Interior)
function PusherMotor({ isSelected, onClick, exploded }: { isSelected: boolean; onClick: () => void; exploded: boolean }) {
  return (
    <group onClick={onClick} position={exploded ? [0.5, 0.3, 0.3] : [0, 1.0, 0]}>
      <Cylinder args={[0.2, 0.2, 0.4, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#6b7280"} metalness={0.6} />
      </Cylinder>
      <Box args={[0.15, 0.15, 0.5]} position={[0.25, 0, 0]}>
        <meshStandardMaterial color="#4b5563" />
      </Box>
    </group>
  );
}

// Ticket Motor (Interior)
function TicketMotor({ isSelected, onClick, exploded }: { isSelected: boolean; onClick: () => void; exploded: boolean }) {
  return (
    <group onClick={onClick} position={exploded ? [-0.5, 0.3, 0.3] : [-0.6, 0.8, 0]}>
      <Cylinder args={[0.18, 0.18, 0.35, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#6b7280"} metalness={0.6} />
      </Cylinder>
    </group>
  );
}

// Control Board (Interior)
function ControlBoard({ isSelected, onClick, exploded }: { isSelected: boolean; onClick: () => void; exploded: boolean }) {
  return (
    <group onClick={onClick} position={exploded ? [0, 0.3, 0.8] : [0, 0.5, -0.6]}>
      <Box args={[0.8, 0.05, 0.5]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#1e40af"} />
      </Box>
      {/* Chips */}
      {[[-0.2, 0.02, 0], [0.2, 0.02, 0], [0, 0.02, 0.15]].map((pos, i) => (
        <Box key={i} args={[0.1, 0.1, 0.1]} position={pos as [number, number, number]}>
          <meshStandardMaterial color="#111827" />
        </Box>
      ))}
    </group>
  );
}

// Sensor (Interior)
function Sensor({ isSelected, onClick, exploded }: { isSelected: boolean; onClick: () => void; exploded: boolean }) {
  return (
    <group onClick={onClick} position={exploded ? [0.3, 0.5, 0.5] : [0.6, 1.3, 0]}>
      <Box args={[0.1, 0.15, 0.1]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#eab308"} />
      </Box>
    </group>
  );
}

// Medal Tray (Interior)
function MedalTray({ isSelected, onClick, exploded }: { isSelected: boolean; onClick: () => void; exploded: boolean }) {
  return (
    <group onClick={onClick} position={exploded ? [-0.3, 0.2, 0.5] : [0, 0.9, 0.3]}>
      <Box args={[0.6, 0.05, 0.3]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#92400e"} metalness={0.4} />
      </Box>
    </group>
  );
}

// Ticket Roll (Interior)
function TicketRoll({ isSelected, onClick, exploded }: { isSelected: boolean; onClick: () => void; exploded: boolean }) {
  return (
    <group onClick={onClick} position={exploded ? [-0.6, 0.3, -0.3] : [-0.6, 0.7, 0.3]}>
      <Cylinder args={[0.25, 0.25, 0.3, 16]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#22D3EE" : "#e5e7eb"} />
      </Cylinder>
    </group>
  );
}

function MachineScene({ viewMode, selectedComponent, onSelectComponent }: Machine3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Auto rotate
  useFrame((state) => {
    if (groupRef.current && !selectedComponent) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });

  const isExterior = viewMode === "exterior";
  const isInterior = viewMode === "interior";
  const isExploded = viewMode === "exploded";

  return (
    <group ref={groupRef}>
      {/* Exterior Components (Always visible in exterior & exploded) */}
      {(isExterior || isExploded) && (
        <>
          <Cabinet 
            isSelected={selectedComponent === "cabinet"} 
            onClick={() => onSelectComponent(selectedComponent === "cabinet" ? null : "cabinet")} 
          />
          <Screen 
            isSelected={selectedComponent === "screen"} 
            onClick={() => onSelectComponent(selectedComponent === "screen" ? null : "screen")} 
          />
          <MedalInput 
            isSelected={selectedComponent === "medalInput"} 
            onClick={() => onSelectComponent(selectedComponent === "medalInput" ? null : "medalInput")} 
          />
          <TicketOutput 
            isSelected={selectedComponent === "ticketOutput"} 
            onClick={() => onSelectComponent(selectedComponent === "ticketOutput" ? null : "ticketOutput")} 
          />
          <ControlPanel 
            isSelected={selectedComponent === "controlPanel"} 
            onClick={() => onSelectComponent(selectedComponent === "controlPanel" ? null : "controlPanel")} 
          />
        </>
      )}

      {/* Interior Components (Visible in interior & exploded) */}
      {(isInterior || isExploded) && (
        <>
          <PusherMotor 
            isSelected={selectedComponent === "pusherMotor"} 
            onClick={() => onSelectComponent(selectedComponent === "pusherMotor" ? null : "pusherMotor")} 
            exploded={isExploded}
          />
          <TicketMotor 
            isSelected={selectedComponent === "ticketMotor"} 
            onClick={() => onSelectComponent(selectedComponent === "ticketMotor" ? null : "ticketMotor")} 
            exploded={isExploded}
          />
          <ControlBoard 
            isSelected={selectedComponent === "controlBoard"} 
            onClick={() => onSelectComponent(selectedComponent === "controlBoard" ? null : "controlBoard")} 
            exploded={isExploded}
          />
          <Sensor 
            isSelected={selectedComponent === "sensor"} 
            onClick={() => onSelectComponent(selectedComponent === "sensor" ? null : "sensor")} 
            exploded={isExploded}
          />
          <MedalTray 
            isSelected={selectedComponent === "medalTray"} 
            onClick={() => onSelectComponent(selectedComponent === "medalTray" ? null : "medalTray")} 
            exploded={isExploded}
          />
          <TicketRoll 
            isSelected={selectedComponent === "ticketRoll"} 
            onClick={() => onSelectComponent(selectedComponent === "ticketRoll" ? null : "ticketRoll")} 
            exploded={isExploded}
          />
        </>
      )}
    </group>
  );
}

export function Machine3D({ viewMode, selectedComponent, onSelectComponent }: Machine3DProps) {
  return (
    <div className="w-full h-[400px] bg-gradient-to-br from-[#0B1020] to-[#101F3D] rounded-xl overflow-hidden border border-[var(--nx-border-updated)]">
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#22D3EE" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#22D3EE" />
        
        <MachineScene 
          viewMode={viewMode} 
          selectedComponent={selectedComponent} 
          onSelectComponent={onSelectComponent} 
        />
        
        <OrbitControls 
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          autoRotate={false}
        />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#0a0f1a" />
        </mesh>
      </Canvas>
    </div>
  );
}
