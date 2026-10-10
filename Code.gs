/**
 * KARAOKE CONTROL — conector a la hoja de inscripciones del karaoke web.
 * La app consulta este script y muestra las nuevas inscripciones.
 */
const SPREADSHEET_ID = '1VRiAQIm1HBZZ12UlEfp6oYAXSul-4ybqATnXyyeToos';
const SHEET_NAME = 'Inscripciones Karaoke';

function doGet(e) {
  const callback = e && e.parameter && e.parameter.callback;
  try {
    return output_(getSignupData_(), callback);
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message || err), rows: [] }, callback);
  }
}

function getSignupData_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No existe la pestaña "' + SHEET_NAME + '". Comprueba que se haya creado al recibir la primera inscripción.');
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return { ok: true, rows: [] };

  const headers = values[0].map(h => String(h).trim());
  const timestampIndex = findHeader_(headers, ['fecha y hora', 'marca temporal', 'timestamp', 'fecha de envio', 'fecha']);
  const languageIndex = findHeader_(headers, ['idioma', 'language']);
  const artistIndex = findHeader_(headers, ['cantante / autor', 'cantante/autor', 'cantante o autor', 'artista', 'autor']);
  const songIndex = findHeader_(headers, ['cancion', 'song', 'tema']);
  const nameIndex = findHeader_(headers, ['nombre de quien canta', 'nombre de la persona que va a cantar', 'nombre y apellidos', 'participante', 'nombre', 'name']);

  const rows = values.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map((row, i) => {
      const timestamp = timestampIndex >= 0 ? row[timestampIndex] : row[0];
      const language = languageIndex >= 0 ? row[languageIndex] : row[1] || '';
      const artist = artistIndex >= 0 ? row[artistIndex] : row[2] || '';
      const song = songIndex >= 0 ? row[songIndex] : row[3] || '';
      const name = nameIndex >= 0 ? row[nameIndex] : row[4] || '';
      const timestampIso = timestamp instanceof Date ? timestamp.toISOString() : String(timestamp || '');
      return {
        _timestamp: timestampIso,
        _language: String(language || ''),
        _artist: String(artist || ''),
        _song: String(song || '—'),
        _name: String(name || 'Participante'),
        _id: [timestampIso, String(name || ''), String(song || ''), i].join('|')
      };
    });

  rows.sort((a, b) => new Date(a._timestamp).getTime() - new Date(b._timestamp).getTime());
  return { ok: true, rows: rows };
}

function findHeader_(headers, candidates) {
  const normalizedHeaders = headers.map(normalize_);
  for (const candidate of candidates) {
    const index = normalizedHeaders.indexOf(normalize_(candidate));
    if (index >= 0) return index;
  }
  return -1;
}

function normalize_(value) {
  return String(value || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim();
}

function output_(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
