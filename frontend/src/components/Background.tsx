import React from "react";

const Background = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f172a]">
      {/* Stele */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Nori fini și nedefiniți */}
      <div className="absolute inset-0">
        <div
          className="absolute bg-gray-300 rounded-full filter blur-xl animate-drift"
          style={{
            width: "20%",
            height: "10%",
            top: "20%",
            left: "10%",
            opacity: 0.1,
          }}
        />
        <div
          className="absolute bg-gray-400 rounded-full filter blur-xl animate-drift-slow"
          style={{
            width: "30%",
            height: "15%",
            top: "50%",
            left: "60%",
            opacity: 0.15,
          }}
        />
        <div
          className="absolute bg-gray-200 rounded-full filter blur-xl animate-drift"
          style={{
            width: "25%",
            height: "12%",
            top: "70%",
            left: "30%",
            opacity: 0.12,
          }}
        />
      </div>
    </div>
  );
};

export default Background;
