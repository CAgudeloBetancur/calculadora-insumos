# Calculadora de Insumos

Aplicación web para calcular cuántos bultos de uno o varios insumos necesitas
comprar para realizar diferentes mezclas o combinaciones, para fertilizar un cultivo u otra actividad, a partir del número de plantas, la
dosis recomendada en gramos por planta y la proporción de la mezcla (partes).

Diseñada principalmente para uso en agricultura en Colombia: funciona en el celular, es
offline (PWA) y no requiere registro.

## Stack

- [Astro](https://astro.build) 7 — sitio estático con islas interactivas
- [Preact](https://preactjs.com) — isla de la calculadora
- [TypeScript](https://typescriptlang.org) (strict) — tipos en todo el repo
- [Vitest](https://vitest.dev) — pruebas unitarias
- PWA — manifest + service worker (offline)

## Comandos

| Comando               | Descripción                                  |
| :-------------------- | :------------------------------------------- |
| `npm install`         | Instala dependencias                         |
| `npm run dev`         | Servidor de desarrollo en `localhost:4321`   |
| `npm test`            | Corre las pruebas una vez                    |
| `npm run test:watch`  | Pruebas en modo watch                        |
| `npm run coverage`    | Reporte de cobertura                         |
| `npm run lint`        | ESLint                                       |
| `npm run format`      | Prettier                                     |
| `npm run build`       | Genera el sitio estático en `dist/`           |
| `npm run preview`     | Sirve `dist/` localmente                     |

## Estructura

```text
src/
├── components/     # Componentes Preact y Astro
│   ├── Calculadora.tsx       # Orquestador de estado
│   ├── MezclaForm.tsx         # Formulario editable
│   ├── ResultadosPanel.tsx    # Desglose de bultos
│   └── RegistrarSW.astro      # Registro del service worker
├── lib/            # Lógica pura (sin DOM)
│   ├── types.ts    # Modelo de datos
│   ├── calculo.ts  # Fórmulas de cálculo
│   └── calculo.spec.ts
├── pages/          # Rutas
├── scripts/        # Utilidades (generación de screenshots)
└── styles/         # CSS global
```

# Documentación

La documentación del ciclo de vida de desarrollo de software (SDLC) vive
en un vault de Obsidian del proyecto, bajo sldc/:
- 01-requisitos.md — glosario de dominio, alcance, historias de usuario, reglas de negocio
- 02-diseno.md — arquitectura, modelo de datos, flujo de cálculo
- 03-planificacion.md — hitos, backlog, riesgos
- 04-implementacion.md — convenciones de código, comandos
- 05-revision.md — estrategia de pruebas
- 06-despliegue.md — CI/CD y publicación
- 07-monitorizacion.md — métricas y manejo de errores

# Licencia

Este proyecto está bajo licencia [MIT](LICENSE)