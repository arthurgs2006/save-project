// ==============================
// Configuração principal do projeto
// ==============================

export const USE_LOCAL_SERVER = false; 
// true → usa servidor local Node (/connect-token)
// false → usa servidor remoto

export const BASE_URL = "https://database-save-app.onrender.com";
export const LOCAL_SERVER_URL = "http://localhost:3001";

export const API_URL = USE_LOCAL_SERVER
    ? LOCAL_SERVER_URL
    : BASE_URL;

// ==============================
// Configuração para BENEFITS (.NET)
// ==============================

export const USE_LOCAL_BENEFITS_API = true;

// Backend .NET local
export const LOCAL_BENEFITS_API_URL = "http://localhost:5254/api";

// Backend remoto (caso publique depois)
export const REMOTE_BENEFITS_API_URL = "https://database-save-app.onrender.com/api";

export const BENEFITS_API_URL = USE_LOCAL_BENEFITS_API
    ? LOCAL_BENEFITS_API_URL
    : REMOTE_BENEFITS_API_URL;

// ==============================
// Configuração para INVESTMENTS (.NET)
// ==============================

/**
 * Usa o mesmo backend dos Benefits
 * porque os endpoints estão no mesmo servidor .NET
 */
export const INVESTMENTS_API_URL = BENEFITS_API_URL;