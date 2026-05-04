# SESSION HANDOFF — Redesign Bolsillo BCH

> Rama activa: `redesign-v2` | Última sesión: 2025-05-03
> Leer también: DESIGN_SYSTEM.md, MIGRATION_PLAN.md

---

## 1. Estado actual del MIGRATION_PLAN

| # | Paso | Estado | Resumen |
|---|------|--------|---------|
| 0 | Preparación / rama redesign-v2 | ✅ | Punto de partida, rama creada |
| 1 | tailwind.config.cjs | ✅ | Tokens brand, neutral, sky, error, safe area, tipografía |
| 2 | Inter | ✅ | Reemplaza Archivo + Chivo Mono; clase `.tabular` en CSS global |
| 3 | PocketBalance.tsx | ✅ | Átomo de marca: bolsillo punteado + moneda BCH |
| 4 | ActionButton.tsx | ✅ | Botones circulares del Home (Enviar, Recibir, Escanear) |
| 5 | Button.tsx viejo | ⚠️ POSPUESTO | Se dejó intacto. Nuevas pantallas usan AppButton. Migración pantalla a pantalla. |
| 6 | BottomNavigation | ✅ | 3 tabs en español (Inicio, Movimientos, Ajustes), brand activo |
| 7 | HomeHeader.tsx | ✅ | Logo bolsillo + "Bolsillo" en brand + avatar iniciales |
| 8 | WalletViewHome.tsx | ✅ | Refactor completo: usa PocketBalance, ActionButton x3, HomeRecentTransactions |
| 8.5/8.6/8.7 | Fixes del Home | ✅ | Dark mode completo, padding, contraste ActionButtons |
| — | WelcomeView.tsx (Login) | ✅ | Anticipado en plan (sin número de paso). Layout centrado, logo PNG, AppButton, copy corregido |
| 9 | TransactionItem.tsx | ✅ | Extracción de átomo desde HomeRecentTransactions; formatBch → util/format.ts |
| 10A | AppButton.tsx | ✅ | Nuevo componente con variantes/tamaños/loading; convive con Button viejo |
| 10B | WelcomeView → AppButton | ✅ | Migración del Login al nuevo AppButton |
| 10B.5 | AppButton lg tipografía | ✅ | text-base font-semibold (ajuste post-validación visual en device) |
| 10B.6 | Eliminar header global | ✅ | WalletView.jsx sin header de balance en subpantallas; borrados BalanceHideButton + SyncIndicator |
| 10C | WalletViewSend — auditoría | ✅ | Diagnóstico completo: mapa, lógica vs presentación, regiones JSX, acoplamiento |
| 10D | WalletViewSend — refactor | ⬜ | Pendiente. Ver Sección 5 — el alcance cambió. |
| 11 | WalletViewPay (Receive) | ⬜ | Hoy es placeholder. Pendiente implementar pantalla real. |
| 12 | WalletViewScan | ⬜ | Hoy es placeholder. Pendiente implementar. |
| 13 | WalletViewHistory | ⬜ | Pendiente. |
| 14 | SettingsView | ⬜ | Pendiente. |
| 15–18 | VendorMode, Onboarding, Lock, Assets | ⬜ | Pendiente. |

---

## 2. Decisiones de arquitectura tomadas en esta sesión

### `formatBch` vive en `@/util/format.ts`, no en `sats.ts`
- **Dónde:** `src/util/format.ts`
- **Por qué:** separación explícita entre matemática (sats.ts: bchToSats, satsToBch) y display (format.ts: formatBch). No mezclar conversiones con formateo.
- **Nota:** `satsToBch` en sats.ts hace algo similar internamente. Solapamiento ~80%. Unificar post-redesign.

### `AppButton.tsx` convive con `Button.tsx` viejo
- **Dónde:** ambos en `src/components/atoms/`
- **Por qué:** migración incremental pantalla a pantalla. El Button viejo tiene props ad-hoc (`bgColor`, `icon`, `labelSize`…) usadas en decenas de archivos. Romper eso en un solo PR es inmanejable.
- **Convención:** pantallas ya migradas usan AppButton; pantallas no migradas siguen con Button viejo hasta que les llegue el turno.

### Loading state de AppButton mantiene `children` visibles
- **Dónde:** `AppButton.tsx` línea 88–91
- **Por qué:** el spinner aparece a la izquierda del texto, no lo reemplaza. Permite que el label del estado ("Iniciando sesión...") sea legible mientras carga. Validado visualmente en WelcomeView.

### AppButton size `lg` usa `text-base font-semibold`
- **Dónde:** `SIZE_CLASSES` en AppButton.tsx, valor `lg`
- **Por qué:** `text-body-md` resultó visualmente pequeño para un botón de acción principal. Se ajustó a `text-base font-semibold` después de validar en dispositivo físico (Redmi 10C) en el Sub-paso 10B.5.

### Header global de subpantallas eliminado deliberadamente
- **Dónde:** `WalletView.jsx` (el condicional `!isHome` ya no existe)
- **Por qué:** decisión de producto. El balance ya está en el Home (PocketBalance). En pantallas de flujo (Send, Receive) la info duplicada es ruido. SyncIndicator sacrificado — los errores de conexión se manejarán en el flujo de cada operación.
- **Componentes borrados:** `BalanceHideButton.tsx`, `SyncIndicator.tsx`
- **WalletViewBalance.jsx conservado:** lo usa `AppCauldronDexView.jsx`, no es código muerto.

### Alias `primary` → `brand` en tailwind.config.cjs
- **Dónde:** `tailwind.config.cjs` líneas 35–47 (bloque `primary: { ... }`)
- **Por qué:** permite migrar pantalla a pantalla sin romper las no migradas. `bg-primary` y `bg-brand-500` apuntan al mismo `#23A06D`. Se limpiará cuando todas las pantallas estén migradas.

### WalletViewSend: JSX con branches separados, no un render monolítico
- **Dónde:** `WalletViewSend.tsx` líneas 807–912
- **Por qué:** hay 3 cards de input condicionales (stablecoin mode / token send / BCH normal). Son branches limpios. Refactorizar el header y el footer del Send no rompe ningún flujo avanzado — están encapsulados en sus propias condiciones.

---

## 3. Deudas técnicas vivas

| Deuda | Dónde | Por qué no se resolvió |
|-------|-------|----------------------|
| `formatBch` y `satsToBch` tienen ~80% de solapamiento | `src/util/format.ts` y `src/util/sats.ts` | Unificar requiere tocar tests y callers; fuera del scope del redesign visual |
| `tailwind-merge` no instalado | `AppButton.tsx` (JSDoc lo documenta) | Instalar es un commit de dependencia separado; no se quiso mezclar con los commits de componentes |
| `formatBch(0n)` devuelve `"0.00"` — la versión original del Paso 9 tenía una guard `if (abs === 0n) return "0"` que se eliminó | `src/util/format.ts` | Se eliminó la guard por fidelidad al refactor de extracción — la versión inline original devolvía `"0.00"` y la guard introducía un cambio de comportamiento. Coherencia con la regla de extracción pura, no opinión sobre formato correcto. |
| `CurrencyService(x).getSymbol(x)` — argumento duplicado | `TransactionItem.tsx` línea 48 | Patrón heredado de la codebase; no se quiso cambiar la firma del servicio |
| `WalletViewBalance.jsx` queda como archivo vivo solo por Cauldron DEX | `src/components/views/wallet/home/WalletViewBalance.jsx` | Depende de decisión de producto sobre Cauldron (ver Sección 4) |
| Botón "MAX" (x3) y botón "Volver" en WalletViewSend usan Button viejo | `WalletViewSend.tsx` líneas 826, 866, 892, 918 | Pendientes de migrar a AppButton en los sub-pasos del Send |
| `WalletViewButtons.jsx` deprecado (no borrado) | `src/components/views/wallet/home/` | Se anotó en Paso 8 como "dejar de usar", no borrado. Verificar y borrar en limpieza post-redesign |

---

## 4. Decisiones de producto pendientes (post-redesign)

Estas decisiones NO son del redesign visual. Se identificaron durante el trabajo y se anotaron para PRs separados de simplificación de producto.

- **Flujos avanzados del Send:** evaluar si stablecoin mode, selección manual de UTXOs, envío de CashTokens (fungibles y NFTs) tienen lugar en la propuesta minimalista. Si se eliminan, `WalletViewSend.tsx` se reduce drásticamente (de 1078 líneas a ~300).
- **Cauldron DEX (`AppCauldronDexView.jsx`):** feature avanzada (swap de tokens). Probablemente no encaja en la wallet minimalista para comerciantes. Si se elimina, también se elimina el último uso de `WalletViewBalance.jsx` y ese componente se puede borrar.
- **Divisa por defecto:** está en USD, debería ser ARS. Fix funcional en preferences/onboarding, no visual.
- **Bug display de balance:** `text-display` (48px) se rompe con montos grandes (ej: `$1.234.567,89`). Ajustar font-size responsive según longitud de string, o cap en 40px.
- **SyncIndicator eliminado:** si la conexión Electrum se cae, no hay feedback visual permanente. Manejar errores de conexión en el flujo de cada operación (Send, Receive) si se vuelve un problema real.

---

## 5. Próximo paso concreto — Sub-paso 10D: nuevo flujo Send

### Qué se hizo hasta acá

Se hizo la auditoría completa del archivo (`WalletViewSend.tsx`, 1078 líneas):
- Mapa del archivo con rangos de líneas
- Identificación de lógica vs presentación
- Las tres regiones a refactorizar: header, input de monto, botones
- Análisis de acoplamiento (branches separados, no monolítico)
- SlideToAction: usa tokens `primary` que resuelven al mismo verde, no está roto

### Decisiones de alto nivel cerradas

| Decisión | Estado |
|----------|--------|
| Alcance: flujo nuevo multi-pantalla (`Escanear → Monto → Confirmar → Éxito`), no refactor visual del Send actual | ✅ |
| Caso de uso primario: comerciante / persona-a-persona, escanear primero (no dirección primero) | ✅ |
| Destinatario: dirección truncada (`qrn8...92x`), sin sistema de contactos | ✅ |
| Confirmación: mantener SlideToAction (no "mantener pulsado" ni tap simple) | ✅ |

### Decisiones de detalle pendientes

| Pregunta | Estado |
|----------|--------|
| ¿Rutas separadas o estado interno entre pasos? | ⬜ |
| QR BIP21 con monto: ¿saltar el paso de monto? | ⬜ |
| Fallback sin cámara / sin permisos | ⬜ |
| ¿Cámara abierta al entrar a Send, o botón para abrir? | ⬜ |
| BCH-first vs fiat-first en el input | ⬜ |
| Chips de monto rápido (sí/no, qué montos en ARS) | ⬜ |
| Memo opcional | ⬜ |
| ¿Qué muestra la pantalla de confirmación? | ⬜ |
| Comportamiento de "Compartir" y "Listo" en la pantalla de éxito | ⬜ |

**Acción al retomar:** resolver las 9 preguntas de detalle y escribir `SEND_FLOW_SPEC.md`. Solo después de ese documento OK arrancar el código.

---

## 6. Convenciones de prompt acordadas

- **"ANTES de tocar... esperá mi OK"**: antes de cualquier edición, el agente reporta diagnóstico (qué se va a cambiar, qué queda huérfano, qué archivos se afectan) y espera confirmación explícita. No asumir que la descripción del cambio = autorización para ejecutarlo.
- **Refactor = comportamiento idéntico**: una extracción de componente no agrega features. Si la extracción requiere un cambio de firma, reportar antes de hacerlo.
- **Una pantalla / componente por PR**: nunca mezclar dos pantallas en un mismo commit.
- **Frentes nuevos**: si durante un cambio se detecta algo en un archivo no relacionado, reportar antes de tocar. No editar de paso.
- **Decisiones cerradas**: si una decisión ya se tomó en la sesión (ej: "formatBch va en format.ts, no en sats.ts"), no re-proponerla. Está en este documento.
- **Prompts largos con specs exactas**: los prompts de implementación incluyen el archivo destino, las props esperadas, las clases CSS esperadas. No dejar nada abierto a interpretación.

---

## 7. Archivos clave para retomar contexto

| Archivo | Para qué sirve |
|---------|---------------|
| `DESIGN_SYSTEM.md` | Fuente de verdad de tokens, tipografía, componentes, specs de pantallas |
| `MIGRATION_PLAN.md` | Estado del plan paso a paso con anotaciones in-line |
| `SESSION_HANDOFF.md` | Este archivo — resumen ejecutivo de la sesión |
| `SEND_FLOW_SPEC.md` | A crear antes de tocar el Send — decisiones del flujo multi-pantalla |
| `tailwind.config.cjs` | Tokens de color (brand, neutral, sky, error, alias primary) |
| `src/components/atoms/AppButton.tsx` | Nuevo sistema de botones (variantes, tamaños, loading) |
| `src/components/atoms/TransactionItem.tsx` | Átomo de transacción (extraído en Paso 9) |
| `src/components/atoms/PocketBalance.tsx` | Componente de marca del Home |
| `src/components/atoms/ActionButton.tsx` | Botones circulares del Home |
| `src/util/format.ts` | formatBch (display) — NO en sats.ts |
| `src/components/views/wallet/WalletView.jsx` | Layout wrapper de /wallet/* — ya sin header global |
| `src/components/views/wallet/send/WalletViewSend.tsx` | Próxima pantalla a refactorizar (1078 líneas, auditada) |

### Estado del repo
- **Rama:** `redesign-v2`
- **Último commit:** `refactor(layout): eliminar header global de subpantallas + cleanup`
- **Build:** ✅ limpio (`pnpm build:ci` pasa sin errores)
- **APK debug:** instalada y probada en Redmi 10C
