import React from "react";

interface TrustScoreDisplayProps {
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  description: string;
}

const TrustScoreDisplay = ({
  score,
  riskLevel,
  description,
}: TrustScoreDisplayProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "High":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
        return "↗";
      case "Medium":
        return "→";
      case "Low":
        return "↘";
      default:
        return "→";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
      {/* Trust Score Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">
          Trust Score:
        </span>
        <span className="text-4xl font-bold text-gray-800 dark:text-gray-200 font-mono">
          {score.toFixed(2)}
        </span>
        <div
          className={`px-3 py-1 rounded text-white text-sm font-medium flex items-center gap-1 ${getRiskColor(
            riskLevel
          )}`}
        >
          <span>{riskLevel}</span>
          <span className="text-xs">{getRiskIcon(riskLevel)}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
        {description}
      </p>

      {/* Powered By Section */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          Powered by:
        </span>
        <div className="flex flex-col">
          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
            veritas
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            protocol
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreDisplay;
