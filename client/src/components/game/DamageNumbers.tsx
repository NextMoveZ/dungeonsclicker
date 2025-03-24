import { useEffect } from "react";

interface DamageNumber {
  id: number;
  amount: number;
  x: number;
  y: number;
  isCritical: boolean;
}

interface DamageNumbersProps {
  damageNumbers: DamageNumber[];
  onNumberRemoved: (id: number) => void;
}

const DamageNumbers = ({ damageNumbers, onNumberRemoved }: DamageNumbersProps) => {
  // Remove damage number after animation completes
  useEffect(() => {
    damageNumbers.forEach(number => {
      const timer = setTimeout(() => {
        onNumberRemoved(number.id);
      }, 1000); // Match with animation duration
      
      return () => clearTimeout(timer);
    });
  }, [damageNumbers, onNumberRemoved]);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {damageNumbers.map(number => (
        <div
          key={number.id}
          className={`damage-number ${number.isCritical ? 'critical' : ''}`}
          style={{
            left: `${number.x}px`,
            top: `${number.y}px`,
            color: number.isCritical ? '#ff5252' : '#ffffff',
          }}
        >
          {number.amount}
        </div>
      ))}
    </div>
  );
};

export default DamageNumbers;