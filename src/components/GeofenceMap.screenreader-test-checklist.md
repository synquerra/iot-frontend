# GeofenceMap Screen Reader Testing Checklist

## Purpose
This document provides a checklist for manually testing the GeofenceMap component's current location feature with screen readers.

## Screen Readers to Test
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

## Test Scenarios

### 1. My Location Button
- [ ] Button is announced with its label "Go to my current location"
- [ ] Button state (enabled/disabled) is announced
- [ ] Button can be focused using Tab key
- [ ] Button can be activated using Enter or Space key

### 2. Loading State
- [ ] When button is clicked, loading message is announced: "Fetching your current location..."
- [ ] Button state changes to "disabled" and is announced
- [ ] aria-busy state is announced during loading

### 3. Error Messages
- [ ] Error messages are announced immediately when they appear
- [ ] Error message content is clear and understandable
- [ ] Dismiss button is announced with label "Dismiss error message"
- [ ] Error can be dismissed using keyboard

### 4. Success State
- [ ] When location is successfully fetched, map movement is not disruptive
- [ ] Current location marker tooltip is readable

### 5. Clear All Button
- [ ] Button is announced with its text "Clear All"
- [ ] Button state (enabled/disabled) is announced correctly
- [ ] Confirmation dialog is announced when activated

## Testing Instructions

### macOS VoiceOver
1. Enable VoiceOver: Cmd + F5
2. Navigate to the GeofenceMap component
3. Use Tab to navigate between buttons
4. Use VO + Space to activate buttons
5. Listen for announcements when states change

### Windows NVDA
1. Start NVDA
2. Navigate to the GeofenceMap component
3. Use Tab to navigate between buttons
4. Use Enter or Space to activate buttons
5. Listen for announcements when states change

## Expected Behavior Summary
All interactive elements should be:
- Keyboard accessible
- Properly labeled
- State changes announced
- Error messages announced assertively
- Loading states announced politely
