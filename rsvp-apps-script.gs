/**
 * Liz & Colin — RSVP receiver
 *
 * Paste this into Extensions → Apps Script in your RSVP Google Sheet,
 * then Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL (it ends in /exec) into RSVP_ENDPOINT in index.html.
 *
 * Each guest gets their own row in the "RSVPs" tab (created on first use), so you
 * can count dinners with a filter or COUNTIF. Rows from the same reply share a Party ID,
 * and a reply that arrives twice (a retry after a slow connection) is only saved once.
 */

const SHEET_NAME = 'RSVPs';
const HEADERS = ['Submitted', 'Party ID', 'Email', 'Attending', 'Party size', 'Guest name', 'Dinner', 'Note'];
const MAX_GUESTS = 8; // a safety cap; the website controls how many guests can be listed

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Spam trap: real people never see or fill the hidden "website" field.
  if (p.website) return reply({ ok: true });

  const attending = p.attend === 'yes';
  const count = attending ? Math.min(Math.max(parseInt(p.guests, 10) || 1, 1), MAX_GUESTS) : 1;

  const guests = [];
  for (let i = 1; i <= count; i++) {
    const name = clean(p['guest' + i + '_name']);
    if (!name) return reply({ ok: false, error: 'Missing name for guest ' + i + '.' });
    guests.push({ name: name, meal: attending ? clean(p['guest' + i + '_meal']) : '' });
  }

  const now = new Date();
  // The page sends one ID per reply and reuses it on retries; fall back to a fresh one if it's missing.
  const sid = String(p.submission_id || '');
  const partyId = /^[a-z0-9]{8,32}$/i.test(sid) ? sid.slice(0, 16) : Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  const email = clean(p.email);
  const note = clean(p.note);
  const rows = guests.map(function (g, i) {
    return [now, partyId, email, attending ? 'Yes' : 'No', attending ? count : 0, g.name, g.meal, i === 0 ? note : ''];
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // keeps simultaneous RSVPs from overwriting each other
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    // A retry of a reply we already saved: say OK, write nothing.
    if (sheet.getLastRow() > 1) {
      const seen = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).createTextFinder(partyId).matchEntireCell(true).findNext();
      if (seen) return reply({ ok: true, duplicate: true });
    }
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the URL in a browser shows this, so you can check the deployment is live.
function doGet() {
  return reply({ ok: true, message: 'RSVP endpoint is running.' });
}

// Trim long input and stop text that starts with = + - @ from being read as a formula.
function clean(value) {
  const s = String(value || '').trim().slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
