// In-memory serverless cache for project works
let projectWorksCache = [
  {
    _id: 'proj_ai_medical_gradcam_01',
    id: 'proj_ai_medical_gradcam_01',
    title: 'AI Medical Chest X-Ray Diagnosis with Grad-CAM Visual Heatmaps',
    tagline: 'Deep learning PyTorch convolutional network for automated lung pathology screening with 98.4% validation accuracy.',
    description: 'A clinical-grade deep learning solution trained on NIH ChestX-ray14 dataset. Features automated disease detection (Pneumonia, Effusion, Infiltration, Cardiomegaly) and overlays explainable Grad-CAM heatmaps for radiologists. Includes full PyTorch training pipeline, FastAPI backend, React dashboard, Dockerfile, and pre-trained weights.',
    category: 'AI & Data Science (AI / ML)',
    projectType: 'Hardware + Software',
    price: 3499,
    rating: 4.9,
    downloads: 38,
    techStack: ['PyTorch', 'Python 3.10', 'FastAPI', 'React', 'OpenCV', 'Docker'],
    features: ['Real-time Grad-CAM Heatmap Generation', 'Automated PDF Diagnostic Report Generator', '98.4% Classification Accuracy', 'Full REST API & Web UI Included'],
    screenshots: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80'
    ],
    demoVideo: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4',
    githubUrl: 'https://github.com/projectxia/medical-ai-gradcam',
    documentation: '# AI Medical Imaging Project Documentation\n\nRun `docker-compose up` to launch the API and web UI.',
    seller: {
      name: 'Dr. Aaron Vance',
      email: 'aaron.vance@mit.edu',
      role: 'Verified Creator'
    },
    isVerified: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    _id: 'proj_smart_rfid_trolley_02',
    id: 'proj_smart_rfid_trolley_02',
    title: 'Smart Autonomous RFID Shopping Cart with Weight Anti-Theft Sensor',
    tagline: 'ESP32 IoT trolley with automated barcode/RFID item tracking, load-cell anti-theft verification, and instant billing.',
    description: 'An end-to-end smart retail IoT solution. Hardware consists of ESP32 MCU, RC522 RFID reader, HX711 Load Cell amplifier for weight discrepancy anti-theft detection, 20x4 I2C LCD display, and cloud synchronization with payment gateway.',
    category: 'Electronics & Comm (ECE)',
    projectType: 'Hardware + Software',
    price: 2799,
    rating: 4.8,
    downloads: 52,
    techStack: ['ESP32', 'Arduino C++', 'RFID RC522', 'HX711 Load Cell', 'MQTT', 'Node.js'],
    features: ['Instant Item Barcode & RFID Scan', 'Hardware Anti-Theft Weight Cross-Check', 'Cloud Cart & Invoice Sync', 'Complete Gerber PCB & Circuit Schematics'],
    screenshots: [
      'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80'
    ],
    demoVideo: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-tracks-42740-large.mp4',
    githubUrl: 'https://github.com/projectxia/smart-rfid-cart',
    documentation: '# Smart Trolley Firmware & Circuit Documentation',
    seller: {
      name: 'Vikram Menon',
      email: 'vikram.iot@gmail.com',
      role: 'Verified Innovator'
    },
    isVerified: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  }
];

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
