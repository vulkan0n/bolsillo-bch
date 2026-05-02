# Plan de migración — Bolsillo redesign

> Cada paso es un PR / commit independiente.
> NUNCA pidas a Claude Code que haga varios pasos juntos.

---

## Paso 0 — Preparación (vos, sin Claude Code)

```bash
git checkout main
git pull
git checkout -b redesign-v2
git add .
git commit -m "chore: punto de partida del redesign"
```

Copiar `DESIGN_SYSTEM.md` a la raíz del repo (o a `docs/`).

---

## Paso 1 — Reemplazar tailwind.config.cjs

**Prompt para Claude Code:**

```
Tengo un nuevo tailwind.config.cjs que reemplaza el actual.

1. Reemplazá el contenido actual de tailwind.config.cjs por el archivo que voy 
   a pegarte abajo.
2. Buscá referencias hardcoded a colores HEX o RGBA en todo el codebase 
   (rgba(148,195,82...) por ejemplo). Listámelas, NO las modifiques.
3. Corré `npm run build` y reportá si hay errores.

[pegar contenido del nuevo tailwind.config.cjs]
```

---

## Paso 2 — Importar Inter

**Prompt para Claude Code:**

```
Necesito reemplazar Archivo + Chivo Mono por Inter.

1. Buscá dónde se importan las fuentes actuales (index.html, index.css, 
   main.css o similares).
2. Reemplazalas por Inter desde Google Fonts. Pesos: 400, 500, 600, 700, con 
   display=swap.
3. Asegurate de que en el CSS global haya:
   .tabular { font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; }
   Para usar `className="tabular"` en montos.
4. Reportá qué archivos modificaste.
```

---

## Paso 3 — Crear PocketBalance.tsx (componente nuevo, el de marca)

**Prompt para Claude Code:**

```
Necesito crear un componente nuevo: src/components/atoms/PocketBalance.tsx

Es el componente de marca de la app. Es un "bolsillo" punteado con una 
moneda BCH circular saliendo por arriba. Solo va a usarse en el Home.

Specs exactas:

Estructura (de arriba a abajo):
1. Wrapper relativo con padding-top de 28px (pt-7) para dejar espacio a la 
   moneda que sobresale.
2. Moneda BCH: círculo absoluto, top:0, left:50%, translate-x-(-50%):
   - w-14 h-14 (56px), rounded-full, bg-brand-500
   - Adentro centrado, el símbolo BCH (Ƀ) en blanco, font-bold, text-2xl
   - Si el proyecto ya tiene un componente BchIcon o similar, usalo. Si no,
     usá texto "Ƀ" (U+0243).
3. Bolsillo (el rectángulo punteado):
   - bg-sky-100 dark:bg-sky-100
   - border-2 border-dashed border-sky-200 dark:border-sky-400/40
   - rounded-3xl
   - px-6 py-7
   - Adentro tres elementos centrados verticalmente:
     a) Label "TU BOLSILLO":
        - text-overline (definido en el config), uppercase
        - text-sky-500, tracking-wider, text-center, mb-3
     b) Balance fiat:
        - Container flex items-baseline justify-center
        - Símbolo "$": text-3xl text-neutral-400 mr-1 font-medium
        - Número: text-display text-neutral-900 dark:text-neutral-900 tabular
     c) Sub BCH:
        - text-sm text-neutral-400 mt-1 tabular text-center

Props:
- fiatAmount: string (ya formateado, ej "1,247.30")
- fiatCurrency: string (ej "$") — default "$"
- bchAmount: string (ya formateado, ej "0.03867")
- label?: string — default "TU BOLSILLO"

NO acepta onClick ni es interactivo. Es un componente puramente de display.

Hacelo en TypeScript con tipos exportados. Mostrame el archivo final.
```

---

## Paso 4 — Crear ActionButton.tsx (los 3 círculos del Home)

**Prompt para Claude Code:**

```
Necesito crear un componente nuevo: src/components/atoms/ActionButton.tsx

Es un botón circular blanco con un ícono y un label debajo. Reemplaza los 
botones grandes actuales del Home. Se van a usar 3: Enviar, Recibir, Escanear.

Specs:

- Container: <button> con flex flex-col items-center gap-2.
- Círculo:
  - w-14 h-14 (56px), rounded-full
  - bg-neutral-0 dark:bg-neutral-50 (en dark queda más claro que el fondo)
  - border border-neutral-200 dark:border-neutral-200
  - flex items-center justify-center
- Ícono:
  - 24x24 (w-6 h-6)
  - color: text-neutral-800 dark:text-neutral-100
  - strokeWidth=1.75
  - usar lucide-react (instalar si no está)
- Label: text-sm text-neutral-700 dark:text-neutral-300, mt-2.
- Estados:
  - active:bg-neutral-50 dark:active:bg-neutral-100
  - active:scale-[0.98]
  - transition-all duration-100
  - disabled:opacity-50 disabled:cursor-not-allowed
- Focus visible: outline-2 outline-brand-500 outline-offset-2

Props:
- icon: ReactNode
- label: string
- onClick: () => void
- disabled?: boolean
- ariaLabel?: string (default = label)

Hacelo en TypeScript con tipos exportados.
```

---

## Paso 5 — Refactor de Button.tsx

**Prompt para Claude Code:**

```
Necesito actualizar src/components/atoms/Button.tsx con las variantes del 
DESIGN_SYSTEM.md sección 7.3.

Variantes (prop `variant`):
- primary (default): bg-brand-500 text-white, hover:bg-brand-400, 
  active:bg-brand-600
- secondary: bg-neutral-100 text-neutral-800, hover:bg-neutral-200
- outline: bg-transparent border border-neutral-300 text-neutral-800, 
  hover:bg-neutral-50
- ghost: bg-transparent text-neutral-700, hover:bg-neutral-100
- destructive: bg-error text-white, hover:bg-error-dark

Tamaños (prop `size`):
- sm: h-9 px-3 text-sm rounded-md
- md (default): h-12 px-5 text-body-md rounded-xl
- lg: h-14 px-6 text-body-md rounded-xl

Props extra:
- fullWidth?: boolean → agrega w-full

Comunes:
- font-medium
- transition-colors duration-150
- focus-visible:outline-2 focus-visible:outline-brand-500 outline-offset-2
- disabled:opacity-50 disabled:cursor-not-allowed
- active:scale-[0.98] transition-transform

ANTES de tocar:
1. Mostrame las props actuales del Button para mantener compatibilidad.
2. Listá todos los archivos que importan Button.
3. Esperá confirmación antes de cambiar.
```

---

## Paso 6 — Refactor de BottomNavigation

**Prompt para Claude Code:**

```
Refactor de BottomNavigation siguiendo DESIGN_SYSTEM.md sección 7.7.

Cambios:
- 3 items: Inicio, Movimientos, Ajustes (si hay más, eliminá los extras o
  movelos a "Más" dentro de Ajustes — pero primero mostrame qué items hay
  ahora y propongo la migración antes de tocar).
- Item activo: ícono + label en text-brand-600 dark:text-brand-400, 
  font-medium.
- Item inactivo: text-neutral-400.
- Background: bg-neutral-0 dark:bg-neutral-50.
- Border top: border-t border-neutral-100 dark:border-neutral-200.
- Sin sombra.
- Sin botón central destacado.
- Altura: h-16 + pb-safe-bottom.
- Íconos: lucide-react, 24x24, strokeWidth 1.75.
  - Inicio: Home icon
  - Movimientos: ListIcon o Receipt
  - Ajustes: Settings icon

ANTES de tocar:
1. Mostrame el archivo actual.
2. Listá qué items existen hoy y proponé el mapeo.
3. Esperá confirmación.
```

---

## Paso 7 — Refactor de Header del Home

**Prompt para Claude Code:**

```
Refactor del header del Home siguiendo DESIGN_SYSTEM.md sección 7.8 
(variante Home).

Estructura:
- Container: flex items-center justify-between px-5 pt-safe-top pb-3 
  bg-neutral-25 dark:bg-neutral-25.
- Izquierda: 
  - Mini ícono de bolsillo (24x24). Si no hay un ícono apropiado, usá 
    lucide-react `Wallet`.
  - Texto "Bolsillo" en text-h3 text-brand-600 dark:text-brand-400 
    font-semibold ml-2.
- Derecha:
  - Avatar circular: w-9 h-9 rounded-full bg-brand-500 text-white text-sm 
    font-semibold flex items-center justify-center.
  - Contenido del avatar: la inicial del usuario, o "U" si no hay datos.
  - Es clickeable, lleva a Settings (o a perfil si existe).

ANTES:
1. Mostrame el header actual del Home (probablemente en MainLayout.jsx, 
   ViewHeader.tsx o WalletViewHome.tsx).
2. Listame qué hace hoy (qué muestra, qué acciones tiene).
3. Esperá confirmación antes de cambiar.
```

---

## Paso 8 — Refactor de WalletViewHome.tsx (la pantalla principal)

**Prompt para Claude Code:**

```
Refactor visual de views/wallet/home/WalletViewHome.tsx siguiendo 
DESIGN_SYSTEM.md sección 8.1.

NO cambies lógica de negocio:
- No tocar dispatchers de Redux.
- No tocar handlers, hooks, llamadas de red.
- Solo JSX, classNames, y composición de componentes.

ANTES de tocar:
1. Mostrame el archivo actual completo.
2. Mostrame también WalletViewBalance.jsx y WalletViewButtons.jsx (que se 
   usan adentro).
3. Identificá qué partes son lógica (mantener) vs presentación (cambiar).
4. Listá los datos que el componente recibe para el balance (formato, 
   moneda, etc.) — necesito saber qué le voy a pasar al PocketBalance.

Después esperá mi plan concreto.
```

(Cuando responda, le pasás el plan de refactor: usar PocketBalance, 
ActionButton x3, sección "Esta semana" con lista de TransactionItem, 
etc. Adaptado a la lógica que reportó.)

---

## Paso 9 — Crear TransactionItem (si no existe)

**Prompt para Claude Code:**

```
Necesito un componente TransactionItem en src/components/atoms/ 
para los items de la lista de movimientos.

Specs en DESIGN_SYSTEM.md sección 7.6.

ANTES:
1. Buscá si ya hay un componente similar (puede llamarse TxItem, 
   HistoryItem, etc.). Si existe, mostrame el archivo y vemos si 
   refactorizamos en lugar de crear nuevo.
```

---

## Paso 10 en adelante — Pantalla por pantalla

Para cada pantalla, repetir el patrón:

| # | Pantalla | Sección DESIGN_SYSTEM |
|---|----------|----------------------|
| 10 | Send → `WalletViewSend.tsx` | 8.2 |
| 11 | Receive → `WalletViewPay.tsx` | 8.3 |
| 12 | **Escanear (nueva)** → `WalletViewScan.tsx` | 8.4 |
| 13 | Movimientos → `WalletViewHistory.tsx` | 8.5 |
| 14 | Ajustes → `SettingsView.jsx` | 8.6 |
| 15 | Modo Comerciante → `VendorModeView.tsx` | — adaptar criterio |
| 16 | Onboarding → `WelcomeView.tsx` | — adaptar criterio |
| 17 | Lock screen → `AppLockScreen.tsx` | — adaptar criterio |
| 18 | Assets → `AssetsView.tsx` | — adaptar criterio |

**Plantilla de prompt:**

```
Refactor visual de [ARCHIVO] siguiendo DESIGN_SYSTEM.md sección [N].

NO cambies lógica de negocio, solo presentación.

ANTES de tocar:
1. Mostrame el archivo actual completo.
2. Identificá lógica vs presentación.
3. Proponé el refactor en pseudocódigo.

Después esperá confirmación.
```

---

## Reglas de oro

1. **Una pantalla / componente por PR.** Nunca mezclar.
2. **Componentes globales antes que pantallas.** Si una pantalla necesita un 
   componente nuevo, primero el componente, después la pantalla.
3. **Nunca aceptar cambios de lógica no pedidos.** Si Claude Code dice "ya 
   que estaba acá refactoricé esto otro", pedile que revierta.
4. **Después de cada PR, probar la app.** Light + dark.
5. **Si una pantalla queda fea según el design system,** el problema es del 
   design system: avisame y lo ajustamos. No parchear pantalla por pantalla.
6. **No dejar que dos agentes editen el código en paralelo.** Uno diseña, 
   otro implementa.
