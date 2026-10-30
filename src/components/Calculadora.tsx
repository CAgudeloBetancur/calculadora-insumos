import { useState, useMemo } from 'preact/hooks';
import { calcular } from '../lib/calculo';
import type { Mezcla, Insumo } from '../lib/types';
import { MezclaForm } from './MezclaForm';
import { ResultadosPanel } from './ResultadosPanel';

const estadoInicial: Mezcla = {
  plantas: 5000,
  gramosPorPlantaTotal: 60,
  insumos: [
    { id: 'f1', nombre: '', partes: 1, bultoKg: 50},
    { id: 'f2', nombre: '', partes: 1, bultoKg: 50}
  ],
};

export function Calculadora() {
  const [mezcla, setMezcla] = useState<Mezcla>(estadoInicial);

  const resultado = useMemo(() => calcular(mezcla), [mezcla]);

  function agregarInsumo() {
    const nuevo:Insumo = {
      id: `f${Date.now()}`,
      nombre: '',
      partes: 1,
      bultoKg: 50
    }
    setMezcla(m => ({
      ...m,
      insumos: [...m.insumos, nuevo],
    }));
  }

  function eliminarInsumo(id:string) {
    setMezcla(m => ({
      ...m,
      insumos: m.insumos.filter(f => f.id !== id)
    }));
  }

  function actualizarInsumo(id:string, cambios:Partial<Insumo>) {
    setMezcla(m => ({
      ...m,
      insumos: m.insumos.map(f => f.id === id ? {...f, ...cambios} : f)
    }));
  }

  function actualizarPlantas(valor:number) {
    setMezcla(m => ({...m, plantas:valor}));
  }

  function actualizarDosis(valor:number) {
    setMezcla(m => ({...m, gramosPorPlantaTotal: valor}));
  }

  function reiniciar() {
    setMezcla(estadoInicial);
  }

  return (
    <div class="calculadora">
      <MezclaForm
        mezcla={mezcla}
        onPlantasChange={actualizarPlantas}
        onDosisChange={actualizarDosis}
        onInsumoChange={actualizarInsumo}
        onAgregar={agregarInsumo}
        onEliminar={eliminarInsumo}
        onReiniciar={reiniciar}
      />
      <ResultadosPanel resultado={resultado}/>
    </div>
  );
}