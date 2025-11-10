import { Container } from "reactstrap";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function(){

    return (
        <>
            <div className="min-vh-100 text-white" style={{ backgroundColor: '#0d1117' }}>
            <Container>
                <AccountHeader />
                <TitleHeader />
                <div>
                    <header>
                        <h6>Nome do emprego LTDA</h6>
                        <h5>R$ 5.000,00</h5>
                    </header>
                    <h2 className="text-center mt-5">Página de Recebidos/Renda</h2>
                    <div>
                        <p>Detalhes dos recebidos irão aqui.</p>
                    </div>
                </div>
            </Container>
            </div>
        </>

    )

}