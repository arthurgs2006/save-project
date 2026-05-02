// Configuração principal do projeto
export const USE_LOCAL_SERVER = false; // Mude para true para usar o servidor local com a rota /connect-token
export const BASE_URL = "https://database-save-app.onrender.com";
export const LOCAL_SERVER_URL = "http://localhost:3001";
export const API_URL = USE_LOCAL_SERVER ? LOCAL_SERVER_URL : BASE_URL;

// USAR SERVIDOR LOCAL:
// "http://localhost:3001"

// ------------------------------
// Configuração separada para Benefits
// ------------------------------
export const USE_LOCAL_BENEFITS_API = true;

// Backend .NET local que você rodou
export const LOCAL_BENEFITS_API_URL = "http://localhost:5254/api";

// Se no futuro você publicar essa rota no servidor externo,
// troca aqui sem mexer na BASE_URL principal.
export const REMOTE_BENEFITS_API_URL = "https://database-save-app.onrender.com/api";

export const BENEFITS_API_URL = USE_LOCAL_BENEFITS_API
    ? LOCAL_BENEFITS_API_URL
    : REMOTE_BENEFITS_API_URL;