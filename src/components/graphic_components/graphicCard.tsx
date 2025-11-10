
export default function(){
    return (
        <>
            <div className="d-flex justify-content-center align-items-end mt-4 gap-3">
                {['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes, i) => (
                <div key={i} className="text-center">
                    <div
                    className={`rounded-pill mx-auto ${
                        mes === 'Out' ? 'bg-primary' : 'bg-secondary opacity-25'
                    }`}
                    style={{
                        width: '20px',
                        height: mes === 'Out' ? '80px' : `${40 + i * 5}px`,
                    }}
                    ></div>
                    <small className="text-secondary">{mes}</small>
                </div>
                ))}
            </div>
        </>

    )

}