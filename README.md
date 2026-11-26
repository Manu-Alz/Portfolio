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
- **Sumar un proyecto:** copiá un `<article class="card">` en `index.html`, cambiá el número, el link, la captura y el texto. Las tarjetas se apilan solas.
- **Tipografías:** Archivo (variable, con eje de ancho), Instrument Serif y JetBrains Mono, de Google Fonts.

## Publicar
GitHub → Settings → Pages → Source: "Deploy from a branch", rama `main`, carpeta `/ (root)`.

## Idiomas (ES / EN)

- El español está escrito directamente en `index.html`.
- El inglés vive en `js/i18n.js`: cada línea dice qué elemento cambiar y con qué texto. Si editás un texto en español, actualizá también su versión ahí.
- El botón **ES / EN** guarda la elección en el navegador. También se puede forzar con `?lang=en` o `?lang=es` en la URL (sirve para mandar el link directo en inglés).
- El CV (`cv.html`) tiene su propia traducción al final del archivo y respeta el mismo idioma elegido.
