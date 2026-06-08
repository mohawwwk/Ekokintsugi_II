const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const response = require('../utils/responseHelper');

const SHOE_PREFIXES = ['EKO-', 'KNT-', 'CIR-'];
const TREE_PREFIXES = ['TR-', 'TRE-', 'TREE-'];

function generateShoeId() {
  const prefix = SHOE_PREFIXES[Math.floor(Math.random() * SHOE_PREFIXES.length)];
  const number = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}${number}`;
}

function generateTreeId() {
  const prefix = TREE_PREFIXES[Math.floor(Math.random() * TREE_PREFIXES.length)];
  const number = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}${number}`;
}

function generateQRCode(userId) {
  return `https://ekokintsugi.com/qr/${userId}`;
}

exports.createUser = async (req, res) => {
  try {
    const { name, phone, email, password, role, city, address, shoeSize, startDate, endDate } = req.body;

    const userCount = await prisma.user.count();
    if (userCount >= 10) {
      return response.error(res, 'Maximum 10 users allowed. Cannot create more users.', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return response.error(res, 'Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let shoeId = generateShoeId();
    let existingShoe = await prisma.shoe.findUnique({ where: { shoeId } });
    while (existingShoe) {
      shoeId = generateShoeId();
      existingShoe = await prisma.shoe.findUnique({ where: { shoeId } });
    }

    let treeId = generateTreeId();
    let existingTree = await prisma.tree.findUnique({ where: { treeId } });
    while (existingTree) {
      treeId = generateTreeId();
      existingTree = await prisma.tree.findUnique({ where: { treeId } });
    }

    const qrCode = generateQRCode('');

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role: role || 'supporter',
        city,
        address,
        shoeSize,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        qrCode,
        pointsTotal: 100,
        pointsRemaining: 100
      }
    });

    await prisma.shoe.create({
      data: {
        shoeId,
        productLine: 'EkoKintsugi Classic',
        size: shoeSize || '42',
        status: 'PreBooked',
        userId: user.id
      }
    });

    await prisma.tree.create({
      data: {
        treeId,
        plantType: 'Bamboo',
        location: 'Bali, Indonesia',
        status: 'Symbolic Tree Parent',
        userId: user.id
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { qrCode: generateQRCode(user.id) }
    });

    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { shoe: true, tree: true }
    });

    return response.success(res, createdUser, 'User created successfully with assigned assets', 201);
  } catch (error) {
    console.error('Create user error:', error);
    return response.error(res, 'Failed to create user');
  }
};

exports.getStats = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const returnCount = await prisma.return.count();
    const reviewCount = await prisma.review.count();
    const pointsTotal = await prisma.user.aggregate({
      _sum: { pointsTotal: true }
    });

    return response.success(res, {
      users: userCount,
      returns: returnCount,
      reviews: reviewCount,
      totalPoints: pointsTotal._sum.pointsTotal || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return response.error(res, 'Failed to fetch statistics');
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { shoe: true, tree: true },
      orderBy: { createdAt: 'desc' }
    });

    return response.success(res, { users });
  } catch (error) {
    console.error('Get all users error:', error);
    return response.error(res, 'Failed to fetch users');
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        shoe: true,
        tree: true,
        reviews: { orderBy: { weekNumber: 'asc' } },
        returns: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
