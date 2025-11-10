import { Link } from "react-router-dom";

export default function ContinueButton() {
  return (
    <div className="pb-4 w-100">
      <Link
        to="/homescreen"
        className="continue-btn d-flex justify-content-center align-items-center w-100 text-white text-decoration-none"
        style={{
          borderRadius: "40px",
          padding: "14px 0",
          background: "linear-gradient(90deg, #3A5BFF, #2D3FE8)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
          transition: "0.25s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0px)";
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
      >
        Continuar
      </Link>
    </div>
  );
}
