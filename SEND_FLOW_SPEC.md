# SEND_FLOW_SPEC — Flujo Send rediseñado

> Especificación del nuevo flujo Send de Bolsillo BCH (Paso 10D del MIGRATION_PLAN).
> Reemplaza totalmente al `WalletViewSend.tsx` viejo (borrado en Pre-Paso 10).
> Este documento es la fuente de verdad antes de escribir código. Si una decisión
> aparece acá, no se re-discute al implementar.
>
> Leer también: DESIGN_SYSTEM.md, SESSION_HANDOFF.md (sección 5), MIGRATION_PLAN.md.

---

## 1. Objetivo y alcance

### Qué hace este flujo

Permite a un comerciante / usuario persona-a-persona enviar BCH a una dirección,
ingresando el monto en pesos argentinos (fiat-first), confirmando con un gesto
deliberado, y recibiendo feedback claro al finalizar.

Se accede desde el botón **Enviar** del Home, que abre la cámara directamente.

### Qué NO hace

- No tiene sistema de contactos. El destinatario es siempre una dirección
  truncada (`qrn8...92x`).
- No envía tokens, NFTs, ni CashTokens. Solo BCH.
- No tiene modo estable / stablecoin (decisión de producto, ver NOTAS-BOLSILLO).
- No tiene botón "Compartir comprobante" en la pantalla de éxito.
- No tiene modo comerciante separado — la app entera ya es modo comerciante.
- No persiste el draft entre sesiones ni a través de pausas. Ver §3.

---

## 2. Mapa de pantallas y máquina de estados

### Las cuatro pantallas

```
┌──────────┐  scan QR    ┌─────────┐  next   ┌──────────┐  slide   ┌────────┐
│ Escáner  │ ──────────► │  Monto  │ ──────► │ Confirmar│ ───────► │ Éxito  │
└──────────┘  (sin monto)└─────────┘         └──────────┘          └────────┘
     │                                            ▲
     │ scan QR                                    │
     │ (con monto BIP21)                          │
     └────────────────────────────────────────────┘
                 (salta Monto)
```

### Rutas

| Pantalla   | Ruta sugerida          | Notas                          |
|------------|------------------------|--------------------------------|
| Escáner    | `/wallet/send/scan`    | Punto de entrada               |
| Monto      | `/wallet/send/amount`  | Acepta dirección por params    |
| Confirmar  | `/wallet/send/confirm` | Lee del slice, no params       |
| Éxito      | `/wallet/send/success` | Lee del slice, no params       |

Las pantallas son rutas separadas (no un único componente con estados), según
decisión del handoff ("rutas separadas, no monolítico"). El estado compartido
entre ellas vive en el slice `sendDraft`.

### Navegación entre pantallas

| Origen     | Trigger                                  | Destino   |
|------------|------------------------------------------|-----------|
| Home       | Tap en botón "Enviar"                    | Escáner   |
| Escáner    | QR válido sin monto                      | Monto     |
| Escáner    | QR BIP21 con monto                       | Confirmar |
| Escáner    | Tap en "Ingresar dirección manualmente"  | Monto     |
| Monto      | Tap en "Continuar" (con monto válido)    | Confirmar |
| Confirmar  | Slide-to-action completado                | Éxito     |
| Confirmar  | Broadcast falla                          | Monto (con toast de error) |
| Éxito      | Tap en "Listo"                           | Home      |

### Back nativo (botón físico Android / swipe iOS)

Regla general: **vuelve a la pantalla anterior del flujo**.

| Pantalla   | Back nativo va a                          |
|------------|-------------------------------------------|
| Escáner    | Home                                      |
| Monto      | Escáner                                   |
| Confirmar  | Monto                                     |
| Éxito      | Home (no permite volver a Confirmar)      |

**Caso especial — entrada vía QR con monto:** si el usuario escaneó un QR BIP21
con monto y saltó directo a Confirmar, el back desde Confirmar va a Monto igual,
con la dirección y el monto del QR pre-llenados. El usuario puede editar el
monto desde ahí. Esto es deliberado: damos al usuario la posibilidad de
modificar el monto incluso si vino de un QR, y simplifica la lógica (no hay
"saltar Escáner al volver atrás").

### Pausa / resume de la app

Si la app se pausa (background) durante el flujo, **el draft se pierde**.

- Al volver al foreground, si la app estaba en cualquier ruta del flujo Send
  (Escáner, Monto, Confirmar), se navega de vuelta al Home.
- El slice `sendDraft` se limpia.
- Excepción: si la app se pausa **estando en Éxito** (la transacción ya se
  envió), no hay nada que perder. Al volver se muestra el Home.

Esto es coherente con la regla "una transacción es una sesión deliberada". No
queremos que un usuario que dejó la app abierta hace 2 horas vuelva y vea un
draft con monto y dirección listos para enviar.

---

## 3. Estado compartido

### Slice `sendDraft` (a crear)

El estado del flujo entero vive en un slice nuevo de Redux Toolkit. Su shape
exacto, acciones y selectores se deciden al implementar — este documento solo
fija las restricciones de comportamiento:

- Almacena lo mínimo necesario para que las pantallas de Monto, Confirmar y
  Éxito puedan renderizar sin volver a pedir nada al usuario.
- Se inicializa al entrar al flujo (al pisar la ruta `/wallet/send/scan` o
  `/wallet/send/amount` desde un punto de entrada externo).
- Se limpia al salir del flujo: tap en "Listo" en Éxito, back desde Escáner al
  Home, pausa de la app, error fatal.
- No se persiste a disco. Vive en memoria de Redux.
- La pantalla de Éxito guarda su propia copia local de los datos que necesita
  mostrar antes de que el slice se limpie (hash de tx, monto, destinatario), o
  el slice se limpia recién en la transición Éxito → Home. La decisión es del
  implementador; lo que importa es que Éxito no quede en blanco.

### Modificación al slice `exchangeRates`

Necesario para mostrar el cartel de "cotización vieja". Se agrega un timestamp
(o `lastUpdatedAt`) que registra cuándo se obtuvo la cotización actual del par
BCH/ARS.

- Umbral de "vieja": **más de 10 minutos**.
- Si la cotización tiene más de 10 minutos, las pantallas de Monto y Confirmar
  muestran un cartel discreto: "Cotización actualizada hace X min" (texto
  exacto se decide al implementar las traducciones).
- Si la cotización falla y no hay ninguna disponible, la pantalla de Monto
  sigue siendo usable: se muestra la última cotización conocida con el cartel,
  y se permite continuar. No se bloquea al usuario.
- Si **nunca** hubo una cotización (primera vez, sin red), el flujo Send se
  bloquea con un mensaje claro: "Necesitamos la cotización para enviar.
  Conectate a internet e intentá de nuevo."

---

## 4. Pantalla 1 — Escáner

### Propósito

Capturar la dirección de destino (y opcionalmente el monto, si el QR es BIP21
con `?amount=`) escaneando un QR con la cámara, o dando un fallback para
ingresar la dirección manualmente.

### Entrada

- Desde Home → tap en botón "Enviar" del `ActionButton`.
- Permiso de cámara: **se pide al entrar** a esta pantalla. No al instalar la
  app, no en onboarding. Just-in-time.

### Layout

Pantalla full-screen con la cámara ocupando todo el viewport.

- Overlay oscuro (~70% opacity) cubre la pantalla excepto un marco central de
  scan.
- Marco de scan: cuadrado centrado, esquinas redondeadas con líneas verde
  brand (`brand-500`), animación sutil de "respiración" si es factible. Ver
  DESIGN_SYSTEM.md §8.4.
- Botón cerrar (X) arriba a la derecha, color blanco, lleva al Home.
- Texto debajo del marco: "Apuntá al código QR" — `text-body` blanco.
- Botón fantasma debajo del texto: **"Ingresar dirección manualmente"** —
  siempre visible, no solo en fallback. `AppButton variant="ghost"` color
  blanco.

### Estados

| Estado                       | Comportamiento                                          |
|------------------------------|---------------------------------------------------------|
| Pidiendo permiso             | Se muestra el modal nativo de Capacitor                 |
| Permiso denegado             | Pantalla con mensaje + botón "Ingresar manualmente" + botón "Abrir configuración" |
| Cámara abriendo              | Pantalla negra con loader centrado                      |
| Cámara activa, escaneando    | Layout normal descrito arriba                           |
| QR detectado, validando      | Marco cambia a sólido brand-500, breve haptic feedback  |
| QR válido sin monto          | Disparar acción, navegar a Monto con la dirección       |
| QR válido con monto BIP21    | Disparar acción, navegar a Confirmar                    |
| QR inválido                  | Toast: "Este QR no es una dirección de Bitcoin Cash"    |

### Validación de QR

Usar el utility existente `parseBip21Uri` (o equivalente — ver
`src/util/uri.test.ts` que existe). Casos a manejar:

- `bitcoincash:qrn8...?amount=0.001` → dirección + monto en BCH (sats).
- `bitcoincash:qrn8...` → solo dirección.
- `qrn8...` (sin prefijo) → solo dirección, válida.
- Direcciones legacy (no CashAddr) → rechazar con mensaje claro.
- Cualquier otro contenido (URL, texto, otra cripto) → toast de error.

### Fallback: ingresar dirección manualmente

Tap en el botón abre un modal o navega a Monto con un campo de dirección
editable. Decisión a tomar al implementar — recomiendo modal sobre la cámara
para que el usuario pueda volver a escanear sin re-pedir permiso.

### Back nativo

Vuelve al Home.

---

## 5. Pantalla 2 — Monto

### Propósito

Capturar el monto a enviar en pesos argentinos, mostrar la conversión a BCH en
tiempo real, y opcionalmente capturar un memo público.

### Entrada

- Desde Escáner: con dirección (y sin monto).
- Desde Escáner: con dirección + monto pre-llenado (si vino el back desde
  Confirmar después de un broadcast fallido, o el usuario tocó back desde
  Confirmar).
- Desde fallback de Escáner: con dirección ingresada manualmente.

### Layout

Subpantalla con header de back (variante "Subpantalla" del DESIGN_SYSTEM §7.8).

```
┌──────────────────────────────────┐
│ ←   Enviar                       │   ← header
├──────────────────────────────────┤
│                                  │
│  Para                            │   ← label text-sm text-neutral-600
│  qrn8...92x                      │   ← dirección truncada, tabular,
│                                  │     text-body-md text-neutral-900
│                                  │
│         $ 0                      │   ← input fiat-first, text-display-sm
│         0.00000000 BCH           │   ← conversión, text-sm text-neutral-400
│                                  │
│  ⚠ Cotización hace 12 min        │   ← cartel solo si >10min
│                                  │
│  [$1.000] [$2.000] [$5.000]      │   ← chips de montos rápidos
│  [$10.000]                       │
│                                  │
│  Memo (opcional)                 │   ← label
│  [_________________________]     │   ← input
│  Es visible para todos           │   ← warning text-xs text-neutral-400
│                                  │
├──────────────────────────────────┤
│  [    Continuar    ]             │   ← AppButton lg fullWidth, fijo abajo
└──────────────────────────────────┘
```

### Comportamiento del input

- **Fiat-first siempre.** El usuario escribe pesos. La conversión a BCH se
  muestra debajo, no se edita directamente.
- Formato de input: solo dígitos y separador decimal según locale `es-AR` (coma
  decimal, punto como separador de miles). Ver `src/util/currency.test.ts`.
- Al tipear, la conversión a BCH se actualiza en vivo usando la cotización del
  slice `exchangeRates`.
- Si el monto excede el balance disponible, el input se pinta en rojo (`error`)
  y el botón "Continuar" se deshabilita. Mensaje: "No tenés saldo suficiente".
- Foco automático al entrar en la pantalla, teclado numérico nativo.

### Chips de montos rápidos

Cuatro chips: **$1.000 / $2.000 / $5.000 / $10.000**.

- Tap en un chip pre-llena el input con ese valor (reemplaza, no suma).
- **Deuda anotada:** estos valores van a quedar obsoletos por inflación
  argentina. Revisar cada N meses (sugerencia: cada 6 meses) y subir si los
  montos típicos de venta superan los $10.000. No es un blocker del paso.

### Cartel de cotización vieja

- Solo visible si la cotización tiene más de 10 minutos.
- Texto: "Cotización actualizada hace X min" (X es un número entero de minutos).
- Estilo: `text-xs text-warn` con un ícono de reloj 16px a la izquierda. Sin
  fondo, sin borde — discreto pero visible.

### Memo

- Campo de texto opcional, máximo 220 caracteres (límite de OP_RETURN BCH es
  220 bytes — confirmar al implementar leyendo `TransactionBuilderService`).
- Si vino pre-llenado del QR BIP21 (`?message=`), se muestra ya cargado pero
  editable.
- **Cartel "Es visible para todos"** debajo del campo, siempre visible.
  `text-xs text-neutral-400`. No es un warning de error, es informativo.

### Validación para "Continuar"

Botón habilitado solo si:
- Hay un monto > 0.
- El monto cabe en el balance (incluyendo fee estimada).
- Hay cotización disponible (aunque sea vieja).

### Back nativo

Vuelve a Escáner.

---

## 6. Pantalla 3 — Confirmar

### Propósito

Mostrar al usuario un resumen mínimo de lo que va a enviar, advertir sobre
irreversibilidad, y exigir un gesto deliberado (slide) para ejecutar.

### Entrada

- Desde Monto: usuario tocó "Continuar".
- Desde Escáner: el QR era BIP21 con monto.

### Layout

```
┌──────────────────────────────────┐
│ ←   Confirmar envío              │   ← header
├──────────────────────────────────┤
│                                  │
│  Vas a enviar                    │   ← label text-sm text-neutral-600
│                                  │
│       $ 1.500,00                 │   ← monto fiat, text-display-sm
│       0.00045 BCH                │   ← BCH, text-body text-neutral-400
│                                  │
│                                  │
│  A                               │   ← label
│  qrn8...92x                      │   ← dirección truncada, tabular,
│                                  │     text-body-md
│                                  │
│  Memo                            │   ← solo si hay memo
│  Pago de almuerzo                │   ← text-body
│                                  │
│  Fee de red                      │   ← label
│  ~$3,20 (0.00001 BCH)            │   ← text-body-md
│                                  │
│  ⚠ Cotización hace 12 min        │   ← cartel solo si >10min
│                                  │
│  ⚠ Esta operación no se puede    │   ← advertencia irreversibilidad,
│     deshacer                     │     text-sm text-warn
│                                  │
├──────────────────────────────────┤
│  [≫ Deslizá para enviar      ]   │   ← SlideToAction
└──────────────────────────────────┘
```

### Comportamiento del SlideToAction

- Componente nuevo o reutilizado del que existía en el Send viejo
  (`SlideToAction` del Send viejo se borró en Pre-Paso 10 — confirmar al
  implementar si hay que rehacerlo o se rescata del git history).
- Track verde brand-500, thumb circular blanco, ícono flecha derecha.
- Al deslizar 90% del recorrido se considera completado.
- Al completar: thumb se queda al final, label cambia a "Enviando...", se
  dispara el broadcast.
- Si el slide se suelta antes del 90%, vuelve al inicio con animación.

### Estados

| Estado            | Comportamiento                                       |
|-------------------|------------------------------------------------------|
| Idle              | Layout normal, slide listo                           |
| Enviando          | Slide bloqueado, label "Enviando...", spinner sutil  |
| Éxito broadcast   | Navegar a Éxito                                      |
| Error broadcast   | Volver a Monto (ver §6.error)                        |

### Error de broadcast

Si el broadcast falla (Electrum caído, error de red, fee insuficiente, etc.):

- Volver a la pantalla **Monto**.
- Mostrar un toast con el motivo del error: "Error al enviar — verificá tu
  conexión" o "Saldo insuficiente para cubrir la fee".
- Mantener el draft cargado: dirección, monto, memo siguen ahí.
- El usuario puede ajustar y reintentar.

### Fee de red

- Se calcula al entrar a la pantalla usando `TransactionBuilderService` (no se
  toca esa lógica, ver CLAUDE.md "Qué NO se toca").
- Se muestra ya formateada en pesos + BCH.
- Si el cálculo de fee falla (no hay UTXOs, error de servicio), volver a Monto
  con toast: "No pudimos calcular la fee. Intentá de nuevo".

### Back nativo

Vuelve a Monto.

---

## 7. Pantalla 4 — Éxito

### Propósito

Confirmar visualmente que la transacción se envió, mostrar resumen mínimo, y
ofrecer una salida clara al Home.

### Entrada

- Desde Confirmar: broadcast exitoso (la tx fue aceptada por Electrum, no
  necesariamente confirmada en la blockchain).

### Layout

```
┌──────────────────────────────────┐
│                                  │
│                                  │
│           ┌──────┐               │
│           │  ✓   │               │   ← círculo grande brand-500, check
│           └──────┘                     blanco, ~80px
│                                  │
│         ¡Enviado!                │   ← text-h1 text-neutral-900
│                                  │
│       $ 1.500,00                 │   ← text-display-sm
│       0.00045 BCH                │   ← text-body text-neutral-400
│                                  │
│       a qrn8...92x               │   ← text-body text-neutral-600
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│  [      Listo      ]             │   ← AppButton primary lg fullWidth
└──────────────────────────────────┘
```

- Sin botón "Compartir comprobante" (decisión del handoff).
- Sin botón "Enviar otro" — si quiere enviar otra cosa, vuelve al Home y
  arranca de nuevo.
- Sin link a "Ver en explorador" — el usuario no es cripto-entusiasta. Si en
  algún momento se pide, va en Movimientos al tocar la transacción.

### Back nativo

Va al **Home directo** (no permite volver a Confirmar). Esto evita que el
usuario re-envíe accidentalmente.

### Limpieza del slice

El slice `sendDraft` se limpia al pisar la ruta `/wallet/`  (Home) desde Éxito,
ya sea por tap en "Listo" o por back nativo.

---

## 8. Manejo del input fiat-first — detalle técnico

### Conversión

- La conversión `pesos → sats` se hace al pasar a Confirmar, no en cada
  keystroke. En Monto se muestra una preview pero la conversión "oficial" que
  va al broadcast se calcula al confirmar usando la cotización vigente en ese
  momento.
- Si la cotización cambia entre Monto y Confirmar (porque el slice se
  refrescó), Confirmar muestra la conversión nueva. El usuario ve `0.00045
  BCH` en Monto y puede ver `0.00046 BCH` en Confirmar — eso es esperado.
- La fuente de verdad del envío es el monto en **sats**, no en pesos.

### Por qué fiat-first y no toggle

Decisión del handoff: el usuario es un comerciante argentino que piensa en
pesos. El BCH es un detalle de implementación. No hay toggle BCH↔fiat para
evitar la confusión de "¿en qué moneda estoy escribiendo ahora?".

### Edge case: cotización falla durante el flujo

- Si la cotización se pierde mientras el usuario está en Monto: se muestra la
  última conocida con el cartel de "cotización vieja", se permite continuar.
- Si nunca hubo cotización: se bloquea el flujo en Escáner con un mensaje
  claro. El usuario no puede llegar a Monto sin cotización al menos una vez.

---

## 9. Manejo de errores

| Situación                           | Dónde aparece          | Comportamiento                           |
|-------------------------------------|------------------------|------------------------------------------|
| QR inválido                         | Escáner                | Toast, sigue escaneando                  |
| Permiso de cámara denegado          | Escáner                | Pantalla alternativa con manual + ajustes|
| Cámara no disponible                | Escáner                | Pantalla alternativa con manual          |
| Dirección manual inválida           | Modal/Monto            | Mensaje inline rojo                      |
| Monto excede balance                | Monto                  | Input rojo, botón disabled, mensaje      |
| Cotización vieja (>10min)           | Monto, Confirmar       | Cartel warn, no bloquea                  |
| Sin cotización nunca                | Escáner (al entrar)    | Pantalla bloqueada con mensaje           |
| Fee no calculable                   | Confirmar (al entrar)  | Volver a Monto con toast                 |
| Broadcast falla (red)               | Confirmar              | Volver a Monto con toast                 |
| Broadcast falla (saldo / fee)       | Confirmar              | Volver a Monto con toast específico      |
| App pausa durante flujo             | Cualquiera             | Limpiar slice, ir a Home al reabrir      |

Toasts: usar `NotificationService` (ver CLAUDE.md). Duración 3-5 segundos.

---

## 10. Decisiones cerradas — referencia rápida

Tabla compilada del SESSION_HANDOFF §5 + decisiones de las dos rondas previas a
escribir este doc. Si algo de acá entra en conflicto con una propuesta futura,
gana este documento.

| # | Decisión |
|---|----------|
| 1 | Flujo multi-pantalla: Escáner → Monto → Confirmar → Éxito |
| 2 | Caso de uso primario: comerciante / persona-a-persona |
| 3 | Destinatario: dirección truncada, sin sistema de contactos |
| 4 | Confirmación: SlideToAction |
| 5 | Reemplazo total del Send viejo, no convivencia |
| 6 | App entera es "modo comerciante por default" |
| 7 | Estado entre rutas: slice `sendDraft` (rutas separadas) |
| 8 | QR BIP21 con monto: salta a Confirmar |
| 9 | Fallback sin cámara: botón manual siempre visible |
| 10 | Permiso de cámara: just-in-time, al entrar a Escáner |
| 11 | Cámara directa desde botón Enviar del Home |
| 12 | Botón Escanear eliminado del Home (ya hecho en cleanup) |
| 13 | Input fiat-first con cartel de cotización vieja >10min |
| 14 | Chips: $1.000 / $2.000 / $5.000 / $10.000 (deuda inflación) |
| 15 | Memo opcional + prefilled desde QR + cartel "memo público" |
| 16 | Confirmación: mínima + advertencia de irreversibilidad |
| 17 | Botón "Listo" → Home; sin botón Compartir |
| 18 | Si cotización falla: mantener fiat-first con última conocida + cartel |
| 19 | Modificar `exchangeRates` slice para guardar timestamp |
| 20 | Back nativo: pantalla anterior, EXCEPTO Éxito → Home |
| 21 | Pausa de app: draft se pierde, vuelve a Home al reabrir |
| 22 | Broadcast falla: vuelve a Monto con toast (incluso si entró por QR-con-monto) |

---

## 11. Fuera de alcance / deudas que aparecen al pasar

- **Bug `text-display-sm` con montos largos.** El balance del Home tiene el
  mismo problema (anotado en handoff §4). En Monto y Confirmar también puede
  pasar con montos grandes en pesos. No se resuelve en este paso — se anota
  acá para que cuando se aborde el bug del Home, se tenga en cuenta también
  estas pantallas.
- **`SlideToAction` rescate o reescritura.** El componente del Send viejo se
  borró en el cleanup. Al implementar Confirmar hay que decidir si se rescata
  del git history (`git log --diff-filter=D -- '**/SlideToAction*'`) o se
  rehace. Recomendado: rehacer, alineado al design system.
- **`SyncIndicator` en el flujo.** Se eliminó del header global en 10B.6. Si
  Electrum se cae durante el flujo Send, el broadcast fallará y caemos en el
  manejo de error. No hace falta indicador permanente. Si se vuelve un
  problema real, se evalúa después.
- **Divisa default en USD.** Sigue como deuda funcional fuera del redesign
  visual. Este flujo asume ARS — si el usuario tiene USD configurado,
  funciona pero los chips ($1.000 etc.) no tendrán sentido. Se ataca por
  separado.
- **Avatar con displayName de Google.** Anotado en NOTAS-BOLSILLO, no es de
  este paso.
- **`formatBch` vs `satsToBch`.** El flujo Send va a usar uno o el otro varias
  veces. Mantener la convención: `formatBch` para display, `satsToBch` para
  matemática. La unificación de los dos sigue como deuda post-redesign.

---

## 12. Orden de implementación sugerido

Cada bullet es un PR independiente. La regla "una pantalla por PR" se mantiene.
El orden minimiza dependencias entre PRs.

1. Slice `sendDraft` + modificación de `exchangeRates` con timestamp. PR de
   infraestructura, sin UI.
2. Pantalla **Escáner** (`/wallet/send/scan`). Permiso, cámara, parseo BIP21,
   fallback manual. Al final del PR, debería navegar a un placeholder de
   Monto.
3. Pantalla **Monto** (`/wallet/send/amount`). Input fiat-first, chips,
   conversión, memo, cartel de cotización vieja. Navega a placeholder de
   Confirmar.
4. Pantalla **Confirmar** (`/wallet/send/confirm`) + **SlideToAction**. Cálculo
   de fee, slide, manejo de error de broadcast. Navega a placeholder de Éxito.
5. Pantalla **Éxito** (`/wallet/send/success`). Layout, botón Listo, limpieza
   de slice.
6. Cableado del botón **Enviar** del Home a `/wallet/send/scan`.
7. Hooking del back nativo en cada pantalla (puede ir en el PR de cada
   pantalla, o uno separado al final si conviene).

Antes de cada PR: armar el prompt siguiendo la convención del SESSION_HANDOFF
§6 ("ANTES de tocar... esperá mi OK").
