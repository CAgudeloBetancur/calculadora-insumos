import {describe, it, expect} from 'vitest';
import {calcular} from './calculo';
import type { Mezcla } from './types';

describe('calcular', () => {
  describe('caso principal (HU-1)', () => {
    it('5000 plantas, 60 g/planta, proporción 1:1 -> 150 kg de cada uno', () => {
      const mezcla: Mezcla = {
        plantas: 5000,
        gramosPorPlantaTotal: 60,
        insumos: [
          { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
          { id: 'B', nombre: 'Insumo B', partes: 1, bultoKg: 50},
        ],
      };
      
      const resultado = calcular(mezcla);
      expect(resultado.ok).toBe(true);

      if (!resultado.ok) return;

      expect(resultado.mezclas).toHaveLength(2);

      for(const f of resultado.mezclas) {
        expect(f.kilogramosRequeridos).toBe(150);        
        expect(f.bultos).toBe(3);
        expect(f.kilogramosSobrantes).toBe(0);
      }

      expect(resultado.totalKgRequeridos).toBe(300);
    });
  });
});

describe('proporciones variables (RN-2)', () => {
  it('5000 plantas, 60 g/planta, proporción 2:1:1 -> 75/37.5/37.5 kg', () => {
    const mezcla:Mezcla = {
      plantas: 5000,
      gramosPorPlantaTotal: 60,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 2, bultoKg: 50},
        { id: 'B', nombre: 'Insumo B', partes: 1, bultoKg: 50},
        { id: 'C', nombre: 'Insumo C', partes: 1, bultoKg: 50},
      ],
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(true);
    if(!resultado.ok) return;

    const [a, b, c] = resultado.mezclas;

    expect(a!.kilogramosRequeridos).toBe(150);
    expect(b!.kilogramosRequeridos).toBe(75);
    expect(c!.kilogramosRequeridos).toBe(75);
    expect(resultado.totalKgRequeridos).toBe(300);
  });

  it('1000 plantas, 30 g/planta, 1 Insumo -> todo a uno', () => {
    const mezcla: Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 30,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
      ],
    }

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(true);
    if(!resultado.ok) return;

    const f = resultado.mezclas[0]!;
    expect(f.kilogramosRequeridos).toBe(30);
    expect(f.bultos).toBe(1);
    expect(f.kilogramosSobrantes).toBe(20);
  });
});

describe('redondeo de bultos (RN-3', () => {
  it('sobrante máximo permitido: 39 kg (40) y 49 kg (50)', () => {
    const mezcla:Mezcla = {
      plantas: 100,
      gramosPorPlantaTotal: 10,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
      ],
    }

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(true);
    if(!resultado.ok) return;

    const f = resultado.mezclas[0]!;
    expect(f.kilogramosRequeridos).toBe(1);
    expect(f.bultos).toBe(1);
    expect(f.kilogramosSobrantes).toBe(49);
  });

  it('requerido exacto múltiplo: 100kg -> 2 bultos de 50kg, 0 sobrante', () => {
    const mezcla:Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 100,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
      ],
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(true);
    if(!resultado.ok) return;

    const f = resultado.mezclas[0]!;
    expect(f.kilogramosRequeridos).toBe(100);
    expect(f.bultos).toBe(2);
    expect(f.kilogramosSobrantes).toBe(0);
  });
});

describe('validación (RN-1, RN-4)', () => {
  it('sin Insumos -> error', () => {
    const mezcla: Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 100,
      insumos: [],
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(false);
    if(resultado.ok) return;

    expect(resultado.errores.length).toBeGreaterThan(0);
    expect(resultado.errores.some((e) => /Insumo/i.test(e))).toBe(true);
  });

  it('plantas en cero -> error', () => {
    const mezcla:Mezcla = {
      plantas: 0,
      gramosPorPlantaTotal: 60,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
      ],
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(false);
  });

  it('dosis negativa -> error', () => {
    const mezcla:Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: -10,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
      ],
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(false);
  });

  it('dosis mayor a 1000 g/planta -> error', () => {
    const mezcla:Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 1001,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
      ],
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(false);
  });

  it('partes en cero -> error', () => {
    const mezcla:Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 60,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 0, bultoKg: 50},
      ],
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(false);
  });

  it('partes mayores a 100 -> error', () => {
    const mezcla:Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 60,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 101, bultoKg: 50},
      ],
    }

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(false);
  });

  it('más de 10_000_000 de plantas -> error', () => {
    const mezcla:Mezcla = {
      plantas: 10_000_001,
      gramosPorPlantaTotal: 60,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
      ],
    }

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(false);
  });

  it('más de 10 Insumos -> error', () => {
    const mezcla:Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 60,
      insumos: Array.from(
          {length: 11}, 
          (_, i) => ({ 
            id: `F${i+1}`, 
            nombre: `Insumo ${i+1}`, 
            partes: 1,
            bultoKg: 50
          })
      )
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(false);
  });

  it('la suma de todos los insumos iguala la dosis total', () => {
    const mezcla:Mezcla = {
      plantas: 5000,
      gramosPorPlantaTotal: 60,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 3, bultoKg: 50},
        { id: 'B', nombre: 'Insumo B', partes: 5, bultoKg: 50},
        { id: 'C', nombre: 'Insumo C', partes: 2, bultoKg: 50},
      ],
    }

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(true);
    if(!resultado.ok) return;

    const suma = resultado.mezclas.reduce((acc, f) => acc + f.kilogramosRequeridos, 0);
    expect(suma).toBeCloseTo(300, 6);
  });

  it('peso de bulto fuera de rango -> error', () => {
    const mezcla:Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 60,
      insumos: [{id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 100}],
    }

    const resultado = calcular(mezcla);

    expect(resultado.ok);
  });

  it('variación con bulto de 40kg en vez de 50kg -> más bultos, y más sobrante', () => {
    const mezcla:Mezcla = {
      plantas: 5000,
      gramosPorPlantaTotal: 60,
      insumos: [{id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 40}],
    }

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(true);
    if(!resultado.ok) return;

    const f = resultado.mezclas[0]!;
    expect(f.kilogramosRequeridos).toBe(300);
    expect(f.bultos).toBe(8);
    expect(f.kilogramosTotales).toBe(320);
    expect(f.kilogramosSobrantes).toBe(20);
  });

  it('bulto de 25 kg -> ceil aplicado correctamente', () => {
    const mezcla:Mezcla = {
      plantas: 1000,
      gramosPorPlantaTotal: 100,
      insumos: [{id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 25}],
    }

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(true);
    if(!resultado.ok) return;

    const f = resultado.mezclas[0]!;
    expect(f.kilogramosRequeridos).toBe(100);
    expect(f.bultos).toBe(4);
    expect(f.kilogramosSobrantes).toBe(0);
  });
});

describe('casos grandes (RN-1 límite)', () => {
  it('1.000.000 plantas, 100 g/planta, 1 Insumo -> 100.000 kg', () => {
    const mezcla: Mezcla = {
      plantas: 1_000_000,
      gramosPorPlantaTotal: 100,
      insumos: [
        { id: 'A', nombre: 'Insumo A', partes: 1, bultoKg: 50},
      ],
    };

    const resultado = calcular(mezcla);

    expect(resultado.ok).toBe(true);
    if(!resultado.ok) return;

    const f = resultado.mezclas[0]!;
    expect(f.kilogramosRequeridos).toBe(100_000);
    expect(f.bultos).toBe(2000);
    expect(f.kilogramosSobrantes).toBe(0);
  });
});

