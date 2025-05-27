# Getting Started with MCP UI Extensions

This guide shows you how to use the MCP UI Dashboard Example with [@edonadei's forked repositories](https://github.com/edonadei) that include UI rendering extensions for the Model Context Protocol.

## 🎯 What You'll Get

- **Interactive Dashboards**: Create dashboards with metrics, charts, and data tables
- **Dynamic Forms**: Generate forms with validation and various input types  
- **Data Visualization**: Charts, graphs, and real-time data display
- **Enhanced Logging**: Detailed component analysis and debugging information
- **UI Templates**: Reusable UI patterns with validation

## 📋 Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Git** for cloning repositories
- Basic familiarity with TypeScript/JavaScript

## 🚀 Quick Setup (5 Minutes)

### Option 1: Clone & Link (Recommended)

```bash
# 1. Create workspace
mkdir mcp-ui-workspace && cd mcp-ui-workspace

# 2. Clone the three repositories
git clone https://github.com/edonadei/modelcontextprotocol-supports-ui.git
git clone https://github.com/edonadei/typescript-sdk.git  
git clone https://github.com/edonadei/mcp-ui-dashboard-example.git

# 3. Build and link the SDK
cd typescript-sdk
npm install && npm run build && npm link

# 4. Setup the example
cd ../mcp-ui-dashboard-example
npm install && npm link @modelcontextprotocol/sdk && npm run build

# 5. Run it!
npm run client
```

### Option 2: Git Dependencies (Simpler)

```bash
# 1. Clone just the example
git clone https://github.com/edonadei/mcp-ui-dashboard-example.git
cd mcp-ui-dashboard-example

# 2. Update package.json to use git dependency
npm pkg set dependencies.@modelcontextprotocol/sdk="git+https://github.com/edonadei/typescript-sdk.git"

# 3. Install and run
npm install && npm run build && npm run client
```

## ✅ Success Indicators

When everything works, you should see:

```
🚀 Starting MCP UI Dashboard Client Example
📅 Timestamp: 2025-XX-XX...
🔧 Creating MCP client...
✅ Connected to UI Dashboard Server
🛠️  Listing available tools...
✅ Received 3 tools from server
📊 Creating a dashboard...
🎨 Dashboard UI component analysis:
   Root component type: container
   Layout: grid
   Grid columns: 12
   Direct children: 5
📝 Creating a form...
📊 Data analysis with metrics...
🎉 All examples completed successfully!
```

## 🔍 What's Different in These Forks?

### [modelcontextprotocol-supports-ui](https://github.com/edonadei/modelcontextprotocol-supports-ui)
- **Extended MCP Schema**: Adds UI component types to the core protocol
- **New Content Types**: `UIContent`, `UIComponent`, `UITemplate`
- **UI Methods**: Template listing, rendering, validation
- **Location**: `schema/2025-03-26/schema.ts`

### [typescript-sdk](https://github.com/edonadei/typescript-sdk)  
- **UI Type Support**: Full TypeScript types for UI extensions
- **Enhanced Capabilities**: Client/server UI capability negotiation
- **Validation Schemas**: Zod schemas for UI components
- **Location**: `src/types.ts`

### UI Dashboard Example
- **Interactive Server**: Creates dashboards, forms, and data visualizations
- **Enhanced Client**: Detailed logging and component analysis
- **Sample Data**: Sales, user, and metrics data for testing

## 🛠️ Available Tools

The example server provides these tools:

1. **`create_dashboard`**: Interactive dashboards with metrics and charts
   - Parameters: `title`, `metrics`, `charts`, `tables`, `theme`
   - Generates: Grid layouts, metric cards, charts, data tables

2. **`create_form`**: Dynamic forms with validation
   - Parameters: `title`, `fields[]` (with types, labels, validation)
   - Generates: Form components with various input types

3. **`get_sample_data`**: Sample data for testing
   - Parameters: `type` ("sales", "users", "metrics")
   - Returns: Structured data with analysis

## 📊 Example Output

### Dashboard Creation
```
🎨 Dashboard UI component analysis:
   Root component type: container
   Layout: grid
   Grid columns: 12
   CSS class: dashboard-container theme-light
   Direct children: 5
   Child component breakdown:
     1. text ("Sales Analytics Dashboard")
     2. container
        └─ Contains 4 nested components (metric cards)
     3. card [Revenue Trend]
        └─ Contains 1 nested components (line chart)
     4. card [Orders]  
        └─ Contains 1 nested components (bar chart)
     5. card [Recent Users]
        └─ Contains 1 nested components (data table)
```

### Form Generation
```
📝 Form UI component analysis:
   Root component type: form
   Form title: User Registration Form
   Form method: POST
   Has validation: true
   Total children: 7
   Form field analysis:
     Field 1: input (firstName, required)
     Field 2: input (lastName, required)  
     Field 3: input (email, required)
     Field 4: select (role, options: User, Admin, Manager)
     Field 5: checkbox (newsletter)
     Submit button: Submit (primary)
```

## 🔧 Troubleshooting

### Build Issues
```bash
# Clean and rebuild
npm run clean && npm run rebuild

# Check TypeScript compilation
npx tsc --noEmit
```

### Connection Problems
```bash
# Test server independently
npm run build
node dist/index.js
# Should show: "MCP UI Dashboard Server running on stdio"
```

### Missing UI Types
```bash
# Verify you're using the forked SDK
npm ls @modelcontextprotocol/sdk
# Should show path to edonadei's typescript-sdk
```

### Dependency Issues
```bash
# Re-link the SDK (if using Method 1)
cd ../typescript-sdk && npm run build && npm link
cd ../mcp-ui-dashboard-example && npm link @modelcontextprotocol/sdk

# Or reinstall (if using Method 2)
npm install --force
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)**: Detailed setup instructions with troubleshooting
- **[README.md](README.md)**: Complete feature documentation  
- **[EXAMPLE_OUTPUT.md](EXAMPLE_OUTPUT.md)**: Full example run with enhanced logging
- **[QUICK_START.md](QUICK_START.md)**: Minimal setup commands

## 🌟 Key Features Demonstrated

### UI Components
- **Containers**: Grid and flex layouts
- **Text**: Headers, labels, captions with styling
- **Cards**: Elevated containers with titles
- **Charts**: Line charts, bar charts with data binding
- **Tables**: Sortable, filterable data tables
- **Forms**: Dynamic forms with validation
- **Inputs**: Text, email, select, checkbox components

### Data Integration  
- **Sample Data**: 6 months sales data, 3 user records, 4 key metrics
- **Calculations**: Revenue totals, user distributions, growth rates
- **Structured Content**: JSON data with type information

### Theming & Styling
- **Light/Dark Themes**: Automatic CSS class application
- **Responsive Design**: Grid-based layouts
- **Component Variants**: Elevated, outlined, default styles

## 🤝 Contributing

To contribute to the UI extensions:

1. **Fork** the relevant repository from [@edonadei](https://github.com/edonadei)
2. **Create** a feature branch
3. **Test** your changes with the full setup
4. **Submit** a pull request

## 📞 Getting Help

If you run into issues:

1. **Check the enhanced logging** for specific error details
2. **Verify Node.js/npm versions** meet requirements  
3. **Ensure all repositories** are properly cloned and built
4. **Review the troubleshooting section** in [SETUP.md](SETUP.md)
5. **Test each component independently** (protocol → SDK → example)

## 🔗 Repository Links

- **Protocol**: https://github.com/edonadei/modelcontextprotocol-supports-ui
- **TypeScript SDK**: https://github.com/edonadei/typescript-sdk  
- **Dashboard Example**: https://github.com/edonadei/mcp-ui-dashboard-example

---

**Ready to build rich, interactive MCP applications with UI rendering? Start with the Quick Setup above! 🚀** 