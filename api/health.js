export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ONLINE',
    platform: 'ProjectXia Cyber Marketplace API',
    securityShield: 'ACTIVE',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
  });
}
