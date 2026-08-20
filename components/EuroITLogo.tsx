import React from 'react';

interface EuroITLogoProps {
  className?: string;
  size?: number | string;
  opacity?: number;
}

export const EuroITLogo: React.FC<EuroITLogoProps> = ({ 
  className = '', 
  size = 64,
  opacity = 1 
}) => {
  return (
    <svg
      viewBox="0 0 950 850"
      width={size}
      height={size}
      className={className}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Outer Golden C-Curve */}
      <path
        d="M 370 65 
           L 720 65 
           C 745 65, 755 75, 755 100 
           L 755 210 
           C 755 235, 745 245, 720 245 
           L 540 245 
           C 400 245, 305 340, 305 470 
           C 305 600, 400 695, 540 695 
           L 720 695 
           C 745 695, 755 705, 755 730 
           L 755 810 
           C 755 835, 745 845, 720 845 
           L 370 845 
           C 160 845, 135 690, 135 470 
           C 135 250, 160 65, 370 65 Z"
        fill="#D9B748"
      />
      {/* Black Horizontal Leaf Shape in the Middle */}
      <path
        d="M 335 605 
           C 335 480, 470 425, 620 425 
           L 735 425 
           C 750 425, 760 435, 760 450 
           L 760 490 
           C 760 550, 710 605, 630 605 
           Z"
        fill="#050505"
      />
    </svg>
  );
};
