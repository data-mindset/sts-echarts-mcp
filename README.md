# sts-echarts-mcp

[![smithery badge](https://smithery.ai/badge/@data-mindset/sts-echarts-mcp)](https://smithery.ai/server/@data-mindset/sts-echarts-mcp)

Generate visual charts using Apache ECharts with AI MCP dynamically for Smithery AI.

Built with [Smithery SDK](https://smithery.ai/docs)

## Features

- 17 chart types: bar, line, pie, radar, scatter, sankey, funnel, gauge, treemap, sunburst, heatmap, candlestick, boxplot, graph, parallel, tree, and custom ECharts
- Export to PNG, SVG, or ECharts option format
- MinIO integration for chart storage (mandatory)
- Public bucket access for generated charts

## Prerequisites

- **MinIO**: Object storage server for chart images
- **Smithery API key**: Get yours at [smithery.ai/account/api-keys](https://smithery.ai/account/api-keys)

## MinIO Setup

Install and start MinIO locally:

```bash
# macOS
brew install minio/stable/minio
minio server ~/minio-data --console-address :9001

# Or use Docker
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```

Default credentials: `minioadmin` / `minioadmin`

## Getting Started

### Installing via Smithery

To install STS ECharts automatically via [Smithery](https://smithery.ai/server/@data-mindset/sts-echarts-mcp):

```bash
npx -y @smithery/cli install @data-mindset/sts-echarts-mcp
```

### Installing Manually
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure MinIO in your Smithery config or environment:
   - `MINIO_ENDPOINT`: Server endpoint (default: localhost)
   - `MINIO_PORT`: Server port (default: 9000)
   - `MINIO_ACCESS_KEY`: Access key (required)
   - `MINIO_SECRET_KEY`: Secret key (required)
   - `MINIO_BUCKET_NAME`: Bucket name (default: sts-echarts)

3. Start development server:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

## Deploy

Deploy to Smithery at [smithery.ai/new](https://smithery.ai/new)

## License

MIT
