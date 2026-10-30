# Manual de instalación y uso

Genera el PDF a partir de `manual.html`.

## Generar el PDF

```bash
# Opción A: usar un Chromium ya instalado
CHROMIUM_PATH=/ruta/a/chrome node manual/build-manual.mjs

# Opción B: instalar el Chromium que espera Playwright
npx playwright install chromium
node manual/build-manual.mjs
```

Salida: `manual/Bolsillo-BCH-Manual.pdf`.

## Capturas

Las imágenes viven en `manual/assets/screens/`. Ya están integradas las capturas
reales; si las cambiás, mantené los mismos nombres. La `02` es un diagrama en
español del permiso de Android (no una captura).

| Archivo | Pantalla |
|---|---|
| `01-fdroid-web.png` | f-droid.org, botón de descarga |
| `02-permitir-instalacion.png` | Android: permitir instalar apps desconocidas |
| `03-fdroid-home.png` | F-Droid: ícono de la caja (Repositorios) |
| `04-fdroid-qr.png` | F-Droid escaneando el QR del repo |
| `05-instalar-bolsillo.png` | F-Droid: ficha de Bolsillo BCH |
| `06-login.png` | Bolsillo: “Entrar con Google” |
| `07-home.png` | Bolsillo: Inicio |
| `08-recibir.png` | Bolsillo: Recibir |
| `09-enviar.png` | Bolsillo: Enviar |
| `10-modo-estable.png` | Ajustes → Modo Estable |
| `11-seed.png` | Ajustes → Seguridad → Frase de recuperación |

## Otros assets

- `assets/logo.png` — ícono de la app.
- `assets/fdroid-qr.png` — QR del repositorio F-Droid.
