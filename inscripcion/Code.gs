const SHEET_ID = '1VRiAQIm1HBZZ12UlEfp6oYAXSul-4ybqATnXyyeToos';
const RESPONSE_SHEET_NAME = 'Inscripciones Karaoke';

const LANGUAGES = [
  { label: 'Inglés', key: 'english' },
  { label: 'Infantil', key: 'infantil' },
  { label: 'Español', key: 'espanol' },
  { label: 'Italiano', key: 'italiano' },
  { label: 'Catalán', key: 'catala' },
  { label: 'Francés', key: 'francais' },
  { label: 'Neerlandés', key: 'nederlands' }
];

function doGet(e) {
  // API para el formulario alojado en Vercel; sin parámetro sigue mostrando la página Apps Script.
  const api = e && e.parameter ? e.parameter.api : '';
  if (api === 'catalog') {
    return jsonResponse_({ok: true, catalog: getCatalog()});
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Inscripciones Karaoke')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  const api = e && e.parameter ? e.parameter.api : '';
  if (api !== 'signup') {
    return jsonResponse_({ok: false, message: 'Endpoint no válido.'});
  }
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);
    return jsonResponse_(submitSignup(payload));
  } catch (err) {
    return jsonResponse_({ok: false, message: err && err.message ? err.message : String(err)});
  }
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalize_(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findLanguageSheet_(ss, key) {
  const aliases = {
    english: ['englishkaraoke', 'english'],
    infantil: ['karaokeinfantil', 'infantil'],
    espanol: ['karaokeespanol', 'espanol'],
    italiano: ['karaokeitaliano', 'italiano'],
    catala: ['karaokecatala', 'catala', 'catalan'],
    francais: ['karaokefrancais', 'francais', 'frances'],
    nederlands: ['nederlandsekaraoke', 'nederlands', 'holandes']
  };
  const candidates = aliases[key] || [key];
  const sheets = ss.getSheets().map(sheet => ({sheet, name: normalize_(sheet.getName())}));
  for (const candidate of candidates) {
    const found = sheets.find(item => item.name.includes(candidate));
    if (found) return found.sheet;
  }
  throw new Error('No encuentro la pestaña para el idioma: ' + key);
}

function getCatalog() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const result = {};
  LANGUAGES.forEach(lang => {
    const sheet = findLanguageSheet_(ss, lang.key);
    const lastRow = sheet.getLastRow();
    const entries = [];
    if (lastRow >= 2) {
      const artists = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
      const songs = sheet.getRange(2, 4, lastRow - 1, 1).getDisplayValues();
      for (let i = 0; i < artists.length; i++) {
        const artist = String(artists[i][0] || '').trim();
        const song = String(songs[i][0] || '').trim();
        if (artist && song) entries.push({artist, song});
      }
    }
    const artistsList = [...new Set(entries.map(x => x.artist))].sort((a,b) => a.localeCompare(b, 'es'));
    const songsByArtist = {};
    artistsList.forEach(artist => {
      songsByArtist[artist] = [...new Set(entries.filter(x => x.artist === artist).map(x => x.song))]
        .sort((a,b) => a.localeCompare(b, 'es'));
    });
    result[lang.key] = {label: lang.label, artists: artistsList, songsByArtist};
  });
  return result;
}

function submitSignup(payload) {
  if (!payload) throw new Error('No se han recibido los datos.');
  const language = LANGUAGES.find(x => x.key === payload.language);
  if (!language) throw new Error('Selecciona un idioma.');
  const artist = String(payload.artist || '').trim();
  const song = String(payload.song || '').trim();
  const singerName = String(payload.singerName || '').trim();
  if (!artist || !song || !singerName) throw new Error('Completa todos los campos.');

  const catalog = getCatalog()[language.key];
  if (!catalog || !catalog.songsByArtist[artist] || !catalog.songsByArtist[artist].includes(song)) {
    throw new Error('La canción no corresponde al cantante. Actualiza la página e inténtalo de nuevo.');
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(RESPONSE_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RESPONSE_SHEET_NAME);
    sheet.appendRow(['Fecha y hora', 'Idioma', 'Cantante / autor', 'Canción', 'Nombre de quien canta']);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date(), language.label, artist, song, singerName]);
  const last = sheet.getLastRow();
  if (last > 2) sheet.getRange(2, 1, last - 1, 5).sort({column: 1, ascending: true});
  sheet.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  return {ok: true, message: '¡Inscripción registrada correctamente!'};
}
