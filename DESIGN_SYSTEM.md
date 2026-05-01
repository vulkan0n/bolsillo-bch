# Design System — BCH Wallet Redesign

> Documento de referencia para el rediseño visual de la wallet.
> Cualquier cambio de UI debe seguir estos lineamientos.
> Inspiración: estética minimalista tipo fintech moderna, paleta derivada del logo de la app.

---

## 1. Filosofía de diseño

**Minimalismo plano y aireado.**

- **Plano, no skeumórfico.** Sin sombras pesadas, sin gradientes innecesarios, sin texturas. Como mucho, una sombra sutil para elevar cards principales.
- **Aire antes que contenido.** El espacio en blanco es un elemento de diseño. Si una pantalla se siente apretada, sacar elementos antes de achicar padding.
- **Jerarquía por tamaño y peso, no por color.** El color se reserva para acciones y estados, no para decorar.
- **Una sola acción primaria por pantalla.** El usuario no debería tener que pensar cuál es el botón más importante.
- **Consistencia obsesiva.** Mismo radio, mismo padding, mismo tamaño de ícono en todos lados.

---

## 2. Paleta de colores

### 2.1 Celeste — color protagonista (rol "marca de fondo")

Usado en: header del Home, fondos de íconos de acción, fondos de pantallas destacadas.

| Token         | Light            | Dark            | Uso                                        |
|---------------|------------------|-----------------|--------------------------------------------|
| `sky-50`      | `#F0F7FF`        | `#0E1A2B`       | Fondo de círculos de íconos, chips suaves  |
| `sky-100`     | `#DCEBFB`        | `#15263D`       | Hover de íconos, fondos secundarios        |
| `sky-200`     | `#BCD9F5`        | `#1E3654`       | Bordes suaves, dividers de marca           |
| `sky-300`     | `#9BC7EE`        | `#2A4870`       | Acento medio                               |
| `sky-400`     | `#7AB3E5`        | `#3A5E8C`       | Hover de fondos celeste                    |
| `sky-500`     | `#5FA0DB`        | `#5FA0DB`       | Color celeste de marca (pleno)             |
| `sky-600`     | `#4585C4`        | `#7AB3E5`       | Texto sobre celeste claro, links           |
| `sky-700`     | `#356CA6`        | `#9BC7EE`       | Hover de links                             |

**Color de marca celeste:** `#5FA0DB` (token `sky-500`).
Derivado del bolsillo del logo, ajustado a una saturación más equilibrada que funcione tanto plano como en dark mode.

### 2.2 Verde BCH — color de acción

Usado en: botones primarios, montos positivos (recibido), badges de éxito, ícono de la app.

| Token         | Light            | Dark            | Uso                                        |
|---------------|------------------|-----------------|--------------------------------------------|
| `brand-50`    | `#E6F7F0`        | `#0E2A1F`       | Fondos suaves de éxito                     |
| `brand-100`   | `#C2EBD8`        | `#143A2C`       | Chips de "recibido"                        |
| `brand-200`   | `#94DCBC`        | `#1C5040`       | Bordes de cards de tx entrantes            |
| `brand-300`   | `#5EC99B`        | `#2D6E5A`       | —                                          |
| `brand-400`   | `#3BB783`        | `#3BB783`       | Hover de botón primario                    |
| `brand-500`   | `#23A06D`        | `#3BB783`       | **Botón primario, marca BCH**              |
| `brand-600`   | `#1B8459`        | `#5EC99B`       | Pressed state                              |
| `brand-700`   | `#156945`        | `#94DCBC`       | Texto sobre fondos brand-50                |

**Color de marca BCH:** `#23A06D` (token `brand-500`).
Derivado del verde menta del símbolo Bitcoin Cash del logo, ajustado para mejor contraste sobre blanco que el verde original.

### 2.3 Neutros — grises azulados (fríos, NO los beige actuales)

Usado en: textos, fondos, bordes, todo lo no-marca.

| Token        | Light       | Dark        | Uso                                              |
|--------------|-------------|-------------|--------------------------------------------------|
| `neutral-0`  | `#FFFFFF`   | `#0B0F14`   | Fondo de cards (light) / fondo app (dark)        |
| `neutral-50` | `#F7F8FA`   | `#11161D`   | Fondo de app (light) / fondo de cards (dark)     |
| `neutral-100`| `#EEF1F5`   | `#1A2029`   | Hover sobre cards, dividers gruesos              |
| `neutral-200`| `#E2E6EC`   | `#252C37`   | Bordes, dividers                                 |
| `neutral-300`| `#CBD2DB`   | `#333B47`   | Bordes activos, placeholders                     |
| `neutral-400`| `#9AA3B0`   | `#525B68`   | Texto muted, íconos secundarios                  |
| `neutral-500`| `#6B7280`   | `#7A8493`   | Texto secundario                                 |
| `neutral-600`| `#4B5563`   | `#9DA6B3`   | Texto body en dark                               |
| `neutral-700`| `#374151`   | `#C4CBD5`   | Texto principal en dark                          |
| `neutral-800`| `#1F2937`   | `#E1E5EB`   | Texto principal en light                         |
| `neutral-900`| `#0F172A`   | `#F2F4F7`   | Texto enfático, headings                         |

### 2.4 Semánticos

| Token       | Light       | Dark        | Uso                            |
|-------------|-------------|-------------|--------------------------------|
| `success`   | `#23A06D`   | `#3BB783`   | Igual que brand (mismo verde)  |
| `success-bg`| `#E6F7F0`   | `#0E2A1F`   | Fondo de toasts/banners éxito  |
| `error`     | `#DC2626`   | `#F87171`   | Errores, montos enviados       |
| `error-bg`  | `#FEE2E2`   | `#3B0F0F`   | Fondo de banners de error      |
| `warn`      | `#D97706`   | `#FBBF24`   | Warnings, pending              |
| `warn-bg`   | `#FEF3C7`   | `#3B2A0A`   | Fondo de banners de warn       |
| `info`      | `#5FA0DB`   | `#7AB3E5`   | Info (igual que sky-500)       |

### 2.5 Reglas de uso del color

- **Celeste** → estructura y marca. Headers, círculos de íconos, fondos destacados. Nunca botones primarios.
- **Verde brand** → acción y éxito. Botón principal, montos recibidos, confirmaciones. Reservado, no decorativo.
- **Neutros** → 80% de la app. Texto, fondos, bordes.
- **Rojo error** → solo errores reales y montos enviados (negativos).
- **Nunca usar verde y rojo juntos en el mismo componente** salvo en el historial de transacciones.

---

## 3. Tipografía

**Familia única:** `Inter` (variable font).
Reemplaza Archivo + Chivo Mono. Inter tiene variante tabular para los números, así que no necesitamos una fuente mono separada para los montos.

### Escala

| Token           | Tamaño    | Line-height | Peso     | Uso                              |
|-----------------|-----------|-------------|----------|----------------------------------|
| `text-display`  | 40px      | 44px        | 700      | Balance principal                |
| `text-h1`       | 28px      | 34px        | 700      | Títulos de pantalla              |
| `text-h2`       | 22px      | 28px        | 600      | Títulos de sección               |
| `text-h3`       | 18px      | 24px        | 600      | Subtítulos, nombres de cards     |
| `text-body`     | 16px      | 24px        | 400      | Texto general                    |
| `text-body-md`  | 16px      | 24px        | 500      | Texto general enfático           |
| `text-sm`       | 14px      | 20px        | 400      | Labels, metadata                 |
| `text-xs`       | 12px      | 16px        | 500      | Tags, captions, timestamps       |

### Reglas

- **Montos siempre con `font-variant-numeric: tabular-nums`** para que las cifras no bailen.
- **Nunca usar más de 3 tamaños tipográficos en una misma pantalla.**
- **Letter-spacing en mayúsculas:** los labels todo-mayúscula (raros, solo en tags) llevan `tracking-wider`.
- **Headings nunca en celeste o verde**, solo neutros.

---

## 4. Espaciado

Sistema base **4px**. Toda medida es múltiplo de 4.

| Token  | Px   | Uso                                     |
|--------|------|-----------------------------------------|
| `0.5`  | 2px  | Gaps mínimos                            |
| `1`    | 4px  | Gap entre ícono y label corto           |
| `2`    | 8px  | Padding interno chico                   |
| `3`    | 12px | Gap entre items de lista                |
| `4`    | 16px | Padding estándar de card                |
| `5`    | 20px | Padding de card grande                  |
| `6`    | 24px | Margen entre secciones                  |
| `8`    | 32px | Margen entre bloques mayores            |
| `10`   | 40px | Padding superior de pantalla            |
| `12`   | 48px | Separación grande                       |

### Reglas

- **Padding lateral de pantalla:** `px-5` (20px) en mobile.
- **Padding interno de card:** `p-5` (20px).
- **Gap entre cards:** `gap-3` (12px) o `gap-4` (16px).
- **Bottom padding del scroll:** siempre `pb-24` para que el bottom nav no tape contenido.

---

## 5. Border radius, bordes, sombras

### Radius

| Token         | Px   | Uso                                |
|---------------|------|------------------------------------|
| `rounded-sm`  | 6px  | Tags, chips chicos                 |
| `rounded-md`  | 10px | Inputs, botones chicos             |
| `rounded-lg`  | 14px | Botones medianos                   |
| `rounded-xl`  | 18px | Botones primarios, cards chicas    |
| `rounded-2xl` | 22px | Cards estándar                     |
| `rounded-3xl` | 28px | Cards principales (Home), modales  |
| `rounded-full`| 9999 | Círculos de ícono, avatars         |

### Bordes

- **Por defecto, sin borde.** La separación se hace con espacio o cambio de fondo.
- Cuando se necesita borde: `border border-neutral-200` en light, `border-neutral-200` en dark (que mapea a un gris oscuro).
- **Nunca borde de color de marca decorativo.**

### Sombras

- `shadow-none` por default.
- `shadow-card`: `0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)` — solo para cards principales del Home.
- `shadow-elevated`: `0 4px 16px rgba(15, 23, 42, 0.08)` — para modales y bottom sheets.
- **En dark mode, sombras prácticamente invisibles** — la elevación se sugiere con cambio de fondo (card más clara que el fondo).

---

## 6. Iconografía

- **Estilo:** line icons, stroke 1.5px, monocromos.
- **Librería recomendada:** `lucide-react` (ya tiene la estética correcta y es liviana).
- **Tamaños estándar:** 20px (inline), 24px (botones), 28px (íconos de acción en círculos), 40px (íconos hero).
- **Color por defecto:** `neutral-700` en light, `neutral-300` en dark.
- **Íconos de acción primaria** (los que van en círculos celeste): siempre en `sky-600` sobre fondo `sky-50`.

---

## 7. Componentes core

### 7.1 Button

**Variantes:**

| Variante        | Background        | Texto             | Borde                | Cuándo usar                   |
|-----------------|-------------------|-------------------|----------------------|-------------------------------|
| `primary`       | `brand-500`       | `white`           | —                    | Acción principal de pantalla  |
| `secondary`     | `neutral-100`     | `neutral-800`     | —                    | Acción secundaria             |
| `outline`       | `transparent`     | `neutral-800`     | `neutral-300`        | Acción terciaria              |
| `ghost`         | `transparent`     | `neutral-700`     | —                    | En toolbars, headers          |
| `destructive`   | `error`           | `white`           | —                    | Confirmar borrado, etc.       |

**Tamaños:**
- `sm`: `h-9 px-3 text-sm rounded-md`
- `md` (default): `h-12 px-5 text-body-md rounded-xl`
- `lg`: `h-14 px-6 text-body-md rounded-xl` — botón principal de pantalla, full width

**Reglas:**
- Una sola `primary` visible por pantalla.
- Botón de acción principal de pantalla (Enviar, Confirmar): siempre `lg`, full width, fijo abajo con `pb-safe`.

### 7.2 Card

```
className="bg-neutral-0 dark:bg-neutral-50 rounded-3xl p-5 shadow-card"
```

- Sin borde por defecto.
- En dark mode, la card es **más clara** que el fondo (no más oscura).
- Cards anidadas: la interna usa `bg-neutral-50` (light) / `bg-neutral-100` (dark) y `rounded-2xl`.

### 7.3 IconButton (círculo de acción tipo MP)

El componente clave del Home. Reemplaza los 4 botones grandes actuales.

```
<button className="flex flex-col items-center gap-2">
  <span className="w-14 h-14 rounded-full bg-sky-50 dark:bg-sky-50 flex items-center justify-center">
    <Icon className="w-6 h-6 text-sky-600" strokeWidth={1.5} />
  </span>
  <span className="text-sm text-neutral-700 dark:text-neutral-300">Enviar</span>
</button>
```

- Círculo: 56×56 (`w-14 h-14`).
- Ícono: 24×24, color `sky-600`.
- Label debajo, `text-sm`, neutro.
- Gap label-círculo: 8px.

### 7.4 Input

```
className="h-12 px-4 rounded-xl bg-neutral-50 border border-transparent
           focus:border-sky-500 focus:bg-neutral-0
           text-body text-neutral-900 placeholder:text-neutral-400"
```

- Fondo gris suave en reposo, blanco al enfocarse.
- Borde aparece solo al enfocarse, en celeste.
- Sin labels flotantes — label arriba en `text-sm text-neutral-600`.

### 7.5 ListItem (para historial de transacciones)

Estructura horizontal:

```
[Ícono circular 40px] [Título + subtítulo (timestamp)] [Monto + token]
```

- Sin bordes entre items, solo `gap-3` o divider muy sutil (`border-neutral-100`).
- Monto recibido: `text-brand-600` con `+` adelante.
- Monto enviado: `text-neutral-900` (NO rojo, el rojo es solo para errores) con `−` adelante.
- Timestamp en `text-xs text-neutral-400`.

### 7.6 BottomNavigation

Inspirada en MP pero más sobria:

- 4 items (no 5) — Home, Historial, Comerciante, Settings.
- Sin botón central destacado tipo MP. La acción "Enviar/Recibir" vive en el Home, no en la nav.
- Item activo: ícono `sky-600` + label `sky-600` `font-medium`.
- Item inactivo: ícono y label `neutral-400`.
- Background `neutral-0` con `border-t border-neutral-100`. Sin sombra.
- Altura: `h-16` + `pb-safe`.

### 7.7 Header de pantalla

Dos variantes:

**Variante "Home" (con identidad de marca):**
- Fondo `sky-50` (light) o `sky-50` mapeado dark.
- Logo a la izquierda, ícono de notificaciones/settings a la derecha.
- Sin texto "Hola, [nombre]" — minimalista.
- Se funde con la card del balance abajo.

**Variante "Subpantalla" (Send, Settings, etc.):**
- Fondo `neutral-50` (mismo que app).
- Botón back a la izquierda, título centrado en `text-h2`, acción a la derecha si la hay.
- Sin border bottom.

---

## 8. Patrones de pantalla

### 8.1 Pantalla Home

Estructura vertical, sin sidebar ni tabs:

```
┌──────────────────────────────┐
│  [logo]              [⚙]    │ ← Header celeste suave (sky-50)
│                              │
│  Balance disponible          │
│  $ 0,00345  BCH              │ ← text-display
│  ≈ ARS 12.450                │ ← text-sm muted
│                              │
│  [↑ Enviar] [↓ Recibir]      │ ← IconButtons en círculos celeste
│  [⚡ Pagar]  [🏪 Vender]     │
│                              │
├──────────────────────────────┤ ← Cambio a fondo neutral-50
│                              │
│  Movimientos     Ver todo →  │
│                              │
│  ┌────────────────────────┐ │
│  │ ↓ Recibido   +0.0001   │ │
│  │   hace 2h    BCH       │ │
│  └────────────────────────┘ │
│  ...                         │
└──────────────────────────────┘
[ Bottom nav ]
```

Diferencias vs. MP:
- **Sin tarjeta promo / banner** (la app de wallet no necesita venderle nada al usuario).
- **Solo 4 acciones**, no 8. Si aparecen más features, se agrupan dentro de un "Más" en bottom nav.
- **Sin notificaciones en el header** salvo que haya algo realmente urgente.

### 8.2 Send / Pay

- Una sola pantalla por paso, sin acordeón.
- Input grande del monto centrado, tipografía display.
- Conversión de moneda debajo, con toggle entre BCH/ARS.
- Botón primario fijo abajo `lg`, full width.

### 8.3 Receive

- QR centrado, grande (mínimo 280×280).
- Address debajo, con botón "Copiar" inline.
- Sin opciones de monto/expiry visibles por defecto, en un acordeón "Opciones avanzadas".

### 8.4 History

- Sin filtros visibles por defecto. Botón filtro arriba a la derecha.
- Items agrupados por día con headers `text-xs text-neutral-400 uppercase tracking-wider`.
- Tap en item → bottom sheet con detalle, no nueva pantalla.

---

## 9. Dark mode

**Filosofía:** "Off-black con cards más claras" (no negro puro, no inversión literal).

- Fondo de app: `#0B0F14` (token `neutral-0` en dark).
- Cards: `#11161D` (un escalón más claro que el fondo).
- Cards anidadas: `#1A2029`.
- El celeste se mantiene visible pero **menos saturado** en dark.
- El verde brand se aclara levemente para mantener contraste sobre fondos oscuros.
- **Sin bordes brillantes** — separación por contraste de luminosidad.

### Reglas de migración

Cuando un componente actualmente usa `bg-white`, mapear a `bg-neutral-0` (que automáticamente cambia con `dark:`).
Mismo criterio para todos los colores: usar siempre tokens, nunca valores HEX directos en JSX.

---

## 10. Animaciones

Mínimas, funcionales:

- **Transiciones de estado:** `transition-colors duration-150 ease-out`.
- **Apertura de modales:** slide-up desde abajo, 250ms.
- **Loading:** skeleton shimmer en `neutral-100`, no spinner salvo en acciones de red.
- **NO animaciones decorativas** (bouncing, pulsing, etc.) salvo el latido del balance al refrescar.

---

## 11. Migración desde el estado actual

Resumen de lo que va a cambiar:

| Elemento actual                         | Cambia a                                     |
|-----------------------------------------|----------------------------------------------|
| Verde lima `rgba(148,195,82,1)`         | Verde BCH `#23A06D` (brand-500)              |
| Neutrales beige/cálidos                 | Neutrales gris azulado (fríos)               |
| Sin color celeste                       | Celeste protagonista en headers e íconos     |
| Archivo + Chivo Mono                    | Inter (única familia, con tabular-nums)      |
| Botones grandes con texto e ícono       | IconButtons circulares + label debajo        |
| Bordes y dividers marcados              | Mayormente sin bordes, separación por aire   |
| Sombras (si hay)                        | Sombras casi imperceptibles                  |

**Orden de migración recomendado:**

1. Reemplazar `tailwind.config.cjs` (cambia colores y fonts globalmente).
2. Importar Inter desde Google Fonts en el `index.html` o `index.css`.
3. Crear/actualizar `Button.tsx` y crear `IconButton.tsx`.
4. Refactor de `MainLayout.jsx` y `BottomNavigation.tsx`.
5. Refactor de `WalletViewHome.tsx` (la pantalla más visible) usando los nuevos componentes.
6. Iterar pantalla por pantalla en este orden: Send → Receive → History → Settings → resto.

Cada PR debe tocar **una sola pantalla**. Cualquier cambio que afecte componentes globales va en su PR separado, antes de las pantallas que lo usan.
