/** Familia de medidas a la que pertenece una unidad. */
export type FamiliaUnidad = 'superficie' | 'peso' | 'volumen' | 'cafe';

export interface UnidadConversion {
  /** Identificador estable de la unidad. */
  id: string;
  /** Nombre de la unidad, como se muestra en la interfaz. */
  nombre: string;
  /** Familia de medidas. */
  familia: FamiliaUnidad;
  /**
   * Cuántas unidades de esta medida equivalen a una unidad base.
   * La unidad base de cada familia es la que tiene factor 1.
   */
  factorABase: number;
  /** Decimales recomendados al mostrar el resultado. */
  decimales: number;
}

/* ===== Superficie ===== */

const METROS_CUADRADOS_POR_HECTAREA = 10000;
const METROS_CUADRADOS_POR_CUADRA = 6400;
const METROS_CUADRADOS_POR_ACRE = 4046.86;

/* ===== Peso ===== */

const KILOGRAMOS_PON_LIBRA = 0.45359237;
const KILOGRAMOS_PON_ONZA = 0.028349523125;
const KILOGRAMOS_PON_ARROBA = 12.5;
const KILOGRAMOS_PON_CARGA = 125;
const KILOGRAMOS_PON_BULTO_40 = 40;
const KILOGRAMOS_PON_BULTO_50 = 50;

/* ===== Volumen ===== */

const LITROS_PON_GALON_ESTADOUNIDENSE = 3.785411784;

/* ===== Café ===== */

/**
 * Factor de conversión de café en cereza a café pergamino seco.
 *
 * Se usa 4,8 a 1, que corresponde al beneficio por lavado, el más común
 * en Colombia: 60 kg de cereza rinden aproximadamente una arroba
 * (12,5 kg) de pergamino seco.
 *
 * El rendimiento real varía según el método de beneficio y el estado de
 * la cereza, así que este valor es una referencia, no una medida exacta.
 */
export const FACTOR_CEREZA_A_PERGAMINO = 4.8;

/** Todas las unidades soportadas por los conversores. */
export const UNIDADES: readonly UnidadConversion[] = [
  // Superficie
  {
    id: 'metros2',
    nombre: 'metros cuadrados',
    familia: 'superficie',
    factorABase: 1,
    decimales: 0,
  },
  {
    id: 'hectareas',
    nombre: 'hectáreas',
    familia: 'superficie',
    factorABase: METROS_CUADRADOS_POR_HECTAREA,
    decimales: 4,
  },
  {
    id: 'cuadras',
    nombre: 'cuadras',
    familia: 'superficie',
    factorABase: METROS_CUADRADOS_POR_CUADRA,
    decimales: 2,
  },
  {
    id: 'acres',
    nombre: 'acres',
    familia: 'superficie',
    factorABase: METROS_CUADRADOS_POR_ACRE,
    decimales: 4,
  },

  // Peso
  {
    id: 'kilogramos',
    nombre: 'kilogramos',
    familia: 'peso',
    factorABase: 1,
    decimales: 2,
  },
  {
    id: 'gramos',
    nombre: 'gramos',
    familia: 'peso',
    factorABase: 0.001,
    decimales: 0,
  },
  {
    id: 'libras',
    nombre: 'libras',
    familia: 'peso',
    factorABase: KILOGRAMOS_PON_LIBRA,
    decimales: 2,
  },
  {
    id: 'onzas',
    nombre: 'onzas',
    familia: 'peso',
    factorABase: KILOGRAMOS_PON_ONZA,
    decimales: 2,
  },
  {
    id: 'arrobas',
    nombre: 'arrobas',
    familia: 'peso',
    factorABase: KILOGRAMOS_PON_ARROBA,
    decimales: 3,
  },
  {
    id: 'cargas',
    nombre: 'cargas',
    familia: 'peso',
    factorABase: KILOGRAMOS_PON_CARGA,
    decimales: 3,
  },
  {
    id: 'bultos40',
    nombre: 'bultos de 40 kg',
    familia: 'peso',
    factorABase: KILOGRAMOS_PON_BULTO_40,
    decimales: 3,
  },
  {
    id: 'bultos50',
    nombre: 'bultos de 50 kg',
    familia: 'peso',
    factorABase: KILOGRAMOS_PON_BULTO_50,
    decimales: 3,
  },

  // Volumen
  {
    id: 'litros',
    nombre: 'litros',
    familia: 'volumen',
    factorABase: 1,
    decimales: 2,
  },
  {
    id: 'mililitros',
    nombre: 'mililitros',
    familia: 'volumen',
    factorABase: 0.001,
    decimales: 0,
  },
  {
    id: 'galones',
    nombre: 'galones (EE. UU.)',
    familia: 'volumen',
    factorABase: LITROS_PON_GALON_ESTADOUNIDENSE,
    decimales: 3,
  },
  {
    id: 'centimetrosCubicos',
    nombre: 'centímetros cúbicos',
    familia: 'volumen',
    factorABase: 0.001,
    decimales: 0,
  },
];

/** Devuelve la unidad con el identificador dado. */
export function obtenerUnidad(id: string): UnidadConversion | undefined {
  return UNIDADES.find((unidad) => unidad.id === id);
}

/** Devuelve las unidades de una familia de medidas. */
export function obtenerUnidadesDeFamilia(familia: FamiliaUnidad): UnidadConversion[] {
  return UNIDADES.filter((unidad) => unidad.familia === familia);
}

/**
 * Convierte un valor entre dos unidades de la misma familia.
 *
 * Se convierte primero a la unidad base de la familia y luego a la
 * unidad destino.
 */
export function convertir(valor: number, origenId: string, destinoId: string): number {
  const origen = obtenerUnidad(origenId);
  const destino = obtenerUnidad(destinoId);

  if (!origen || !destino || origen.familia !== destino.familia) {
    return Number.NaN;
  }

  return (valor * origen.factorABase) / destino.factorABase;
}

/** Convierte café en cereza a café pergamino seco. */
export function convertirCerezaAPergamino(kilogramosCereza: number): number {
  return kilogramosCereza / FACTOR_CEREZA_A_PERGAMINO;
}

/** Convierte café pergamino seco a café en cereza. */
export function convertirPergaminoACereza(kilogramosPergamino: number): number {
  return kilogramosPergamino * FACTOR_CEREZA_A_PERGAMINO;
}
