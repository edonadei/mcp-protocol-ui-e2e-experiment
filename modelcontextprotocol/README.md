# Model Context Protocol specification

This repo contains the specification and protocol schema for the Model Context Protocol.

The schema is [defined in TypeScript](schema/2025-03-26/schema.ts) first, but
[made available as JSON Schema](schema/2025-03-26/schema.json) as well, for wider
compatibility.

The official MCP documentation is built using Mintlify and available at
[modelcontextprotocol.io](https://modelcontextprotocol.io).

## New Features

### UI Extensions

The protocol now supports UI rendering capabilities, allowing servers to return structured UI components instead of just text. This enables rich interactive experiences including:

- **UI Templates**: Define structure and constraints for UI components
- **UI Rendering**: Generate UI components using templates and data  
- **UI Validation**: Validate UI components against templates
- **Content Types**: New `UIContent` type for messages and tool responses

See [examples/ui-extension-example.md](examples/ui-extension-example.md) for detailed usage examples and implementation guidelines.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this
project.

## License

This project is licensed under the MIT License—see the [LICENSE](LICENSE) file for
details.
