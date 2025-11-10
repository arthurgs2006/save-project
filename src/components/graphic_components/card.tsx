interface Props {
  type?: string;
  time?: string;
  value?: string;
  children?: React.ReactNode;  
}

export default function DepositItem(props: Props) {
  return (
    <>
      <div className="deposit-item d-flex align-items-center justify-content-between mb-3">
        
        {props.children ? (
          props.children
        ) : (
          <>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-arrow-down-circle text-info fs-5"></i>
              <div>
                <p className="deposit-title mb-0">{props.type}</p>
                <small className="deposit-time">{props.time}</small>
              </div>
            </div>

            <span className="deposit-value text-success fw-semibold">
              {props.value}
            </span>
          </>
        )}
      </div>
    </>
  );
}
