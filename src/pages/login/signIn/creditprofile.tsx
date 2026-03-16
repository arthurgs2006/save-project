import { useState } from "react";
import { motion } from "framer-motion";

import SelectGrid from "../../../components/graphic_components/selectGrid";
import ButtonW_100 from "../../../components/generic_components/btn";

export default function CreditProfile({ credentials, onFinish }: any) {
    const [preferences, setPreferences] = useState<string[]>([]);

    async function hashPassword(password: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    async function finishStep() {
        const passwordHashed = await hashPassword(credentials.password);

        onFinish({
            id: crypto.randomUUID(),
            preferencias: {
                categorias_favoritas: preferences,
                tema_app: "dark",
                notificacoes: true
            },
            passwordHashed
        });
    }

    return (
        <motion.div
            className="w-100"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Seu perfil financeiro</h3>
                <p className="home-item-subtitle mb-0">
                    Escolha os tipos de gastos que mais usa
                </p>
            </div>

            <motion.div className="w-100 mb-4">
                <SelectGrid onChange={setPreferences} />
            </motion.div>

            <motion.div className="w-100">
                <ButtonW_100
                    label="Continuar"
                    onClick={finishStep}
                />
            </motion.div>
        </motion.div>
    );
}