const QRCode = require('qrcode');
const prisma = require('../utils/prisma');
const response = require('../utils/responseHelper');

/**
 * Generate a QR code containing user and asset data
 * @route GET /api/qr/generate/:userId
 */
exports.generateQR = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { shoe: true, tree: true, reviews: true }
    });

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    const qrData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      shoe: user.shoe ? {
        shoeId: user.shoe.shoeId,
        productLine: user.shoe.productLine,
        size: user.shoe.size,
        status: user.shoe.status
      } : null,
      tree: user.tree ? {
        treeId: user.tree.treeId,
        plantType: user.tree.plantType,
        location: user.tree.location,
        status: user.tree.status
      } : null,
      points: {
        total: user.pointsTotal,
        remaining: user.pointsRemaining,
        used: user.pointsUsed
      },
      reviewsCompleted: user.reviews.length,
      maxReviews: 8,
      dashboardUrl: `${req.protocol}://${req.get('host')}/dashboard/${user.id}`
    };

    const qrImage = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 400,
      margin: 2,
      color: {
        dark: '#2E7D32',
        light: '#FFFFFF'
      }
    });

    return response.success(res, {
      qrCode: qrImage,
      userId: user.id,
      name: user.name,
      data: qrData
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    return response.error(res, 'Failed to generate QR code');
  }
};
