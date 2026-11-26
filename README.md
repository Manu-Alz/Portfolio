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

## Checklist: proyecto nuevo

Un proyecto aparece en varios lugares. Al sumar uno, revisar todos:

1. **Captura** en `assets/work/` (JPG, ~1600 px de ancho, recortada arriba).
2. **Trabajo** (`index.html`, `#trabajo`): copiar un `<article class="card">`, cambiar número (`card__num`), título, año, link, captura, texto, `card__results`, `card__facts` (Rol / Desafío) y `tags`. Las tarjetas se apilan solas.
3. **Contador** del título "Trabajo" (`<sup class="mono">03</sup>`) → nueva cantidad.
4. **Panel en vivo** (`.stats`):
   - Monitor (CH·01): sumar un `<li data-ping="URL">` si el sitio está online (mide la latencia real).
   - Registro (CH·04): sumar una línea `<li><time>AÑO</time><span>…</span></li>` en orden cronológico, antes de "Ahora".
5. **Trayectoria**: si es un hito, sumarlo o mencionarlo en el `article.step` del año.
6. **Servicios / capacidades**: si suma un servicio nuevo (por ejemplo, apps o CRM), agregarlo a la lista de capacidades.
7. **Inglés** (`js/i18n.js`): traducir cada texto nuevo. Ojo: varias entradas van por posición (`".card__info > p", 2`, `".log li", 5`, …), así que al insertar una tarjeta o una línea de registro hay que correr los índices de las que siguen.
8. **CV** (`cv.html`): sumarlo si corresponde, también en su traducción.
9. **Caché**: subir `?v=N` en los `<link>`/`<script>` de `index.html` para que los navegadores tomen los cambios.
- **Tipografías:** Archivo (variable, con eje de ancho), Instrument Serif y JetBrains Mono, de Google Fonts.

## Publicar
GitHub → Settings → Pages → Source: "Deploy from a branch", rama `main`, carpeta `/ (root)`.

## Idiomas (ES / EN)

- El español está escrito directamente en `index.html`.
- El inglés vive en `js/i18n.js`: cada línea dice qué elemento cambiar y con qué texto. Si editás un texto en español, actualizá también su versión ahí.
- El botón **ES / EN** guarda la elección en el navegador. También se puede forzar con `?lang=en` o `?lang=es` en la URL (sirve para mandar el link directo en inglés).
- El CV (`cv.html`) tiene su propia traducción al final del archivo y respeta el mismo idioma elegido.
