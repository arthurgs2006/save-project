import { useEffect, useState } from "react";

// Tipos das opções para buscar o saldo
export type GetBankBalanceOptions = {
  userId?: string | number;
};

// Função que realmente busca o saldo no JSON Server
export async function getBankBalance(
  options: GetBankBalanceOptions = {}
): Promise<number> {
  const { userId = 1 } = options;

  try {
    // Endpoint do JSON Server rodando em http://localhost:3001
    const res = await fetch(`http://localhost:3001/users/${userId}`);

    if (!res.ok) {
      throw new Error("Usuário não encontrado no JSON Server.");
    }

    const user = await res.json();

    // ✅ Campo padrão correto no novo modelo
    if (typeof user.saldo_final === "number") {
      return user.saldo_final;
    }

    // ✅ Compatibilidade com versões antigas que usavam "balance"
    if (typeof user.balance === "number") {
      return user.balance;
    }

    throw new Error(
      "O usuário não possui o campo 'saldo_final' nem 'balance' cadastrado."
    );
  } catch (err: any) {
    throw new Error(`Erro ao buscar saldo: ${err.message}`);
  }
}

// Hook React para usar saldo no frontend
export function useBankBalance(options: GetBankBalanceOptions = {}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const b = await getBankBalance(options);
        if (mounted) setBalance(b);
      } catch (e) {
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [options.userId]);

  return { balance, loading, error };
}
