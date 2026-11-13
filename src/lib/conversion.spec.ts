// src/lib/conversion.spec.ts
// Pruebas de las conversiones de unidades del agro.

import { describe, it, expect } from 'vitest';
import {
  convertir,
  convertirCerezaAPergamino,
  convertirPergaminoACereza,
  FACTOR_CEREZA_A_PERGAMINO,
  obtenerUnidad,
  obtenerUnidadesDeFamilia,
} from './conversion';

describe('obtenerUnidad', () => {
  it('devuelve la unidad cuando existe', () => {
    expect(obtenerUnidad('cuadras')?.nombre).toBe('cuadras');
  });

  it('devuelve undefined cuando no existe', () => {
    expect(obtenerUnidad('inexistente')).toBeUndefined();
  });
});

describe('obtenerUnidadesDeFamilia', () => {
  it('devuelve solo las unidades de la familia pedida', () => {
    const unidades = obtenerUnidadesDeFamilia('peso');

    expect(unidades.length).toBeGreaterThan(0);
    for (const unidad of unidades) {
      expect(unidad.familia).toBe('peso');
    }
  });

  it('devuelve una lista vacía para una familia sin unidades', () => {
    expect(obtenerUnidadesDeFamilia('cafe')).toHaveLength(0);
  });
});

describe('convertir', () => {
  it('convierte cuadras a hectareas', () => {
    // 1 cuadra = 6.400 m² = 0,64 ha
    expect(convertir(1, 'cuadras', 'hectareas')).toBeCloseTo(0.64, 10);
    expect(convertir(3, 'cuadras', 'hectareas')).toBeCloseTo(1.92, 10);
  });

  it('convierte hectareas a metros cuadrados', () => {
    expect(convertir(1, 'hectareas', 'metros2')).toBeCloseTo(10000, 10);
  });

  it('convierte acres a metros cuadrados', () => {
    expect(convertir(1, 'acres', 'metros2')).toBeCloseTo(4046.86, 6);
  });

  it('la conversion es reversible', () => {
    const original = 7.5;
    const ida = convertir(original, 'cuadras', 'hectareas');
    const vuelta = convertir(ida, 'hectareas', 'cuadras');

    expect(vuelta).toBeCloseTo(original, 10);
  });

  it('convierte arrobas a kilogramos', () => {
    expect(convertir(1, 'arrobas', 'kilogramos')).toBeCloseTo(12.5, 10);
    expect(convertir(10, 'arrobas', 'kilogramos')).toBeCloseTo(125, 10);
  });

  it('convierte cargas a kilogramos', () => {
    expect(convertir(1, 'cargas', 'kilogramos')).toBeCloseTo(125, 10);
  });

  it('convierte bultos de 40 y 50 kg a kilogramos', () => {
    expect(convertir(1, 'bultos40', 'kilogramos')).toBeCloseTo(40, 10);
    expect(convertir(1, 'bultos50', 'kilogramos')).toBeCloseTo(50, 10);
  });

  it('convierte libras y onzas a kilogramos', () => {
    expect(convertir(1, 'libras', 'kilogramos')).toBeCloseTo(0.45359237, 10);
    expect(convertir(16, 'onzas', 'libras')).toBeCloseTo(1, 10);
  });

  it('convierte litros a galones estadounidenses', () => {
    expect(convertir(3.785411784, 'litros', 'galones')).toBeCloseTo(1, 8);
    expect(convertir(20, 'litros', 'galones')).toBeCloseTo(5.2834, 3);
  });

  it('convierte galones a mililitros y centimetros cubicos', () => {
    expect(convertir(1, 'galones', 'mililitros')).toBeCloseTo(3785.41, 1);
    expect(convertir(1, 'galones', 'centimetrosCubicos')).toBeCloseTo(3785.41, 1);
  });

  it('devuelve NaN cuando las unidades son de familias distintas', () => {
    expect(convertir(1, 'cuadras', 'kilogramos')).toBeNaN();
  });

  it('devuelve NaN cuando una unidad no existe', () => {
    expect(convertir(1, 'inexistente', 'kilogramos')).toBeNaN();
  });
});

describe('conversion de cafe', () => {
  it('usa un factor de 4,8 a 1', () => {
    expect(FACTOR_CEREZA_A_PERGAMINO).toBe(4.8);
  });

  it('convierte 60 kg de cereza en una arroba de pergamino', () => {
    const pergamino = convertirCerezaAPergamino(60);

    expect(pergamino).toBeCloseTo(12.5, 10);
  });

  it('convierte una carga de pergamino en 600 kg de cereza', () => {
    const cereza = convertirPergaminoACereza(125);

    expect(cereza).toBeCloseTo(600, 10);
  });

  it('la conversion en ambos sentidos es coherente', () => {
    const cereza = 450;
    const pergamino = convertirCerezaAPergamino(cereza);

    expect(convertirPergaminoACereza(pergamino)).toBeCloseTo(cereza, 10);
  });

  it('con cero kilos de cereza el pergamino es cero', () => {
    expect(convertirCerezaAPergamino(0)).toBe(0);
  });
});
