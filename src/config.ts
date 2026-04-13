// Configuração para escolher o servidor
export const USE_LOCAL_SERVER = false; // Mude para true para usar o servidor local com a rota /connect-token
export const BASE_URL = "https://database-save-app.onrender.com";
export const LOCAL_SERVER_URL = "http://localhost:3001";
export const API_URL = USE_LOCAL_SERVER ? LOCAL_SERVER_URL : BASE_URL;

// USAR SERVIDOR LOCAL:
// "http://localhost:3001"