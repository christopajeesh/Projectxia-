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
    totalUsers: 142,
    totalProjects: 68,
    totalIntrusionsBlocked: 219,
    serverUptime: '99.98%',
    superAdminEmail: 'theprojectxia@gmail.com',
  };

  const auditLogs = [
    {
      _id: 'log_audit_1',
      action: 'USER_LOGIN',
      performedBy: {
        name: 'ProjectXia Super Admin',
        email: 'theprojectxia@gmail.com',
        mobile: '+91 98400 12345',
      },
      ipAddress: '157.48.24.110 (Secure SSL Node)',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      _id: 'log_audit_2',
      action: 'CUSTOM_LEAD_SUBMISSION',
      performedBy: {
        name: 'Priya Sharma',
        email: 'priya.sharma.tech@gmail.com',
        mobile: '+91 98451 23456',
      },
      ipAddress: '49.37.198.42 (Bangalore, IN)',
      createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    },
    {
      _id: 'log_audit_3',
      action: 'USER_REGISTRATION',
      performedBy: {
        name: 'Karthik Raja',
        email: 'karthik.raja.ece@gmail.com',
        mobile: '+91 97890 87654',
      },
      ipAddress: '106.51.78.23 (Chennai, IN)',
      createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    },
  ];

  return res.status(200).json({
    success: true,
    metrics,
    auditLogs,
  });
}
