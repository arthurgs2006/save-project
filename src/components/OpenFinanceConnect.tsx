import { useState, useEffect } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { API_URL } from "../config";

interface OpenFinanceConnectProps {
  clientUserId: string;
}

export default function OpenFinanceConnect({ clientUserId }: OpenFinanceConnectProps) {
  const [connectToken, setConnectToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConnectToken() {
      const requestUrl = `${API_URL}/connect-token`;
      console.log("OpenFinanceConnect requestUrl", requestUrl, "clientUserId", clientUserId);

      try {
        const response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientUserId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData?.error || response.statusText || "Erro ao gerar connect token.";
          throw new Error(`Erro ${response.status}: ${message}`);
        }

        const data = await response.json();

        if (!data?.accessToken) {
          throw new Error("Token de conexão não retornado.");
        }

        setConnectToken(data.accessToken);
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        setError(`Não foi possível gerar o token de conexão: ${message}`);
      }
    }

    if (clientUserId) {
      fetchConnectToken();
    }
  }, [clientUserId]);

  if (error) {
    return <div className="text-danger mb-4">{error}</div>;
  }

  if (!connectToken) {
    return <div className="text-white mb-4">Carregando conexão Open Finance...</div>;
  }

  return (
    <div className="mb-4">
      <h3 className="fw-bold mb-3 text-white">Conectar conta bancária</h3>
      <PluggyConnect
        connectToken={connectToken}
        includeSandbox={true}
        onSuccess={(itemData) => {
          console.log("Connected!", itemData);
          // TODO: enviar itemData.item.id ao backend se quiser armazenar a conexão.
        }}
        onError={(error) => {
          console.error("Connection failed", error);
        }}
      />
    </div>
  );
}
