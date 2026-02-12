// En producción usa el base path de Vite, en desarrollo usa /api directo
export const API_BASE = import.meta.env.PROD
  ? `${import.meta.env.BASE_URL}api`
  : '/api';
