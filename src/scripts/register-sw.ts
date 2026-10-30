// src/scripts/register-sw.ts
// Registra el service worker en producción.

export function registrarServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('No se pudo registrar el service worker:', error);
    });
  });
}