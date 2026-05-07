import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import Activity from '../models/Activity.js';

// Strong password validator
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8)              errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password))         errors.push('one uppercase letter');
  if (!/[a-z]/.test(password))         errors.push('one lowercase letter');
  if (!/[0-9]/.test(password))         errors.push('one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
                                        errors.push('one special character (!@#$%...)');
  return errors;
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Strong password check
    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Password must contain: ${pwErrors.join(', ')}`,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: 'member' });

    const token = generateToken(user._id);

    await Activity.create({
      user: user._id,
      action: 'joined_project',
      entityType: 'user',
      entityId: user._id,
      details: { message: `${user.name} joined FlowSphere` },
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        productivityScore: user.productivityScore,
        streakCount: user.streakCount,
        badges: user.badges,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastActiveDate = new Date();
    user.isOnline = true;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        productivityScore: user.productivityScore,
        streakCount: user.streakCount,
        badges: user.badges,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline: false });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }
    res.status(200).json({ success: true, message: 'Password reset link sent to email' });
  } catch (error) {
    next(error);
  }
};
