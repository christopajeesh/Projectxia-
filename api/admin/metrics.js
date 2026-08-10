export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const metrics = {
    totalUsers: 1,
    totalProjects: 0,
    totalIntrusionsBlocked: 0,
    serverUptime: '99.99%',
    superAdminEmail: 'theprojectxia@gmail.com',
  };

  const auditLogs = [];

  return res.status(200).json({
    success: true,
    metrics,
    auditLogs,
  });
}
