import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    mobile: {
      type: String,
      trim: true,
      default: '',
    },

    /*
     * Password is optional because:
     *
     * 1. Normal email/password users have one.
     * 2. Google users don't need one.
     * 3. OTP users don't need one.
     */
    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'creator', 'admin', 'owner'],
      default: 'user',
    },

    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },

    bio: {
      type: String,
      maxlength: [
        500,
        'Bio cannot exceed 500 characters',
      ],
      default:
        'Innovator and software developer building next-gen solutions on ProjectXia.',
    },

    skills: {
      type: [String],
      default: [
        'React',
        'Node.js',
        'Python',
        'AI/ML',
        'Cybersecurity',
      ],
    },

    education: {
      type: String,
      default:
        'B.Tech / Computer Science & Engineering',
    },

    experience: {
      type: String,
      default:
        'Full Stack & AI Systems Researcher',
    },

    github: {
      type: String,
      default:
        'https://github.com/projectxia',
    },

    linkedin: {
      type: String,
      default:
        'https://linkedin.com/company/projectxia',
    },

    portfolio: {
      type: String,
      default:
        'https://projectxia.io',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationLevel: {
      type: String,
      enum: [
        'Unverified',
        'Tier 1 - KYC Verified',
        'Tier 2 - Code Audited Creator',
        'Tier 3 - Master Architect',
      ],
      default: 'Unverified',
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },

    /*
     * These fields are kept for compatibility
     * with other ProjectXia code.
     *
     * Authentication OTPs are now kept temporarily
     * in the backend OTP store instead of exposing them
     * through the API.
     */
    otpCode: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
      select: false,
    },

    savedProjects: [
      {
        type: String,
      },
    ],

    purchasedProjects: [
      {
        type: String,
      },
    ],

    reputationScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Automatically hash passwords before saving.
 *
 * This means the controller never needs to manually
 * bcrypt-hash a password before User.create().
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  /*
   * Google/OTP users have no password.
   */
  if (!this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});

userSchema.methods.matchPassword =
  async function (enteredPassword) {
    if (!this.password) {
      return false;
    }

    return bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

export default
  mongoose.models.User ||
  mongoose.model('User', userSchema);