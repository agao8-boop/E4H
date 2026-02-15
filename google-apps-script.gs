// Google Apps Script for E4H Form Submission
// Deploy this as a Web App with "Anyone" access

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Define all possible form fields in the order you want them
    const fieldNames = [
      'name',
      'email',
      'phone',
      'zipcode',
      'user_type',
      'source',
      'comments',
      'updates',
      'tips'
    ];

    // Add checkbox fields - these can have multiple values
    const checkboxFields = {
      'interest': ['starter', 'home', 'power', 'notsure'],
      'excited': ['bills', 'money', 'backup', 'portable', 'cooking', 'environment']
    };

    // If this is the first submission, create headers
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Zip Code',
        'User Type',
        'How did you hear about us?',
        'Comments',
        'Want updates?',
        'Want tips?',
        'Interest - Starter Pack',
        'Interest - Home Pack',
        'Interest - Power Pack',
        'Interest - Not sure',
        'Excited - Lower bills',
        'Excited - Making money',
        'Excited - Backup power',
        'Excited - Portable/renter-friendly',
        'Excited - Clean cooking',
        'Excited - Environmental impact'
      ];
      sheet.appendRow(headers);
    }

    // Create row data array
    const rowData = [];

    // Add timestamp
    rowData.push(new Date());

    // Add regular form fields - use empty string if blank
    fieldNames.forEach(fieldName => {
      const value = e.parameter[fieldName] || '';
      rowData.push(value);
    });

    // Handle interest checkboxes
    const interestValues = e.parameter['interest'];
    checkboxFields.interest.forEach(value => {
      if (Array.isArray(interestValues)) {
        rowData.push(interestValues.includes(value) ? 'Yes' : '');
      } else {
        rowData.push(interestValues === value ? 'Yes' : '');
      }
    });

    // Handle excited checkboxes
    const excitedValues = e.parameter['excited'];
    checkboxFields.excited.forEach(value => {
      if (Array.isArray(excitedValues)) {
        rowData.push(excitedValues.includes(value) ? 'Yes' : '');
      } else {
        rowData.push(excitedValues === value ? 'Yes' : '');
      }
    });

    // Append the row to the sheet
    sheet.appendRow(rowData);

    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success',
      'message': 'Form submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function doGet(e) {
  return ContentService.createTextOutput('E4H Form Script is running. Use POST requests to submit data.');
}
