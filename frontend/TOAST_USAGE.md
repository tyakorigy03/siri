# Toast Notification Usage Guide

This project uses `react-toastify` for displaying user notifications. All toast utilities are available in `src/utils/toast.js`.

## Installation

The package is already added to `package.json`. To install:

```bash
npm install
```

## Available Functions

### `showSuccess(message)`
Display a success notification (green).

```javascript
import { showSuccess } from '../../utils/toast';

showSuccess('Business day opened successfully!');
```

### `showError(message)`
Display an error notification (red). Auto-closes after 5 seconds.

```javascript
import { showError } from '../../utils/toast';

showError('Failed to load data');
```

### `showWarning(message)`
Display a warning notification (orange).

```javascript
import { showWarning } from '../../utils/toast';

showWarning('Please review your input');
```

### `showInfo(message)`
Display an info notification (blue).

```javascript
import { showInfo } from '../../utils/toast';

showInfo('Data will refresh in 30 seconds');
```

### `handleApiError(error, defaultMessage)`
Automatically handles API errors and displays appropriate error toast.

```javascript
import { handleApiError } from '../../utils/toast';

try {
  await someApiCall();
} catch (error) {
  handleApiError(error, 'Failed to perform action');
}
```

## Usage Examples

### Basic Error Handling

```javascript
import { handleApiError, showSuccess } from '../../utils/toast';

const handleSubmit = async () => {
  try {
    const result = await saveData(formData);
    showSuccess('Data saved successfully!');
  } catch (error) {
    handleApiError(error, 'Failed to save data');
  }
};
```

### Form Validation Errors

```javascript
import { showError, showWarning } from '../../utils/toast';

const validateForm = () => {
  if (!formData.name) {
    showError('Name is required');
    return false;
  }
  
  if (formData.amount < 0) {
    showWarning('Amount cannot be negative');
    return false;
  }
  
  return true;
};
```

### Loading States with Success

```javascript
import { showSuccess, handleApiError } from '../../utils/toast';

const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
    showSuccess('Action completed successfully!');
  } catch (error) {
    handleApiError(error, 'Action failed');
  } finally {
    setLoading(false);
  }
};
```

## Toast Configuration

The toast container is configured in `App.jsx` with the following settings:

- **Position**: Top-right
- **Auto Close**: 3 seconds (5 seconds for errors)
- **Hide Progress Bar**: false
- **Close On Click**: true
- **Pause On Hover**: true
- **Draggable**: true
- **Theme**: Light

## Best Practices

1. **Use `handleApiError` for API calls** - It automatically extracts error messages
2. **Show success messages** - Users appreciate feedback when actions complete
3. **Don't spam toasts** - Avoid showing multiple toasts for non-critical errors
4. **Use appropriate types** - Success for completions, Error for failures, Warning for cautions
5. **Keep messages concise** - Toast messages should be short and clear

## Replacing Alert() Calls

Replace all `alert()` calls with toast notifications:

**Before:**
```javascript
alert('Error: ' + error.message);
```

**After:**
```javascript
handleApiError(error, 'An error occurred');
```

**Before:**
```javascript
alert('Success!');
```

**After:**
```javascript
showSuccess('Operation completed successfully!');
```
