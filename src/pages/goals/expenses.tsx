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
                    <h2 className="text-center mt-5">Página de Débitos</h2>
                </div>
            </Container>
            </div>
        </>

    )

}