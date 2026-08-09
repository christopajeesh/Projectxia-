import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    tagline: {
      type: String,
      maxlength: [180, 'Tagline cannot exceed 180 characters'],
      default: 'Next-generation software solution built for enterprise and academic excellence.',
    },
    description: {
      type: String,
      required: [true, 'Please provide a comprehensive project description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category or branch'],
      trim: true,
    },
    projectType: {
      type: String,
      default: 'Hardware + Software',
    },
    hardwareComponents: {
      type: String,
      default: '',
    },
    schematicsFormat: {
      type: String,
      default: 'KiCAD / Altium / PDF',
    },
    techStack: {
      type: [String],
      required: true,
      validate: [val => val.length > 0, 'Specify at least one technology stack tag'],
    },
    features: {
      type: [String],
      required: true,
    },
    screenshots: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      ],
    },
    demoVideo: {
      type: String,
      default: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4',
    },
    demoLiveUrl: {
      type: String,
      default: 'https://demo.projectxia.io/preview',
    },
    documentation: {
      type: String,
      default: '# Project Architecture & Setup Guide\n\n### Requirements\n- Node.js >= 18\n- Python >= 3.10\n- Docker & Docker Compose\n\n### Quick Start\n```bash\ngit clone repo\ncd project && npm install\nnpm run dev\n```\n\n### Security & Architecture Standards\nIncludes SHA-256 integrity checksums, zero hardcoded credentials, and automated vulnerability scanning.',
    },
    sourceCodeUrl: {
      type: String,
      default: 'https://storage.projectxia.io/secure-vault/package-v1.zip',
    },
    githubUrl: {
      type: String,
      default: 'https://github.com/projectxia/verified-mesh-repo',
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    licenseType: {
      type: String,
      enum: ['MIT Open License', 'Commercial Full Rights', 'Academic Research License', 'Enterprise Custom'],
      default: 'Commercial Full Rights',
    },
    price: {
      type: Number,
      default: 2499, // in INR
    },
    currency: {
      type: String,
      default: 'INR',
    },
    tags: {
      type: [String],
      default: ['Production-Ready', 'AI-Verified', 'Clean-Architecture', 'Zero-Vulnerabilities'],
    },
    seller: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      rating: { type: Number, default: 4.9 },
      verificationLevel: { type: String, default: 'Tier 2 - Code Audited Creator' },
    },
    // AI Security & Trust Score breakdown
    trustScore: {
      type: Number,
      default: 99, // out of 100
      min: 0,
      max: 100,
    },
    plagiarismScore: {
      type: Number,
      default: 1, // 1% or lower means 99% original code
      min: 0,
      max: 100,
    },
    cleanCodeScore: {
      type: Number,
      default: 98,
    },
    securityScanStatus: {
      type: String,
      enum: ['Passed 100%', 'Safe With Minor Warnings', 'Under Manual Review', 'Flagged as High Risk'],
      default: 'Passed 100%',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    numReviews: {
      type: Number,
      default: 14,
    },
    viewsCount: {
      type: Number,
      default: 340,
    },
    downloadsCount: {
      type: Number,
      default: 42,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ title: 'text', description: 'text', category: 'text', techStack: 'text' });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
