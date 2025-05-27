# MCP UI Extension Example

This document demonstrates how to use the new UI rendering capabilities in the Model Context Protocol (MCP).

## Overview

The UI extension allows MCP servers to return structured UI components instead of just text, enabling rich interactive experiences. The extension includes:

- **UI Templates**: Define the structure and constraints of UI components
- **UI Rendering**: Generate UI components using templates and data
- **UI Validation**: Validate UI components against templates
- **Content Types**: New `UIContent` type for messages and tool responses
- **Client Customization**: Extensive client-side UI customization and preferences

## Basic Concepts

### UI Components

UI components are structured objects that describe how to render user interface elements:

```typescript
interface UIComponent {
  type: UIComponentType;           // The component type (button, input, etc.)
  props: { [key: string]: unknown }; // Component-specific properties
  children?: UIComponent[];        // Optional child components
  id?: string;                    // Optional unique identifier
  className?: string;             // Optional CSS classes
  style?: { [key: string]: string | number }; // Optional inline styles
}
```

### UI Templates

Templates define what UI components are allowed and their constraints:

```typescript
interface UITemplate {
  name: string;                   // Unique template identifier
  description?: string;           // Human-readable description
  schema: UITemplateSchema;       // Component structure and constraints
  metadata?: {                    // Optional metadata
    version?: string;
    tags?: string[];
    author?: string;
  };
}
```

## Example Use Cases

### 1. Data Visualization Tool

A server that can render charts and graphs:

```typescript
// Server capabilities
{
  "ui": {
    "templates": true,
    "rendering": true,
    "validation": true,
    "listChanged": true
  }
}

// UI template for charts
{
  "name": "chart-template",
  "description": "Template for rendering various chart types",
  "schema": {
    "rootComponent": "chart",
    "allowedComponents": ["chart", "container", "text"],
    "componentSchemas": {
      "chart": {
        "properties": {
          "type": { "enum": ["bar", "line", "pie", "scatter"] },
          "data": { "type": "array" },
          "title": { "type": "string" },
          "width": { "type": "number" },
          "height": { "type": "number" }
        },
        "required": ["type", "data"]
      }
    },
    "maxDepth": 3
  }
}

// Tool response with UI content
{
  "content": [
    {
      "type": "ui",
      "component": {
        "type": "chart",
        "props": {
          "type": "bar",
          "title": "Sales Data",
          "data": [
            { "label": "Q1", "value": 100 },
            { "label": "Q2", "value": 150 },
            { "label": "Q3", "value": 120 },
            { "label": "Q4", "value": 180 }
          ],
          "width": 400,
          "height": 300
        }
      }
    }
  ]
}
```

### 2. Form Builder Tool

A server that creates interactive forms:

```typescript
// UI template for forms
{
  "name": "form-template",
  "description": "Template for creating interactive forms",
  "schema": {
    "rootComponent": "form",
    "allowedComponents": ["form", "input", "select", "button", "text", "container"],
    "componentSchemas": {
      "form": {
        "properties": {
          "action": { "type": "string" },
          "method": { "enum": ["GET", "POST"] }
        }
      },
      "input": {
        "properties": {
          "type": { "enum": ["text", "email", "password", "number"] },
          "name": { "type": "string" },
          "placeholder": { "type": "string" },
          "required": { "type": "boolean" }
        },
        "required": ["name"]
      },
      "button": {
        "properties": {
          "type": { "enum": ["submit", "button", "reset"] },
          "text": { "type": "string" }
        },
        "required": ["text"]
      }
    }
  }
}

// Rendered form UI
{
  "type": "ui",
  "component": {
    "type": "form",
    "props": {
      "action": "/submit",
      "method": "POST"
    },
    "children": [
      {
        "type": "input",
        "props": {
          "type": "text",
          "name": "name",
          "placeholder": "Enter your name",
          "required": true
        }
      },
      {
        "type": "input",
        "props": {
          "type": "email",
          "name": "email",
          "placeholder": "Enter your email",
          "required": true
        }
      },
      {
        "type": "button",
        "props": {
          "type": "submit",
          "text": "Submit"
        }
      }
    ]
  }
}
```

### 3. Dashboard Builder

A server that creates interactive dashboards:

```typescript
// Dashboard template
{
  "name": "dashboard-template",
  "description": "Template for creating dashboards with cards and widgets",
  "schema": {
    "rootComponent": "container",
    "allowedComponents": ["container", "card", "text", "chart", "progress", "table"],
    "componentSchemas": {
      "card": {
        "properties": {
          "title": { "type": "string" },
          "subtitle": { "type": "string" },
          "variant": { "enum": ["default", "outlined", "elevated"] }
        }
      },
      "progress": {
        "properties": {
          "value": { "type": "number", "minimum": 0, "maximum": 100 },
          "label": { "type": "string" },
          "color": { "enum": ["primary", "secondary", "success", "warning", "error"] }
        },
        "required": ["value"]
      }
    },
    "styling": {
      "allowInlineStyles": true,
      "allowedClasses": ["grid", "flex", "p-4", "m-2", "rounded", "shadow"]
    }
  }
}

// Dashboard UI
{
  "type": "ui",
  "component": {
    "type": "container",
    "className": "grid grid-cols-2 gap-4 p-4",
    "children": [
      {
        "type": "card",
        "props": {
          "title": "Revenue",
          "subtitle": "This month"
        },
        "children": [
          {
            "type": "text",
            "props": {
              "content": "$45,231",
              "variant": "h2"
            }
          },
          {
            "type": "progress",
            "props": {
              "value": 75,
              "label": "75% of target",
              "color": "success"
            }
          }
        ]
      },
      {
        "type": "card",
        "props": {
          "title": "Users",
          "subtitle": "Active this week"
        },
        "children": [
          {
            "type": "chart",
            "props": {
              "type": "line",
              "data": [
                { "x": "Mon", "y": 120 },
                { "x": "Tue", "y": 150 },
                { "x": "Wed", "y": 180 },
                { "x": "Thu", "y": 160 },
                { "x": "Fri", "y": 200 }
              ]
            }
          }
        ]
      }
    ]
  }
}
```

## Protocol Flow

### 1. Capability Negotiation

Client and server negotiate UI capabilities during initialization:

```typescript
// Client capabilities
{
  "ui": {
    "rendering": true,
    "supportedComponents": ["container", "text", "button", "input", "chart"],
    "interactive": true,
    "platforms": ["web"]
  }
}

// Server capabilities
{
  "ui": {
    "templates": true,
    "rendering": true,
    "validation": true,
    "listChanged": true
  }
}
```

### 2. Template Discovery

Client discovers available UI templates:

```typescript
// Request
{
  "method": "ui/templates/list",
  "params": {}
}

// Response
{
  "templates": [
    {
      "name": "chart-template",
      "description": "Template for rendering charts",
      "metadata": {
        "version": "1.0.0",
        "tags": ["visualization", "charts"]
      }
    },
    {
      "name": "form-template",
      "description": "Template for creating forms",
      "metadata": {
        "version": "1.0.0",
        "tags": ["forms", "input"]
      }
    }
  ]
}
```

### 3. UI Rendering

Server renders UI using a template:

```typescript
// Request
{
  "method": "ui/render",
  "params": {
    "templateName": "chart-template",
    "data": {
      "chartType": "bar",
      "title": "Sales Data",
      "values": [100, 150, 120, 180]
    },
    "context": {
      "platform": "web",
      "viewport": {
        "width": 800,
        "height": 600
      },
      "theme": "light"
    }
  }
}

// Response
{
  "ui": {
    "type": "chart",
    "props": {
      "type": "bar",
      "title": "Sales Data",
      "data": [
        { "label": "Q1", "value": 100 },
        { "label": "Q2", "value": 150 },
        { "label": "Q3", "value": 120 },
        { "label": "Q4", "value": 180 }
      ]
    }
  },
  "metadata": {
    "templateName": "chart-template",
    "templateVersion": "1.0.0",
    "complexity": "medium"
  }
}
```

### 4. UI Validation

Validate UI components against templates:

```typescript
// Request
{
  "method": "ui/validate",
  "params": {
    "component": {
      "type": "chart",
      "props": {
        "type": "bar",
        "data": []
      }
    },
    "templateName": "chart-template"
  }
}

// Response
{
  "valid": false,
  "errors": [
    {
      "path": "props.data",
      "message": "Data array cannot be empty",
      "code": "EMPTY_DATA"
    }
  ],
  "warnings": [
    {
      "path": "props.title",
      "message": "Title is recommended for accessibility",
      "code": "MISSING_TITLE"
    }
  ]
}
```

## Implementation Guidelines

### For Server Developers

1. **Define Clear Templates**: Create well-documented UI templates with appropriate constraints
2. **Validate Input**: Always validate UI components before rendering
3. **Handle Errors Gracefully**: Provide meaningful error messages for validation failures
4. **Consider Accessibility**: Include accessibility properties in your UI components
5. **Support Multiple Platforms**: Design templates that work across different rendering contexts

### For Client Developers

1. **Declare Capabilities**: Clearly specify which UI components and features you support
2. **Implement Fallbacks**: Provide fallback rendering for unsupported components
3. **Respect Templates**: Follow template constraints when rendering UI components
4. **Handle Validation**: Use validation endpoints to ensure UI correctness
5. **Support Interactivity**: Implement event handling for interactive components

## Security Considerations

1. **Sanitize Content**: Always sanitize text content and HTML attributes
2. **Validate Styles**: Restrict inline styles to safe CSS properties
3. **Limit Complexity**: Implement depth and size limits for UI components
4. **Control Scripts**: Never allow script execution in UI components
5. **Validate URLs**: Sanitize and validate any URLs in UI components

## Best Practices

1. **Keep Templates Simple**: Start with simple templates and gradually add complexity
2. **Use Semantic Components**: Choose component types that match their semantic meaning
3. **Provide Good Defaults**: Include sensible default values in templates
4. **Document Everything**: Provide clear documentation for templates and components
5. **Test Thoroughly**: Test UI rendering across different clients and platforms

## Client Customization Capabilities

### 1. **Capability Declaration**

Clients can declare their UI customization capabilities during initialization:

```typescript
// Enhanced client capabilities
{
  "ui": {
    "rendering": true,
    "supportedComponents": ["container", "text", "button", "input", "chart", "form"],
    "interactive": true,
    "platforms": ["web", "mobile"],
    "preferences": true,
    "customization": {
      "themes": true,
      "colorSchemes": true,
      "typography": true,
      "layout": true,
      "accessibility": true,
      "localization": true,
      "customStyles": true,
      "componentOverrides": true
    },
    "accessibility": {
      "highContrast": true,
      "reducedMotion": true,
      "screenReader": true,
      "keyboardNavigation": true
    },
    "interactions": ["mouse", "touch", "keyboard"]
  }
}
```

### 2. **Setting Global UI Preferences**

Clients can set global preferences that apply to all UI rendering:

```typescript
// Set global UI preferences
{
  "method": "ui/preferences/set",
  "params": {
    "preferences": {
      "defaultTheme": "dark",
      "defaultPlatform": "web",
      "colorScheme": {
        "primary": "#3b82f6",
        "secondary": "#64748b",
        "accent": "#f59e0b",
        "background": "#0f172a",
        "surface": "#1e293b",
        "text": "#f8fafc"
      },
      "typography": {
        "fontFamily": "Inter, sans-serif",
        "fontSize": "medium",
        "fontWeight": "normal"
      },
      "layout": {
        "density": "comfortable",
        "borderRadius": "medium",
        "shadows": true
      },
      "accessibility": {
        "highContrast": false,
        "reducedMotion": false,
        "screenReader": false,
        "keyboardNavigation": true
      },
      "locale": {
        "language": "en",
        "region": "US",
        "direction": "ltr",
        "dateFormat": "MM/dd/yyyy",
        "numberFormat": "en-US"
      },
      "behavior": {
        "animations": true,
        "autoFocus": true,
        "interactionMode": "mouse",
        "showTooltips": true
      }
    }
  }
}
```

### 3. **Per-Request Customization**

Clients can customize UI on a per-request basis:

```typescript
// Render UI with specific customizations
{
  "method": "ui/render",
  "params": {
    "templateName": "dashboard-template",
    "data": {
      "title": "Sales Dashboard",
      "metrics": [...]
    },
    "context": {
      "platform": "web",
      "viewport": { "width": 1200, "height": 800 },
      "theme": "light"
    },
    "preferences": {
      "componentVariants": {
        "button": "outlined",
        "card": "elevated",
        "chart": "minimal"
      },
      "colorScheme": {
        "primary": "#10b981",
        "accent": "#f59e0b"
      },
      "typography": {
        "fontSize": "large",
        "fontWeight": "bold"
      },
      "layout": {
        "density": "spacious",
        "borderRadius": "large"
      },
      "accessibility": {
        "highContrast": true,
        "reducedMotion": true
      },
      "locale": {
        "language": "es",
        "region": "ES",
        "direction": "ltr"
      }
    },
    "overrides": {
      "components": {
        "header-title": {
          "props": { "variant": "h1" },
          "style": { "color": "#1f2937", "fontSize": "2rem" },
          "className": "font-bold text-center"
        },
        "main-chart": {
          "props": { "showLegend": false },
          "style": { "height": "400px" }
        }
      },
      "globalStyles": {
        ".dashboard-card": {
          "boxShadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          "borderRadius": "12px"
        }
      }
    }
  }
}
```

### 4. **Responsive and Adaptive UI**

The server can adapt UI based on client context:

```typescript
// Server adapts UI based on client preferences
{
  "ui": {
    "type": "container",
    "className": "dashboard-grid",
    "style": {
      // Adapts to client's density preference
      "gap": preferences.layout.density === "compact" ? "8px" : 
             preferences.layout.density === "comfortable" ? "16px" : "24px",
      // Adapts to client's theme
      "backgroundColor": preferences.colorScheme.background,
      "color": preferences.colorScheme.text
    },
    "children": [
      {
        "type": "card",
        "props": {
          // Adapts to client's component variant preference
          "variant": preferences.componentVariants?.card || "default",
          "title": preferences.locale.language === "es" ? "Ventas" : "Sales"
        },
        "style": {
          // Adapts to accessibility preferences
          "border": preferences.accessibility.highContrast ? "2px solid" : "1px solid",
          "borderRadius": preferences.layout.borderRadius === "none" ? "0" :
                         preferences.layout.borderRadius === "small" ? "4px" :
                         preferences.layout.borderRadius === "medium" ? "8px" : "12px"
        }
      }
    ]
  }
}
```

### 5. **Accessibility Customization**

Comprehensive accessibility support:

```typescript
// Accessibility-focused customization
{
  "preferences": {
    "accessibility": {
      "highContrast": true,
      "reducedMotion": true,
      "screenReader": true,
      "keyboardNavigation": true
    }
  }
}

// Server responds with accessibility-optimized UI
{
  "ui": {
    "type": "form",
    "props": {
      "role": "form",
      "aria-label": "Contact Form"
    },
    "children": [
      {
        "type": "input",
        "props": {
          "type": "text",
          "name": "name",
          "aria-label": "Full Name",
          "aria-required": "true",
          "aria-describedby": "name-help"
        },
        "style": {
          // High contrast colors
          "backgroundColor": "#ffffff",
          "color": "#000000",
          "border": "2px solid #000000",
          // No animations for reduced motion
          "transition": preferences.accessibility.reducedMotion ? "none" : "all 0.2s"
        }
      }
    ]
  }
}
```

### 6. **Internationalization Support**

Full i18n customization:

```typescript
// Locale-specific customization
{
  "preferences": {
    "locale": {
      "language": "ar",
      "region": "SA",
      "direction": "rtl",
      "dateFormat": "dd/MM/yyyy",
      "numberFormat": "ar-SA"
    }
  }
}

// Server responds with localized UI
{
  "ui": {
    "type": "container",
    "style": {
      "direction": "rtl",
      "textAlign": "right"
    },
    "children": [
      {
        "type": "text",
        "props": {
          "content": "مرحبا بك في لوحة التحكم", // "Welcome to Dashboard" in Arabic
          "lang": "ar"
        }
      },
      {
        "type": "text",
        "props": {
          "content": new Intl.DateTimeFormat('ar-SA').format(new Date())
        }
      }
    ]
  }
}
```

### 7. **Dynamic Theme Switching**

Real-time theme customization:

```typescript
// Client requests theme change
{
  "method": "ui/preferences/set",
  "params": {
    "preferences": {
      "defaultTheme": "dark",
      "colorScheme": {
        "primary": "#60a5fa",
        "background": "#111827",
        "surface": "#1f2937",
        "text": "#f9fafb"
      }
    }
  }
}

// All subsequent UI rendering uses new theme
// Server can also send theme-aware components
{
  "ui": {
    "type": "button",
    "props": {
      "text": "Save Changes",
      "variant": "primary"
    },
    "style": {
      "backgroundColor": "var(--color-primary)",
      "color": "var(--color-text)",
      "@media (prefers-color-scheme: dark)": {
        "backgroundColor": "var(--color-primary-dark)"
      }
    }
  }
}
```

## Advanced Customization Examples

### Custom Component Styling

```typescript
{
  "overrides": {
    "components": {
      "data-table": {
        "props": {
          "striped": true,
          "hoverable": true,
          "sortable": true
        },
        "style": {
          "borderCollapse": "separate",
          "borderSpacing": "0",
          "borderRadius": "8px",
          "overflow": "hidden"
        },
        "className": "shadow-lg"
      }
    },
    "globalStyles": {
      ".data-table th": {
        "backgroundColor": "#f8fafc",
        "fontWeight": "600",
        "textTransform": "uppercase",
        "fontSize": "0.75rem",
        "letterSpacing": "0.05em"
      },
      ".data-table td": {
        "padding": "12px 16px",
        "borderBottom": "1px solid #e2e8f0"
      }
    }
  }
}
```

### Platform-Specific Adaptations

```typescript
// Mobile-optimized rendering
{
  "context": {
    "platform": "mobile",
    "viewport": { "width": 375, "height": 812 }
  },
  "preferences": {
    "layout": {
      "density": "compact"
    },
    "behavior": {
      "interactionMode": "touch",
      "autoFocus": false
    }
  }
}

// Server responds with mobile-optimized UI
{
  "ui": {
    "type": "container",
    "style": {
      "padding": "8px",
      "fontSize": "16px", // Prevents zoom on iOS
      "touchAction": "manipulation"
    },
    "children": [
      {
        "type": "button",
        "style": {
          "minHeight": "44px", // Touch target size
          "fontSize": "18px",
          "padding": "12px 24px"
        }
      }
    ]
  }
}
```

## Best Practices for Client Customization

### For Client Developers

1. **Declare Capabilities Accurately**: Only declare support for features you can actually implement
2. **Respect User Preferences**: Honor system-level accessibility and theme preferences
3. **Provide Fallbacks**: Gracefully handle unsupported customizations
4. **Cache Preferences**: Store user preferences locally for consistency
5. **Validate Customizations**: Ensure custom styles don't break functionality

### For Server Developers

1. **Honor Client Preferences**: Respect client customization requests when possible
2. **Provide Sensible Defaults**: Include fallback values for all customizable properties
3. **Test Across Contexts**: Verify UI works across different themes, locales, and platforms
4. **Document Customization**: Clearly document which aspects can be customized
5. **Validate Overrides**: Ensure client overrides don't compromise security or functionality 