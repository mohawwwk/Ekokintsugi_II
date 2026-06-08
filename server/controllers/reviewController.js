const prisma = require('../utils/prisma');
const response = require('../utils/responseHelper');

/**
 * Create a new weekly review and award points
 * @route POST /api/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekNumber, daysWorn, hoursPerDay, comfort, fit, sole, material, stitching, feedback } = req.body;

    if (weekNumber < 1 || weekNumber > 8) {
      return response.error(res, 'Week number must be between 1 and 8', 400);
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_weekNumber: { userId, weekNumber }
      }
    });

    if (existingReview) {
      return response.error(res, `Review for week ${weekNumber} already submitted`, 400);
    }

    const userReviews = await prisma.review.findMany({ where: { userId } });
    if (userReviews.length >= 8) {
      return response.error(res, 'Maximum 8 reviews per user reached', 400);
    }

    for (let w = 1; w < weekNumber; w++) {
      const prevReview = await prisma.review.findUnique({
        where: { userId_weekNumber: { userId, weekNumber: w } }
      });
      if (!prevReview) {
        return response.error(res, `Please complete week ${w} review before submitting week ${weekNumber}`, 400);
      }
    }

    const review = await prisma.review.create({
      data: {
        userId,
        weekNumber,
        daysWorn: parseInt(daysWorn),
        hoursPerDay: parseInt(hoursPerDay),
        comfort: parseInt(comfort),
        fit: parseInt(fit),
        sole: parseInt(sole),
        material: parseInt(material),
        stitching: parseInt(stitching),
        feedback
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { pointsRemaining: { increment: 10 } }
    });

    return response.success(res, { review }, 'Review submitted successfully', 201);
  } catch (error) {
    console.error('Create review error:', error);
    return response.error(res, 'Failed to create review');
  }
};

/**
 * Get all reviews for a specific user
 * @route GET /api/reviews/user/:userId
 */
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { weekNumber: 'asc' }
    });

    return response.success(res, { reviews, count: reviews.length });
  } catch (error) {
    console.error('Get reviews error:', error);
    return response.error(res, 'Failed to fetch reviews');
  }
};

/**
 * Get all reviews from all users (Admin only)
 * @route GET /api/reviews
 */
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return response.success(res, { reviews });
  } catch (error) {
    console.error('Get all reviews error:', error);
    return response.error(res, 'Failed to fetch reviews');
  }
};
