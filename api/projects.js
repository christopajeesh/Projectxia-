// In-memory serverless cache for project works
let projectWorksCache = [];

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

  // GET: Return all listed projects
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      projects: projectWorksCache,
      total: projectWorksCache.length,
    });
  }

  // POST: Create / Upload new project
  if (req.method === 'POST') {
    try {
      const data = req.body || {};
      const newProject = {
        _id: 'proj_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        id: 'proj_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title: data.title || 'Untitled Engineering Project',
        tagline: data.tagline || data.description?.slice(0, 100) || '',
        description: data.description || '',
        category: data.category || 'Computer Science (CSE / IT)',
        projectType: data.projectType || 'Software Only',
        price: Number(data.price) || 2999,
        rating: 5.0,
        downloads: 0,
        techStack: Array.isArray(data.techStack) ? data.techStack : ['React', 'Node.js', 'Python'],
        features: data.features || ['Full Source Code', 'Verified Architecture', 'Runbook Guide'],
        screenshots: data.screenshots || ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80'],
        demoVideo: data.demoVideo || '',
        githubUrl: data.githubUrl || '',
        documentation: data.documentation || '',
        seller: data.seller || {
          name: 'Platform Creator',
          email: 'creator@projectxia.com',
          role: 'Verified Innovator'
        },
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      projectWorksCache = [newProject, ...projectWorksCache];

      return res.status(201).json({
        success: true,
        project: newProject,
        message: 'Project uploaded and published live on ProjectXia marketplace!',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to publish project.',
      });
    }
  }

  // DELETE: Remove project
  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (id) {
      projectWorksCache = projectWorksCache.filter((p) => p._id !== id && p.id !== id);
    }
    return res.status(200).json({ success: true, message: 'Project removed.' });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
