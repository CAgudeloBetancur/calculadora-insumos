export interface Insumo {
  id:string;
  nombre:string;
  partes:number;
  bultoKg:number;
}

export interface Mezcla {
  plantas:number;
  gramosPorPlantaTotal:number;
  insumos:Insumo[];
}

export interface ResultadoInsumo {
  insumoId:string;
  nombre:string;
  kilogramosRequeridos:number;
  bultoKg:number;
  bultos:number;
  kilogramosTotales:number;
  kilogramosSobrantes:number;
}

export type ResultadoCalculo = 
  | { ok: true; mezclas: ResultadoInsumo[]; totalKgRequeridos: number; }
  | { ok: false; errores: string[] };