# GeofenceMap Accessibility Testing Checklist

## Screen Reader Testing Guide

This document provides guidance for manual screen reader testing of the GeofenceMap component's current location feature.

### Recommended Screen Readers
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

### Test Scenarios

#### 1. Current Location Button
**Expected Behavior:**
- Screen reader should announce: "Go to my current location, button"
- Button should be discoverable via screen reader navigation
- Button state (enabled/disabled) should be announced

**How to Test:**
1. Navigate to the GeofenceMap component
2. Use Tab key to navigate to the "My Location" button
3. Verify the button label is announced correctly
4. Verify the button role is announced as "button"

#### 2. Loading State
**Expected Behavior:**
- When location is being fetched, screen reader should announce: "Fetching your current location..."
- Button should be announced as "busy" or "loading"

**How to Test:**
1. Click the "My Location" button
2. Verify the loading message is announced automatically (aria-live region)
3. Verify the button state changes to disabled/busy

#### 3. Error Messages
**Expected Behavior:**
- Error messages should be announced immediately when they appear
- Error should be announced as an "alert"
- Dismiss button should be accessible and announced

**How to Test:**
1. Trigger an error (e.g., deny location permission)
2. Verify the error message is announced automatically
3. Navigate to the dismiss button
4. Verify dismiss button label: "Dismiss error message, button"
5. Activate dismiss button and verify error is removed

#### 4. Keyboard Navigation
**Expected Behavior:**
- All interactive elements should be keyboard accessible
- Tab order should be logical
- Enter/Space should activate buttons

**How to Test:**
1. Use Tab key to navigate through all controls
2. Verify tab order: My Location → Clear All → Dismiss (if error present)
3. Press Enter or Space on each button to verify activation
4. Verify focus indicators are visible

### Accessibility Features Implemented

✅ **aria-label**: "Go to my current location" on the button
✅ **aria-busy**: Set to true during loading state
✅ **aria-live**: Polite live region for loading announcements
✅ **role="status"**: On loading state container
✅ **role="alert"**: On error messages
✅ **aria-live="assertive"**: On error messages for immediate announcement
✅ **aria-atomic="true"**: Ensures complete message is read
✅ **Keyboard navigation**: All buttons are keyboard accessible
✅ **Focus management**: Proper focus indicators on all interactive elements

### Test Results

**Date:** _To be filled during manual testing_
**Tester:** _To be filled during manual testing_
**Screen Reader:** _To be filled during manual testing_

- [ ] Current location button is properly announced
- [ ] Loading state is announced to screen readers
- [ ] Error messages are announced immediately
- [ ] Dismiss button is accessible and functional
- [ ] Keyboard navigation works correctly
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] All interactive elements are accessible

### Notes

This is a manual testing checklist. Automated tests verify the presence of ARIA attributes and keyboard functionality, but actual screen reader testing requires manual verification with real assistive technology.
