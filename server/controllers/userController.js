const prisma = require('../utils/prisma');
const response = require('../utils/responseHelper');

/**
 * Get current authenticated user details and associated data
 * @route GET /api/user/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        shoe: true,
        tree: true,
        reviews: {
          orderBy: { weekNumber: 'asc' }
        }
      }
    });

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    const reviewsCompleted = user.reviews.length;
    const reviewsRemaining = 8 - reviewsCompleted;

    return response.success(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        address: user.address,
        shoeSize: user.shoeSize,
        startDate: user.startDate,
        endDate: user.endDate,
        pointsTotal: user.pointsTotal,
        pointsUsed: user.pointsUsed,
        pointsRemaining: user.pointsRemaining,
        qrCode: user.qrCode,
        reviewsCompleted,
        reviewsRemaining,
        maxReviews: 8
      },
      shoe: user.shoe,
      tree: user.tree,
      reviews: user.reviews
    });
  } catch (error) {
    console.error('Get me error:', error);
    return response.error(res, 'Failed to fetch user data');
  }
};
