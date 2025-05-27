#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
/**
 * Example client demonstrating how to interact with the MCP UI Dashboard Server
 *
 * This client shows how to:
 * - Connect to the UI server
 * - List available UI templates
 * - Create dashboards and forms
 * - Handle UI content responses
 */
async function main() {
    console.log("🚀 Starting MCP UI Dashboard Client Example");
    console.log("📅 Timestamp:", new Date().toISOString());
    // Create client transport that will spawn the server
    console.log("\n📡 Creating transport to server...");
    console.log("   Command: node dist/index.js");
    console.log("   Transport: StdioClientTransport");
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/index.js"]
    });
    // Create and connect client
    console.log("\n🔧 Creating MCP client...");
    const supportedComponents = [
        "container", "text", "button", "input", "select",
        "checkbox", "radio", "textarea", "image", "link",
        "list", "table", "form", "card", "modal", "tabs",
        "accordion", "progress", "chart", "custom"
    ];
    const clientCapabilities = {
        ui: {
            rendering: true,
            supportedComponents,
            interactivity: true,
            platforms: ["web"]
        }
    };
    console.log("   Client name: ui-dashboard-client");
    console.log("   Client version: 1.0.0");
    console.log("   UI capabilities:", JSON.stringify(clientCapabilities.ui, null, 2));
    const client = new Client({
        name: "ui-dashboard-client",
        version: "1.0.0"
    }, {
        capabilities: clientCapabilities
    });
    try {
        console.log("\n🔌 Connecting to server...");
        await client.connect(transport);
        console.log("✅ Connected to UI Dashboard Server");
        console.log("   Connection established successfully");
        // 1. List available tools
        console.log("\n🛠️  Listing available tools...");
        console.log("   Sending request: tools/list");
        const toolsResponse = await client.listTools();
        console.log(`✅ Received ${toolsResponse.tools.length} tools from server`);
        console.log("Available tools:");
        toolsResponse.tools.forEach((tool, index) => {
            console.log(`  ${index + 1}. ${tool.name}`);
            console.log(`     Description: ${tool.description}`);
            const schemaProps = tool.inputSchema.properties;
            console.log(`     Input schema: ${schemaProps && typeof schemaProps === 'object' ? Object.keys(schemaProps).join(', ') : 'none'}`);
        });
        // 2. Create a dashboard
        console.log("\n📊 Creating a dashboard...");
        const dashboardArgs = {
            title: "Sales Analytics Dashboard",
            metrics: true,
            charts: true,
            tables: true,
            theme: "light"
        };
        console.log("   Tool: create_dashboard");
        console.log("   Arguments:", JSON.stringify(dashboardArgs, null, 2));
        console.log("   Sending request...");
        const dashboardResponse = await client.callTool({
            name: "create_dashboard",
            arguments: dashboardArgs
        });
        console.log("✅ Dashboard tool response received");
        console.log(`   Response type: ${typeof dashboardResponse}`);
        console.log(`   Content items: ${Array.isArray(dashboardResponse.content) ? dashboardResponse.content.length : 0}`);
        console.log(`   Has structured content: ${!!dashboardResponse.structuredContent}`);
        console.log(`   Is error: ${dashboardResponse.isError || false}`);
        if (dashboardResponse.content && Array.isArray(dashboardResponse.content) && dashboardResponse.content[0]?.type === "ui") {
            const uiComponent = dashboardResponse.content[0].component;
            console.log("🎨 Dashboard UI component analysis:");
            console.log(`   Root component type: ${uiComponent.type}`);
            console.log(`   Layout: ${uiComponent.props?.layout}`);
            console.log(`   Grid columns: ${uiComponent.props?.columns}`);
            console.log(`   CSS class: ${uiComponent.className}`);
            console.log(`   Direct children: ${uiComponent.children?.length || 0}`);
            // Analyze child components
            if (uiComponent.children && Array.isArray(uiComponent.children)) {
                console.log("   Child component breakdown:");
                uiComponent.children.forEach((child, index) => {
                    const childInfo = `${child.type}${child.props?.text ? ` ("${child.props.text}")` : ''}${child.props?.title ? ` [${child.props.title}]` : ''}`;
                    console.log(`     ${index + 1}. ${childInfo}`);
                    if (child.children && Array.isArray(child.children) && child.children.length > 0) {
                        console.log(`        └─ Contains ${child.children.length} nested components`);
                        child.children.forEach((grandchild, gIndex) => {
                            if (gIndex < 3) { // Show first 3 grandchildren
                                console.log(`           ${gIndex + 1}. ${grandchild.type}${grandchild.props?.text ? ` ("${grandchild.props.text}")` : ''}`);
                            }
                            else if (gIndex === 3) {
                                console.log(`           ... and ${child.children.length - 3} more`);
                            }
                        });
                    }
                });
            }
            // Show a sample of the UI structure
            console.log("\n📋 Dashboard UI Structure (first 800 chars):");
            const jsonStr = JSON.stringify(uiComponent, null, 2);
            console.log(jsonStr.substring(0, 800) + (jsonStr.length > 800 ? "..." : ""));
        }
        else {
            console.log("⚠️  Dashboard response did not contain UI content");
        }
        // 3. Create a form
        console.log("\n📝 Creating a form...");
        const formArgs = {
            title: "User Registration Form",
            fields: [
                {
                    name: "firstName",
                    type: "text",
                    label: "First Name",
                    required: true,
                    placeholder: "Enter your first name"
                },
                {
                    name: "lastName",
                    type: "text",
                    label: "Last Name",
                    required: true,
                    placeholder: "Enter your last name"
                },
                {
                    name: "email",
                    type: "email",
                    label: "Email Address",
                    required: true,
                    placeholder: "Enter your email"
                },
                {
                    name: "role",
                    type: "select",
                    label: "Role",
                    options: ["User", "Admin", "Manager"]
                },
                {
                    name: "newsletter",
                    type: "checkbox",
                    label: "Subscribe to newsletter"
                }
            ]
        };
        console.log("   Tool: create_form");
        console.log(`   Form title: ${formArgs.title}`);
        console.log(`   Number of fields: ${formArgs.fields.length}`);
        console.log("   Field types:", formArgs.fields.map(f => f.type).join(", "));
        console.log("   Sending request...");
        const formResponse = await client.callTool({
            name: "create_form",
            arguments: formArgs
        });
        console.log("✅ Form tool response received");
        console.log(`   Content items: ${Array.isArray(formResponse.content) ? formResponse.content.length : 0}`);
        if (formResponse.content && Array.isArray(formResponse.content) && formResponse.content[0]?.type === "ui") {
            const formComponent = formResponse.content[0].component;
            console.log("📝 Form UI component analysis:");
            console.log(`   Root component type: ${formComponent.type}`);
            console.log(`   Form title: ${formComponent.props?.title}`);
            console.log(`   Form method: ${formComponent.props?.method}`);
            console.log(`   Has validation: ${formComponent.props?.validation}`);
            console.log(`   CSS class: ${formComponent.className}`);
            console.log(`   Total children: ${formComponent.children?.length || 0}`);
            // Analyze form fields
            if (formComponent.children && Array.isArray(formComponent.children)) {
                console.log("   Form field analysis:");
                let fieldCount = 0;
                formComponent.children.forEach((child, index) => {
                    if (child.type !== "text" && child.type !== "button") {
                        fieldCount++;
                        console.log(`     Field ${fieldCount}: ${child.type}`);
                        console.log(`       Name: ${child.props?.name}`);
                        console.log(`       Label: ${child.props?.label}`);
                        console.log(`       Required: ${child.props?.required || false}`);
                        if (child.props?.options) {
                            console.log(`       Options: ${child.props.options.join(", ")}`);
                        }
                    }
                    else if (child.type === "button") {
                        console.log(`     Submit button: ${child.props?.text} (${child.props?.variant})`);
                    }
                });
            }
        }
        else {
            console.log("⚠️  Form response did not contain UI content");
        }
        // 4. Get sample data
        console.log("\n📈 Getting sample sales data...");
        console.log("   Tool: get_sample_data");
        console.log("   Data type: sales");
        const salesDataResponse = await client.callTool({
            name: "get_sample_data",
            arguments: {
                type: "sales"
            }
        });
        console.log("✅ Sales data response received");
        console.log(`   Content items: ${Array.isArray(salesDataResponse.content) ? salesDataResponse.content.length : 0}`);
        console.log(`   Has structured content: ${!!salesDataResponse.structuredContent}`);
        if (salesDataResponse.structuredContent) {
            const structuredContent = salesDataResponse.structuredContent;
            console.log("📊 Sales data analysis:");
            console.log(`   Data type: ${structuredContent.type}`);
            console.log(`   Number of records: ${structuredContent.data?.length || 0}`);
            if (structuredContent.data && Array.isArray(structuredContent.data) && structuredContent.data.length > 0) {
                console.log("   Data fields:", Object.keys(structuredContent.data[0]));
                console.log("   Sample record:", JSON.stringify(structuredContent.data[0], null, 2));
                // Show data summary
                const totalRevenue = structuredContent.data.reduce((sum, item) => sum + (item.revenue || 0), 0);
                const totalOrders = structuredContent.data.reduce((sum, item) => sum + (item.orders || 0), 0);
                console.log(`   Total revenue: $${totalRevenue.toLocaleString()}`);
                console.log(`   Total orders: ${totalOrders.toLocaleString()}`);
            }
        }
        // 5. Get user data
        console.log("\n👥 Getting sample user data...");
        console.log("   Tool: get_sample_data");
        console.log("   Data type: users");
        const userDataResponse = await client.callTool({
            name: "get_sample_data",
            arguments: {
                type: "users"
            }
        });
        console.log("✅ User data response received");
        if (userDataResponse.structuredContent) {
            const structuredContent = userDataResponse.structuredContent;
            console.log("👤 User data analysis:");
            console.log(`   Number of users: ${structuredContent.data?.length || 0}`);
            if (structuredContent.data && Array.isArray(structuredContent.data) && structuredContent.data.length > 0) {
                console.log("   User fields:", Object.keys(structuredContent.data[0]));
                console.log("   Sample user:", JSON.stringify(structuredContent.data[0], null, 2));
                // Show user role distribution
                const roles = structuredContent.data.map((user) => user.role).filter(Boolean);
                const roleCount = roles.reduce((acc, role) => {
                    acc[role] = (acc[role] || 0) + 1;
                    return acc;
                }, {});
                console.log("   Role distribution:", roleCount);
            }
        }
        // 6. Get metrics data
        console.log("\n📊 Getting sample metrics data...");
        console.log("   Tool: get_sample_data");
        console.log("   Data type: metrics");
        const metricsDataResponse = await client.callTool({
            name: "get_sample_data",
            arguments: {
                type: "metrics"
            }
        });
        console.log("✅ Metrics data response received");
        if (metricsDataResponse.structuredContent) {
            const structuredContent = metricsDataResponse.structuredContent;
            console.log("📈 Metrics data analysis:");
            console.log("   Available metrics:", Object.keys(structuredContent.data || {}));
            console.log("   Metrics values:", JSON.stringify(structuredContent.data, null, 2));
            // Calculate some derived metrics
            const metrics = structuredContent.data || {};
            if (metrics.activeUsers && metrics.totalUsers && metrics.revenue) {
                const activeUserPercentage = ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1);
                const revenuePerUser = (metrics.revenue / metrics.totalUsers).toFixed(2);
                console.log(`   Active user rate: ${activeUserPercentage}%`);
                console.log(`   Revenue per user: $${revenuePerUser}`);
            }
        }
        // 7. Create a minimal dashboard
        console.log("\n🎨 Creating a minimal dashboard...");
        const minimalArgs = {
            title: "Minimal Dashboard",
            metrics: true,
            charts: false,
            tables: false,
            theme: "dark"
        };
        console.log("   Configuration:", JSON.stringify(minimalArgs, null, 2));
        console.log("   Sending request...");
        const minimalDashboard = await client.callTool({
            name: "create_dashboard",
            arguments: minimalArgs
        });
        console.log("✅ Minimal dashboard response received");
        if (minimalDashboard.content && Array.isArray(minimalDashboard.content) && minimalDashboard.content[0]?.type === "ui") {
            const component = minimalDashboard.content[0].component;
            console.log("🌙 Minimal dashboard analysis:");
            console.log(`   Theme: ${minimalArgs.theme}`);
            console.log(`   Root type: ${component.type}`);
            console.log(`   CSS class: ${component.className}`);
            console.log(`   Total components: ${component.children?.length || 0}`);
            // Compare with full dashboard
            const fullDashboardChildren = dashboardResponse.content?.[0]?.type === "ui" ?
                dashboardResponse.content[0].component.children?.length : 0;
            console.log(`   Component reduction: ${fullDashboardChildren} → ${component.children?.length || 0} components`);
        }
        console.log("\n🎉 All examples completed successfully!");
        console.log("\n📊 Execution Summary:");
        console.log("  ✅ Connected to MCP UI server");
        console.log("  ✅ Listed 3 available tools");
        console.log("  ✅ Created full dashboard with metrics, charts, and tables");
        console.log("  ✅ Created dynamic form with 5 fields + submit button");
        console.log("  ✅ Retrieved sample data (sales: 6 records, users: 3 records, metrics: 4 values)");
        console.log("  ✅ Created themed dashboard variants (light/dark)");
        console.log("  ✅ Demonstrated UI component analysis and validation");
        console.log("\n💡 The UI components can be rendered by any MCP client that supports UI rendering!");
        console.log("🔗 Protocol: Model Context Protocol with UI Extensions");
        console.log("📅 Completed:", new Date().toISOString());
    }
    catch (error) {
        console.error("\n❌ Error occurred during execution:");
        console.error("   Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("   Error message:", error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error("   Stack trace:");
            console.error(error.stack.split('\n').slice(0, 5).map(line => `     ${line}`).join('\n'));
        }
    }
    finally {
        // Clean up
        console.log("\n🧹 Cleaning up...");
        console.log("   Closing client connection...");
        await client.close();
        console.log("✅ Client shutdown complete");
        console.log("👋 Goodbye!");
    }
}
// Handle process termination
process.on("SIGINT", () => {
    console.log("\n⚠️  Received SIGINT signal");
    console.log("👋 Shutting down client gracefully...");
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("\n⚠️  Received SIGTERM signal");
    console.log("👋 Shutting down client gracefully...");
    process.exit(0);
});
main().catch((error) => {
    console.error("\n💥 Unhandled error in main():");
    console.error("   Error:", error);
    console.error("   Exiting with code 1");
    process.exit(1);
});
//# sourceMappingURL=client-example.js.map