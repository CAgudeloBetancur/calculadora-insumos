import type {
  Mezcla,
  ResultadoCalculo,
  ResultadoInsumo,
} from './types';

const MAX_INSUMOS = 10;
const MAX_PLANTAS = 10_000_000;
const MAX_PARTES = 100;
const MAX_DOSIS = 1000;
const MIN_BULTO_KG = 5;
const MAX_BULTO_KG = 75;

function validar(mezcla:Mezcla): string[] {

  let errores:string[] = [];

  if(mezcla.insumos.length === 0)
    errores.push("Agrega al menos un insumo.");
  else if(mezcla.insumos.length > MAX_INSUMOS)
    errores.push(`Máximo ${MAX_INSUMOS} insumos por mezcla.`);

  if(mezcla.insumos.some(f => !Number.isInteger(f.partes) || f.partes <= 0))
    errores.push("Las partes de cada insumo deben ser un entero positivo.");

  if(mezcla.insumos.some(f => f.partes > MAX_PARTES))
    errores.push(`Las partes de cada insumo no pueden superar ${MAX_PARTES}.`);

  if(!Number.isInteger(mezcla.plantas) || mezcla.plantas <= 0) 
    errores.push("El número de plantas debe ser un entero positivo.");
  else if(mezcla.plantas > MAX_PLANTAS) 
    errores.push(`El número de plantas no puede superar ${MAX_PLANTAS}.`);

  if(!Number.isFinite(mezcla.gramosPorPlantaTotal) || mezcla.gramosPorPlantaTotal <= 0) 
    errores.push("La dosis por planta debe ser mayor a 0.");
  else if(mezcla.gramosPorPlantaTotal > MAX_DOSIS)
    errores.push(`La dosis por planta no puede superar ${MAX_DOSIS} g.`);

  if(mezcla.insumos.some(f => !Number.isFinite(f.bultoKg) || f.bultoKg < MIN_BULTO_KG || f.bultoKg > MAX_BULTO_KG))
    errores.push(`El peso del bulto de un insumo debe estar entre ${MIN_BULTO_KG} y ${MAX_BULTO_KG} kg.`);

  return errores;
}

export function calcular(mezcla:Mezcla): ResultadoCalculo {

  const errores:string[] = validar(mezcla);

  if(errores.length > 0) return { ok: false, errores: errores };

  const totalPartesEnMezcla = mezcla.insumos.reduce((acc, f) => acc + f.partes, 0);

  let resultadoInsumos:ResultadoInsumo[] = mezcla.insumos.map(f => { 
    
    const gramosPorPlantaPorInsumo:number = mezcla.gramosPorPlantaTotal * (f.partes / totalPartesEnMezcla);
    const totalGramosRequeridoDeInsumo:number = mezcla.plantas * gramosPorPlantaPorInsumo;
    const kilogramosRequeridos:number = totalGramosRequeridoDeInsumo / 1000;

    const bultos:number = kilogramosRequeridos / f.bultoKg;
    const bultosRedondeado:number = Math.ceil(Number(bultos.toFixed(6))); // evita problemas de precisión

    const kilogramosTotales:number = bultosRedondeado * f.bultoKg;

    const kilogramosSobrantes:number = kilogramosTotales - kilogramosRequeridos;

    return {
      insumoId: f.id,
      nombre: f.nombre,
      kilogramosRequeridos,
      bultoKg: f.bultoKg,
      bultos: bultosRedondeado,
      kilogramosTotales,
      kilogramosSobrantes,
    }

  });

  return { 
    ok: true,
    mezclas: resultadoInsumos,
    totalKgRequeridos: resultadoInsumos.reduce((acc, f) => acc + f.kilogramosRequeridos, 0)
  };
}
