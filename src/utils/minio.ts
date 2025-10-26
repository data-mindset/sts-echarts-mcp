import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Client } from "minio";

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "sts-echarts";

/**
 * Public read policy for the bucket
 */
const PUBLIC_READ_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: { AWS: ["*"] },
      Action: ["s3:GetObject"],
      Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
    },
  ],
};

/**
 * Check if MinIO is properly configured
 */
export function isMinIOConfigured(): boolean {
  return !!(
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY &&
    process.env.MINIO_ENDPOINT
  );
}

/**
 * Get MinIO client (mandatory - throws error if not configured)
 */
function getMinIOClient(): Client {
  if (!isMinIOConfigured()) {
    throw new Error(
      "MinIO is not configured. Please provide MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY environment variables.",
    );
  }

  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error(
      "MinIO is not configured. Please provide MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY environment variables.",
    );
  }

  return new Client({
    endPoint: endpoint,
    port: Number.parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: accessKey,
    secretKey: secretKey,
  });
}

/**
 * Store Buffer to MinIO and return public URL
 */
export async function storeBufferToMinIO(
  buffer: Buffer,
  extension: string,
  mimeType: string,
): Promise<string> {
  const minioClient = getMinIOClient();

  // Generate unique filename
  const timestamp = Date.now();
  const objectName = `charts/${timestamp}.${extension}`;

  // Create temporary file
  const tempFilePath = path.join(os.tmpdir(), `temp_${timestamp}.${extension}`);
  fs.writeFileSync(tempFilePath, buffer);

  try {
    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");

      // Set public read policy for the bucket
      await minioClient.setBucketPolicy(
        BUCKET_NAME,
        JSON.stringify(PUBLIC_READ_POLICY),
      );
    }

    // Upload file to MinIO
    await minioClient.fPutObject(BUCKET_NAME, objectName, tempFilePath, {
      "Content-Type": mimeType,
    });

    // Clean up temporary file
    fs.unlinkSync(tempFilePath);

    // Generate public URL using environment variables
    const useSSL = process.env.MINIO_USE_SSL === "true";
    const protocol = useSSL ? "https" : "http";
    const endPoint = process.env.MINIO_ENDPOINT || "localhost";
    const port = process.env.MINIO_PORT || "9000";
    const url = `${protocol}://${endPoint}:${port}/${BUCKET_NAME}/${objectName}`;

    return url;
  } catch (error) {
    // Clean up temporary file on error
    try {
      fs.unlinkSync(tempFilePath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}
