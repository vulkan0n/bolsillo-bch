# Plan de migración — Para usar con Claude Code

> Este archivo describe cómo ejecutar el redesign paso a paso.
> Cada paso es un PR / commit independiente.
> NUNCA pidas a Claude Code que haga varios pasos juntos: el resultado es siempre peor que hacerlos por separado.

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
Tengo un nuevo tailwind.config.cjs que reemplaza el actual. La migración es 
puramente de tokens, sin tocar JSX todavía.

1. Reemplazá el contenido actual de tailwind.config.cjs por el archivo que voy 
   a pegarte abajo.
2. Revisá si en el codebase hay referencias hardcoded a colores HEX o RGBA 
   (rgba(148,195,82...) por ejemplo). Si las hay, listámelas pero NO las 
   modifiques todavía.
3. Corré `npm run build` o `npm run dev` y reportá si hay errores.

[pegar acá el contenido del nuevo tailwind.config.cjs]
```

---

## Paso 2 — Importar Inter

**Prompt para Claude Code:**

```
Necesito reemplazar las fuentes actuales (Archivo + Chivo Mono) por Inter.

1. Buscá dónde se importan las fuentes actuales (probablemente en index.html 
   o en algún index.css / main.css).
2. Reemplazalas por Inter desde Google Fonts. Necesito los pesos 400, 500, 
   600 y 700, con `display=swap`.
3. Asegurate de que en el CSS global haya una regla que aplique 
   `font-feature-settings: "tnum"` o equivalente a los elementos con la 
   clase `.tabular`, así puedo usar `className="tabular"` en montos para 
   tener números de ancho fijo.
4. Reportá qué archivos modificaste.
```

---

## Paso 3 — Crear IconButton (componente nuevo)

**Prompt para Claude Code:**

```
Necesito crear un componente nuevo en src/components/atoms/IconButton.tsx.

Es un botón circular con un ícono adentro y un label debajo, estilo Mercado 
Pago / fintech moderna. Specs exactas:

- Estructura: <button> que contiene un <span> circular con el ícono y un 
  <span> con el label debajo.
- Círculo: 56x56px (w-14 h-14), rounded-full, bg-sky-50.
  En dark mode: bg-sky-50 (que ya está mapeado a un celeste oscuro en el 
  config).
- Ícono: 24x24px (w-6 h-6), color text-sky-600, strokeWidth=1.5.
  Usar lucide-react. Si lucide-react no está instalado, instalalo.
- Label: text-sm text-neutral-700 dark:text-neutral-300, mt-2.
- Container: flex flex-col items-center gap-2.
- En estado :active, el círculo cambia a bg-sky-100. Usar 
  transition-colors duration-150.
- Disabled: opacity-50 cursor-not-allowed.

Props:
- icon: ReactNode (el componente de lucide ya instanciado)
- label: string
- onClick: () => void
- disabled?: boolean
- ariaLabel?: string (default = label)

Hacelo en TypeScript con tipos exportados. Mostrame el archivo final.
```

---

## Paso 4 — Refactor de Button.tsx

**Prompt para Claude Code:**

```
Necesito actualizar src/components/atoms/Button.tsx para soportar las 
variantes definidas en DESIGN_SYSTEM.md sección 7.1.

Variantes a soportar (prop `variant`):
- primary (default): bg-brand-500 text-white, hover:bg-brand-400, 
  active:bg-brand-600
- secondary: bg-neutral-100 text-neutral-800, hover:bg-neutral-200, 
  dark:bg-neutral-100 dark:text-neutral-800
- outline: bg-transparent border border-neutral-300 text-neutral-800, 
  hover:bg-neutral-50
- ghost: bg-transparent text-neutral-700, hover:bg-neutral-100
- destructive: bg-error text-white, hover:bg-error-dark

Tamaños (prop `size`):
- sm: h-9 px-3 text-sm rounded-md
- md (default): h-12 px-5 text-body-md rounded-xl
- lg: h-14 px-6 text-body-md rounded-xl, full-width opcional con prop fullWidth

Comunes a todas:
- font-medium
- transition-colors duration-150
- focus-visible:outline-2 focus-visible:outline-sky-500 outline-offset-2
- disabled:opacity-50 disabled:cursor-not-allowed

ANTES de tocar el archivo:
1. Mostrame las props actuales del Button para saber qué tengo que mantener 
   por compatibilidad.
2. Listá todos los archivos que importan Button, así sabemos qué puede 
   romperse.

Después esperá mi confirmación para hacer el cambio.
```

---

## Paso 5 — Refactor de WalletViewHome.tsx

Este es el cambio más visible. Hacelo después de tener Button + IconButton listos.

**Prompt para Claude Code:**

```
Necesito refactorizar views/wallet/home/WalletViewHome.tsx siguiendo la 
sección 8.1 de DESIGN_SYSTEM.md.

ANTES de tocar nada:
1. Mostrame el archivo actual completo.
2. Mostrame también WalletViewBalance.jsx y WalletViewButtons.jsx que se 
   usan adentro.
3. Listá los iconos / íconos / componentes que vamos a necesitar reemplazar.

Después te paso el plan concreto del refactor.
```

(Esperá su respuesta antes de seguir. Cuando responda, le pasás el plan
concreto basado en lo que reportó.)

---

## Paso 6 — BottomNavigation

**Prompt para Claude Code:**

```
Refactor de src/components/(layout|atoms)/BottomNavigation siguiendo la 
sección 7.6 de DESIGN_SYSTEM.md.

Cambios:
- 4 items en lugar de los actuales (si hay más, agrupalos en "Más").
- Item activo: ícono + label en sky-600 con font-medium.
- Item inactivo: neutral-400.
- Sin botón central destacado.
- bg-neutral-0 dark:bg-neutral-50, border-t border-neutral-100 
  dark:border-neutral-200.
- h-16 + padding-bottom: env(safe-area-inset-bottom).

Mostrame el archivo actual primero, después te confirmo el cambio.
```

---

## Paso 7 en adelante — Pantalla por pantalla

Para cada una de estas pantallas, repetir el mismo patrón:

1. Send → `WalletViewSend.tsx` (sección 8.2)
2. Receive / Pay → `WalletViewPay.tsx` (sección 8.3)
3. History → `WalletViewHistory.tsx` (sección 8.4)
4. Settings → `SettingsView.jsx`
5. Vendor mode
6. Onboarding
7. Lock screen
8. Assets

**Plantilla de prompt para cada pantalla:**

```
Refactor visual de [ARCHIVO] siguiendo DESIGN_SYSTEM.md sección [N].

NO cambies lógica de negocio, solo presentación:
- No tocar dispatchers de Redux.
- No tocar handlers, hooks, llamadas de red.
- Solo JSX, classNames, y composición de componentes.

ANTES de tocar nada:
1. Mostrame el archivo actual completo.
2. Identificá qué partes son lógica (mantener) vs presentación (cambiar).
3. Proponé el refactor en pseudocódigo / esquema.

Después te confirmo y hacés el cambio.
```

---

## Reglas de oro

1. **Una pantalla por PR.** Nunca mezclar.
2. **Componentes globales antes que pantallas.** Si una pantalla necesita un 
   componente nuevo, primero el componente en su PR, después la pantalla.
3. **Nunca aceptar un cambio que toque lógica sin pedirlo explícito.** Si 
   Claude Code te dice "ya que estaba acá aproveché y refactoricé esto otro", 
   pedile que revierta.
4. **Después de cada PR, probar la app.** Tanto en light como en dark.
5. **Si una pantalla queda fea pero "técnicamente correcta" según el design 
   system,** el problema es del design system: avisame y lo ajustamos. No 
   parchear pantalla por pantalla.
