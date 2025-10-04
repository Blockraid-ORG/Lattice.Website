import React from "react";

const GaugeSmartContractAudit = ({ value }: { value: number }) => {
  // Calculate rotation based on actual arc positions
  const getRotation = (val: number) => {
    return (val / 100) * 180 - 90;
  };

  const centerX = 100;
  const centerY = 100;

  return (
    <svg width="280" height="200" viewBox="-20 0 280 150">
      {/* Low Arc (0-33%) - Left segment */}
      <path
        d="M 20 100 A 80 80 0 0 1 60 20"
        stroke="red"
        strokeWidth="20"
        fill="none"
      />

      {/* Medium Arc (34-66%) - Middle segment */}
      <path
        d="M 60 20 A 80 80 0 0 1 140 20"
        stroke="yellow"
        strokeWidth="20"
        fill="none"
      />

      {/* High Arc (67-100%) - Right segment */}
      <path
        d="M 140 20 A 80 80 0 0 1 180 100"
        stroke="green"
        strokeWidth="20"
        fill="none"
      />

      {/* Needle with center circle */}
      <g transform={`rotate(${getRotation(value)} ${centerX} ${centerY})`}>
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX}
          y2="20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-gray-800 dark:text-gray-200"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill="currentColor"
          className="text-gray-800 dark:text-gray-200"
        />
      </g>

      {/* Labels positioned at left, top, and right */}
      <text
        x="-20"
        y="50"
        fontSize="12"
        fill="currentColor"
        textAnchor="start"
        className="text-gray-800 dark:text-gray-200"
      >
        Low
      </text>
      <text
        x="100"
        y="-10"
        fontSize="12"
        fill="currentColor"
        textAnchor="middle"
        className="text-gray-800 dark:text-gray-200"
      >
        Medium
      </text>
      <text
        x="220"
        y="50"
        fontSize="12"
        fill="currentColor"
        textAnchor="end"
        className="text-gray-800 dark:text-gray-200"
      >
        High
      </text>
    </svg>
  );
};

export default GaugeSmartContractAudit;
