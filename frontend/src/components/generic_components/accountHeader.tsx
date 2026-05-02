import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface AccountHeaderProps {
  name?: string; 
}

export default function AccountHeader({ name }: AccountHeaderProps) {
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);

  return (
    <header className="d-flex justify-content-between align-items-center p-3">
      <Link to="/profile" className="text-white text-decoration-none">
        <h6 className="text-secondary m-0">{greeting}</h6>
        <h5 className="fw-bold">{name || "Usuário Teste"}</h5>
      </Link>

      <Link color="link" className="text-white" to="/settings">
        <i className="bi bi-gear fs-4"></i>
      </Link>
    </header>
  );
}
