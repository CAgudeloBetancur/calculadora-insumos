import type { ResultadoCalculo, ResultadoInsumo } from "../lib/types";

interface Props {
  resultado:ResultadoCalculo
}

function formatearKg(kg:number): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kg);
}

function Insumo({resultado: r, indice}: {resultado: ResultadoInsumo; indice:number}) {
  const nombre = r.nombre || `Insumo ${indice + 1}`;

  return (
    <article class="resultado-insumo">
      <h3>{nombre}</h3>
      <p class="requerido">
        Requerido: <strong>{formatearKg(r.kilogramosRequeridos)} kg</strong>
      </p>
      <ul class="bultos">
        <li>
          <span class="presentacion">Necesitas <strong>{r.bultos}</strong> {`bultos de ${r.bultoKg} kg`}</span>          
          <span class="sobrante">
            {' '}
            (sobran {formatearKg(r.kilogramosSobrantes)} kg)
          </span>
          </li>
      </ul>
    </article>
  );
}

export function ResultadosPanel({resultado}:Props) {
  if(!resultado.ok) {
    return (
      <section class="resultados resultados-error" aria-live="polite" role="alert">
        <h2>Revisa estos datos</h2>
        <ul>
          {resultado.errores.map((e, i) => (<li key={i}>{e}</li>))}
        </ul>
      </section>
    );
  }

  return (
    <section class="resultados" aria-live="polite">
      <h2>Resultado</h2>
      {resultado.mezclas.map((r, i) => (<Insumo key={r.insumoId} resultado={r} indice={i}/>))}
      <p class="total">
        Total estimado: <strong>{formatearKg(resultado.totalKgRequeridos)} kg</strong>
      </p>
      <p class="nota">
        Los bultos se calculan redondeando hacia arriba, para que siempre alcance. El sobrante es la diferencia entre lo que se compra y lo que se va a usar realmente.
      </p>
    </section>
  );
}