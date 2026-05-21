/**
 * ACCIDENT NETWORKS — Google Apps Script
 * Receives form submissions → writes to Google Sheet
 *
 * SETUP:
 * 1. Google Sheets → Extensions → Apps Script
 * 2. Paste this file, save
 * 3. Deploy → New Deployment → Web App
 *    Execute as: Me | Who has access: Anyone
 * 4. Copy Web App URL
 * 5. In loader.js, replace YOUR_SCRIPT_ID_HERE with that URL
 */

var SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      var headers = ['Timestamp','Name','Phone','Accident Type',
                     'City','State','County','Source Site','Page URL','Status'];
      sheet.appendRow(headers);
      var hRange = sheet.getRange(1, 1, 1, headers.length);
      hRange.setFontWeight('bold').setBackground('#1D2F55').setFontColor('#D4AF37');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(9, 300);
    }

    var p = e.parameter;
    sheet.appendRow([
      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      p.name         || '',
      p.phone        || '',
      p.accidentType || '',
      p.city         || p.cityField || '',
      p.state        || '',
      p.county       || '',
      p.source       || '',
      p.pageUrl      || '',
      'New'
    ]);

    // Uncomment to receive email alerts:
    // MailApp.sendEmail('you@email.com',
    //   'New Lead: ' + (p.city||'') + ' — ' + (p.name||''),
    //   'Phone: ' + (p.phone||'') + '\nCity: ' + (p.city||'') +
    //   '\nAccident: ' + (p.accidentType||'') + '\nSource: ' + (p.source||''));

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', msg: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'active', service: 'Accident Networks' }))
    .setMimeType(ContentService.MimeType.JSON);
}
