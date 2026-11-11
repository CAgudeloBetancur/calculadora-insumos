/** Distancia mínima permitida entre plantas y entre calles, en metros. */
export const DISTANCIA_MINIMA_METROS = 0.9;

/** Distancia máxima permitida entre plantas y entre calles, en metros. */
export const DISTANCIA_MAXIMA_METROS = 2;

/** Las distancias sugeridas se redondean a múltiplos de este valor, en metros. */
export const PASO_DISTANCIA_METROS = 0.1;

/** Superficie de una cuadra, en metros cuadrados. */
export const METROS_CUADRADOS_POR_CUADRA = 6400;

/** Superficie de un acre, en metros cuadrados. */
export const METROS_CUADRADOS_POR_ACRE = 4046.86;

/** Superficie de una hectárea, en metros cuadrados. */
export const METROS_CUADRADOS_POR_HECTAREA = 10000;

/** Unidades de superficie admitidas como entrada. */
export type UnidadSuperficie = 'hectareas' | 'cuadras' | 'acres' | 'metros2';

/**
 * Distancias que el usuario puede medir y marcar en el terreno: múltiplos
 * de 10 cm dentro del rango permitido.
 */
export const DISTANCIAS_ADMITIDAS: readonly number[] = [
  0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0,
];

export interface OpcionesDensidad {
  /** Distancia entre plantas, en metros. */
  distanciaPlantas: number;
  /** Distancia entre calles o surcos, en metros. */
  distanciaCalles: number;
  /** Plantas por hectárea resultantes. */
  plantasPorHectarea: number;
  /**
   * Plantas por unidad de superficie, expresadas en la unidad que eligió
   * el usuario. Es el dato comparable con el resto de la página.
   */
  plantasPorUnidad: number;
  /** Superficie ocupada por cada planta, en metros cuadrados. */
  areaPorPlanta: number;
}

export interface ResultadoDesdeDistancias {
  /** Plantas por hectárea. */
  plantasPorHectarea: number;
  /** Plantas por metro cuadrado. */
  plantasPorMetro2: number;
  /** Densidad expresada en la unidad de superficie elegida por el usuario. */
  plantasPorUnidad: number;
  /** Número total de plantas en la superficie dada. */
  plantasTotales: number;
  /** Superficie ocupada por cada planta, en metros cuadrados. */
  areaPorPlanta: number;
  /** Superficie analizada, en metros cuadrados. */
  superficieMetros2: number;
}

export interface ResultadoDesdePlantas {
  /**
   * Par de distancias que cumple exactamente el objetivo, sin redondear
   * ni aplicar los limites. Se muestra aunque quede fuera del rango.
   */
  exacto: OpcionesDensidad;
  /**
   * Par de distancias trazables mas cercano al objetivo, siempre dentro
   * del rango admitido y con la calle igual o mas ancha que el espacio
   * entre plantas.
   */
  recomendado: OpcionesDensidad;
  /** Par de distancias con la medida entre plantas en su valor minimo. */
  minima: OpcionesDensidad;
  /** Par de distancias con la medida entre plantas en su valor maximo. */
  maxima: OpcionesDensidad;
  /** Indica si el objetivo es alcanzable con las distancias permitidas. */
  esAlcanzable: boolean;
  /** Plantas que caben como maximo en la superficie con el par de distancias minimas. */
  plantasMaximasPosibles: number;
  /** Plantas que se pueden sembrar como minimo con el par de distancias maximas. */
  plantasMinimasPosibles: number;
  /** Plantas que se siembran con el par recomendado. */
  plantasConDistanciaRecomendada: number;
  /** Diferencia entre las plantas del objetivo y las del par recomendado. */
  desviacionPlantas: number;
  /** Esa misma diferencia, como porcentaje del objetivo. */
  desviacionPorcentaje: number;
  /** Area por planta que requeriria el objetivo, en metros cuadrados. */
  areaPorPlantaObjetivo: number;
}

export interface ResultadoAreaNecesaria {
  /** Superficie necesaria, en metros cuadrados. */
  metros2: number;
  /** Superficie necesaria, en hectáreas. */
  hectareas: number;
  /** Superficie necesaria, en cuadras. */
  cuadras: number;
  /** Superficie necesaria, en acres. */
  acres: number;
}

/** Convierte una superficie expresada en la unidad indicada a metros cuadrados. */
export function convertirAMetros2(valor: number, unidad: UnidadSuperficie): number {
  switch (unidad) {
    case 'hectareas':
      return valor * METROS_CUADRADOS_POR_HECTAREA;
    case 'cuadras':
      return valor * METROS_CUADRADOS_POR_CUADRA;
    case 'acres':
      return valor * METROS_CUADRADOS_POR_ACRE;
    case 'metros2':
      return valor;
  }
}

/** Convierte una superficie en metros cuadrados a la unidad indicada. */
export function convertirDesdeMetros2(metros2: number, unidad: UnidadSuperficie): number {
  switch (unidad) {
    case 'hectareas':
      return metros2 / METROS_CUADRADOS_POR_HECTAREA;
    case 'cuadras':
      return metros2 / METROS_CUADRADOS_POR_CUADRA;
    case 'acres':
      return metros2 / METROS_CUADRADOS_POR_ACRE;
    case 'metros2':
      return metros2;
  }
}

/** Redondea una distancia al múltiplo de 10 cm más cercano. */
export function redondearDistancia(distancia: number): number {
  return Math.round(distancia / PASO_DISTANCIA_METROS) * PASO_DISTANCIA_METROS;
}

/** Limita una distancia al rango permitido y la redondea a múltiplos de 10 cm. */
export function ajustarDistancia(distancia: number): number {
  const acotada = Math.min(
    DISTANCIA_MAXIMA_METROS,
    Math.max(DISTANCIA_MINIMA_METROS, distancia),
  );
  return redondearDistancia(acotada);
}

/**
 * Calcula la densidad de siembra a partir de dos distancias y una
 * superficie.
 *
 * La densidad se expresa tambien en la unidad de superficie elegida por
 * el usuario, para que pueda compararla con la cantidad de plantas que
 * tendría en una cuadra o en un acre.
 */
export function calcularDesdeDistancias(
  distanciaPlantas: number,
  distanciaCalles: number,
  superficieMetros2: number,
  unidad: UnidadSuperficie = 'hectareas',
): ResultadoDesdeDistancias {
  const areaPorPlanta = distanciaPlantas * distanciaCalles;
  const plantasPorMetro2 = areaPorPlanta > 0 ? 1 / areaPorPlanta : 0;
  const superficieEnUnidad = convertirDesdeMetros2(superficieMetros2, unidad);

  return {
    plantasPorHectarea: plantasPorMetro2 * METROS_CUADRADOS_POR_HECTAREA,
    plantasPorMetro2,
    plantasPorUnidad:
      superficieEnUnidad > 0
        ? plantasPorMetro2 * superficieMetros2 / superficieEnUnidad
        : 0,
    plantasTotales: plantasPorMetro2 * superficieMetros2,
    areaPorPlanta,
    superficieMetros2,
  };
}

/**
 * Construye las opciones de siembra a partir de un par de distancias.
 *
 * La densidad por unidad se calcula sobre la superficie analizada, para
 * que el dato sea comparable con el resto de la pagina. Si la superficie
 * es cero, la densidad por unidad es cero.
 */
function construirOpciones(
  distanciaPlantas: number,
  distanciaCalles: number,
  superficieMetros2: number,
  unidad: UnidadSuperficie,
): OpcionesDensidad {
  const areaPorPlanta = distanciaPlantas * distanciaCalles;
  const plantasPorMetro2 = areaPorPlanta > 0 ? 1 / areaPorPlanta : 0;
  const superficieEnUnidad = convertirDesdeMetros2(superficieMetros2, unidad);

  return {
    distanciaPlantas,
    distanciaCalles,
    plantasPorHectarea:
      areaPorPlanta > 0
        ? plantasPorMetro2 * METROS_CUADRADOS_POR_HECTAREA
        : 0,
    plantasPorUnidad:
      superficieEnUnidad > 0
        ? (plantasPorMetro2 * superficieMetros2) / superficieEnUnidad
        : 0,
    areaPorPlanta,
  };
}

/**
 * Busca el par de distancias trazables (multiplos de 10 cm dentro del
 * rango permitido) cuyo producto se acerca mas al area por planta del
 * objetivo.
 *
 * Se prueban las dos medidas por separado en lugar de forzar un cuadrado:
 * redondear el lado de un cuadrado amplifica el error, porque el area es
 * cuadratica. Un lado de 0,65 m redondeado a 0,70 m pasa de 0,4225 m2 a
 * 0,49 m2, un 16 % de desviacion.
 *
 * Se respetan dos restricciones: ambas distancias deben quedar dentro del
 * rango admitido y la calle nunca puede ser mas angosta que el espacio
 * entre plantas, como es lo habitual en el trazado de surcos.
 */
export function buscarDistanciasTrazables(
  areaPorPlantaObjetivo: number,
  superficieMetros2: number,
  unidad: UnidadSuperficie,
): OpcionesDensidad {
  let mejorDistanciaPlantas = DISTANCIA_MINIMA_METROS;
  let mejorDistanciaCalles = DISTANCIA_MINIMA_METROS;
  let mejorError = Number.POSITIVE_INFINITY;

  for (const distanciaPlantas of DISTANCIAS_ADMITIDAS) {
    for (const distanciaCalles of DISTANCIAS_ADMITIDAS) {
      // La calle nunca puede ser mas angosta que el espacio entre plantas.
      if (distanciaCalles < distanciaPlantas) continue;

      const area = distanciaPlantas * distanciaCalles;
      const error = Math.abs(area - areaPorPlantaObjetivo);

      if (error < mejorError) {
        mejorError = error;
        mejorDistanciaPlantas = distanciaPlantas;
        mejorDistanciaCalles = distanciaCalles;
      }
    }
  }

  return construirOpciones(
    mejorDistanciaPlantas,
    mejorDistanciaCalles,
    superficieMetros2,
    unidad,
  );
}

/**
 * Calcula las distancias de siembra sugeridas para un objetivo de plantas
 * en una superficie dada.
 *
 * El producto de las dos distancias queda determinado por el objetivo:
 * `distanciaPlantas × distanciaCalles = superficie / plantasObjetivo`.
 * Hay infinitos pares que cumplen ese producto, por lo que se ofrecen
 * tres referencias:
 *
 * - `equilibrada`: ambas medidas iguales, la más cercana al objetivo.
 * - `minima`: el par de menor superficie por planta, es decir, la siembra
 *   más densa permitida.
 * - `maxima`: el par de mayor superficie por planta, la siembra más
 *   abierta permitida.
 *
 * Cuando el objetivo queda fuera del rango admisible, se avisa y se
 * ofrecen los pares extremos, que son los más cercanos posibles.
 */
/**
 * Calcula las distancias de siembra sugeridas para un objetivo de plantas
 * en una superficie dada.
 *
 * Se ofrecen tres pares de referencia:
 *
 * - `exacto`: el cuadrado que cumple el objetivo, sin redondear. Puede
 *   quedar fuera del rango admitido, y en ese caso se marca en rojo.
 * - `recomendado`: el par de medidas trazables (multiplos de 10 cm) mas
 *   cercano al objetivo. Siempre cumple el rango admitido.
 * - `minima` y `maxima`: los extremos, la siembra mas densa y la mas
 *   abierta permitidas.
 */
export function calcularDesdePlantas(
  plantasObjetivo: number,
  superficieMetros2: number,
  unidad: UnidadSuperficie = 'hectareas',
): ResultadoDesdePlantas {
  const areaPorPlantaObjetivo =
    plantasObjetivo > 0 ? superficieMetros2 / plantasObjetivo : 0;

  // Superficie por planta minima y maxima admisibles segun los limites.
  const areaMinimaAdmisible = DISTANCIA_MINIMA_METROS * DISTANCIA_MINIMA_METROS;
  const areaMaximaAdmisible = DISTANCIA_MAXIMA_METROS * DISTANCIA_MAXIMA_METROS;

  const esAlcanzable =
    areaPorPlantaObjetivo >= areaMinimaAdmisible &&
    areaPorPlantaObjetivo <= areaMaximaAdmisible;

  // Cuadrado exacto del objetivo, sin redondear ni acotar.
  const distanciaExacta = Math.sqrt(areaPorPlantaObjetivo);

  // Par trazable mas cercano al objetivo, siempre dentro del rango.
  const recomendado = buscarDistanciasTrazables(
    areaPorPlantaObjetivo,
    superficieMetros2,
    unidad,
  );

  const plantasConDistanciaRecomendada = Math.floor(
    superficieMetros2 /
      (recomendado.distanciaPlantas * recomendado.distanciaCalles),
  );
  const desviacionPlantas = plantasConDistanciaRecomendada - plantasObjetivo;

  return {
    exacto: construirOpciones(
      distanciaExacta,
      distanciaExacta,
      superficieMetros2,
      unidad,
    ),
    recomendado,
    minima: construirOpciones(
      DISTANCIA_MINIMA_METROS,
      DISTANCIA_MINIMA_METROS,
      superficieMetros2,
      unidad,
    ),
    maxima: construirOpciones(
      DISTANCIA_MAXIMA_METROS,
      DISTANCIA_MAXIMA_METROS,
      superficieMetros2,
      unidad,
    ),
    esAlcanzable,
    plantasMaximasPosibles: Math.floor(superficieMetros2 / areaMinimaAdmisible),
    plantasMinimasPosibles: Math.floor(superficieMetros2 / areaMaximaAdmisible),
    plantasConDistanciaRecomendada,
    desviacionPlantas,
    desviacionPorcentaje:
      plantasObjetivo > 0 ? (desviacionPlantas / plantasObjetivo) * 100 : 0,
    areaPorPlantaObjetivo,
  };
}

/** Calcula la superficie necesaria para sembrar un número de plantas. */
export function calcularAreaNecesaria(
  plantasTotales: number,
  distanciaPlantas: number,
  distanciaCalles: number,
): ResultadoAreaNecesaria {
  const areaPorPlanta = distanciaPlantas * distanciaCalles;
  const metros2 = areaPorPlanta * plantasTotales;

  return {
    metros2,
    hectareas: convertirDesdeMetros2(metros2, 'hectareas'),
    cuadras: convertirDesdeMetros2(metros2, 'cuadras'),
    acres: convertirDesdeMetros2(metros2, 'acres'),
  };
}
