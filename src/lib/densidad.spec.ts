// src/lib/densidad.spec.ts
// Pruebas de los cálculos de densidad de siembra.

import { describe, it, expect } from 'vitest';
import {
  calcularAreaNecesaria,
  calcularDesdeDistancias,
  calcularDesdePlantas,
  convertirAMetros2,
  convertirDesdeMetros2,
  ajustarDistancia,
  redondearDistancia,
  DISTANCIA_MAXIMA_METROS,
  DISTANCIA_MINIMA_METROS,
  METROS_CUADRADOS_POR_ACRE,
  METROS_CUADRADOS_POR_CUADRA,
  METROS_CUADRADOS_POR_HECTAREA,
} from './densidad';

describe('convertirAMetros2', () => {
  it('convierte hectáreas a metros cuadrados', () => {
    expect(convertirAMetros2(1, 'hectareas')).toBe(METROS_CUADRADOS_POR_HECTAREA);
    expect(convertirAMetros2(2.5, 'hectareas')).toBe(25000);
  });

  it('convierte cuadras a metros cuadrados', () => {
    expect(convertirAMetros2(1, 'cuadras')).toBe(METROS_CUADRADOS_POR_CUADRA);
    expect(convertirAMetros2(3, 'cuadras')).toBe(19200);
  });

  it('convierte acres a metros cuadrados', () => {
    expect(convertirAMetros2(1, 'acres')).toBe(METROS_CUADRADOS_POR_ACRE);
  });

  it('deja los metros cuadrados sin cambios', () => {
    expect(convertirAMetros2(1500, 'metros2')).toBe(1500);
  });
});

describe('convertirDesdeMetros2', () => {
  it('es la inversa de convertirAMetros2', () => {
    const unidades = ['hectareas', 'cuadras', 'acres', 'metros2'] as const;

    for (const unidad of unidades) {
      const metros2 = convertirAMetros2(7, unidad);
      expect(convertirDesdeMetros2(metros2, unidad)).toBeCloseTo(7, 10);
    }
  });
});

describe('redondearDistancia', () => {
  it('redondea al múltiplo de 10 cm más cercano', () => {
    expect(redondearDistancia(1.24)).toBeCloseTo(1.2, 10);
    expect(redondearDistancia(1.26)).toBeCloseTo(1.3, 10);
    expect(redondearDistancia(1.05)).toBeCloseTo(1.1, 10);
    expect(redondearDistancia(2)).toBeCloseTo(2, 10);
  });
});

describe('ajustarDistancia', () => {
  it('acota la distancia al rango permitido', () => {
    expect(ajustarDistancia(0.5)).toBe(DISTANCIA_MINIMA_METROS);
    expect(ajustarDistancia(5)).toBe(DISTANCIA_MAXIMA_METROS);
  });

  it('redondea las distancias dentro del rango', () => {
    expect(ajustarDistancia(1.34)).toBeCloseTo(1.3, 10);
  });
});

describe('calcularDesdeDistancias', () => {
  it('calcula la densidad para 1,5 × 2,5 m en una hectárea', () => {
    const resultado = calcularDesdeDistancias(1.5, 2.5, METROS_CUADRADOS_POR_HECTAREA);

    expect(resultado.areaPorPlanta).toBeCloseTo(3.75, 10);
    expect(resultado.plantasPorMetro2).toBeCloseTo(1 / 3.75, 10);
    expect(resultado.plantasPorHectarea).toBeCloseTo(2666.67, 1);
    expect(resultado.plantasTotales).toBeCloseTo(2666.67, 1);
  });

  it('el número de plantas es el mismo en cualquier superficie proporcional', () => {
    const unaHectarea = calcularDesdeDistancias(1.2, 1.2, METROS_CUADRADOS_POR_HECTAREA);
    const dosHectareas = calcularDesdeDistancias(1.2, 1.2, 2 * METROS_CUADRADOS_POR_HECTAREA);

    expect(dosHectareas.plantasTotales).toBeCloseTo(2 * unaHectarea.plantasTotales, 6);
  });

  it('la densidad por unidad es cero cuando la superficie es cero', () => {
    const resultado = calcularDesdeDistancias(1.2, 1.8, 0, 'cuadras');

    expect(resultado.plantasPorUnidad).toBe(0);
    expect(resultado.plantasTotales).toBe(0);
  });
  it('una distancia en cero no produce densidad infinita', () => {
    const resultado = calcularDesdeDistancias(0, 1.5, METROS_CUADRADOS_POR_HECTAREA);

    expect(resultado.plantasPorMetro2).toBe(0);
    expect(resultado.plantasPorHectarea).toBe(0);
    expect(Number.isFinite(resultado.plantasTotales)).toBe(true);
  });
});

describe('calcularDesdePlantas', () => {
  it('el objetivo define el producto de las dos distancias', () => {
    const superficie = METROS_CUADRADOS_POR_HECTAREA;
    const resultado = calcularDesdePlantas(1600, superficie);

    // 10.000 m2 / 1.600 plantas = 6,25 m2 por planta
    expect(resultado.areaPorPlantaObjetivo).toBeCloseTo(6.25, 10);
  });

  it('el par exacto usa la misma medida para plantas y calles', () => {
    const resultado = calcularDesdePlantas(1600, METROS_CUADRADOS_POR_HECTAREA);

    expect(resultado.exacto.distanciaPlantas).toBe(resultado.exacto.distanciaCalles);
  });

  it('el par exacto no se redondea a multiplos de 10 cm', () => {
    const resultado = calcularDesdePlantas(
      15000,
      METROS_CUADRADOS_POR_CUADRA,
      'cuadras',
    );

    // Raiz de 0,4267 = 0,6532 m
    expect(resultado.exacto.distanciaPlantas).toBeCloseTo(0.6532, 4);
  });

  it('todas las distancias de las opciones estan dentro del rango permitido', () => {
    const resultado = calcularDesdePlantas(1600, METROS_CUADRADOS_POR_HECTAREA);

    const opciones = [
      resultado.recomendado,
      resultado.minima,
      resultado.maxima,
    ];
    for (const opcion of opciones) {
      expect(opcion.distanciaPlantas).toBeGreaterThanOrEqual(DISTANCIA_MINIMA_METROS);
      expect(opcion.distanciaPlantas).toBeLessThanOrEqual(DISTANCIA_MAXIMA_METROS);
      expect(opcion.distanciaCalles).toBeGreaterThanOrEqual(DISTANCIA_MINIMA_METROS);
      expect(opcion.distanciaCalles).toBeLessThanOrEqual(DISTANCIA_MAXIMA_METROS);
    }
  });

  it('las distancias del par recomendado son multiplos de 10 cm', () => {
    const resultado = calcularDesdePlantas(3000, METROS_CUADRADOS_POR_CUADRA, 'cuadras');

    const opciones = [resultado.recomendado, resultado.minima, resultado.maxima];
    for (const opcion of opciones) {
      expect(opcion.distanciaPlantas * 10).toBeCloseTo(
        Math.round(opcion.distanciaPlantas * 10),
        6,
      );
      expect(opcion.distanciaCalles * 10).toBeCloseTo(
        Math.round(opcion.distanciaCalles * 10),
        6,
      );
    }
  });

  it('la opcion mas densa usa 90 cm en ambas medidas', () => {
    const resultado = calcularDesdePlantas(1600, METROS_CUADRADOS_POR_HECTAREA);

    expect(resultado.minima.distanciaPlantas).toBe(DISTANCIA_MINIMA_METROS);
    expect(resultado.minima.distanciaCalles).toBe(DISTANCIA_MINIMA_METROS);
  });

  it('la opcion mas abierta usa 2 m en ambas medidas', () => {
    const resultado = calcularDesdePlantas(1600, METROS_CUADRADOS_POR_HECTAREA);

    expect(resultado.maxima.distanciaPlantas).toBe(DISTANCIA_MAXIMA_METROS);
    expect(resultado.maxima.distanciaCalles).toBe(DISTANCIA_MAXIMA_METROS);
  });

  it('marca como no alcanzable un objetivo imposible por exceso de plantas', () => {
    // 100.000 plantas en 1 ha requeriria 0,1 m2 por planta: imposible.
    const resultado = calcularDesdePlantas(100000, METROS_CUADRADOS_POR_HECTAREA);

    expect(resultado.esAlcanzable).toBe(false);
    expect(resultado.plantasMaximasPosibles).toBeLessThan(100000);
  });

  it('marca como no alcanzable un objetivo imposible por defecto de plantas', () => {
    // 10 plantas en 1 ha: requeriria 1.000 m2 por planta: imposible.
    const resultado = calcularDesdePlantas(10, METROS_CUADRADOS_POR_HECTAREA);

    expect(resultado.esAlcanzable).toBe(false);
    expect(resultado.plantasMinimasPosibles).toBeGreaterThan(0);
  });

  it('un objetivo razonable es alcanzable', () => {
    // 2.500 plantas en 1 ha -> 4 m2 por planta, dentro del rango
    // admisible (0,81 m2 a 4 m2).
    const resultado = calcularDesdePlantas(2500, METROS_CUADRADOS_POR_HECTAREA);

    expect(resultado.esAlcanzable).toBe(true);
  });

  it('las plantas maximas posibles corresponden a la siembra mas densa', () => {
    const superficie = 3 * METROS_CUADRADOS_POR_CUADRA;
    const resultado = calcularDesdePlantas(1000, superficie);

    const esperadas = Math.floor(superficie / (0.9 * 0.9));
    expect(resultado.plantasMaximasPosibles).toBe(esperadas);
  });

  it('la densidad por unidad se expresa en la unidad elegida', () => {
    const superficie = 3 * METROS_CUADRADOS_POR_CUADRA;
    const resultado = calcularDesdePlantas(5000, superficie, 'cuadras');

    // Con el par trazable 1,90 × 2,00 m caben 5.052 plantas en 3 cuadras,
    // es decir 1.684 plantas por cuadra (y no las 1.666,67 del objetivo
    // teórico, porque las medidas se ajustan a múltiplos de 10 cm).
    expect(resultado.recomendado.plantasPorUnidad).toBeCloseTo(1684, 0);
  });

  it('la densidad por cuadra corresponde a las plantas de la superficie', () => {
    const superficie = 3 * METROS_CUADRADOS_POR_CUADRA;
    const resultado = calcularDesdePlantas(5000, superficie, 'cuadras');

    // La densidad por unidad es continua (5.052,63 plantas en total) y el
    // conteo entero es lo que realmente cabe (5.052 plantas).
    const plantasTotales = resultado.recomendado.plantasPorUnidad * 3;
    expect(plantasTotales).toBeCloseTo(5052.63, 1);
    expect(resultado.plantasConDistanciaRecomendada).toBe(5052);
  });

  it('el par recomendado respeta que la calle no sea mas angosta', () => {
    const resultado = calcularDesdePlantas(3000, METROS_CUADRADOS_POR_CUADRA, 'cuadras');

    expect(resultado.recomendado.distanciaCalles).toBeGreaterThanOrEqual(
      resultado.recomendado.distanciaPlantas,
    );
  });

  it('el par recomendado es el mas cercano entre medidas trazables', () => {
    const resultado = calcularDesdePlantas(3000, METROS_CUADRADOS_POR_CUADRA, 'cuadras');

    // 3.000 plantas en 1 cuadra = 2,1333 m2 por planta.
    // 1,20 x 1,80 = 2,16 m2 es el par trazable mas cercano.
    expect(resultado.recomendado.distanciaPlantas).toBeCloseTo(1.2, 10);
    expect(resultado.recomendado.distanciaCalles).toBeCloseTo(1.8, 10);
  });

  it('la desviacion es pequena cuando el objetivo es alcanzable', () => {
    const resultado = calcularDesdePlantas(3000, METROS_CUADRADOS_POR_CUADRA, 'cuadras');

    expect(Math.abs(resultado.desviacionPlantas)).toBeLessThan(100);
    expect(Math.abs(resultado.desviacionPorcentaje)).toBeLessThan(5);
  });

  it('el par recomendado nunca sale del rango admitido', () => {
    const casos = [
      [15000, METROS_CUADRADOS_POR_CUADRA],
      [10000, METROS_CUADRADOS_POR_CUADRA],
      [1600, METROS_CUADRADOS_POR_HECTAREA],
      [2000, 3 * METROS_CUADRADOS_POR_CUADRA],
    ] as const;

    for (const [plantas, superficie] of casos) {
      const resultado = calcularDesdePlantas(plantas, superficie, 'cuadras');
      const { distanciaPlantas, distanciaCalles } = resultado.recomendado;

      expect(distanciaPlantas).toBeGreaterThanOrEqual(DISTANCIA_MINIMA_METROS);
      expect(distanciaPlantas).toBeLessThanOrEqual(DISTANCIA_MAXIMA_METROS);
      expect(distanciaCalles).toBeGreaterThanOrEqual(DISTANCIA_MINIMA_METROS);
      expect(distanciaCalles).toBeLessThanOrEqual(DISTANCIA_MAXIMA_METROS);
    }
  });

  it('la desviacion porcentual se calcula sobre el objetivo', () => {
    const resultado = calcularDesdePlantas(3000, METROS_CUADRADOS_POR_CUADRA, 'cuadras');

    const esperado =
      (resultado.desviacionPlantas / 3000) * 100;
    expect(resultado.desviacionPorcentaje).toBeCloseTo(esperado, 10);
  });

  it('las opciones tienen densidad cero cuando la superficie es cero', () => {
    const resultado = calcularDesdePlantas(1000, 0, 'cuadras');

    expect(resultado.recomendado.plantasPorUnidad).toBe(0);
    expect(resultado.exacto.plantasPorUnidad).toBe(0);
  });
  it('no produce densidad infinita con cero plantas', () => {
    const resultado = calcularDesdePlantas(0, METROS_CUADRADOS_POR_HECTAREA);

    expect(Number.isFinite(resultado.exacto.plantasPorHectarea)).toBe(true);
    expect(resultado.exacto.plantasPorHectarea).toBe(0);
  });
});
describe('calcularAreaNecesaria', () => {
  it('calcula la superficie necesaria para 5.000 plantas a 1,5 × 2,5 m', () => {
    const resultado = calcularAreaNecesaria(5000, 1.5, 2.5);

    expect(resultado.metros2).toBeCloseTo(18750, 6);
    expect(resultado.hectareas).toBeCloseTo(1.875, 6);
    expect(resultado.cuadras).toBeCloseTo(2.93, 2);
  });

  it('la superficie es coherente con las unidades', () => {
    const resultado = calcularAreaNecesaria(10000, 1, 1);

    expect(resultado.metros2).toBeCloseTo(10000, 6);
    expect(resultado.hectareas).toBeCloseTo(1, 6);
    expect(resultado.acres).toBeCloseTo(2.471, 2);
  });
});
