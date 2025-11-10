import React from "react";

interface Props {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function CardButton({ active = false, onClick, children }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-100 p-0 border-0 bg-transparent"
      style={{ borderRadius: "16px" }}
    >
      <div
        className="d-flex flex-column align-items-center justify-content-center py-4"
        style={{
          borderRadius: "16px",
          minHeight: "90px",
          background: active
            ? "linear-gradient(145deg, #3A5BFF55, #2E3FE888)"
            : "rgba(255,255,255,0.06)",
          backdropFilter: "blur(6px)",
          transition: "0.2s",
          boxShadow: active ? "0 0 10px rgba(58,91,255,0.6)" : "none",
          cursor: "pointer",
        }}
      >
        {children}
      </div>
    </button>
  );
}
