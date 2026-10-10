KARAOKE CONTROL — CARPETA DEL CONECTOR

IMPORTANTE
- Esta carpeta contiene el conector para Google Apps Script.
- No se ejecuta ni se publica directamente en Vercel.
- La interfaz de Vercel está en la raíz del repositorio: index.html, vercel.json,
  manifest.webmanifest, sw.js e icon.svg.

INSTALACIÓN DEL CONECTOR
1. Abre https://script.google.com/
2. Crea un proyecto de Apps Script.
3. Copia el contenido de control/Code.gs en el editor.
4. Guarda el proyecto.
5. Implementar > Nueva implementación > Aplicación web.
6. Configura el acceso necesario para que el panel pueda leer las inscripciones.
7. Copia la URL canónica que termina en /exec y pégala en Configurar dentro de Karaoke Control.

CONFIGURACIÓN
El script usa la hoja de cálculo configurada en SPREADSHEET_ID y la pestaña
"Inscripciones Karaoke". Si el nombre de la pestaña de respuestas es distinto,
actualiza SHEET_NAME antes de implementar.

No guardes contraseñas ni claves privadas en el repositorio.
