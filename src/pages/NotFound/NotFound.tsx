import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="text-white background-color vh-100 d-flex justify-content-center align-items-center">
            
            <div className=" px-4">
                <h3 className="mb-3 fw-semibold">Página não encontrada</h3>
                <p className="mb-4 text-secondary">Erro 404 — O conteúdo que você procura não existe.</p>

                <Link 
                    to='/' 
                    className="btn btn-outline-light px-4 py-2 rounded-pill"
                >
                    Voltar para o início
                </Link>
            </div>

        </div>
    );
}
