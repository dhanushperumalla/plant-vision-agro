import { IncomingForm } from 'formidable';

// Vercel API route to proxy requests to N8N webhook
export default async function handler(req, res) {
  console.log('Webhook API route called:', req.method, req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
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
    // Get the webhook URL from environment variable (use N8N_WEBHOOK_URL for production)
    const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.VITE_N8N_WEBHOOK_URL;
    
    console.log('Environment variables check:');
    console.log('- N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL ? 'Found' : 'Not found');
    console.log('- VITE_N8N_WEBHOOK_URL:', process.env.VITE_N8N_WEBHOOK_URL ? 'Found' : 'Not found');
    console.log('- Using URL:', webhookUrl ? 'Found' : 'Not found');
    
    if (!webhookUrl) {
      console.error('N8N webhook URL not configured');
      return res.status(500).json({ 
        error: 'N8N webhook URL not configured',
        details: 'Please set N8N_WEBHOOK_URL environment variable in Vercel'
      });
    }

    console.log('Proxying request to N8N webhook');

    // Parse the multipart form data
    const form = new IncomingForm();
    const parseResult = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
        } else {
          console.log('Parsed form data - fields:', Object.keys(fields), 'files:', Object.keys(files));
          resolve({ fields, files });
        }
      });
    });

    const { files } = parseResult;

    // Create a new FormData to send to N8N
    const formData = new FormData();
    
    // Add the image file to FormData
    if (files.image) {
      const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
      console.log('Image file info:', {
        name: imageFile.originalFilename,
        size: imageFile.size,
        type: imageFile.mimetype
      });
      
      // Read the file and create a blob
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(imageFile.filepath);
      const blob = new Blob([fileBuffer], { type: imageFile.mimetype });
      
      formData.append('image', blob, imageFile.originalFilename || 'image.jpg');
    } else {
      console.error('No image file found in request');
      return res.status(400).json({ 
        error: 'No image file provided',
        details: 'Please include an image file in your request'
      });
    }

    // Forward the request to N8N webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('N8N response status:', response.status);
    console.log('N8N response headers:', Object.fromEntries(response.headers.entries()));

    // Get the response data
    const data = await response.text();
    console.log('N8N response data length:', data.length);
    console.log('N8N response data preview:', data.substring(0, 500));
    
    // Check if the response is successful
    if (!response.ok) {
      console.error('N8N webhook returned error status:', response.status);
      return res.status(response.status).json({
        success: false,
        error: `N8N webhook returned ${response.status}`,
        details: data,
        status: response.status
      });
    }

    // Check if response is empty
    if (!data || data.trim().length === 0) {
      console.error('N8N webhook returned empty response');
      return res.status(500).json({
        success: false,
        error: 'N8N webhook returned empty response',
        details: 'The webhook processed the request but returned no data. This might indicate a configuration issue with your N8N workflow.',
        status: response.status
      });
    }
    
    // Always try to return JSON, even if the original response wasn't JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('Successfully parsed N8N response as JSON');
      console.log('Response structure:', Object.keys(jsonData));
      
      // Validate that we have the expected structure for the frontend
      if (jsonData.output && jsonData.output.plant_name) {
        console.log('Response validation successful - has plant_name');
        res.status(200).json(jsonData);
      } else {
        console.log('Response validation failed - missing expected structure');
        console.log('Expected: jsonData.output.plant_name');
        console.log('Actual structure:', JSON.stringify(jsonData, null, 2));
        res.status(200).json({
          success: false,
          error: 'N8N response missing expected data structure',
          details: 'The webhook returned JSON but missing output.plant_name field',
          rawResponse: jsonData,
          status: response.status
        });
      }
    } catch (parseError) {
      console.log('N8N response is not valid JSON:', parseError.message);
      console.log('Raw response:', data);
      // If it's not JSON, wrap it in a JSON response
      res.status(500).json({
        success: false,
        error: 'Invalid response format from N8N webhook',
        details: 'The webhook returned non-JSON data. Please check your N8N workflow output format.',
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
    bodyParser: false, // Disable body parsing to handle FormData manually
    sizeLimit: '10mb', // Allow larger file uploads
  },
};
