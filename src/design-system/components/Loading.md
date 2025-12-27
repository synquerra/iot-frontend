# Loading Components

Enhanced loading states and animations for the Synquerra design system.

## Components

### Loading
Main loading component that supports multiple types and configurations.

```jsx
import { Loading } from '../design-system/components';

// Basic spinner
<Loading />

// Spinner with text
<Loading text="Loading data..." />

// Different types
<Loading type="dots" text="Processing..." />
<Loading type="spinner" size="lg" color="accent" />
```

### LoadingOverlay
Wraps content with an optional loading overlay.

```jsx
import { LoadingOverlay } from '../design-system/components';

<LoadingOverlay loading={isLoading} text="Saving...">
  <div>Your content here</div>
</LoadingOverlay>
```

### Spinner
Animated spinner component.

```jsx
import { Spinner } from '../design-system/components';

<Spinner size="md" color="primary" />
```

### Dots
Animated dots loading indicator.

```jsx
import { Dots } from '../design-system/components';

<Dots size="lg" color="accent" />
```

### Skeleton
Placeholder loading component for content.

```jsx
import { Skeleton } from '../design-system/components';

// Text skeleton
<Skeleton variant="text" width="60%" />

// Circular skeleton (avatar)
<Skeleton variant="circular" width="40px" height="40px" />

// Rectangular skeleton
<Skeleton variant="rectangular" height="120px" />
```

### ProgressBar
Progress indicator with percentage display.

```jsx
import { ProgressBar } from '../design-system/components';

<ProgressBar value={75} showValue />
<ProgressBar value={50} color="success" />
```

### Pulse
Pulsing animation wrapper for content.

```jsx
import { Pulse } from '../design-system/components';

<Pulse>
  <div>Content that pulses</div>
</Pulse>
```

## Props

### Loading Props
- `type`: 'spinner' | 'dots' | 'pulse' | 'skeleton' (default: 'spinner')
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'white' (default: 'primary')
- `variant`: 'inline' | 'block' | 'overlay' | 'fullscreen' (default: 'inline')
- `text`: string - Optional loading text
- `textPosition`: 'top' | 'bottom' | 'left' | 'right' (default: 'bottom')

### LoadingOverlay Props
- `loading`: boolean - Whether to show the overlay
- `type`: Same as Loading type
- `size`: Same as Loading size
- `color`: Same as Loading color
- `text`: Loading text to display

### Spinner Props
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `color`: Color variant
- `thickness`: 'thin' | 'normal' | 'thick'

### Skeleton Props
- `variant`: 'rectangular' | 'circular' | 'text' | 'button' | 'card'
- `width`: string | number
- `height`: string | number
- `animate`: boolean (default: true)

### ProgressBar Props
- `value`: number - Current progress value
- `max`: number - Maximum value (default: 100)
- `size`: Size variant
- `color`: Color variant
- `showValue`: boolean - Whether to show percentage

## Usage Examples

### Page Loading State
```jsx
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading 
        type="spinner" 
        size="lg" 
        text="Loading devices..." 
        textPosition="bottom"
      />
    </div>
  );
}
```

### Button Loading State
```jsx
<Button loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```

### Content Loading with Overlay
```jsx
<LoadingOverlay loading={isRefreshing} text="Refreshing data...">
  <Card>
    <Card.Content>
      {/* Your content */}
    </Card.Content>
  </Card>
</LoadingOverlay>
```

### Skeleton Loading for Lists
```jsx
{loading ? (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    ))}
  </div>
) : (
  <div>
    {/* Actual content */}
  </div>
)}
```

## Accessibility

All loading components include proper ARIA attributes:
- `role="status"` for loading indicators
- `aria-label` for screen readers
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for progress bars

## Animation Performance

- All animations use CSS transforms and opacity for optimal performance
- Animations respect user's `prefers-reduced-motion` settings
- Consistent timing functions across all components
- GPU-accelerated animations where possible

## Design Tokens

Loading components use the design system's color and animation tokens:
- Colors: Consistent with the design system palette
- Durations: 150ms (fast), 250ms (normal), 350ms (slow)
- Easing: Consistent cubic-bezier functions
- Spacing: Follows the design system spacing scale