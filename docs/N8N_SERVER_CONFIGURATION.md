# N8N Server Configuration for Large File Uploads

## Problem
If you're experiencing **413 Request Entity Too Large** errors, it means your N8N server has upload size limits that are too restrictive.

## Solution Options

### Option 1: Client-Side Compression (Recommended)
✅ **Already Implemented** - The app now automatically compresses images to under 1MB before upload.

### Option 2: Server Configuration (If you have server access)

#### For N8N with nginx Reverse Proxy

1. **Edit nginx configuration** (usually at `/etc/nginx/sites-available/your-site`):
```nginx
server {
    # ... other configuration ...
    
    # Increase client body size to allow larger uploads
    client_max_body_size 10M;  # Allow up to 10MB uploads
    
    # Optional: Increase proxy timeout for large file processing
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
    
    location / {
        proxy_pass http://n8n-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **Test configuration**:
```bash
sudo nginx -t
```

3. **Reload nginx**:
```bash
sudo systemctl reload nginx
```

#### For N8N Docker Configuration

Add environment variables to your docker-compose.yml:

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      # ... other env vars ...
      - N8N_PAYLOAD_SIZE_MAX=10485760  # 10MB in bytes
    volumes:
      # ... other volumes ...
    ports:
      - "5678:5678"
```

#### For Standalone N8N

Set environment variable:
```bash
export N8N_PAYLOAD_SIZE_MAX=10485760  # 10MB in bytes
n8n start
```

### Option 3: Cloud Service Limits

#### For n8n.cloud hosted instances:
- Contact n8n support to increase upload limits
- Default limit is usually 1MB for free tiers
- Paid plans may have higher limits

#### For Vercel Functions (API route limits):
- Vercel has a 4.5MB limit for function payloads
- Our compression ensures we stay well under this limit

## Verification

After making server changes, test with:
```bash
curl -X POST \
  -F "image=@large-test-image.jpg" \
  https://your-n8n-webhook-url
```

## Monitoring

Check nginx error logs if issues persist:
```bash
sudo tail -f /var/log/nginx/error.log
```

## Best Practices

1. **Always compress images client-side** (already implemented)
2. **Set reasonable server limits** (5-10MB is usually sufficient)
3. **Monitor server resources** for large file processing
4. **Use appropriate image formats** (JPEG for photos, PNG for graphics)
5. **Implement progressive upload** for very large files (future enhancement)

## Troubleshooting

### Common Issues:

1. **413 Error persists after nginx config**:
   - Check if changes were applied: `sudo nginx -t && sudo systemctl reload nginx`
   - Verify correct config file is being used
   - Check for multiple nginx instances

2. **N8N workflow fails with large images**:
   - Increase workflow timeout settings
   - Check N8N server memory limits
   - Consider using N8N's HTTP Request node with streaming

3. **Vercel function timeouts**:
   - Our API route has 60-second timeout (configured in vercel.json)
   - Mobile networks may need longer timeouts

### Debug Commands:

```bash
# Check current nginx config
sudo nginx -T | grep client_max_body_size

# Check N8N process limits
ps aux | grep n8n

# Test file upload size
curl -X POST -F "file=@test.jpg" -v https://your-endpoint
```

## Current Implementation Status

✅ **Client-side compression implemented**
✅ **File size validation added**  
✅ **User feedback for compression status**
✅ **Fallback error handling**
⏳ **Server configuration documented**

The client-side compression should resolve most 413 errors automatically.