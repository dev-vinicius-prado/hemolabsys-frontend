// environments/environment.prod.ts
export const environment = {
  production: true,
  // No SockJS, a URL deve começar com http ou https, e ele negocia o upgrade para ws/wss
  apiUrl: 'https://hemolabsys-backend.onrender.com/api',
  wsUrl: 'https://hemolabsys-backend.onrender.com/ws'
};
