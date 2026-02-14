# Google Apps Script Data Alignment Fix

## Problems Identified

### Problem 1: `updates` and `tips` Treated as Text Fields
Your original script treated `updates` and `tips` as regular text fields in the `fieldNames` array:

```javascript
const fieldNames = [
  'name', 'email', 'phone', 'zipcode', 'user_type', 'source', 'comments',
  'updates', 'tips'  // ❌ WRONG - These are checkboxes, not text!
];
```

But in your HTML form (index.html:1172-1180 and b2b.html), these are **checkboxes**:
```html
<input type="checkbox" id="updates" name="updates">
<input type="checkbox" id="tips" name="tips">
```

**How checkboxes behave:**
- When checked: sends value `"on"`
- When unchecked: sends nothing (undefined)

This caused misalignment because the script expected text values but received checkbox values.

### Problem 2: Column Order Mismatch
The original script added data in this order:
1. Timestamp
2. All fieldNames (including updates/tips as text)
3. Interest checkboxes
4. Excited checkboxes

But this didn't match the header order, which expected:
1. Timestamp
2. Text fields (name through comments)
3. **Single checkboxes (updates, tips)** ← These should come BEFORE multi-checkboxes
4. Interest multi-checkboxes
5. Excited multi-checkboxes

## The Fix

### Changed Column Order
The fixed script processes fields in the correct order:

```javascript
// 1. Regular text fields (no updates/tips here!)
const textFields = [
  'name', 'email', 'phone', 'zipcode', 'user_type', 'source', 'comments'
];

// 2. Single checkbox fields (NEW!)
const singleCheckboxFields = ['updates', 'tips'];

// 3. Multi-checkbox fields (same as before)
const checkboxFields = {
  'interest': ['starter', 'home', 'power', 'notsure'],
  'excited': ['bills', 'money', 'backup', 'portable', 'cooking', 'environment']
};
```

### Proper Checkbox Handling
The fixed script now converts checkbox values correctly:

```javascript
// Handle single checkbox fields (updates, tips)
singleCheckboxFields.forEach(fieldName => {
  const value = e.parameter[fieldName];
  rowData.push(value === 'on' ? 'Yes' : '');  // Convert "on" to "Yes", undefined to ""
});
```

## Data Flow Comparison

### ❌ Original (WRONG)
| Column | Value Source | What Was Saved |
|--------|--------------|----------------|
| Col 1 | Timestamp | ✓ Correct |
| Col 2 | name | ✓ Correct |
| Col 3 | email | ✓ Correct |
| Col 4 | phone | ✓ Correct |
| Col 5 | zipcode | ✓ Correct |
| Col 6 | user_type | ✓ Correct |
| Col 7 | source | ✓ Correct |
| Col 8 | comments | ✓ Correct |
| Col 9 | updates | ❌ Saved "on" or undefined (should be "Yes" or "") |
| Col 10 | tips | ❌ Saved "on" or undefined (should be "Yes" or "") |
| Col 11-14 | interest[] | ❌ Misaligned - data went to wrong columns |
| Col 15-20 | excited[] | ❌ Misaligned - data went to wrong columns |

### ✓ Fixed (CORRECT)
| Column | Value Source | What Is Saved |
|--------|--------------|---------------|
| Col 1 | Timestamp | ✓ Correct |
| Col 2 | name | ✓ Correct |
| Col 3 | email | ✓ Correct |
| Col 4 | phone | ✓ Correct |
| Col 5 | zipcode | ✓ Correct |
| Col 6 | user_type | ✓ Correct |
| Col 7 | source | ✓ Correct |
| Col 8 | comments | ✓ Correct |
| Col 9 | updates | ✓ "Yes" or "" (properly converted) |
| Col 10 | tips | ✓ "Yes" or "" (properly converted) |
| Col 11-14 | interest[] | ✓ Correct - "Yes" for each selected option |
| Col 15-20 | excited[] | ✓ Correct - "Yes" for each selected option |

## How to Deploy

1. Open your Google Apps Script editor
2. Replace the entire script with the contents of `google-apps-script-FIXED.js`
3. Save and deploy as a Web App
4. Test with a form submission
5. Verify that all columns align correctly in your Google Sheet

## Testing Checklist

Test with these scenarios to verify the fix:

- [ ] Submit form with NO checkboxes selected
- [ ] Submit form with ONLY updates checked
- [ ] Submit form with ONLY tips checked
- [ ] Submit form with multiple interest items selected
- [ ] Submit form with multiple excited items selected
- [ ] Submit form with ALL checkboxes selected
- [ ] Verify each "Yes" appears in the correct column
- [ ] Verify empty cells appear where checkboxes weren't selected
