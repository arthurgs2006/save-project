import { Container } from "reactstrap"
import TitleHeader from "../../components/generic_components/titleHeader"
import { Link } from "react-router-dom"

export default function () {
    return (
        <div className="text-white background-color pb-5 vh-100 d-flex align-items-center" >
            <Container className="pt-3">
            <TitleHeader title="Configurações"/>
                <main className="px-3 d-flex flex-column justify-content-center ">
                    <div className="d-flex flex-column ">
                        <h6 className="settings-section-title">Serviços</h6>
                        <Link to="" className="settings-link">Conta</Link>
                        <Link to="" className="settings-link">Perfil de investimentos</Link>
                        <Link to="" className="settings-link">Notificações</Link>
                        <hr className="settings-divider" />
                        <h6 className="settings-section-title">Aplicativo</h6>
                        <Link to="" className="settings-link">Editar dados do perfil</Link>
                        <Link to="" className="settings-link">Aparência</Link>
                        <Link to="" className="settings-link">Me ajuda</Link>
                    </div>
                </main>
            </Container>
        </div>
    )
}
