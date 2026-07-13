
const prisma = require('../utils/prisma');

const create = async (userId, type, message) => {
  try {
    return await prisma.notification.create({
      data: { userId, type, message },
    });
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('Notification creation failed:', err.message);
  }
};

module.exports = { create };
