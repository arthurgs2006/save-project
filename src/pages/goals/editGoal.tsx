import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, FormGroup, Label, Input, Button } from "reactstrap";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import GoalSection from "../../components/graphic_components/goal_section";
import ProgressBar from "../../components/graphic_components/progress_bar";
import CardDeposit from "../../components/graphic_components/card.tsx";

export default function EditGoalPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [goal, setGoal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [value, setValue] = useState("");
    const [image, setImage] = useState("");

    const [depositValue, setDepositValue] = useState("");

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");

        if (!storedUser.id) {
            navigate("/login");
            return;
        }

        fetch(`https://database-save-app.onrender.com/users/${storedUser.id}`)
            .then((res) => res.json())
            .then((data) => {
                setUser(data);

                const foundGoal = (data.goals || []).find(
                    (g: any) => g.id === Number(id)
                );

                if (foundGoal) {
                    setGoal(foundGoal);
                    setName(foundGoal.name);
                    setValue(String(foundGoal.value));
                    setImage(foundGoal.image);
                }

                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="background-color min-vh-100 d-flex justify-content-center align-items-center">
                <div className="loading-screen">
                    <span className="loader"></span>
                    <p className="loading-text">Carregando meta...</p>
                </div>
            </div>
        );
    }

    if (!goal) {
        return (
            <div className="background-color min-vh-100 d-flex flex-column justify-content-center align-items-center px-3">
                <div
                    className="home-empty-state text-center"
                    style={{ maxWidth: "420px", width: "100%" }}
                >
                    <p className="mb-3 text-white">Meta não encontrada.</p>
                    <button
                        className="btn btn-primary w-100"
                        onClick={() => navigate("/goals")}
                    >
                        Voltar para Metas
                    </button>
                </div>
            </div>
        );
    }

    const totalDeposits = (goal.deposits || []).reduce(
        (acc: number, dep: any) => acc + Number(dep.value ?? dep.amount ?? 0),
        0
    );

    const numericValue = Number(value) || 1;
    const percentage = Math.min((totalDeposits / numericValue) * 100, 100);

    function handleSave() {
        const updatedGoal = {
            ...goal,
            name,
            value: Number(value),
            image,
        };

        const updatedUser = {
            ...user,
            goals: user.goals.map((g: any) =>
                g.id === Number(id) ? updatedGoal : g
            ),
        };

        fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
        })
            .then(() => {
                alert("Meta atualizada com sucesso!");
                navigate("/goals");
            })
            .catch(() => alert("Erro ao salvar alterações."));
    }

    function handleRedirectFunds() {
        const amount = Number(depositValue);

        if (!amount || amount <= 0) {
            alert("Informe um valor válido.");
            return;
        }

        const saldo = Number(user.saldo_final ?? user.balance ?? 0);

        if (amount > saldo) {
            alert("Saldo insuficiente!");
            return;
        }

        const newDeposit = {
            id: Date.now(),
            value: amount,
            time: new Date().toLocaleString("pt-BR"),
        };

        const updatedGoal = {
            ...goal,
            deposits: [...(goal.deposits || []), newDeposit],
        };

        const updatedUser = {
            ...user,
            saldo_final: saldo - amount,
            goals: user.goals.map((g: any) =>
                g.id === Number(id) ? updatedGoal : g
            ),
        };

        fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
        })
            .then(() => {
                alert("Valor direcionado com sucesso!");
                setUser(updatedUser);
                setGoal(updatedGoal);
                setDepositValue("");
                localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            })
            .catch(() => alert("Erro ao direcionar valor."));
    }

    const saldoDisponivel = Number(user.saldo_final ?? user.balance ?? 0);

    return (
        <div className="edit-goal-page home-apple-screen text-white">
            <Container className="home-shell">
                <AccountHeader name={user?.nome} />
                <TitleHeader title="Editar Meta" backLink="/goals" />

                <main className="home-main">
                    <div className="home-graph-card mb-4">
                        <GoalSection
                            name={name}
                            image={image}
                            targetValue={numericValue}
                            currentValue={totalDeposits}
                        />

                        <div className="mt-4">
                            <ProgressBar percentage={Number(percentage.toFixed(0))} />
                        </div>
                    </div>

                    <section className="home-section">
                        <div className="home-section-header">
                            <h6 className="home-section-title">Editar Informações</h6>
                        </div>

                        <div className="home-graph-card">
                            <Form>
                                <FormGroup className="mb-3">
                                    <Label>Nome da Meta</Label>
                                    <Input
                                        className="custom-input"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Digite o nome da meta"
                                    />
                                </FormGroup>

                                <FormGroup className="mb-0">
                                    <Label>Valor Total (R$)</Label>
                                    <Input
                                        className="custom-input"
                                        type="number"
                                        min="1"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder="Digite o valor total"
                                    />
                                </FormGroup>

                                <Button
                                    color="success"
                                    className="edit-btn w-100 mt-4"
                                    onClick={handleSave}
                                >
                                    Salvar Alterações
                                </Button>
                            </Form>
                        </div>
                    </section>

                    <section className="home-section">
                        <div className="home-section-header">
                            <h6 className="home-section-title">
                                Direcionar saldo geral para esta meta
                            </h6>
                        </div>

                        <div className="home-graph-card">
                            <FormGroup className="mb-3">
                                <Label>Valor (R$)</Label>
                                <Input
                                    className="custom-input-balance"
                                    type="number"
                                    min="1"
                                    value={depositValue}
                                    onChange={(e) => setDepositValue(e.target.value)}
                                    placeholder="Ex: 150"
                                />
                            </FormGroup>

                            <Button
                                color="primary"
                                className="w-100"
                                onClick={handleRedirectFunds}
                                disabled={!depositValue}
                            >
                                Direcionar para Meta
                            </Button>

                            <p className="home-item-subtitle mt-3 mb-0">
                                Saldo disponível: R{" "}
                                {saldoDisponivel.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                })}
                            </p>
                        </div>
                    </section>

                    <section className="home-section">
                        <div className="home-section-header">
                            <h6 className="home-section-title">Depósitos</h6>
                        </div>

                        <div className="home-list">
                            {(goal.deposits || []).length > 0 ? (
                                goal.deposits.map((dep: any) => (
                                    <div key={dep.id} className="home-list-item">
                                        <CardDeposit
                                            time={dep.time}
                                            type="Depósito Recebido"
                                            value={`R$ ${Number(
                                                dep.value ?? dep.amount ?? 0
                                            ).toLocaleString("pt-BR", {
                                                minimumFractionDigits: 2,
                                            })}`}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="home-empty-state">
                                    Nenhum depósito encontrado.
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </Container>
        </div>
    );
}