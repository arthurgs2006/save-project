export default function LoadingScreen() {
  return (
    <>
      <div className="background-color d-flex justify-content-center align-items-center vh-100">
        <div className="loading-screen text-center">

          <div className="loader mb-4"></div>

          <h2 className="loading-text text-white">Carregando...</h2>
        </div>
      </div>
    </>
  );
}
