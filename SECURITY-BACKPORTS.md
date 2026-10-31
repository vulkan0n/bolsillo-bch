# Backports de seguridad (fork Bolsillo BCH)

Este fork está basado en Selene `2026.03.08`. Upstream avanzó a `2026.10.02`
con un refactor grande. **No hacemos merge completo**: solo backports chicos,
aislados y testeables. Si un fix requiere tocar el core de forma profunda, se
documenta y se descarta.

Regla: no tocar `AppProvider`, `DatabaseService`, `FilesystemService`,
`SecurityService` ni `JanitorService` más allá de cambios de 1–2 líneas.

## Código

| Upstream | Qué arregla | Estado |
|---|---|---|
| `e2bda5b9` | Sync de UTXOs con Fulcrum y transacciones sin confirmar | Aplicado |
| `a7811f6e` | No tratar cualquier archivo como `.db.bak` en migración legacy | Aplicado |
| `ac635369` | Serializar guardados y flush al reanudar | Diferido (toca DB/Filesystem/WalletManager) |
| `2888cf42` | Recuperación de wallets desde DB | Diferido (1.290 líneas, alto riesgo) |
| `65756838` | Runtime hardening/persistence | Diferido (refactor grande) |
| `f278b184` | Limpieza de encryption/file ops | Diferido (refactor grande) |
| `91ffc6c0` | QR scanner en JS | Diferido (no es seguridad; cambia scanner) |
| `1bef820f` | Test de MAX | No aplica (solo test) |

## Dependencias (`pnpm audit --prod`)

| Paquete | Severidad | Actual → objetivo | Estado |
|---|---|---|---|
| `@capacitor/android`, `@capacitor/ios` | Crítica (CVE-2026-103922, 9.3) | 8.0.0 → 8.5.1 (instalado 8.5.1) | Actualizado |
| `react-router` | Alta | 7.11.0 → 7.12.0 (instalado 7.12.0) | Actualizado |
| `ws` (Electrum) | Alta | 8.18.3 → 8.21.0+ (instalado 8.22.1) | Actualizado |
| `jspdf` | Crítica | 3.0.4 → 4.0.0 | Diferido (major; evaluar en rama aparte) |
| `dompurify` (vía jsPDF) | Alta | → 3.4.17 | Diferido con jsPDF |
| `h3`, `picomatch`, `defu` (vía WalletConnect/unstorage) | Alta/moderada | parcheadas | Diferido; revisar reachability |
| `ws` 7.5.10 (WalletConnect) | Alta | 8.21.0 | Diferido; no forzar major |
| `fflate`, `deepmerge` | Moderada/baja | — | Documentado |

### CVE-2026-103922 (Capacitor)

El proxy interno `/_capacitor_http_interceptor_` permitía cargar contenido
remoto en el origen de la app. Requiere que la víctima active un link dentro
del WebView. Se actualizó Capacitor a 8.5.1 (parcheado). La app no usa
`dangerouslySetInnerHTML` ni renderiza HTML arbitrario, lo que reduce la
exposición. Verificar login, backup, Electrum y navegación después del update.

## Checklist de release

- [ ] `pnpm vitest run`
- [ ] `pnpm build:ci`
- [ ] `npx cap sync android`
- [ ] `./gradlew assembleRelease` (sin `clean` salvo que falle)
- [ ] Instalar sobre la versión anterior (misma firma) y abrir la app
- [ ] Login con dos cuentas, backup/restore, enviar/recibir, MAX, Modo Estable, logout/login
- [ ] Electrum conecta y sincroniza
- [ ] Verificar `apksigner` y SHA-256 del APK
- [ ] `fdroid update`, commit/push del repo F-Droid y verificar HTTPS

## Rollback

Tag `2026.03.16` antes de la release. Si un backport o upgrade rompe algo, se
revierte ese cambio, se publica solo el subconjunto seguro y se deja la
release anterior disponible en F-Droid.

## Cadencia

Cada 1–3 meses: `git fetch upstream`, `pnpm audit --prod` y revisar solo
commits con `security|encrypt|recover|electrum|fulcrum|database|persistence|dependency`.
Aplicar únicamente lo que pase tests y no toque el core de forma profunda.
