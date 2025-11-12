import { Link } from "react-router-dom";
export default function ButtonW_100({
  label = "Continuar",
  onClick,
  to
}: {
  label?: string;
  onClick?: () => void;
  to?: string;     // ✅ Agora é opcional
}) {
  const baseStyle = {
    borderRadius: "40px",
    padding: "14px 0",
    background: "linear-gradient(90deg, #3A5BFF, #2D3FE8)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
    transition: "0.25s ease",
  };

  const events = {
    onMouseEnter: (e) => {
      e.currentTarget.style.filter = "brightness(1.15)";
      e.currentTarget.style.transform = "translateY(-2px)";
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.filter = "brightness(1)";
      e.currentTarget.style.transform = "translateY(0px)";
    },
    onMouseDown: (e) => {
      e.currentTarget.style.transform = "scale(0.97)";
    },
    onMouseUp: (e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
    }
  };

  return (
    <div className="pb-4 w-100">
      {to ? (
        // ✅ Link SOMENTE quando for pedido
        <Link
          to={to}
          onClick={onClick}
          className="continue-btn d-flex justify-content-center align-items-center w-100 text-white text-decoration-none"
          {...events}
        >
          {label}
        </Link>
      ) : (
        // ✅ Botão normal: NÃO navega automaticamente
        <button
          type="button"
          onClick={onClick}
          className="continue-btn d-flex justify-content-center align-items-center w-100 text-white"
          style={baseStyle}
          {...events}
        >
          {label}
        </button>
      )}
    </div>
  );
}
