const prisma = require('../utils/prisma');
const response = require('../utils/responseHelper');

exports.createReturnRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shoeId, reason, condition } = req.body;

    const shoe = await prisma.shoe.findUnique({ where: { id: shoeId } });
    if (!shoe) {
      return response.error(res, 'Shoe not found', 404);
    }

    if (shoe.userId !== userId) {
      return response.error(res, 'This shoe does not belong to you', 403);
    }

    const existingReturn = await prisma.return.findFirst({
      where: { shoeId, status: { in: ['Requested', 'Approved', 'Received'] } }
    });

    if (existingReturn) {
      return response.error(res, 'An active return request already exists for this shoe', 400);
    }

    const returnRequest = await prisma.return.create({
      data: {
        userId,
        shoeId,
        reason,
        condition
      }
    });

    await prisma.shoe.update({
      where: { id: shoeId },
      data: { status: 'Returned' }
    });

    return response.success(res, {
      return: returnRequest
    }, 'Return request submitted successfully', 201);
  } catch (error) {
    console.error('Create return request error:', error);
    return response.error(res, 'Failed to create return request');
  }
};

exports.updateReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, finalAction } = req.body;

    const returnRequest = await prisma.return.findUnique({ where: { id } });
    if (!returnRequest) {
      return response.error(res, 'Return request not found', 404);
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (finalAction) updateData.finalAction = finalAction;

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: updateData
    });

    if (status === 'Completed') {
      await prisma.shoe.update({
        where: { id: returnRequest.shoeId },
        data: { status: 'Returned' }
      });
    }

    return response.success(res, {
      return: updatedReturn
    }, 'Return updated successfully');
  } catch (error) {
    console.error('Update return error:', error);
    return response.error(res, 'Failed to update return');
  }
};

exports.getAllReturns = async (req, res) => {
  try {
    const returns = await prisma.return.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        shoe: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return response.success(res, { returns });
  } catch (error) {
    console.error('Get all returns error:', error);
    return response.error(res, 'Failed to fetch returns');
  }
};

exports.getReturnsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const returns = await prisma.return.findMany({
      where: { userId },
      include: { shoe: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ returns });
  } catch (error) {
    console.error('Get returns by user error:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
};
