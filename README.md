# Feedback SDK

<div style="background: #f7fafc; padding: 20px; border: 1px solid #f5f5dc; border-radius: 8px;">
  <h2 style="color: #2d3748;">Embeddable Feedback Widget</h2>
  <p style="color: #2d3748;">A lightweight, customizable feedback widget for websites. Agnostic, performant (<10kb gzipped), and accessible.</p>
  <p>
    <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status">
    <img src="https://img.shields.io/badge/coverage-96%25-blue" alt="Coverage">
    <img src="https://img.shields.io/badge/size-5.7kb%20gzipped-gold" alt="Bundle Size">
  </p>
</div>

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-repo/feedback-sdk.git
cd feedback-sdk/widget
npm install
npm run build
```

## Quick Start

Embed the widget on any website:

```html
<!-- Load the SDK -->
<script src="path/to/feedback-sdk.umd.js"></script>
<script>
  FeedbackSDK.init({
    projectId: "your-project-id",
    apiKey: "your-api-key"
  });
</script>
```

The widget appears as a floating button. Click to open the feedback form.

## Configuration

Pass options to `FeedbackSDK.init()`:

| Option          | Type     | Required | Description |
|-----------------|----------|----------|-------------|
| `projectId`     | string   | Yes      | Unique project identifier. |
| `apiKey`        | string   | Yes      | API key for authentication. |
| `apiEndpoint`   | string   | No       | Custom API URL (defaults to production). |
| `theme`         | object   | No       | Color overrides (see Theming). |
| `locale`        | "en" \| "es" | No    | Language for UI messages (optional, defaults to "en"). |
| `debug`         | boolean  | No       | Enable console error logging. |
| `onSuccess`     | function | No       | Callback on successful submission. |
| `onError`       | function | No       | Callback on errors. |

Example:

```javascript
FeedbackSDK.init({
  projectId: "my-app",
  apiKey: "key123",
  // locale: "es", // Optional, defaults to "en" for English UI messages
  theme: {
    primaryColor: "#d4af37",
    backgroundColor: "#f7fafc"
  },
  debug: true,
  onSuccess: (feedback) => console.log("Sent:", feedback),
  onError: (error) => alert("Error: " + error)
});
```

## Internationalization (i18n)

Set the `locale` to "en" (English) or "es" (Spanish) for UI messages. Defaults to English.

```javascript
locale: "es" // Shows "Tu opinión", "Enviar", etc.
```

## Theming

Customize colors using CSS variables. Overrides apply to the Shadow DOM.

```javascript
theme: {
  primaryColor: "#d4af37",      // Buttons, accents (gold)
  backgroundColor: "#f7fafc",   // Modal background (bone-like)
  textColor: "#2d3748",         // Text (slate gray)
  borderColor: "#e5e7eb",       // Borders
  inputBackgroundColor: "#ffffff" // Form inputs
}
```

Default palette is sober: slate grays with gold/bone accents for elegance.

## API Reference

### FeedbackSDK.init(config)

Initializes the widget with the provided config.

**Parameters:**
- `config` (SDKConfig): Configuration object.

**Returns:** void

### Callbacks

- `onSuccess(feedback: FeedbackPayload)`: Called after successful submission.
- `onError(error: string)`: Called on errors (rate limit, network).

### Types

```typescript
interface SDKConfig {
  projectId: string;
  apiKey: string;
  apiEndpoint?: string;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    inputBackgroundColor?: string;
  };
  debug?: boolean;
  onSuccess?: (feedback: FeedbackPayload) => void;
  onError?: (error: string) => void;
}

interface FeedbackPayload {
  projectId: string;
  userId: string;
  rating: number;
  comment?: string;
  deviceInfo: { userAgent: string; url: string };
  timestamp: string;
}
```

## Examples

### Basic Embedding

```html
<!DOCTYPE html>
<html>
<body>
  <h1>My Website</h1>
  <script src="feedback-sdk.umd.js"></script>
  <script>
    FeedbackSDK.init({
      projectId: "example",
      apiKey: "key123"
    });
  </script>
</body>
</html>
```

### Advanced Theming

```javascript
FeedbackSDK.init({
  projectId: "advanced",
  apiKey: "key123",
  theme: {
    primaryColor: "#d4af37",
    backgroundColor: "#2d3748",
    textColor: "#f7fafc"
  },
  onSuccess: () => {
    // Hide widget or show custom message
    document.querySelector('div').style.display = 'none';
  }
});
```

### Error Handling

```javascript
FeedbackSDK.init({
  projectId: "error-demo",
  apiKey: "key123",
  debug: true,
  onError: (error) => {
    if (error === "RATE_LIMIT_EXCEEDED") {
      // Custom rate limit UI
    } else {
      // Log to analytics
    }
  }
});
```

## Development

### Build

```bash
npm run build  # Lint, type-check, and bundle
npm run test   # Run tests with coverage
```

### Architecture

See [ADR.md](widget/docs/ADR.md) for design decisions.

## Contributing

- Run tests: `npm run test`
- Format code: Pre-commit hooks handle formatting (4 spaces, 100 char lines).
- Follow the ADR for new features.

## License

MIT</content>
<parameter name="filePath">/home/kerty/projects/feedback-sdk/README.md