
const { sendSuccess, sendError } = require('../utils/apiResponse');

const prisma = require('../utils/prisma');

const getStats = async (req, res, next) => {
  try {
    const [farmers, buyers, products, orders] = await Promise.all([
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
    ]);
    return sendSuccess(res, { farmers, buyers, products, orders, states: 28, districts: 100 });
  } catch (err) {
    next(err);
  }
};

const getFarmers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [farmers, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'FARMER' },
        select: { id: true, name: true, email: true, phone: true, district: true, state: true, isVerified: true, createdAt: true },
        skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { role: 'FARMER' } }),
    ]);
    return sendSuccess(res, { farmers, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

const getBuyers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [buyers, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'BUYER' },
        select: { id: true, name: true, email: true, phone: true, district: true, isVerified: true, createdAt: true },
        skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { role: 'BUYER' } }),
    ]);
    return sendSuccess(res, { buyers, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
          payment: { select: { status: true, method: true } },
        },
        skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return sendSuccess(res, { orders, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isVerified: true },
      select: { id: true, name: true, isVerified: true },
    });
    return sendSuccess(res, user, 200, 'User verified');
  } catch (err) {
    next(err);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isVerified: false },
    });
    return sendSuccess(res, null, 200, 'User suspended');
  } catch (err) {
    next(err);
  }
};

const manageColdStorages = async (req, res, next) => {
  try {
    const storages = await prisma.coldStorage.findMany({ orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, storages);
  } catch (err) {
    next(err);
  }
};

const updateColdStorage = async (req, res, next) => {
  try {
    const storage = await prisma.coldStorage.update({ where: { id: req.params.id }, data: req.body });
    return sendSuccess(res, storage, 200, 'Cold storage updated');
  } catch (err) {
    next(err);
  }
};

const deleteColdStorage = async (req, res, next) => {
  try {
    await prisma.coldStorage.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 200, 'Cold storage deleted');
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const [totalRevenue, aiUsage, userGrowth] = await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } }),
      prisma.pricePrediction.count(),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    ]);
    return sendSuccess(res, {
      totalRevenue: totalRevenue._sum.amount || 0,
      aiPredictions: aiUsage,
      usersByRole: userGrowth,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getFarmers, getBuyers, getAdminOrders, verifyUser, suspendUser, manageColdStorages, getReports, updateColdStorage, deleteColdStorage };
