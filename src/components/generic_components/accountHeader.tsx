
import { Link } from "react-router-dom";
interface AccountHeaderProps {
  name?: string; 
}

export default function AccountHeader({ name }: AccountHeaderProps) {
  return (
    <header className="d-flex justify-content-between align-items-center p-3">
      <Link to="/profile" className="text-white text-decoration-none">
        <h6 className="text-secondary m-0">Boa noite</h6>
        <h5 className="fw-bold">{name || "Usuário Teste"}</h5>
      </Link>

      <Link color="link" className="text-white" to="/settings">
        <i className="bi bi-gear fs-4"></i>
      </Link>
    </header>
  );
}
