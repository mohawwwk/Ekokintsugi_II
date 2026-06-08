const prisma = require('../utils/prisma');
const response = require('../utils/responseHelper');

exports.addPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pointsTotal: { increment: parseInt(points) },
        pointsRemaining: { increment: parseInt(points) }
      }
    });

    return response.success(res, {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        pointsTotal: updatedUser.pointsTotal,
        pointsRemaining: updatedUser.pointsRemaining
      }
    }, `Added ${points} points to ${user.name}`);
  } catch (error) {
    console.error('Add points error:', error);
    return response.error(res, 'Failed to add points');
  }
};

exports.redeemPoints = async (req, res) => {
  try {
    const { userId, points } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    if (user.pointsRemaining < parseInt(points)) {
      return response.error(res, 'Insufficient points', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pointsUsed: { increment: parseInt(points) },
        pointsRemaining: { decrement: parseInt(points) }
      }
    });

    return response.success(res, {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        pointsTotal: updatedUser.pointsTotal,
        pointsUsed: updatedUser.pointsUsed,
        pointsRemaining: updatedUser.pointsRemaining
      }
    }, `Redeemed ${points} points from ${user.name}`);
  } catch (error) {
    console.error('Redeem points error:', error);
    return response.error(res, 'Failed to redeem points');
  }
};

exports.getPoints = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        pointsTotal: true,
        pointsUsed: true,
        pointsRemaining: true
      }
    });

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    return response.success(res, { user });
  } catch (error) {
    console.error('Get points error:', error);
    return response.error(res, 'Failed to fetch points');
  }
};
