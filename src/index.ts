import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { tools } from "./tools";

// Config schema for MinIO configuration
export const configSchema = z.object({
  MINIO_ENDPOINT: z
    .string()
    .default("localhost")
    .describe("MinIO server endpoint (without protocol)"),
  MINIO_PORT: z.coerce.number().default(9000).describe("MinIO server port"),
  MINIO_USE_SSL: z.coerce
    .boolean()
    .default(false)
    .describe("Use SSL/HTTPS connection"),
  MINIO_ACCESS_KEY: z.string().describe("MinIO access key"),
  MINIO_SECRET_KEY: z.string().describe("MinIO secret key"),
  MINIO_BUCKET_NAME: z
    .string()
    .default("sts-echarts")
    .describe("Bucket name for storing charts"),
});

export default function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  // Set environment variables from config for MinIO utilities
  // Convert types to strings as required by process.env
  process.env.MINIO_ENDPOINT = config.MINIO_ENDPOINT;
  process.env.MINIO_PORT = String(config.MINIO_PORT);
  process.env.MINIO_USE_SSL = String(config.MINIO_USE_SSL);
  process.env.MINIO_ACCESS_KEY = config.MINIO_ACCESS_KEY;
  process.env.MINIO_SECRET_KEY = config.MINIO_SECRET_KEY;
  process.env.MINIO_BUCKET_NAME = config.MINIO_BUCKET_NAME;

  const server = new McpServer({
    name: "sts-echarts-mcp",
    version: "0.1.0",
  });

  // Register all chart generation tools
  for (const tool of tools) {
    const { name, description, inputSchema, run } = tool;
    server.registerTool(
      name,
      {
        title: name,
        description,
        inputSchema: inputSchema.shape,
      },
      run as any,
    );
  }

  return server.server;
}
