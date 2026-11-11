import { useMemo, useState } from 'preact/hooks';
import {
  calcularAreaNecesaria,
  calcularDesdeDistancias,
  calcularDesdePlantas,
  convertirAMetros2,
  DISTANCIA_MAXIMA_METROS,
  DISTANCIA_MINIMA_METROS,
  type OpcionesDensidad,
  type UnidadSuperficie,
} from '../lib/densidad';

// src/components/CalculadoraDensidad.tsx
// Calculadora de densidad de siembra con tres modos:
//   1. Desde las distancias -> densidad y numero de plantas.
//   2. Desde las plantas objetivo -> distancias sugeridas.
//   3. Area necesaria -> superficie para cierto numero de plantas.

type Modo = 'distancias' | 'plantas' | 'area';

const MODOS: { id: Modo; etiqueta: string }[] = [
  { id: 'distancias', etiqueta: 'Desde las distancias' },
  { id: 'plantas', etiqueta: 'Desde las plantas' },
  { id: 'area', etiqueta: 'Área necesaria' },
];

interface DefinicionUnidad {
  id: UnidadSuperficie;
  /** Nombre de la unidad en singular. */
  singular: string;
  /** Nombre de la unidad en plural. */
  plural: string;
}

const UNIDADES: DefinicionUnidad[] = [
  { id: 'hectareas', singular: 'hectárea', plural: 'hectáreas' },
  { id: 'cuadras', singular: 'cuadra', plural: 'cuadras' },
  { id: 'acres', singular: 'acre', plural: 'acres' },
  { id: 'metros2', singular: 'metro cuadrado', plural: 'metros cuadrados' },
];

/** Devuelve el nombre de la unidad, en singular o plural según la cantidad. */
function nombreDeUnidad(unidad: UnidadSuperficie, cantidad: number): string {
  const definicion = UNIDADES.find((opcion) => opcion.id === unidad);
  if (!definicion) return '';

  return cantidad === 1 ? definicion.singular : definicion.plural;
}

/** Construye el texto del campo de superficie, reactivo a la unidad elegida. */
function nombreDelCampo(unidad: UnidadSuperficie, cantidad: number): string {
  return 'Número de ' + nombreDeUnidad(unidad, cantidad);
}

function formatarNumero(valor: number, decimales = 0): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
}

function formatarMetros(valor: number): string {
  return `${formatarNumero(valor, 2)} m`;
}

function leerNumero(valor: string): number {
  const numero = parseFloat(valor);
  return Number.isNaN(numero) ? 0 : numero;
}

interface SelectorUnidadProps {
  unidad: UnidadSuperficie;
  onUnidadChange: (unidad: UnidadSuperficie) => void;
}

function SelectorUnidad({ unidad, onUnidadChange }: SelectorUnidadProps) {
  return (
    <div class="campo">
      <label for="densidad-unidad">Unidad de medida</label>
      <select
        id="densidad-unidad"
        value={unidad}
        onChange={(evento) =>
          onUnidadChange(
            (evento.target as HTMLSelectElement).value as UnidadSuperficie,
          )
        }
      >
        {UNIDADES.map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.plural}
          </option>
        ))}
      </select>
    </div>
  );
}

interface OpcionesSiembraProps {
  titulo: string;
  opciones: OpcionesDensidad;
  destacada: boolean;
  /** Resalta el resultado cuando algún lado se sale del rango permitido. */
  alerta: boolean;
  /** Nombre de la unidad de superficie elegida por el usuario. */
  nombreUnidad: string;
  /**
   * 'principal' destaca el cálculo; 'informativa' lo muestra como dato
   * de referencia, sin llamar la atención.
   */
  variante: 'principal' | 'informativa';
}

function OpcionesSiembra({
  titulo,
  opciones,
  destacada,
  alerta,
  nombreUnidad,
  variante,
}: OpcionesSiembraProps) {
  const clases = [
    'opciones-sowing',
    variante,
    destacada ? 'destacada' : '',
    alerta ? 'fuera-de-rango' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article class={clases}>
      <h4>
        {titulo}
        {destacada && variante === 'principal' && (
          <span class="etiqueta-recomendada">Recomendada</span>
        )}
        {alerta && <span class="etiqueta-alerta">Fuera de rango</span>}
      </h4>
      <p class="distancias">
        <strong>{formatarMetros(opciones.distanciaPlantas)}</strong> entre plantas
        <span aria-hidden="true"> × </span>
        <strong>{formatarMetros(opciones.distanciaCalles)}</strong> entre calles
      </p>
      <p class="densidad-resultante">
        {formatarNumero(opciones.plantasPorUnidad)} plantas por {nombreUnidad}
      </p>
      <p class="area-planta">
        {formatarNumero(opciones.areaPorPlanta, 2)} m² por planta
      </p>
    </article>
  );
}

export function CalculadoraDensidad() {
  const [modo, setModo] = useState<Modo>('distancias');
  const [distanciaPlantas, setDistanciaPlantas] = useState(1.2);
  const [distanciaCalles, setDistanciaCalles] = useState(1.8);
  const [unidad, setUnidad] = useState<UnidadSuperficie>('hectareas');
  const [superficie, setSuperficie] = useState(1);
  const [plantasObjetivo, setPlantasObjetivo] = useState(1600);

  const superficieMetros2 = useMemo(
    () => convertirAMetros2(superficie, unidad),
    [superficie, unidad],
  );

  const resultadoDesdeDistancias = useMemo(
    () =>
      calcularDesdeDistancias(
        distanciaPlantas,
        distanciaCalles,
        superficieMetros2,
        unidad,
      ),
    [distanciaPlantas, distanciaCalles, superficieMetros2, unidad],
  );

  const resultadoDesdePlantas = useMemo(
    () => calcularDesdePlantas(plantasObjetivo, superficieMetros2, unidad),
    [plantasObjetivo, superficieMetros2, unidad],
  );

  const resultadoAreaNecesaria = useMemo(
    () =>
      calcularAreaNecesaria(plantasObjetivo, distanciaPlantas, distanciaCalles),
    [plantasObjetivo, distanciaPlantas, distanciaCalles],
  );

  const nombreUnidad = nombreDeUnidad(unidad, superficie);

  const superficieFueraDeRango =
    resultadoDesdePlantas.areaPorPlantaObjetivo > 0 &&
    !resultadoDesdePlantas.esAlcanzable;

  const distanciaExactaFueraDeRango =
    resultadoDesdePlantas.exacto.distanciaPlantas < DISTANCIA_MINIMA_METROS ||
    resultadoDesdePlantas.exacto.distanciaPlantas > DISTANCIA_MAXIMA_METROS ||
    resultadoDesdePlantas.exacto.distanciaCalles < DISTANCIA_MINIMA_METROS ||
    resultadoDesdePlantas.exacto.distanciaCalles > DISTANCIA_MAXIMA_METROS;

  return (
    <div class="calculadora-densidad">
      <div class="pestanas" role="tablist" aria-label="Modos de cálculo">
        {MODOS.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            role="tab"
            id={`pestana-${opcion.id}`}
            aria-selected={modo === opcion.id}
            aria-controls={`panel-${opcion.id}`}
            class={modo === opcion.id ? 'pestana activa' : 'pestana'}
            onClick={() => setModo(opcion.id)}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {/* ---------------- Modo 1: desde las distancias ---------------- */}
      <section
        role="tabpanel"
        id="panel-distancias"
        aria-labelledby="pestana-distancias"
        hidden={modo !== 'distancias'}
      >
        <div class="fila-campos">
          <div class="campo">
            <label for="densidad-plantas">Distancia entre plantas (m)</label>
            <input
              id="densidad-plantas"
              type="number"
              min="0.9"
              max="2"
              step="0.1"
              value={distanciaPlantas}
              onInput={(evento) =>
                setDistanciaPlantas(
                  leerNumero((evento.target as HTMLInputElement).value),
                )
              }
            />
          </div>

          <div class="campo">
            <label for="densidad-calles">Distancia entre calles (m)</label>
            <input
              id="densidad-calles"
              type="number"
              min="0.9"
              max="2"
              step="0.1"
              value={distanciaCalles}
              onInput={(evento) =>
                setDistanciaCalles(
                  leerNumero((evento.target as HTMLInputElement).value),
                )
              }
            />
          </div>
        </div>

        <div class="fila-campos">
          <SelectorUnidad unidad={unidad} onUnidadChange={setUnidad} />

          <div class="campo">
            <label for="densidad-superficie">
              {nombreDelCampo(unidad, superficie)}
            </label>
            <input
              id="densidad-superficie"
              type="number"
              min="0"
              step="0.01"
              value={superficie}
              onInput={(evento) =>
                setSuperficie(
                  leerNumero((evento.target as HTMLInputElement).value),
                )
              }
            />
          </div>
        </div>

        <div class="resultados" aria-live="polite">
          <h3>Resultado</h3>
          <dl class="lista-resultados">
            <dt>Superficie analizada</dt>
            <dd>
              {formatarNumero(superficie)} {nombreUnidad}
              <span class="secundario">
                ({formatarNumero(resultadoDesdeDistancias.superficieMetros2)} m²)
              </span>
            </dd>

            <dt>Plantas por {nombreUnidad}</dt>
            <dd>{formatarNumero(resultadoDesdeDistancias.plantasPorUnidad)}</dd>

            <dt>Superficie por planta</dt>
            <dd>
              {formatarNumero(resultadoDesdeDistancias.areaPorPlanta, 2)} m²
            </dd>

            <dt>Plantas totales en la superficie</dt>
            <dd>{formatarNumero(resultadoDesdeDistancias.plantasTotales)}</dd>
          </dl>
        </div>
      </section>

      {/* ---------------- Modo 2: desde las plantas ---------------- */}
      <section
        role="tabpanel"
        id="panel-plantas"
        aria-labelledby="pestana-plantas"
        hidden={modo !== 'plantas'}
      >
        <div class="fila-campos">
          <div class="campo">
            <label for="densidad-objetivo">Cantidad de plantas objetivo</label>
            <input
              id="densidad-objetivo"
              type="number"
              min="0"
              step="1"
              value={plantasObjetivo}
              onInput={(evento) =>
                setPlantasObjetivo(
                  leerNumero((evento.target as HTMLInputElement).value),
                )
              }
            />
          </div>

          <SelectorUnidad unidad={unidad} onUnidadChange={setUnidad} />
        </div>

        <div class="campo">
          <label for="densidad-superficie-plantas">
            {nombreDelCampo(unidad, superficie)}
          </label>
          <input
            id="densidad-superficie-plantas"
            type="number"
            min="0"
            step="0.01"
            value={superficie}
            onInput={(evento) =>
              setSuperficie(leerNumero((evento.target as HTMLInputElement).value))
            }
          />
        </div>

        <div class="resultados" aria-live="polite">
          <h3>Distancias sugeridas</h3>

          {superficieFueraDeRango && (
            <p class="aviso" role="status">
              Con {formatarNumero(plantasObjetivo)} plantas en{' '}
              {formatarNumero(superficie)} {nombreUnidad} harían falta{' '}
              {formatarMetros(resultadoDesdePlantas.exacto.distanciaPlantas)}{' '}
              entre plantas y{' '}
              {formatarMetros(resultadoDesdePlantas.exacto.distanciaCalles)}{' '}
              entre calles, y eso queda fuera del rango admitido de 0,90 m a
              2,00 m. La recomendación se ajusta a las medidas más densas
              permitidas: con 0,90 × 0,90 m caben{' '}
              {formatarNumero(resultadoDesdePlantas.plantasMaximasPosibles)}{' '}
              plantas, y con 2,00 × 2,00 m,{' '}
              {formatarNumero(resultadoDesdePlantas.plantasMinimasPosibles)}{' '}
              plantas.
            </p>
          )}

          <div class="rejilla-opciones">
            <OpcionesSiembra
              titulo="Cálculo de tu objetivo"
              opciones={resultadoDesdePlantas.exacto}
              destacada={false}
              alerta={distanciaExactaFueraDeRango}
              nombreUnidad={nombreUnidad}
              variante="principal"
            />
            <OpcionesSiembra
              titulo="Más cercano"
              opciones={resultadoDesdePlantas.recomendado}
              destacada={!distanciaExactaFueraDeRango}
              alerta={false}
              nombreUnidad={nombreUnidad}
              variante="principal"
            />
            <OpcionesSiembra
              titulo="Más densa"
              opciones={resultadoDesdePlantas.minima}
              destacada={false}
              alerta={false}
              nombreUnidad={nombreUnidad}
              variante="informativa"
            />
            <OpcionesSiembra
              titulo="Más abierta"
              opciones={resultadoDesdePlantas.maxima}
              destacada={false}
              alerta={false}
              nombreUnidad={nombreUnidad}
              variante="informativa"
            />
          </div>

          <dl class="lista-resultados">
            <dt>Superficie analizada</dt>
            <dd>
              {formatarNumero(superficie)} {nombreUnidad}
              <span class="secundario">
                ({formatarNumero(superficieMetros2)} m²)
              </span>
            </dd>

            <dt>Plantas de tu objetivo</dt>
            <dd>{formatarNumero(plantasObjetivo)}</dd>

            <dt>Con la distancia recomendada</dt>
            <dd>
              {formatarNumero(resultadoDesdePlantas.plantasConDistanciaRecomendada)}
              <span class="secundario">
                {resultadoDesdePlantas.desviacionPlantas === 0
                  ? 'coincide exactamente con el objetivo'
                  : `difieren en ${formatarNumero(
                      Math.abs(resultadoDesdePlantas.desviacionPlantas),
                    )} plantas (${formatarNumero(
                      Math.abs(resultadoDesdePlantas.desviacionPorcentaje),
                      1,
                    )} %)`}
              </span>
            </dd>

            <dt>Superficie que requeriría tu objetivo</dt>
            <dd>
              {formatarNumero(resultadoDesdePlantas.areaPorPlantaObjetivo, 2)} m²
              por planta
            </dd>

            <dt>Máximo posible con 0,90 × 0,90 m</dt>
            <dd>
              {formatarNumero(resultadoDesdePlantas.plantasMaximasPosibles)}{' '}
              plantas
            </dd>

            <dt>Mínimo posible con 2,00 × 2,00 m</dt>
            <dd>
              {formatarNumero(resultadoDesdePlantas.plantasMinimasPosibles)}{' '}
              plantas
            </dd>
          </dl>
        </div>
      </section>

      {/* ---------------- Modo 3: área necesaria ---------------- */}
      <section
        role="tabpanel"
        id="panel-area"
        aria-labelledby="pestana-area"
        hidden={modo !== 'area'}
      >
        <div class="campo">
          <label for="densidad-total-plantas">
            Cantidad de plantas a sembrar
          </label>
          <input
            id="densidad-total-plantas"
            type="number"
            min="0"
            step="1"
            value={plantasObjetivo}
            onInput={(evento) =>
              setPlantasObjetivo(
                leerNumero((evento.target as HTMLInputElement).value),
              )
            }
          />
        </div>

        <div class="fila-campos">
          <div class="campo">
            <label for="densidad-area-plantas">Distancia entre plantas (m)</label>
            <input
              id="densidad-area-plantas"
              type="number"
              min="0.9"
              max="2"
              step="0.1"
              value={distanciaPlantas}
              onInput={(evento) =>
                setDistanciaPlantas(
                  leerNumero((evento.target as HTMLInputElement).value),
                )
              }
            />
          </div>

          <div class="campo">
            <label for="densidad-area-calles">Distancia entre calles (m)</label>
            <input
              id="densidad-area-calles"
              type="number"
              min="0.9"
              max="2"
              step="0.1"
              value={distanciaCalles}
              onInput={(evento) =>
                setDistanciaCalles(
                  leerNumero((evento.target as HTMLInputElement).value),
                )
              }
            />
          </div>
        </div>

        <div class="resultados" aria-live="polite">
          <h3>Superficie necesaria</h3>
          <dl class="lista-resultados">
            <dt>Hectáreas</dt>
            <dd>{formatarNumero(resultadoAreaNecesaria.hectareas, 4)}</dd>

            <dt>Cuadras</dt>
            <dd>{formatarNumero(resultadoAreaNecesaria.cuadras, 2)}</dd>

            <dt>Acres</dt>
            <dd>{formatarNumero(resultadoAreaNecesaria.acres, 4)}</dd>

            <dt>Metros cuadrados</dt>
            <dd>{formatarNumero(resultadoAreaNecesaria.metros2)}</dd>
          </dl>
        </div>
      </section>
    </div>
  );
}
