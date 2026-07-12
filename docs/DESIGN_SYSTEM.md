# Design System — Bolsillo (BCH Wallet)

> Documento de referencia para el rediseño visual de la wallet.
> Cualquier cambio de UI debe seguir estos lineamientos.
> Inspiración: estética minimalista con metáfora visual de "bolsillo" como elemento de marca.

---

## 1. Identidad y filosofía

### Nombre
La app se llama **Bolsillo**. La metáfora del bolsillo es el corazón de la marca: tu BCH vive en tu bolsillo, accesible y tuyo.

### Filosofía de diseño

**Minimalismo plano con un elemento de marca distintivo.**

- **Plano, no skeumórfico.** Sin sombras pesadas, sin gradientes, sin texturas.
- **Aire antes que contenido.** El espacio en blanco es un elemento de diseño.
- **Jerarquía por tamaño y peso, no por color.**
- **Una sola acción primaria por pantalla.**
- **Consistencia obsesiva.** Mismo radio, mismo padding, mismo tamaño de ícono en todos lados.
- **El bolsillo es exclusivo del Home.** Es el momento de marca; el resto de la app es funcional y sobrio.

---

## 2. Paleta de colores

### 2.1 Verde BCH — protagonista (rol "marca y acción")

Usado en: ícono/moneda BCH, botones primarios, montos recibidos, nombre "Bolsillo" en header, indicador activo de bottom nav.

| Token         | Light            | Dark            | Uso                                        |
|---------------|------------------|-----------------|--------------------------------------------|
| `brand-50`    | `#E6F7F0`        | `#0E2A1F`       | Fondos suaves de éxito, badges             |
| `brand-100`   | `#C2EBD8`        | `#143A2C`       | Chips de "recibido"                        |
| `brand-200`   | `#94DCBC`        | `#1C5040`       | Bordes de cards de tx entrantes            |
| `brand-300`   | `#5EC99B`        | `#2D6E5A`       | Acento medio                               |
| `brand-400`   | `#3BB783`        | `#3BB783`       | Hover de botón primario                    |
| `brand-500`   | `#23A06D`        | `#3BB783`       | **Botón primario, marca BCH, moneda**      |
| `brand-600`   | `#1B8459`        | `#5EC99B`       | Pressed state, header "Bolsillo"           |
| `brand-700`   | `#156945`        | `#94DCBC`       | Texto sobre fondos brand-50                |

**Color de marca BCH:** `#23A06D` (token `brand-500`).

### 2.2 Celeste — acento de marca (rol "fondo del bolsillo")

Usado en: fondo del componente PocketBalance en Home, secundariamente en chips informativos. **NO se usa en headers, botones, ni elementos estructurales.**

| Token         | Light            | Dark            | Uso                                        |
|---------------|------------------|-----------------|--------------------------------------------|
| `sky-50`      | `#F0F5FF`        | `#0E1A2B`       | —                                          |
| `sky-100`     | `#E2EAFB`        | `#15263D`       | **Fondo del Bolsillo (light/dark)**        |
| `sky-200`     | `#C9D5F5`        | `#1E3654`       | Borde punteado del Bolsillo (light)        |
| `sky-300`     | `#9BC7EE`        | `#2A4870`       | —                                          |
| `sky-400`     | `#7AB3E5`        | `#3A5E8C`       | Borde punteado del Bolsillo (dark)         |
| `sky-500`     | `#5FA0DB`        | `#5FA0DB`       | Texto "TU BOLSILLO"                        |
| `sky-600`     | `#4585C4`        | `#7AB3E5`       | —                                          |

### 2.3 Neutros — gris azulado

| Token        | Light       | Dark        | Uso                                              |
|--------------|-------------|-------------|--------------------------------------------------|
| `neutral-0`  | `#FFFFFF`   | `#0B1018`   | Fondo de cards (light) / fondo app (dark)        |
| `neutral-25` | `#FBFCFD`   | `#0E131C`   | Fondo de app (light)                             |
| `neutral-50` | `#F7F8FA`   | `#131923`   | Fondo app (light) / cards (dark)                 |
| `neutral-100`| `#EEF1F5`   | `#1A2231`   | Hover, dividers gruesos                          |
| `neutral-200`| `#E2E6EC`   | `#252E3F`   | Bordes, dividers, círculos de íconos de acción   |
| `neutral-300`| `#CBD2DB`   | `#333D50`   | Bordes activos, placeholders                     |
| `neutral-400`| `#9AA3B0`   | `#525B68`   | Texto muted, íconos secundarios                  |
| `neutral-500`| `#6B7280`   | `#7A8493`   | Texto secundario                                 |
| `neutral-600`| `#4B5563`   | `#9DA6B3`   | Texto body en dark                               |
| `neutral-700`| `#374151`   | `#C4CBD5`   | Texto principal en dark, íconos                  |
| `neutral-800`| `#1F2937`   | `#E1E5EB`   | Texto principal en light                         |
| `neutral-900`| `#0F172A`   | `#F2F4F7`   | Texto enfático, balance, headings                |

### 2.4 Semánticos

| Token       | Light       | Dark        | Uso                            |
|-------------|-------------|-------------|--------------------------------|
| `success`   | `#23A06D`   | `#3BB783`   | Igual que brand                |
| `success-bg`| `#E6F7F0`   | `#0E2A1F`   | Fondos de toasts/banners éxito |
| `error`     | `#DC2626`   | `#F87171`   | Errores                        |
| `error-bg`  | `#FEE2E2`   | `#3B0F0F`   | Fondos de banners de error     |
| `warn`      | `#D97706`   | `#FBBF24`   | Warnings, pending              |
| `warn-bg`   | `#FEF3C7`   | `#3B2A0A`   | Fondos de banners de warn      |

### 2.5 Reglas de uso del color

- **Verde brand** → marca, acción primaria, estados de éxito, montos recibidos.
- **Celeste** → exclusivamente como fondo del componente Bolsillo en Home. No usar como color estructural en otras pantallas.
- **Neutros** → 80% de la app.
- **Rojo error** → solo errores reales. Los montos enviados van en `neutral-900`, NO en rojo.
- **Verde y rojo nunca juntos** salvo en historial (recibido vs error real).

---

## 3. Tipografía

**Familia única:** `Inter` (variable font), pesos 400 / 500 / 600 / 700.
Reemplaza Archivo + Chivo Mono. Inter con `tabular-nums` cubre los montos.

### Escala

| Token             | Tamaño  | Line-height | Peso  | Uso                              |
|-------------------|---------|-------------|-------|----------------------------------|
| `text-display`    | 48px    | 52px        | 700   | Balance principal del Home       |
| `text-display-sm` | 36px    | 40px        | 700   | Montos en pantallas Send/Receive |
| `text-h1`         | 28px    | 34px        | 700   | Títulos de pantalla              |
| `text-h2`         | 22px    | 28px        | 600   | Títulos de sección               |
| `text-h3`         | 18px    | 24px        | 600   | Subtítulos, nombres en lista     |
| `text-body-md`    | 16px    | 24px        | 500   | Texto enfático                   |
| `text-body`       | 16px    | 24px        | 400   | Texto general                    |
| `text-sm`         | 14px    | 20px        | 400   | Labels, metadata                 |
| `text-xs`         | 12px    | 16px        | 500   | Tags, captions, timestamps       |
| `text-overline`   | 11px    | 16px        | 600   | "TU BOLSILLO", letter-spacing wide |

### Reglas

- **Montos siempre con `font-variant-numeric: tabular-nums`**.
- **Balance principal**: 48px, peso 700, color `neutral-900`. Símbolo `$` en `neutral-400`.
- **"TU BOLSILLO"**: `text-overline`, mayúsculas, color `sky-500`, `tracking-wider`.
- **Nunca más de 3 tamaños tipográficos por pantalla.**

---

## 4. Espaciado

Sistema base **4px**.

| Token  | Px   | Uso                                     |
|--------|------|-----------------------------------------|
| `1`    | 4px  | Gap mínimo                              |
| `2`    | 8px  | Padding interno chico                   |
| `3`    | 12px | Gap entre items de lista                |
| `4`    | 16px | Padding estándar de card                |
| `5`    | 20px | Padding de pantalla                     |
| `6`    | 24px | Margen entre secciones                  |
| `8`    | 32px | Margen entre bloques mayores            |
| `10`   | 40px | Padding superior de pantalla            |

### Reglas

- **Padding lateral de pantalla:** `px-5` (20px).
- **Padding interno de card:** `p-4` o `p-5`.
- **Bottom padding del scroll:** `pb-24`.

---

## 5. Border radius, bordes, sombras

### Radius

| Token         | Px   | Uso                                |
|---------------|------|------------------------------------|
| `rounded-md`  | 10px | Inputs, botones chicos             |
| `rounded-lg`  | 14px | Botones medianos                   |
| `rounded-xl`  | 18px | Botones primarios                  |
| `rounded-2xl` | 22px | Cards, items de historial          |
| `rounded-3xl` | 28px | Bolsillo, modales, cards grandes   |
| `rounded-full`| 9999 | Círculos                           |

### Bordes

- **Por defecto sin borde.**
- Bolsillo: `border-2 border-dashed border-sky-200` (light) / `border-sky-400/40` (dark).
- Action buttons del Home: `border border-neutral-200`.
- Items de historial: sin borde.

### Sombras

- `shadow-none` por default.
- **Sin sombras en el Bolsillo.**
- `shadow-card` solo modales/bottom sheets.

---

## 6. Iconografía

- **Estilo:** line icons, stroke 1.75-2px, monocromos.
- **Librería:** `lucide-react`.
- **Tamaños:** 20px (inline, lista), 24px (botones de acción), 28px (íconos hero).
- **Color por defecto:** `neutral-700` en light, `neutral-300` en dark.
- **Action buttons del Home:** `neutral-800` en light, `neutral-100` en dark.

---

## 7. Componentes core

### 7.1 PocketBalance — el componente de marca

**El componente más importante de la app. Solo vive en `WalletViewHome.tsx`. NO reutilizar en otras pantallas.**

Estructura:

```
        ┌──────┐                  ← Moneda BCH (verde, círculo sólido)
        │  Ƀ   │                     Sobresale por arriba del bolsillo
        └──┬───┘
   ╭───────┴────────────╮
   │                    │           ← Bolsillo: rounded-3xl, bg-sky-100,
   │    TU BOLSILLO     │             border-2 border-dashed border-sky-200
   │                    │
   │   $ 1,247.30       │           ← Balance: text-display, neutral-900
   │   0.03867 BCH      │           ← Sub: text-sm, neutral-400, tabular
   │                    │
   ╰────────────────────╯
```

Specs:
- Wrapper: `relative pt-7` (deja espacio para que la moneda sobresalga).
- Bolsillo: `bg-sky-100`, `border-2 border-dashed border-sky-200 dark:border-sky-400/40`, `rounded-3xl`, `px-6 py-7`.
- Moneda: `absolute top-0 left-1/2 -translate-x-1/2`, `w-14 h-14 rounded-full bg-brand-500`, símbolo BCH blanco adentro centrado.
- Label "TU BOLSILLO": `text-overline text-sky-500 text-center tracking-wider mt-2`.
- Balance: `$` en `text-3xl text-neutral-400 mr-1 font-medium`, número en `text-display text-neutral-900 tabular-nums`.
- Sub BCH: `text-sm text-neutral-400 mt-1 tabular-nums text-center`.

### 7.2 ActionButton (Home — Recibir/Enviar/Escanear)

```
[Círculo verde suave con borde, ícono adentro]
            label
```

- Container: `flex flex-col items-center gap-2`.
- Círculo: `w-14 h-14 rounded-full`
  - Light: `bg-brand-50`, `border-[1.5px] border-brand-300`
  - Dark: `bg-brand-900`, `border-[1.5px] border-brand-700`
- Ícono: 24×24, strokeWidth 1.75
  - Light: `text-brand-700`
  - Dark: `text-brand-200`
- Label: `text-sm text-neutral-700 dark:text-neutral-300`, mt-2.
- Active: `active:bg-brand-100 dark:active:bg-brand-800`, `active:scale-[0.98] transition-all duration-100`.
- Layout en Home: `grid grid-cols-3 gap-4`.

### 7.3 Button (botones rectangulares)

| Variante      | Background    | Texto         | Borde         | Cuándo usar                   |
|---------------|---------------|---------------|---------------|-------------------------------|
| `primary`     | `brand-500`   | `white`       | —             | Acción principal de pantalla  |
| `secondary`   | `neutral-100` | `neutral-800` | —             | Acción secundaria             |
| `outline`     | `transparent` | `neutral-800` | `neutral-300` | Acción terciaria              |
| `ghost`       | `transparent` | `neutral-700` | —             | Toolbars, headers             |
| `destructive` | `error`       | `white`       | —             | Confirmar borrado             |

**Tamaños:**
- `sm`: h-9, px-3, rounded-md, text-sm, font-medium
- `md` (default): h-12, px-5, rounded-xl, text-body-md, font-medium
- `lg`: h-14, px-6, rounded-xl, text-base, font-semibold — típicamente fullWidth (CTA principal de pantalla)

**Reglas:**
- Una `primary` visible por pantalla.
- Botón principal de subpantalla: `lg`, fullWidth, fijo abajo con `pb-safe`.

### 7.4 Card

```
className="bg-neutral-0 dark:bg-neutral-50 rounded-2xl p-4"
```

- Sin borde por defecto. En dark, card más clara que fondo.

### 7.5 Input

```
className="h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-50 
           border border-transparent
           focus:border-brand-500 focus:bg-neutral-0
           text-body text-neutral-900 placeholder:text-neutral-400"
```

- **Borde de foco en verde brand**, NO celeste.
- Label arriba en `text-sm text-neutral-600`.

### 7.6 TransactionItem

```
[Ícono circular 40px] [Nombre + timestamp] [Monto fiat / Monto BCH]
```

- Container: `flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-0 dark:bg-neutral-50`.
- Ícono recibido: círculo `bg-brand-50`, flecha down en `brand-600 dark:brand-300`.
- Ícono enviado: círculo `bg-neutral-100`, flecha up en `neutral-600 dark:neutral-400`.
- Nombre: `text-body-md text-neutral-900`.
- Timestamp: `text-xs text-neutral-400`.
- Monto fiat (derecha): `text-body-md tabular-nums`.
  - Recibido: `text-brand-600 dark:text-brand-400`, prefijo `+`.
  - Enviado: `text-neutral-900`, prefijo `−`.
- Monto BCH debajo: `text-xs text-neutral-400 tabular-nums`, también con `+` o `−`.

### 7.7 BottomNavigation

- **3 items**: Inicio, Movimientos, Ajustes.
- Item activo: ícono + label en **`brand-600 dark:brand-400`**.
- Item inactivo: `neutral-400`.
- Background `neutral-0 dark:neutral-50`, `border-t border-neutral-100`.
- Altura: `h-16` + `pb-safe`.
- Sin botón central destacado.

### 7.8 Header

**Variante "Home":**
- Fondo `neutral-25 dark:neutral-25` (mismo que app).
- Izquierda: ícono mini de bolsillo (24px) + texto "Bolsillo" en `text-h3 text-brand-600 dark:text-brand-400 font-semibold`.
- Derecha: avatar circular `w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center`.
- Padding: `px-5 pt-safe pb-3`.

**Variante "Subpantalla":**
- Fondo igual que app.
- Izquierda: chevron-left, `neutral-700`, 24px.
- Centro: título `text-h2 text-neutral-900`.
- Derecha: opcional acción (ghost button).

---

> **Nota sobre tokens `sky-*` en dark mode:** Los colores `sky-*` del
> config son valores estáticos (no tienen variante automática por dark
> mode). Para el efecto "azul navy oscuro" del bolsillo en dark mode,
> usar `dark:bg-sky-900` (`#1B3A5C`) y `dark:border-sky-700`
> (`#356CA6`) explícitamente. NO asumir que `sky-100` cambia
> automáticamente en dark — no lo hace.

---

## 8. Patrones de pantalla

### 8.1 Home

```
┌──────────────────────────────────┐
│  [bolsillo] Bolsillo        [A]  │
│                                  │
│           ┌──────┐               │
│           │  Ƀ   │               │
│           └──┬───┘               │
│      ╭───────┴──────────╮        │
│      │  TU BOLSILLO     │        │
│      │  $ 1,247.30      │        │
│      │  0.03867 BCH     │        │
│      ╰──────────────────╯        │
│                                  │
│   [↑]      [↓]      [⊞]          │
│  Enviar  Recibir  Escanear       │
│                                  │
│  Esta semana                     │
│  ┌────────────────────────────┐  │
│  │ ↓ María L.    +$24.50      │  │
│  │   Hace 2h     +0.00076 BCH │  │
│  └────────────────────────────┘  │
│  ...                             │
└──────────────────────────────────┘
[Inicio] [Movimientos] [Ajustes]
```

### 8.2 Send / Pay

- Subpantalla con header de back.
- Input grande del monto centrado, `text-display-sm`.
- Toggle BCH ↔ fiat debajo.
- Campo "Para" abajo.
- Botón primario `lg` fullWidth fijo en bottom.

### 8.3 Receive

- QR centrado, mínimo 280×280.
- Address debajo, monoespaciada, con botón "Copiar" inline.
- Acordeón "Opciones avanzadas".

### 8.4 Escanear

- Pantalla full-screen con cámara.
- Marco de scan en el centro (esquinas redondeadas, líneas verde brand).
- Overlay oscuro alrededor.
- Botón de cerrar arriba a la derecha.

### 8.5 Movimientos (History)

- Lista agrupada por día con headers `text-xs text-neutral-400 uppercase tracking-wider`.
- Cada item es un `TransactionItem`.
- Tap → bottom sheet con detalle.

### 8.6 Ajustes (Settings)

- Lista de filas con ícono izquierdo, label, chevron derecho.
- Agrupadas por sección.

---

## 9. Dark mode

**Filosofía:** "Off-black con cards más claras". Sin negro puro, sin inversión literal.

- Fondo de app: `#0B1018`.
- Cards: `#131923` (un escalón más claro).
- Cards anidadas: `#1A2231`.
- El bolsillo en dark usa `bg-sky-100` (que mapea a `#15263D` — azul oscuro saturado).
- Borde punteado en dark: `border-sky-400/40`.
- Verde brand se aclara levemente (`brand-400` en lugar de `brand-500`).
- **Sin sombras en dark.**

---

## 10. Animaciones

- **Transiciones de estado:** `transition-colors duration-150 ease-out`.
- **Tap feedback:** `active:scale-[0.98] transition-transform duration-100`.
- **Apertura de modales:** slide-up desde abajo, 250ms.
- **Loading:** skeleton shimmer en `neutral-100`.
- **Sin animaciones decorativas.**

---

## 11. Migración desde el estado actual

Resumen de cambios:

| Elemento actual                         | Cambia a                                              |
|-----------------------------------------|-------------------------------------------------------|
| Verde lima `rgba(148,195,82,1)`         | Verde BCH `#23A06D` (brand-500)                       |
| Neutrales beige/cálidos                 | Neutrales gris azulado                                |
| Sin elemento de marca distintivo        | Componente PocketBalance en Home                      |
| Header genérico                         | Header con "Bolsillo" en verde + avatar               |
| Archivo + Chivo Mono                    | Inter (única familia, tabular-nums)                   |
| 4 botones de acción                     | 3 botones (Enviar/Recibir/Escanear)                   |
| Botones grandes con texto e ícono       | ActionButton circular blanco con borde                |
| Bordes y dividers marcados              | Mayormente sin bordes, separación por aire            |
| Bottom nav 4-5 items                    | Bottom nav 3 items (Inicio/Movimientos/Ajustes)       |

**Orden de migración:**

1. Reemplazar `tailwind.config.cjs`.
2. Importar Inter en index.html / index.css.
3. Crear `PocketBalance.tsx` (componente nuevo, solo Home).
4. Crear `ActionButton.tsx`.
5. Refactor de `Button.tsx`.
6. Refactor de `BottomNavigation` (3 items + colores brand).
7. Refactor de `MainLayout` y header del Home.
8. Refactor de `WalletViewHome.tsx` integrando todo.
9. Iterar pantallas: Send → Receive → Escanear (nueva) → Movimientos → Ajustes → resto.

Cada PR toca **una sola pantalla o componente**.
