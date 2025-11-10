import { Button } from "reactstrap";

export default function(){
    return (
        <>
        <header className="d-flex justify-content-between align-items-center p-3">
            <div>
                <h6 className="text-secondary m-0">Boa noite</h6>
                <h5 className="fw-bold">Usuário Teste</h5>
            </div>
                <Button color="link" className="text-white">
                <i className="bi bi-gear fs-4"></i>
                </Button>
        </header>
        </>
    )

}