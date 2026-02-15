// Google Apps Script for E4H Form Submission and Tracking
// Deploy this as a Web App with "Anyone" access

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Determine which type of submission this is
    const eventType = e.parameter['event_type'] || 'signup';
    const subscriptionType = e.parameter['subscription_type'];

    // Route to appropriate handler
    if (subscriptionType === 'newsletter') {
      return handleNewsletterSubscription(ss, e);
    } else if (eventType === 'quick_preview') {
      return handleQuickPreview(ss, e);
    } else if (eventType === 'calculator_session') {
      return handleCalculatorSession(ss, e);
    } else {
      return handleSignupForm(ss, e);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle newsletter subscriptions
function handleNewsletterSubscription(ss, e) {
  let sheet = ss.getSheetByName('Newsletter Subscriptions');
  if (!sheet) {
    sheet = ss.insertSheet('Newsletter Subscriptions');
    sheet.appendRow(['Timestamp', 'Email', 'Source Page']);
  }

  sheet.appendRow([
    new Date(),
    e.parameter['email'] || '',
    e.parameter['source_page'] || 'footer'
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    'result': 'success',
    'message': 'Newsletter subscription successful'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle quick preview interactions
function handleQuickPreview(ss, e) {
  let sheet = ss.getSheetByName('Quick Preview Tracking');
  if (!sheet) {
    sheet = ss.insertSheet('Quick Preview Tracking');
    sheet.appendRow(['Timestamp', 'Appliance Count', 'Estimated Savings', 'User IP']);
  }

  // Get user's IP address (if available)
  const userIp = e.parameter['userIp'] || 'unknown';

  sheet.appendRow([
    new Date(),
    e.parameter['appliance_count'] || '',
    e.parameter['estimated_savings'] || '',
    userIp
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    'result': 'success',
    'message': 'Quick preview tracked'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle calculator session tracking
function handleCalculatorSession(ss, e) {
  let sheet = ss.getSheetByName('Calculator Sessions');
  if (!sheet) {
    sheet = ss.insertSheet('Calculator Sessions');
    sheet.appendRow([
      'Timestamp',
      'Zip Code',
      'Utility',
      'Appliances Selected',
      'Usage Pattern',
      'Monthly Savings',
      'Recommended System',
      'User IP'
    ]);
  }

  const userIp = e.parameter['userIp'] || 'unknown';

  sheet.appendRow([
    new Date(),
    e.parameter['zipcode'] || '',
    e.parameter['utility'] || '',
    e.parameter['appliances'] || '',
    e.parameter['usage_pattern'] || '',
    e.parameter['monthly_savings'] || '',
    e.parameter['recommended_system'] || '',
    userIp
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    'result': 'success',
    'message': 'Calculator session tracked'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle main signup form
function handleSignupForm(ss, e) {
  let sheet = ss.getSheetByName('Signups') || ss.getActiveSheet();

  // Define all possible form fields
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

  // Add checkbox fields
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

  // Add regular form fields
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

  // Append the row
  sheet.appendRow(rowData);

  return ContentService.createTextOutput(JSON.stringify({
    'result': 'success',
    'message': 'Form submitted successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Test function
function doGet(e) {
  return ContentService.createTextOutput('E4H Form Script is running. Use POST requests to submit data.');
}
