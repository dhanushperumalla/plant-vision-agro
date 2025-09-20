// Simple test API route to verify Vercel deployment
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API route is working!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
