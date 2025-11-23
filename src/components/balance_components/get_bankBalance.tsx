import { useEffect, useState } from "react";


export type GetBankBalanceOptions = {
  userId?: string | number;
};


export async function getBankBalance(
  options: GetBankBalanceOptions = {}
): Promise<number> {
  const { userId = 1 } = options;

  try {

    const res = await fetch(`https://database-save-app.onrender.com/users/${userId}`);

    if (!res.ok) {
      throw new Error("Usuário não encontrado no JSON Server.");
    }

    const user = await res.json();


    if (typeof user.saldo_final === "number") {
      return user.saldo_final;
    }


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
