# Primary Color Utility Classes

This document explains the reusable CSS utility classes for the primary color (`#A82323`). These classes make it easy to change the primary color across the entire project by updating just the CSS variable in `app/globals.css`.

## How to Change the Primary Color

To change the primary color for the entire project, simply update the `--primary` CSS variable in `app/globals.css`:

```css
:root {
  --primary: 0 66% 40%; /* Change this value to your new color in HSL format */
}
```

All components using the utility classes below will automatically update to the new color!

## Available Utility Classes

### Button Classes

- **`.btn-primary`** - Base primary button with hover effect
  ```tsx
  <button className="btn-primary">Click me</button>
  ```

- **`.btn-primary-sm`** - Small primary button (px-3 py-1.5, text-sm)
  ```tsx
  <button className="btn-primary-sm">Edit</button>
  ```

- **`.btn-primary-md`** - Medium primary button (px-4 py-2, font-medium)
  ```tsx
  <button className="btn-primary-md">Save</button>
  ```

- **`.btn-primary-lg`** - Large primary button (px-4 py-3, font-semibold)
  ```tsx
  <button className="btn-primary-lg">Submit</button>
  ```

### Badge Classes

- **`.badge-primary`** - Primary badge with light background
  ```tsx
  <span className="badge-primary">Active</span>
  ```

- **`.badge-primary-border`** - Primary badge with border
  ```tsx
  <span className="badge-primary-border">Featured</span>
  ```

### Status Classes

- **`.status-primary`** - Status badge for active/preparing states
  ```tsx
  <span className="status-primary">Preparing</span>
  ```

### Text Classes

- **`.text-primary-color`** - Primary text color
  ```tsx
  <p className="text-primary-color">Important text</p>
  ```

### Background Classes

- **`.bg-primary-light`** - Light primary background (10% opacity)
  ```tsx
  <div className="bg-primary-light">Content</div>
  ```

- **`.bg-primary-medium`** - Medium primary background (20% opacity)
  ```tsx
  <div className="bg-primary-medium">Content</div>
  ```

### Border Classes

- **`.border-primary-color`** - Primary border color
  ```tsx
  <div className="border-primary-color border-l-4">Content</div>
  ```

- **`.border-primary-light`** - Light primary border (30% opacity)
  ```tsx
  <div className="border-primary-light border">Content</div>
  ```

### Icon Classes

- **`.icon-primary`** - Icon container with primary styling
  ```tsx
  <div className="icon-primary">
    <Icon />
  </div>
  ```

### Gradient Classes

- **`.gradient-primary`** - Primary gradient background
  ```tsx
  <div className="gradient-primary rounded-lg p-6">Content</div>
  ```

## Usage Examples

### Example 1: Button
```tsx
// Before (hardcoded)
<button className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
  Edit
</button>

// After (using utility class)
<button className="btn-primary-sm">Edit</button>
```

### Example 2: Badge
```tsx
// Before (hardcoded)
<span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
  Active
</span>

// After (using utility class)
<span className="badge-primary">Active</span>
```

### Example 3: Status Indicator
```tsx
// Before (hardcoded)
<span className="bg-primary/10 text-primary border-primary/30">
  Preparing
</span>

// After (using utility class)
<span className="status-primary">Preparing</span>
```

## Benefits

1. **Centralized Color Management** - Change color in one place (`app/globals.css`)
2. **Consistent Styling** - All components use the same styling patterns
3. **Easier Maintenance** - Update classes instead of searching through all components
4. **Better Readability** - Semantic class names are easier to understand
5. **Reduced Code Duplication** - Reusable classes instead of repeating styles

## Migration Guide

To migrate existing components to use these utility classes:

1. Replace button styles with appropriate `.btn-primary-*` class
2. Replace badge styles with `.badge-primary` or `.badge-primary-border`
3. Replace status indicators with `.status-primary`
4. Replace icon containers with `.icon-primary`
5. Replace gradients with `.gradient-primary`

All classes automatically use the `--primary` CSS variable, so changing the color is as simple as updating one line in `app/globals.css`!
