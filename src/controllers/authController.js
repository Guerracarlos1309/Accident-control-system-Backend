const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

/**
 * Login user and return token
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Find user by username
    const user = await User.findOne({ 
      where: { username },
      include: [{ model: Role, as: 'role' }]
    });

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role ? user.role.name : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
