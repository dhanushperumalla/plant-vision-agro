// Vercel API route to proxy requests to N8N webhook
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the webhook URL from environment variable
    const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return res.status(500).json({ error: 'N8N webhook URL not configured' });
    }

    // Extract the path from the request
    const { path } = req.query;
    const targetUrl = `${webhookUrl}`;

    // Forward the request to N8N webhook
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'],
        'ngrok-skip-browser-warning': 'true',
      },
      body: req.body,
    });

    // Get the response data
    const data = await response.text();
    
    // Set appropriate headers
    res.status(response.status);
    
    // Try to parse as JSON, if not possible, send as text
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch {
      res.send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Configure the API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow large image uploads
    },
  },
};
