const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const response = require('../utils/responseHelper');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.signup = async (req, res) => {
  try {
    const { name, phone, email, password, role, city, address, shoeSize } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return response.error(res, 'Email already registered', 400);
    }

    const userCount = await prisma.user.count();
    if (userCount >= 10) {
      return response.error(res, 'Maximum 10 users allowed', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role: role || 'supporter',
        city,
        address,
        shoeSize
      }
    });

    const token = generateToken(user);

    return response.success(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Signup error:', error);
    return response.error(res, 'Registration failed');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return response.error(res, 'Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.error(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user);

    return response.success(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return response.error(res, 'Login failed');
  }
};
