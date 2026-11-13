import { useMemo, useState } from 'preact/hooks';
import {
  convertir,
  convertirCerezaAPergamino,
  convertirPergaminoACereza,
  obtenerUnidadesDeFamilia,
  type FamiliaUnidad,
} from '../lib/conversion';

// src/components/Conversores.tsx
// Conversores de unidades del agro. Cada familia de medidas tiene su
// propio bloque, independiente de los demás.

function formatarNumero(valor: number, decimales = 0): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
}

interface BloqueConversionProps {
  /** Título del bloque. */
  titulo: string;
  /** Texto de ayuda bajo el título. */
  descripcion: string;
  /** Familia de unidades que convierte este bloque. */
  familia: FamiliaUnidad;
  /** Valor inicial del campo. */
  valorInicial: number;
  /** Unidad inicial seleccionada. */
  unidadInicial: string;
}

function BloqueConversion({
  titulo,
  descripcion,
  familia,
  valorInicial,
  unidadInicial,
}: BloqueConversionProps) {
  const [valor, setValor] = useState(valorInicial);
  const [unidadOrigen, setUnidadOrigen] = useState(unidadInicial);

  const unidades = useMemo(() => obtenerUnidadesDeFamilia(familia), [familia]);

  const equivalentes = useMemo(() => {
    const unidadBase = unidades.find((unidad) => unidad.id === unidadOrigen);
    if (!unidadBase) return [];

    return unidades
      .filter((unidad) => unidad.id !== unidadOrigen)
      .map((unidad) => ({
        unidad,
        valor: convertir(valor, unidadOrigen, unidad.id),
      }));
  }, [unidades, unidadOrigen, valor]);

  function leerNumero(entrada: string): number {
    const numero = parseFloat(entrada);
    return Number.isNaN(numero) ? 0 : numero;
  }

  return (
    <section class="bloque-conversion" aria-labelledby={`titulo-${familia}`}>
      <h3 id={`titulo-${familia}`}>{titulo}</h3>
      <p class="descripcion-bloque">{descripcion}</p>

      <div class="campo-conversion">
        <div class="campo">
          <label for={`valor-${familia}`}>Cantidad</label>
          <input
            id={`valor-${familia}`}
            type="number"
            min="0"
            step="any"
            value={valor}
            onInput={(evento) =>
              setValor(leerNumero((evento.target as HTMLInputElement).value))
            }
          />
        </div>

        <div class="campo">
          <label for={`unidad-${familia}`}>Unidad</label>
          <select
            id={`unidad-${familia}`}
            value={unidadOrigen}
            onChange={(evento) =>
              setUnidadOrigen((evento.target as HTMLSelectElement).value)
            }
          >
            {unidades.map((unidad) => (
              <option key={unidad.id} value={unidad.id}>
                {unidad.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <dl class="equivalentes" aria-live="polite">
        {equivalentes.map((equivalente) => (
          <div key={equivalente.unidad.id} class="equivalente">
            <dt>{equivalente.unidad.nombre}</dt>
            <dd>
              {formatarNumero(equivalente.valor, equivalente.unidad.decimales)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Conversores() {
  const [kilogramosCereza, setKilogramosCereza] = useState(60);
  const [modoCafe, setModoCafe] = useState<'cereza' | 'pergamino'>('cereza');

  const cafe = useMemo(() => {
    if (modoCafe === 'cereza') {
      const pergamino = convertirCerezaAPergamino(kilogramosCereza);
      return {
        valorPrincipal: kilogramosCereza,
        unidadPrincipal: 'kg de café en cereza',
        equivalentes: [
          {
            nombre: 'kg de café pergamino seco',
            valor: pergamino,
            decimales: 2,
          },
          {
            nombre: 'arrobas de café pergamino seco',
            valor: pergamino / 12.5,
            decimales: 3,
          },
          {
            nombre: 'cargas de café pergamino seco',
            valor: pergamino / 125,
            decimales: 4,
          },
        ],
      };
    }

    const cereza = convertirPergaminoACereza(kilogramosCereza);
    return {
      valorPrincipal: kilogramosCereza,
      unidadPrincipal: 'kg de café pergamino seco',
      equivalentes: [
        {
          nombre: 'kg de café en cereza',
          valor: cereza,
          decimales: 2,
        },
        {
          nombre: 'arrobas de café en cereza',
          valor: cereza / 12.5,
          decimales: 3,
        },
        {
          nombre: 'cargas de café en cereza',
          valor: cereza / 125,
          decimales: 4,
        },
      ],
    };
  }, [kilogramosCereza, modoCafe]);

  return (
    <div class="conversores">
      <BloqueConversion
        titulo="Superficie"
        descripcion="Convierte entre hectáreas, cuadras, acres y metros cuadrados."
        familia="superficie"
        valorInicial={1}
        unidadInicial="hectareas"
      />

      <BloqueConversion
        titulo="Peso"
        descripcion="Convierte entre kilogramos, arrobas, cargas y bultos."
        familia="peso"
        valorInicial={50}
        unidadInicial="arrobas"
      />

      <BloqueConversion
        titulo="Volumen"
        descripcion="Convierte entre litros, mililitros y galones, útiles para foliares y fumigadoras."
        familia="volumen"
        valorInicial={20}
        unidadInicial="litros"
      />

      <section class="bloque-conversion" aria-labelledby="titulo-cafe">
        <h3 id="titulo-cafe">Café en cereza y café pergamino</h3>
        <p class="descripcion-bloque">
          Estima cuántos kilos de café en cereza necesitas para obtener una
          cantidad de café pergamino seco, o al revés.
        </p>

        <div class="campo-conversion">
          <div class="campo">
            <label for="valor-cafe">Cantidad</label>
            <input
              id="valor-cafe"
              type="number"
              min="0"
              step="any"
              value={kilogramosCereza}
              onInput={(evento) => {
                const numero = parseFloat((evento.target as HTMLInputElement).value);
                setKilogramosCereza(Number.isNaN(numero) ? 0 : numero);
              }}
            />
          </div>

          <div class="campo">
            <label for="modo-cafe">Unidad</label>
            <select
              id="modo-cafe"
              value={modoCafe}
              onChange={(evento) =>
                setModoCafe(
                  (evento.target as HTMLSelectElement).value as 'cereza' | 'pergamino',
                )
              }
            >
              <option value="cereza">kg de café en cereza</option>
              <option value="pergamino">kg de café pergamino seco</option>
            </select>
          </div>
        </div>

        <dl class="equivalentes" aria-live="polite">
          {cafe.equivalentes.map((equivalente) => (
            <div key={equivalente.nombre} class="equivalente">
              <dt>{equivalente.nombre}</dt>
              <dd>
                {formatarNumero(equivalente.valor, equivalente.decimales)}
              </dd>
            </div>
          ))}
        </dl>

        <p class="nota-bloque">
          <strong>Referencia aproximada.</strong> Se usa un factor de 4,8 a 1,
          que corresponde al beneficio por lavado: 60 kg de café en cereza
          rinden aproximadamente una arroba (12,5 kg) de café pergamino seco.
          El rendimiento real varía según el método de beneficio y el estado
          de la cereza, así que esta cifra sirve como referencia y no como
          una medida exacta. Las tablas oficiales de la Federación Nacional
          de Cafeteros y de Cenicafé tienen los factores por método de
          beneficio.
        </p>
      </section>
    </div>
  );
}
