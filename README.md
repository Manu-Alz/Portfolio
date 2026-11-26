# Manu — Portfolio

Mi portfolio: atleta (judo y surf), marcas, webs, edición de video y contenido.

🔗 https://manu-alz.github.io/Portfolio/

## Cómo está hecho
HTML, CSS y JS a mano, sin build. Para animar usa GSAP + ScrollTrigger y Lenis (scroll suave) desde CDN.
Si esas librerías no cargan o el sistema pide "reducir movimiento", la página se ve completa sin animaciones.

- `index.html`: todo el contenido (proyectos, servicios, atleta, contacto).
- `css/styles.css`: estilos. Colores en `:root` (papel `#ECE9E2`, tinta `#0E0E0E`, azul judogi `#2742FF`).
- `js/main.js`: precarga, tipografía cinética (las letras se estiran hacia el cursor), tarjetas apiladas, foto que se expande, olas en canvas, cursor y botón magnético.
- `assets/`: mi foto, la del gimnasio y capturas de cada proyecto (`assets/work/`).

## Cambios comunes
- **Email de contacto:** arriba de `js/main.js`, en `CONTACTO.email`. Si está vacío, el botón "Escribime" lleva a GitHub.
- **Sumar un proyecto:** ver la lista de abajo.
- **Tipografías:** Archivo (variable, con eje de ancho), Instrument Serif y JetBrains Mono, de Google Fonts.

## Checklist: proyecto nuevo

Un proyecto aparece en varios lugares. Al sumar uno, revisar todos:

1. **Captura** en `assets/work/` (JPG, ~1600 px de ancho, recortada arriba).
2. **Trabajo** (`index.html`, `#trabajo`): copiar un `<article class="card">`, cambiar número (`card__num`), título, año, link, captura, texto, `card__results`, `card__facts` (Rol / Desafío) y `tags`. Las tarjetas se apilan solas.
3. **Índice y contador**: sumar el proyecto al índice `.work__index` (con un `id` en su `<article>`, por ejemplo `id="p-nuevo"`) y subir el contador del título "Trabajo" (`<sup class="mono">05</sup>` en `index.html` y en la línea `kh("Work")` de `js/i18n.js`) → nueva cantidad.
4. **Trayectoria**: si es un hito, sumarlo o mencionarlo en el `article.step` del año.
5. **Servicios / capacidades**: si suma un servicio nuevo (por ejemplo, apps o CRM), agregarlo a la lista de capacidades.
6. **Inglés** (`js/i18n.js`): sumar el proyecto al objeto `CARDS`, con la parte de su link como clave (por ejemplo `"/Pulso/"`). Las traducciones se ubican por ese link, no por la posición, así que el orden de las tarjetas no importa.
7. **CV** (`cv.html`): sumarlo si corresponde, también en su traducción.
8. **Build**: correr `tools/build.ps1` (ver abajo). Actualiza la versión de caché sola y regenera `/en/`.

## Publicar
GitHub → Settings → Pages → Source: "Deploy from a branch", rama `main`, carpeta `/ (root)`.

## Build (antes de cada commit)

```powershell
powershell -ExecutionPolicy Bypass -File tools/build.ps1
```

1. Pone `?v=<hash>` en los CSS/JS de `index.html` según su contenido: no hay que subir la versión a mano.
2. Genera `en/index.html`, la versión en inglés como página real (indexable por Google), a partir de `index.html` + las traducciones de `js/i18n.js`. Usa Microsoft Edge en modo headless.

`en/index.html` es un archivo generado: no se edita a mano.

## Idiomas (ES / EN)

- **Español:** `index.html` (la página base, en `/`).
- **Inglés:** `en/index.html` (en `/en/`), generado con el build. Las traducciones viven en `js/i18n.js`: cada línea dice qué elemento cambiar y con qué texto. Si editás un texto en español, actualizá su versión ahí y corré el build.
- Las dos páginas se enlazan con `hreflang` y tienen su propio `canonical`, título y metadatos.
- El botón **ES / EN** lleva a la otra página y guarda la elección en el navegador. Los links viejos con `?lang=en` siguen funcionando (redirigen a `/en/`).
- El CV (`cv.html`) tiene su propia traducción al final del archivo y respeta el mismo idioma elegido.

## SEO

- Metadatos: `canonical`, `hreflang`, Open Graph y Twitter Card en el `<head>`. Imagen para compartir: `assets/og.jpg` y `assets/og-en.jpg` (1200×630).
- Datos estructurados JSON-LD (`Person` y `WebSite`) en el `<head>`.
- `sitemap.xml` y `robots.txt` en la raíz. Ojo: en un sitio de proyecto de GitHub Pages (`/Portfolio/`) los buscadores solo leen el `robots.txt` del dominio (`manu-alz.github.io/robots.txt`). El sitemap hay que enviarlo a mano en Google Search Console.
