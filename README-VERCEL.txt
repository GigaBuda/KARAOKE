KARAOKE CONTROL — VERSIÓN PARA VERCEL
====================================

QUÉ INCLUYE
- Interfaz web adaptable a ordenador, tablet y móvil.
- Lista de inscripciones ordenada por fecha/hora de llegada.
- Búsqueda, filtros y estados Pendiente / Cantando / Finalizado.
- Actualización automática configurable.
- Avisos de nuevas inscripciones y notificaciones del navegador compatibles.
- PWA instalable.
- Code.gs: conector que se publica en Google Apps Script (no en Vercel).

PUBLICAR LA INTERFAZ EN VERCEL
1. Descomprime este ZIP.
2. Sube estos archivos a un repositorio de GitHub: index.html, icon.svg,
   manifest.webmanifest, sw.js y vercel.json. Puedes incluir README-VERCEL.txt.
3. Entra en https://vercel.com/ e importa ese repositorio (Add New > Project).
4. Selecciona Framework Preset: Other.
5. No hace falta comando de build. Deja Build Command vacío o desactivado.
   Si Vercel solicita Output Directory, usa el directorio raíz (.) y no una
   carpeta dist/build.
6. Pulsa Deploy. Vercel te dará una dirección HTTPS.
7. Abre la web y pulsa Configurar. Pega la URL canónica de Apps Script que
   comienza por https://script.google.com/macros/s/ y termina en /exec.

IMPORTANTE: VERCEL Y GOOGLE APPS SCRIPT SON DOS PUBLICACIONES DISTINTAS
- Vercel aloja la interfaz (HTML, icono, manifest y service worker).
- Code.gs se copia a un proyecto de Google Apps Script y se publica como
  Aplicación web. No se pega Code.gs en Vercel.
- En Apps Script, el conector debe tener el ID de la hoja y la pestaña
  Inscripciones Karaoke correctos, y devolver JSONP usando el parámetro callback.
- Después de desplegar Apps Script, copia la URL que muestra la pantalla de
  implementación. No uses la URL de redirección script.googleusercontent.com.

CONEXIÓN
La interfaz pide la URL /exec la primera vez. En Configurar, pega la URL y
elige la frecuencia de comprobación. La app guarda URL, frecuencia y estados
localmente en ese navegador. Los estados no se comparten entre dispositivos.

PRIVACIDAD
El endpoint de Apps Script puede exponer los datos que devuelve a quien tenga
acceso a la URL. Limita los datos devueltos y no incluyas información personal
innecesaria. La interfaz no necesita tu contraseña de Google.
