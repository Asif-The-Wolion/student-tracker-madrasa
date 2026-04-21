// ════════════════════════════════════════════════════════════════
// Asif National — Student Tracker: Google Apps Script Backend
// Paste this entire file into your Google Sheet's Apps Script editor
// Extensions → Apps Script → paste → Save → Deploy
// ════════════════════════════════════════════════════════════════

const SHEET_ID   = '14hMZngFLesd3329qfyOIqJ8nlmImyEggMekIS2gH5GI';
const ADMIN_KEY  = '2743369';
const ADMIN_EMAIL = 'thewolion@gmail.com';

// Sheet tab names
const S_STUDENTS = 'Students';
const S_ENTRIES  = 'Entries';
const S_APPROVED = 'ApprovedEmails';

// ── INIT SHEETS ──────────────────────────────────────────────────────────────
function initSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Students sheet
  if (!ss.getSheetByName(S_STUDENTS)) {
    const sh = ss.insertSheet(S_STUDENTS);
    sh.appendRow(['id','name','class','roll','guardian','addedBy','addedAt']);
    sh.getRange('1:1').setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#ffffff');
  }
  
  // Entries sheet
  if (!ss.getSheetByName(S_ENTRIES)) {
    const sh = ss.insertSheet(S_ENTRIES);
    sh.appendRow(['id','studentId','class','subject','type','marks','total','pct','hw','handwriting','attention','behaviour','notes','loggedBy','date']);
    sh.getRange('1:1').setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#ffffff');
  }
  
  // ApprovedEmails sheet
  if (!ss.getSheetByName(S_APPROVED)) {
    const sh = ss.insertSheet(S_APPROVED);
    sh.appendRow(['email','role','addedAt']);
    sh.getRange('1:1').setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#ffffff');
    // Add admin as first row
    sh.appendRow([ADMIN_EMAIL, 'Admin', new Date().toISOString()]);
  }
  
  return ss;
}

// ── HTTP HANDLER ─────────────────────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;
  const key    = e.parameter.adminKey;
  
  // Key check for read operations (optional, for security)
  // Remove this check if you want reports to be readable without key
  
  try {
    let result = {};
    
    if (action === 'getStudents') {
      result = { students: getStudents() };
    } else if (action === 'getEntries') {
      result = { entries: getEntries() };
    } else if (action === 'getApproved') {
      result = { approved: getApproved() };
    } else {
      result = { error: 'Unknown action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action || e.parameter.action;
    const key    = body.adminKey;
    
    if (key !== ADMIN_KEY) {
      return jsonResp({ error: 'Unauthorized' });
    }
    
    if (action === 'append') {
      if (body.type === 'student') appendStudent(body.data);
      if (body.type === 'entry')   appendEntry(body.data);
      return jsonResp({ ok: true });
      
    } else if (action === 'replaceAll') {
      replaceStudents(body.students || []);
      replaceEntries(body.entries   || []);
      return jsonResp({ ok: true });
      
    } else if (action === 'addApproved') {
      addApproved(body.email, body.role);
      return jsonResp({ ok: true });
      
    } else if (action === 'removeApproved') {
      removeApproved(body.email);
      return jsonResp({ ok: true });
    }
    
    return jsonResp({ error: 'Unknown action' });
    
  } catch (err) {
    return jsonResp({ error: err.message });
  }
}

function jsonResp(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── STUDENTS ──────────────────────────────────────────────────────────────────
function getStudents() {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_STUDENTS);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function appendStudent(s) {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_STUDENTS);
  sh.appendRow([s.id, s.name, s.class, s.roll||'', s.guardian||'', s.addedBy||'', s.addedAt||'']);
}

function replaceStudents(arr) {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_STUDENTS);
  const lastRow = sh.getLastRow();
  if (lastRow > 1) sh.deleteRows(2, lastRow - 1);
  arr.forEach(s => sh.appendRow([s.id, s.name, s.class, s.roll||'', s.guardian||'', s.addedBy||'', s.addedAt||'']));
}

// ── ENTRIES ───────────────────────────────────────────────────────────────────
function getEntries() {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_ENTRIES);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = typeof row[i] === 'number' ? row[i] : (row[i] || '');
    });
    // Parse numeric fields
    ['marks','total','pct','hw','handwriting','attention','behaviour'].forEach(k => {
      if (obj[k] !== '') obj[k] = Number(obj[k]);
    });
    return obj;
  });
}

function appendEntry(e) {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_ENTRIES);
  sh.appendRow([
    e.id, e.studentId, e.class, e.subject, e.type,
    e.marks, e.total, e.pct, e.hw,
    e.handwriting, e.attention, e.behaviour,
    e.notes||'', e.loggedBy||'', e.date||''
  ]);
}

function replaceEntries(arr) {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_ENTRIES);
  const lastRow = sh.getLastRow();
  if (lastRow > 1) sh.deleteRows(2, lastRow - 1);
  arr.forEach(e => sh.appendRow([
    e.id, e.studentId, e.class, e.subject, e.type,
    e.marks, e.total, e.pct, e.hw,
    e.handwriting, e.attention, e.behaviour,
    e.notes||'', e.loggedBy||'', e.date||''
  ]));
}

// ── APPROVED EMAILS ──────────────────────────────────────────────────────────
function getApproved() {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_APPROVED);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(row => ({ email: row[0], role: row[1] }))
             .filter(e => e.email && e.email !== ADMIN_EMAIL); // exclude admin row
}

function addApproved(email, role) {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_APPROVED);
  sh.appendRow([email, role||'Viewer', new Date().toISOString()]);
}

function removeApproved(email) {
  const ss = initSheets();
  const sh = ss.getSheetByName(S_APPROVED);
  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0].toLowerCase() === email.toLowerCase()) {
      sh.deleteRow(i + 1);
    }
  }
}
