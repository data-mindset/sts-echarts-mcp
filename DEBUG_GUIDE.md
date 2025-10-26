# Debugging Smithery Playground Errors

## ⚠️ How to Find Your MCP Server Error

When you see "An error occurred" in Smithery Playground, the browser console may show many errors - but **most are from Smithery's UI, not your server!**

### Step-by-Step: Finding the Real Error

#### 1. Open Browser Developer Tools

- Press `F12` (or `Cmd+Option+I` on Mac)
- You'll see many errors - **ignore the Console tab for now**

#### 2. Go to Network Tab (Most Important!)

1. Click the **"Network"** tab in Developer Tools
2. Make sure recording is on (red circle should be active)
3. Clear previous requests (trash icon)

#### 3. Trigger the Error

1. In Smithery Playground, try to **Connect** or **Call a Tool**
2. Watch the Network tab for new requests

#### 4. Find the Failed Request

Look for requests that are:

- **Red colored** (failed status)
- Named like: `/mcp?MINIO_ENDPOINT=...` or similar
- Status codes like: **500**, **422**, **400**

#### 5. Read the Actual Error

1. **Click on the failed request**
2. Click the **"Response"** or **"Preview"** tab
3. **Copy the error message** - this is your real error!

### Example: What You'll See

**Console Tab** (❌ Ignore these - they're Smithery UI errors):

```text
TypeError: e.split is not a function
Failed to load RSC payload
[React Scan] Failed to load
```

**Network Tab Response** (✅ This is your real error!):

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Expected string, received object",
    "path": ["echartsOption"]
  }
}
```

### Common MCP Error Messages

**Error -32602**: Invalid parameters

```text
"message": "Expected string, received object"
```

→ **Solution**: Parameter type mismatch in tool schema

**Error -32603**: Internal server error

```text
"message": "MinIO is not configured"
```

→ **Solution**: Check MinIO configuration

**Error ECONNREFUSED**:

```text
"message": "Failed to connect to MinIO server"
```

→ **Solution**: MinIO server unreachable

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
