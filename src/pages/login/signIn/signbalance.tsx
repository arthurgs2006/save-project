import { useState } from "react";
import { Input, Label } from "reactstrap";
import ButtonW_100 from "../../../components/generic_components/btn";
import { motion } from "framer-motion";

export default function BalanceInput({ onNext }: any) {
    const [balance, setBalance] = useState("");

    function handleSubmit() {
        if (balance.trim() === "" || isNaN(Number(balance))) {
            alert("Digite um valor válido para o saldo!");
            return;
        }

        onNext(Number(balance));
    }

    return (
        <motion.div
            className="w-100"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Saldo inicial</h3>
                <p className="home-item-subtitle mb-0">
                    Informe quanto dinheiro você possui na conta
                </p>
            </div>

            <Label className="fw-semibold mb-3 d-block text-white">
                Qual é seu saldo atual?
            </Label>

            <motion.div
                className="w-100 d-flex gap-3 align-items-center mb-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <span
                    className="fw-bold"
                    style={{
                        fontSize: "1.35rem",
                        color: "#fff",
                        minWidth: "34px"
                    }}
                >
                    R$
                </span>

                <Input
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="Digite seu saldo atual"
                    className="custom-input-balance"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
            >
                <ButtonW_100
                    label="Finalizar"
                    onClick={handleSubmit}
                />
            </motion.div>
        </motion.div>
    );
}