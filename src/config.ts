// Configuração para escolher o servidor
export const USE_LOCAL_SERVER = true; // Mude para false para usar o servidor externo

export const BASE_URL = USE_LOCAL_SERVER
  ? "http://localhost:3001"
  : "https://database-save-app.onrender.com";