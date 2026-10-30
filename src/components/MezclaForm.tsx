import type { Mezcla, Insumo } from "../lib/types";

interface Props {
  mezcla:Mezcla;
  onPlantasChange: (valor:number) => void;
  onDosisChange: (valor:number) => void;
  onInsumoChange: (id:string, cambios:Partial<Insumo>) => void;
  onAgregar: () => void;
  onEliminar: (id:string) => void;
  onReiniciar: () => void;
}

export function MezclaForm({
  mezcla,
  onPlantasChange,
  onDosisChange,
  onInsumoChange,
  onAgregar,
  onEliminar,
  onReiniciar
}: Props) {
  const puedeEliminar:boolean = mezcla.insumos.length > 1;

  function parseNumero(valor:string): number {
    const n = parseFloat(valor);
    return Number.isNaN(n) ? 0 : n;
  }

  return (
    <form class="mezcla-form" onSubmit={(e) => e.preventDefault()}>
      <fieldset>
        <legend>Datos del cultivo</legend>
        <div class="campo">
          <label for="plantas">Número de plantas</label>
          <input 
            id="plantas"
            type="number"
            min="1"
            max="10000000"
            step="1"
            value={mezcla.plantas}
            onInput={(e) => onPlantasChange(parseNumero((e.target as HTMLInputElement).value))}/>
        </div>
        <div class="campo">
          <label for="dosis">Dosis total (g/planta)</label>
          <input 
            id="dosis"
            type="number"
            min="0.01"
            max="1000"
            step="0.01"
            value={mezcla.gramosPorPlantaTotal}
            onInput={(e) => onDosisChange(parseNumero((e.target as HTMLInputElement).value))}/>
        </div>
      </fieldset>
      <fieldset>
        <legend>Mezcla de insumos</legend>
        <table class="tabla-mezcla">
          <thead>
            <tr>
              <th scope="col">Nombre (opcional)</th>
              <th scope="col">Partes</th>
              <th scope="col">Kg/bulto</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mezcla.insumos.map((f, i) => (
              <tr key={f.id}>
                <td data-label="Nombre">
                  <input 
                    id={`${f.id}-nombre`}
                    type="text"
                    maxLength={40}
                    placeholder={`Insumo ${i + 1}`}
                    value={f.nombre}
                    aria-label={`Nombre del insumo ${i + 1}`}
                    onInput={(e) => onInsumoChange(f.id, {nombre: (e.target as HTMLInputElement).value})}/>
                </td>
                <td data-label="Partes">
                  <input 
                    id={`${f.id}-partes`}
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={f.partes}
                    aria-label={`Partes del insumo ${i + 1}`}
                    onInput={(e) => onInsumoChange(f.id, {partes: parseNumero((e.target as HTMLInputElement).value)})}/>
                </td>
                <td data-label="Kg/bulto">
                  <input 
                    id={`${f.id}-bulto`}
                    type="number"
                    min="5"
                    max="75"
                    step="1"
                    value={f.bultoKg}
                    aria-label={`Kilogramos de un bulto del insumo ${i + 1}`}
                    onInput={(e) => onInsumoChange(f.id, {bultoKg: parseNumero((e.target as HTMLInputElement).value)})}/>
                </td>
                <td data-label="">
                  <button
                    type="button"
                    onClick={() => onEliminar(f.id)}
                    disabled={!puedeEliminar}
                    aria-label={`Eliminar insumo ${i + 1}`}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div class="acciones-form">
          <button type="button" onClick={onAgregar}>+ Agregar insumo</button>
          <button type="button" onClick={onReiniciar} class="secundario">Reiniciar</button>
        </div>
      </fieldset>
    </form>
  );
}