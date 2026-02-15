// Google Apps Script for E4H Form Submission with Tracking - COMPLETE VERSION
// Deploy this as a Web App with "Anyone" access

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Detect submission type based on parameters
    const params = e.parameter;

    // Newsletter subscription
    if (params.newsletter === 'yes') {
      handleNewsletterSubscription(spreadsheet, params);
      return createSuccessResponse('Newsletter subscription successful');
    }

    // Calculator tracking
    if (params.tracking_type === 'calculator') {
      handleCalculatorTracking(spreadsheet, params);
      return createSuccessResponse('Calculator tracking recorded');
    }

    // Index page savings preview tracking
    if (params.tracking_type === 'savings_preview') {
      handleSavingsPreviewTracking(spreadsheet, params);
      return createSuccessResponse('Savings preview tracking recorded');
    }

    // Regular form submission (interest form)
    handleFormSubmission(spreadsheet, params);
    return createSuccessResponse('Form submitted successfully');

  } catch (error) {
    return createErrorResponse(error.toString());
  }
}

// Newsletter subscriptions
function handleNewsletterSubscription(spreadsheet, params) {
  let sheet = spreadsheet.getSheetByName('Newsletter');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Newsletter');
    sheet.appendRow(['Timestamp', 'Email']);
  }

  sheet.appendRow([
    new Date(),
    params.email || ''
  ]);
}

// Calculator interaction tracking
function handleCalculatorTracking(spreadsheet, params) {
  let sheet = spreadsheet.getSheetByName('Calculator Tracking');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Calculator Tracking');
    sheet.appendRow([
      'Timestamp',
      'User IP/Session',
      'Appliances Count',
      'Total Daily kWh',
      'Morning Usage %',
      'Afternoon Usage %',
      'Evening Usage %',
      'Night Usage %',
      'Utility Provider',
      'Monthly Savings Estimate',
      'VPP Earnings Estimate',
      'Recommended System',
      'System Price',
      'Payback Period'
    ]);
  }

  sheet.appendRow([
    new Date(),
    params.user_session || params.ip || 'Unknown',
    params.appliances_count || '',
    params.total_kwh || '',
    params.morning_usage || '',
    params.afternoon_usage || '',
    params.evening_usage || '',
    params.night_usage || '',
    params.utility || '',
    params.monthly_savings || '',
    params.vpp_earnings || '',
    params.recommended_system || '',
    params.system_price || '',
    params.payback_period || ''
  ]);
}

// Index page savings preview tracking
function handleSavingsPreviewTracking(spreadsheet, params) {
  let sheet = spreadsheet.getSheetByName('Savings Preview');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Savings Preview');
    sheet.appendRow([
      'Timestamp',
      'User IP/Session',
      'Appliance Count',
      'Estimated Savings'
    ]);
  }

  sheet.appendRow([
    new Date(),
    params.user_session || params.ip || 'Unknown',
    params.appliance_count || '',
    params.estimated_savings || ''
  ]);
}

// Regular form submission (existing functionality)
function handleFormSubmission(spreadsheet, params) {
  let sheet = spreadsheet.getSheetByName('Form Submissions');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Form Submissions');
  }

  // Define regular form fields
  const textFields = [
    'name',
    'email',
    'phone',
    'zipcode',
    'user_type',
    'source',
    'comments'
  ];

  // Define single checkbox fields
  const singleCheckboxFields = ['updates', 'tips'];

  // Define multi-checkbox fields
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

  // Add regular text form fields
  textFields.forEach(fieldName => {
    const value = params[fieldName] || '';
    rowData.push(value);
  });

  // Handle single checkbox fields (updates, tips)
  singleCheckboxFields.forEach(fieldName => {
    const value = params[fieldName];
    rowData.push(value === 'on' ? 'Yes' : '');
  });

  // Handle interest checkboxes
  const interestValues = params['interest'];
  checkboxFields.interest.forEach(value => {
    if (Array.isArray(interestValues)) {
      rowData.push(interestValues.includes(value) ? 'Yes' : '');
    } else {
      rowData.push(interestValues === value ? 'Yes' : '');
    }
  });

  // Handle excited checkboxes
  const excitedValues = params['excited'];
  checkboxFields.excited.forEach(value => {
    if (Array.isArray(excitedValues)) {
      rowData.push(excitedValues.includes(value) ? 'Yes' : '');
    } else {
      rowData.push(excitedValues === value ? 'Yes' : '');
    }
  });

  // Append the row to the sheet
  sheet.appendRow(rowData);
}

// Helper functions
function createSuccessResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    'result': 'success',
    'message': message
  })).setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    'result': 'error',
    'message': message
  })).setMimeType(ContentService.MimeType.JSON);
}

// Test function to verify the script works
function doGet(e) {
  return ContentService.createTextOutput('E4H Form Script with Tracking is running. Use POST requests to submit data.');
}
