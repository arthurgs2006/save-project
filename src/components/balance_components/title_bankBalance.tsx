
import { useBankBalance } from "./get_bankBalance";
import type { GetBankBalanceOptions } from "./get_bankBalance";

type Props = {
    userId?: string;
    token?: string;
    baseUrl?: string;
};

export default function TitleBankBalance({ userId, token, baseUrl }: Props) {
    const { balance, loading, error } = useBankBalance({ userId, token, baseUrl } as GetBankBalanceOptions);

    const display = typeof balance === "number" ? balance.toFixed(2) : "0.00";

    if (loading) return <h1>R${display}</h1>;
    if (error) return <h1>R${display}</h1>;

    return (
        <>
            <h1>R${display}</h1>
        </>
    );
}