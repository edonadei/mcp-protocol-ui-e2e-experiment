#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListUITemplatesRequestSchema,
  GetUITemplateRequestSchema,
  RenderUIRequestSchema,
  ValidateUIRequestSchema,
  UITemplate,
  UIComponent,
  UIComponentType,
  RenderUIRequest,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Server demonstrating UI rendering capabilities
 * 
 * This server provides:
 * - Interactive dashboard creation
 * - Data visualization with charts
 * - Form building and validation
 * - Real-time data display
 */

// Sample data for demonstrations
const sampleData = {
  sales: [
    { month: "Jan", revenue: 45000, orders: 120 },
    { month: "Feb", revenue: 52000, orders: 135 },
    { month: "Mar", revenue: 48000, orders: 128 },
    { month: "Apr", revenue: 61000, orders: 155 },
    { month: "May", revenue: 55000, orders: 142 },
    { month: "Jun", revenue: 67000, orders: 168 },
  ],
  users: [
    { name: "Alice Johnson", email: "alice@example.com", role: "Admin", lastLogin: "2024-01-15" },
    { name: "Bob Smith", email: "bob@example.com", role: "User", lastLogin: "2024-01-14" },
    { name: "Carol Davis", email: "carol@example.com", role: "Manager", lastLogin: "2024-01-15" },
  ],
  metrics: {
    totalUsers: 1247,
    activeUsers: 892,
    revenue: 328000,
    growth: 12.5,
  }
};

// UI Templates
const templates: UITemplate[] = [
  {
    name: "dashboard",
    description: "Interactive dashboard template with metrics, charts, and data tables",
    schema: {
      rootComponent: "container" as UIComponentType,
      allowedComponents: ["container", "text", "card", "chart", "table", "progress"] as UIComponentType[],
      componentSchemas: {
        container: {
          properties: {
            layout: { type: "string", enum: ["grid", "flex", "stack"] },
            columns: { type: "number", minimum: 1, maximum: 12 }
          }
        },
        card: {
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            variant: { type: "string", enum: ["default", "outlined", "elevated"] }
          }
        },
        chart: {
          properties: {
            type: { type: "string", enum: ["line", "bar", "pie", "area"] },
            data: { type: "array" },
            xAxis: { type: "string" },
            yAxis: { type: "string" }
          },
          required: ["type", "data"]
        }
      },
      maxDepth: 5,
      allowCustomComponents: false,
      styling: {
        allowInlineStyles: true,
        allowArbitraryClasses: true
      }
    }
  },
  {
    name: "form",
    description: "Dynamic form template with validation and submission handling",
    schema: {
      rootComponent: "form" as UIComponentType,
      allowedComponents: ["form", "input", "select", "checkbox", "radio", "textarea", "button", "text"] as UIComponentType[],
      componentSchemas: {
        form: {
          properties: {
            action: { type: "string" },
            method: { type: "string", enum: ["GET", "POST"] },
            validation: { type: "object" }
          }
        },
        input: {
          properties: {
            type: { type: "string", enum: ["text", "email", "password", "number", "date"] },
            placeholder: { type: "string" },
            required: { type: "boolean" },
            validation: { type: "object" }
          },
          required: ["type"]
        }
      },
      maxDepth: 3,
      allowCustomComponents: false
    }
  },
  {
    name: "data-table",
    description: "Advanced data table with sorting, filtering, and pagination",
    schema: {
      rootComponent: "table" as UIComponentType,
      allowedComponents: ["table", "text", "button", "input"] as UIComponentType[],
      componentSchemas: {
        table: {
          properties: {
            data: { type: "array" },
            columns: { type: "array" },
            sortable: { type: "boolean" },
            filterable: { type: "boolean" },
            pagination: { type: "object" }
          },
          required: ["data", "columns"]
        }
      },
      maxDepth: 2,
      allowCustomComponents: false
    }
  }
];

const server = new Server(
  {
    name: "ui-dashboard-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      ui: {
        templates: true,
        rendering: true,
        validation: true,
        listChanged: true,
      },
    },
  }
);

// List available UI templates
server.setRequestHandler(ListUITemplatesRequestSchema, async () => {
  return {
    templates: templates
  };
});

// Get specific UI template
server.setRequestHandler(GetUITemplateRequestSchema, async (request) => {
  const template = templates.find(t => t.name === request.params.name);
  if (!template) {
    throw new Error(`Template '${request.params.name}' not found`);
  }
  return { template };
});

// Render UI using templates
server.setRequestHandler(RenderUIRequestSchema, async (request) => {
  const { templateName, data, context, preferences } = request.params;
  
  switch (templateName) {
    case "dashboard":
      return renderDashboard(data, context, preferences);
    case "form":
      return renderForm(data, context, preferences);
    case "data-table":
      return renderDataTable(data, context, preferences);
    default:
      throw new Error(`Unknown template: ${templateName}`);
  }
});

// Validate UI components
server.setRequestHandler(ValidateUIRequestSchema, async (request) => {
  const { component, templateName } = request.params;
  const template = templates.find(t => t.name === templateName);
  
  if (!template) {
    return {
      valid: false,
      errors: [{ path: "template", message: `Template '${templateName}' not found`, code: "TEMPLATE_NOT_FOUND" }]
    };
  }

  // Basic validation - in a real implementation, this would be more comprehensive
  const errors: Array<{ path: string; message: string; code?: string }> = [];
  
  if (!template.schema.allowedComponents.includes(component.type)) {
    errors.push({
      path: "component.type",
      message: `Component type '${component.type}' not allowed in template '${templateName}'`,
      code: "INVALID_COMPONENT_TYPE"
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_dashboard",
        description: "Create an interactive dashboard with metrics and charts",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Dashboard title" },
            metrics: { type: "boolean", description: "Include metrics cards", default: true },
            charts: { type: "boolean", description: "Include charts", default: true },
            tables: { type: "boolean", description: "Include data tables", default: true },
            theme: { type: "string", enum: ["light", "dark"], default: "light" }
          },
          required: ["title"]
        }
      },
      {
        name: "create_form",
        description: "Create a dynamic form with validation",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Form title" },
            fields: {
              type: "array",
              description: "Form fields configuration",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["text", "email", "password", "number", "date", "select", "checkbox"] },
                  label: { type: "string" },
                  required: { type: "boolean", default: false },
                  options: { type: "array", items: { type: "string" } }
                },
                required: ["name", "type", "label"]
              }
            }
          },
          required: ["title", "fields"]
        }
      },
      {
        name: "get_sample_data",
        description: "Get sample data for testing UI components",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["sales", "users", "metrics"], description: "Type of sample data" }
          },
          required: ["type"]
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "create_dashboard":
      return await createDashboard(args);
    case "create_form":
      return await createForm(args);
    case "get_sample_data":
      return await getSampleData(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Tool implementations
async function createDashboard(args: any): Promise<CallToolResult> {
  const { title = "Dashboard", metrics = true, charts = true, tables = true, theme = "light" } = args;

  const ui: UIComponent = {
    type: "container",
    props: {
      layout: "grid",
      columns: 12,
      gap: 4,
      padding: 6
    },
    className: `dashboard-container theme-${theme}`,
    children: [
      {
        type: "text",
        props: {
          variant: "h1",
          text: title
        },
        style: { gridColumn: "1 / -1", marginBottom: 24 }
      }
    ]
  };

  if (metrics) {
    ui.children!.push({
      type: "container",
      props: { layout: "grid", columns: 4, gap: 3 },
      style: { gridColumn: "1 / -1", marginBottom: 24 },
      children: [
        createMetricCard("Total Users", sampleData.metrics.totalUsers.toLocaleString(), "👥"),
        createMetricCard("Active Users", sampleData.metrics.activeUsers.toLocaleString(), "🟢"),
        createMetricCard("Revenue", `$${sampleData.metrics.revenue.toLocaleString()}`, "💰"),
        createMetricCard("Growth", `${sampleData.metrics.growth}%`, "📈")
      ]
    });
  }

  if (charts) {
    ui.children!.push({
      type: "card",
      props: {
        title: "Revenue Trend",
        variant: "elevated"
      },
      style: { gridColumn: "1 / 9", height: 400 },
      children: [{
        type: "chart",
        props: {
          type: "line",
          data: sampleData.sales,
          xAxis: "month",
          yAxis: "revenue",
          color: "#3b82f6"
        }
      }]
    });

    ui.children!.push({
      type: "card",
      props: {
        title: "Orders",
        variant: "elevated"
      },
      style: { gridColumn: "9 / -1", height: 400 },
      children: [{
        type: "chart",
        props: {
          type: "bar",
          data: sampleData.sales,
          xAxis: "month",
          yAxis: "orders",
          color: "#10b981"
        }
      }]
    });
  }

  if (tables) {
    ui.children!.push({
      type: "card",
      props: {
        title: "Recent Users",
        variant: "outlined"
      },
      style: { gridColumn: "1 / -1", marginTop: 24 },
      children: [{
        type: "table",
        props: {
          data: sampleData.users,
          columns: [
            { key: "name", label: "Name", sortable: true },
            { key: "email", label: "Email", sortable: true },
            { key: "role", label: "Role", sortable: true },
            { key: "lastLogin", label: "Last Login", sortable: true }
          ],
          sortable: true,
          filterable: true
        }
      }]
    });
  }

  return {
    content: [{
      type: "ui",
      component: ui
    }],
    isError: false
  };
}

async function createForm(args: any): Promise<CallToolResult> {
  const { title, fields } = args;

  const formFields = fields.map((field: any) => {
    const component: UIComponent = {
      type: field.type === "select" ? "select" : field.type === "checkbox" ? "checkbox" : "input",
      props: {
        name: field.name,
        label: field.label,
        required: field.required,
        ...(field.type !== "select" && field.type !== "checkbox" && { type: field.type }),
        ...(field.options && { options: field.options }),
        ...(field.placeholder && { placeholder: field.placeholder })
      },
      style: { marginBottom: 16 }
    };
    return component;
  });

  const ui: UIComponent = {
    type: "form",
    props: {
      title,
      method: "POST",
      validation: true
    },
    className: "dynamic-form",
    style: { maxWidth: 600, margin: "0 auto", padding: 24 },
    children: [
      {
        type: "text",
        props: {
          variant: "h2",
          text: title
        },
        style: { marginBottom: 24 }
      },
      ...formFields,
      {
        type: "button",
        props: {
          type: "submit",
          text: "Submit",
          variant: "primary"
        },
        style: { marginTop: 24 }
      }
    ]
  };

  return {
    content: [{
      type: "ui",
      component: ui
    }],
    isError: false
  };
}

async function getSampleData(args: any): Promise<CallToolResult> {
  const { type } = args;
  
  let data;
  switch (type) {
    case "sales":
      data = sampleData.sales;
      break;
    case "users":
      data = sampleData.users;
      break;
    case "metrics":
      data = sampleData.metrics;
      break;
    default:
      throw new Error(`Unknown data type: ${type}`);
  }

  return {
    content: [{
      type: "text",
      text: `Sample ${type} data:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
    }],
    structuredContent: { data, type },
    isError: false
  };
}

// Helper functions
function createMetricCard(title: string, value: string, icon: string): UIComponent {
  return {
    type: "card",
    props: {
      variant: "elevated",
      padding: 4
    },
    children: [
      {
        type: "container",
        props: { layout: "flex", align: "center", gap: 2 },
        children: [
          {
            type: "text",
            props: { text: icon, variant: "h3" }
          },
          {
            type: "container",
            props: { layout: "stack" },
            children: [
              {
                type: "text",
                props: { text: value, variant: "h2", weight: "bold" }
              },
              {
                type: "text",
                props: { text: title, variant: "caption", color: "muted" }
              }
            ]
          }
        ]
      }
    ]
  };
}

function renderDashboard(data: any, context: any, preferences: any) {
  // This would use the data, context, and preferences to customize the dashboard
  const ui: UIComponent = {
    type: "container",
    props: {
      layout: "grid",
      columns: 12,
      gap: 4,
      padding: 6
    },
    className: `dashboard theme-${context?.theme || preferences?.defaultTheme || "light"}`,
    children: [
      {
        type: "text",
        props: {
          variant: "h1",
          text: data?.title || "Dashboard"
        },
        style: { gridColumn: "1 / -1", marginBottom: 24 }
      },
      // Add more dashboard components based on data
    ]
  };

  return {
    ui,
    metadata: {
      templateName: "dashboard",
      complexity: "medium"
    }
  };
}

function renderForm(data: any, context: any, preferences: any) {
  const ui: UIComponent = {
    type: "form",
    props: {
      title: data?.title || "Form",
      method: "POST"
    },
    children: [
      {
        type: "text",
        props: {
          variant: "h2",
          text: data?.title || "Form"
        }
      }
      // Add form fields based on data
    ]
  };

  return {
    ui,
    metadata: {
      templateName: "form",
      complexity: "low"
    }
  };
}

function renderDataTable(data: any, context: any, preferences: any) {
  const ui: UIComponent = {
    type: "table",
    props: {
      data: data?.rows || [],
      columns: data?.columns || [],
      sortable: true,
      filterable: true
    }
  };

  return {
    ui,
    metadata: {
      templateName: "data-table",
      complexity: "low"
    }
  };
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP UI Dashboard Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
}); 