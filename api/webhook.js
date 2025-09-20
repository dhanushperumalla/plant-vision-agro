// Vercel API route to proxy requests to N8N webhook
export default async function handler(req, res) {
  console.log('Webhook API route called:', req.method, req.url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', received: req.method });
  }

  try {
    // Get the webhook URL from environment variable
    const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL;
    
    console.log('Environment variable check:', webhookUrl ? 'Found' : 'Not found');
    
    if (!webhookUrl) {
      console.error('N8N webhook URL not configured');
      return res.status(500).json({ error: 'N8N webhook URL not configured' });
    }

    console.log('Proxying request to:', webhookUrl);

    // Forward the request to N8N webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: req.body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('N8N response status:', response.status);

    // Get the response data
    const data = await response.text();
    console.log('N8N response data length:', data.length);
    console.log('N8N response data preview:', data.substring(0, 200));
    
    // Set appropriate headers
    res.status(response.status);
    
    // Always try to return JSON, even if the original response wasn't JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('Successfully parsed N8N response as JSON');
      res.json(jsonData);
    } catch (parseError) {
      console.log('N8N response is not JSON, wrapping in JSON response');
      // If it's not JSON, wrap it in a JSON response
      res.json({
        success: false,
        error: 'Invalid response format from N8N webhook',
        rawResponse: data,
        status: response.status
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    
    if (error.name === 'AbortError') {
      res.status(408).json({ 
        error: 'Request timeout', 
        message: 'N8N webhook did not respond within 25 seconds'
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      });
    }
  }
}

// Configure the API route
export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle FormData
  },
};
