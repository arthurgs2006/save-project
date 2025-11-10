import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import CreditProfile from "./signIn/creditprofile";
import Credentials from "./signIn/credentials";

export default function SignIn() {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState<any>(null);

  async function handleRegister(profileData: any) {
    const newUser = {
      email: credentials.email,
      password: credentials.password,
      saldo_final: 0,
      preferencias: profileData.preferencias ?? {},
      extratos: []
    };

    try {
      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      });

      if (!res.ok) {
        alert("Erro ao cadastrar usuário");
        return;
      }

      alert("Usuário cadastrado com sucesso!");
      // window.location.href = "/login";

    } catch (error) {
      console.error("Erro:", error);
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
          onFinish={(profileData: any) => {
            handleRegister(profileData);
          }}
        />
      )}

    </div>
  );
}
