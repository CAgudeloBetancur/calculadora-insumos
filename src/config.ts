export const SITIO = {
  nombre: 'Calculadora de Insumos',
  descripcion: 'Calcula la cantidad de insumos necesarios para un cultivo o preparación',
  url: 'https://calculadorainsumos.com',
  idioma: 'es-CO'
} as const;

/**
 * Google AdSense.
 *
 * Mientras `publisherId` esté vacío, el componente <Anuncio /> muestra un
 * placeholder y NO carga ningún script de terceros. Esto permite 
 * desplegar y solicitar la cuenta de AdSense sin tener el ID.
 *
 * Cuando obtenga el ID (formato "ca-pub-XXXXXXXXXXXXXXX"), reemplazar '' por el valor y redesplegar.
 */

export const ADSENSE = {
  publisherId: '',
  slotId: '', // cuando se cree bloque de anuncios en código
} as const;

export const ANALYTICS = {
  cloudflareWebAnalyticsId: '',
} as const;