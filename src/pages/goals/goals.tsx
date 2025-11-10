import { Button, Container } from "reactstrap";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function(){

    return (
        <>
            <div className="min-vh-100 text-white" style={{ backgroundColor: '#0d1117' }}>
            <Container>
                <AccountHeader />
                <TitleHeader title="Metas" />
                <main>
                    <div>
                        <input type="text" className=""
                        placeholder="Pesquisar" />
                        <button>
                                <i>Search</i>
                        </button>
                    </div>
                    <section>
                        <ul>
                            <li>
                                <div>
                                    <input type="checkbox" />
                                    <div>
                                        <img src="" alt="" />
                                        <span>Meta 1</span>
                                        <span>R$1300,00</span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </section>
                    <Button>
                        Editar
                    </Button>
                </main>

            </Container>
            </div>
        </>

    )

}