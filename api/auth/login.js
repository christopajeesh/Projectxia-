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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    // Super Admin Master Clearance
    if (cleanEmail === 'theprojectxia@gmail.com') {
      if (cleanPassword === 'Pattasseril@123') {
        const ownerUser = {
          _id: 'usr_owner_theprojectxia',
          id: 'usr_owner_theprojectxia',
          name: 'ProjectXia Super Admin',
          email: 'theprojectxia@gmail.com',
          role: 'owner',
          authProvider: 'local',
          isVerified: true,
          bio: 'Platform Owner & Senior Systems Architect at ProjectXia.',
        };
        const token = 'px_owner_tok_' + Date.now().toString(36) + Math.random().toString(36).slice(2);

        return res.status(200).json({
          success: true,
          token,
          user: ownerUser,
          message: 'Super Admin clearance authenticated successfully.',
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid Master Password for theprojectxia@gmail.com.',
        });
      }
    }

    // Standard User local session
    if (cleanEmail && cleanPassword) {
      const standardUser = {
        _id: 'usr_' + Date.now().toString(36),
        id: 'usr_' + Date.now().toString(36),
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'user',
        authProvider: 'local',
        isVerified: true,
      };
      const token = 'px_tok_' + Date.now().toString(36) + Math.random().toString(36).slice(2);

      return res.status(200).json({
        success: true,
        token,
        user: standardUser,
        message: 'Login successful.',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  } catch (error) {
    console.error('[Login API Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
}
