export default function LoadingScreen() {
  return (
    <main className="background-color d-flex justify-content-center align-items-center vh-100">
      <div className="loading-screen text-center">
        <div className="loader mb-4"></div>
        <h2 className="loading-text">Carregando...</h2>
        <p className="loading-subtitle">Aguarde enquanto carregamos suas informações.</p>
      </div>
    </main>
  );
}
