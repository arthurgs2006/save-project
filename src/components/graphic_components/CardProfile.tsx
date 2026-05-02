interface Props {
  revenues: number;
  debts: number;
  value: number;
}

export default function ResumoFinanceiro({ revenues, debts, value }: Props) {
  return (
    <div className="text-white h-100 d-flex flex-column justify-content-between" style={{ minHeight: "140px" }}>
      <h5 className="mb-3">Resumo Financeiro</h5>

      <div className="d-flex flex-column gap-2">
        <p className="m-0 home-item-subtitle text-white">
          <strong>Receitas do mês:</strong> R$ {revenues.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>

        <p className="m-0 home-item-subtitle text-white">
          <strong>Despesas do mês:</strong> R$ {debts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>

        <p className="m-0 home-item-subtitle text-white">
          <strong>Saldo atual:</strong> R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
