import { Link } from "react-router-dom";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

type ButtonW100Props = {
    label?: string;
    onClick?: () => void;
    to?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    className?: string;
    children?: ReactNode;
};

export default function ButtonW_100({
    label = "Continuar",
    onClick,
    to,
    type = "button",
    disabled = false,
    className = "",
    children,
}: ButtonW100Props) {
    const baseStyle: CSSProperties = {
        borderRadius: "999px",
        padding: "14px 18px",
        background: disabled
            ? "linear-gradient(90deg, #7f8cff, #6f7cf0)"
            : "linear-gradient(90deg, #3A5BFF, #2D3FE8)",
        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
        transition: "all 0.25s ease",
        border: "none",
        fontWeight: 600,
        minHeight: "52px",
        opacity: disabled ? 0.7 : 1,
        pointerEvents: disabled ? "none" : "auto",
    };

    function handleMouseEnter(e: MouseEvent<HTMLElement>) {
        if (disabled) return;
        e.currentTarget.style.filter = "brightness(1.08)";
        e.currentTarget.style.transform = "translateY(-2px)";
    }

    function handleMouseLeave(e: MouseEvent<HTMLElement>) {
        if (disabled) return;
        e.currentTarget.style.filter = "brightness(1)";
        e.currentTarget.style.transform = "translateY(0)";
    }

    function handleMouseDown(e: MouseEvent<HTMLElement>) {
        if (disabled) return;
        e.currentTarget.style.transform = "scale(0.98)";
    }

    function handleMouseUp(e: MouseEvent<HTMLElement>) {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-2px)";
    }

    const sharedProps = {
        onClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        className: `continue-btn d-flex justify-content-center align-items-center w-100 text-white text-decoration-none ${className}`.trim(),
        style: baseStyle,
    };

    return (
        <div className="pb-4 w-100">
            {to ? (
                <Link to={to} {...sharedProps} aria-disabled={disabled}>
                    {children || label}
                </Link>
            ) : (
                <button type={type} disabled={disabled} {...sharedProps}>
                    {children || label}
                </button>
            )}
        </div>
    );
}