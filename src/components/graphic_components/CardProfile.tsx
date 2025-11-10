interface Props {
  revenues: number;
  debts: number;
  value: number;
}

export default function ResumoFinanceiro({ revenues, debts, value }: Props) {
  return (
    <div className="bg-dark rounded-4 p-4 mb-4" style={{ height: "140px" }}>
      <h5 className="mb-2">Resumo Financeiro</h5>

      <p className="m-0">
        <strong>revenues do mês:</strong> R$ {revenues.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </p>

      <p className="m-0">
        <strong>debts do mês:</strong> R$ {debts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </p>

      <p className="m-0">
        <strong>value atual:</strong> R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
