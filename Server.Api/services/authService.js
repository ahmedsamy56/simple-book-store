const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { 
  hashPassword, 
  comparePasswords, 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken 
} = require('../utils/authHelpers');

class AuthService {
  async register(userData) {
    const { email, password, confirmPassword } = userData;
    
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({ 
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user'
    });
    
    await user.save();
    return { message: 'User registered successfully' };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid password');
    }

    const userPayload = { 
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`, 
      email: user.email,
      role: user.role 
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.create({
      token: refreshToken,
      email: user.email,
      expiresAt: expiresAt
    });

    return { 
      accessToken, 
      refreshToken,
      name: userPayload.name,
      role: userPayload.role,
      userId: user._id
    };
  }

  async refreshToken(token) {
    if (!token) {
      throw new Error('No refresh token provided');
    }

    const tokenRecord = await RefreshToken.findOne({ token });
    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    const currentDate = new Date();
    if (currentDate > tokenRecord.expiresAt) {
      await RefreshToken.deleteOne({ token });
      throw new Error('Refresh token expired');
    }

    const user = await verifyRefreshToken(token);
    const newAccessToken = generateAccessToken({
      name: user.name,
      email: user.email,
      role: user.role
    });

    return { accessToken: newAccessToken };
  }

  async logout(token) {
    await RefreshToken.deleteOne({ token });
    return { message: 'Logged out successfully' };
  }
}

module.exports = new AuthService(); 