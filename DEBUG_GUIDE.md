# Debugging Smithery Playground Errors

## Method 1: Browser Developer Console (Recommended)

1. **Open Developer Tools**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - Safari: Enable Developer menu first (Preferences > Advanced > Show Develop menu), then `Cmd+Option+I`

2. **Check the Console Tab**:
   - Look for red error messages
   - Expand the error stack trace
   - Look for messages starting with "Error:", "Uncaught", or "Failed to"

3. **Check the Network Tab**:
   - Click the Network tab
   - Refresh the page or retry the connection
   - Look for failed requests (shown in red)
   - Click on the failed request
   - Check the "Response" tab for detailed error messages
   - Check the "Preview" tab for formatted JSON errors
   - Look at the "Status" code (e.g., 500, 422, 404)

## Method 2: Network Response Details

In the Network tab, find the request to your MCP endpoint and check:

1. **Request Headers**: Shows what was sent
2. **Response Headers**: Shows server response metadata
3. **Response Body**: Contains the actual error message (often in JSON format)

Example error response:
```json
{
  "error": {
    "code": "MINIO_CONNECTION_FAILED",
    "message": "Failed to connect to MinIO server at minio-server-ixq5.onrender.com:443",
    "details": "Connection timeout after 30s"
  }
}
```

## Method 3: Smithery Platform Logs

If available on Smithery:
1. Go to your server dashboard
2. Look for "Logs" or "Console" tab
3. Check for server-side errors

## Common Errors and Solutions

### Error: "MinIO is not configured"
**Solution**: Ensure all required config parameters are provided:
- MINIO_ACCESS_KEY (required)
- MINIO_SECRET_KEY (required)
- MINIO_ENDPOINT (defaults to localhost)
- MINIO_PORT (defaults to 9000)
- MINIO_USE_SSL (defaults to false)

### Error: "Connection timeout" or "ECONNREFUSED"
**Causes**:
- MinIO server is not running
- Wrong endpoint/port
- Firewall blocking connection
- SSL/TLS mismatch

**Solution**: Verify MinIO server is accessible:
```bash
curl http://your-minio-endpoint:port/minio/health/live
```

### Error: "Access Denied" or "Invalid credentials"
**Solution**: Verify your MINIO_ACCESS_KEY and MINIO_SECRET_KEY are correct

### Error: "Bucket not found"
**Solution**: The server will auto-create the bucket, but ensure:
- Bucket name is valid (lowercase, no special chars)
- MinIO user has permission to create buckets

## Testing Your MinIO Configuration

Test your MinIO credentials locally first:

```bash
# Install MinIO client
brew install minio-mc

# Configure alias
mc alias set myminiotest http://your-endpoint:port ACCESS_KEY SECRET_KEY

# Test connection
mc admin info myminiotest

# List buckets
mc ls myminiotest
```

## Local Testing Before Deployment

Test the server locally with your production MinIO config:

```bash
MINIO_ENDPOINT=minio-server-ixq5.onrender.com \
MINIO_PORT=443 \
MINIO_USE_SSL=true \
MINIO_ACCESS_KEY=your-key \
MINIO_SECRET_KEY=your-secret \
MINIO_BUCKET_NAME=sts-echarts \
npm run dev
```

Then test a chart generation to verify everything works.

## Quick Checklist

- [ ] Browser console shows no errors
- [ ] Network tab shows successful requests (status 200)
- [ ] MinIO server is accessible from the internet
- [ ] MinIO credentials are correct
- [ ] SSL setting matches MinIO server configuration
- [ ] Bucket name is valid
- [ ] No firewall blocking the connection
