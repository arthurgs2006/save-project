import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { v4 as uuidv4 } from "uuid";

import Credentials from "./signIn/credentials";
import CreditProfile from "./signIn/creditprofile";
import BalanceInput from "./signIn/signbalance";

import { hashPassword } from "../../utils/hashPassword";

export default function SignIn() {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  async function handleRegister(balanceValue: number) {
    try {
      const passwordHashed = await hashPassword(credentials.password);

      const newUser = {
        id: uuidv4(), 
        nome: credentials.name || "Usuário Teste",
        email: credentials.email,
        password: passwordHashed,
        saldo_final: balanceValue,
        preferencias: profileData?.preferencias || [],
        extratos: [],
      };

      const res = await fetch("https://database-save-app.onrender.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        alert("Erro ao cadastrar usuário.");
        return;
      }

      localStorage.setItem("loggedUser", JSON.stringify(newUser));

      alert("Usuário cadastrado com sucesso!");
      window.location.href = "/homescreen"; 
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      alert("Falha ao conectar ao servidor.");
    }
  }

  return (
    <div className="background-color text-white vh-100">
      {step === 1 && (
        <Credentials
          onNext={(data: any) => {
            setCredentials(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <CreditProfile
          credentials={credentials}
          onFinish={(data: any) => {
            setProfileData(data);
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <BalanceInput
          onNext={(value: number) => {
            handleRegister(value);
          }}
        />
      )}
    </div>
  );
}