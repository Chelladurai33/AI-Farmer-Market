const logger = require('../utils/logger');
const prisma = require('../utils/prisma');

/**
 * Create a notification record in the database.
 * Non-throwing — errors are logged but do not propagate.
 */
const create = async (userId, type, message) => {
  try {
    if (!userId || !type || !message) {
      logger.warn('notificationService.create: missing required parameters', { userId, type });
      return null;
    }
    return await prisma.notification.create({
      data: { userId, type, message },
    });
  } catch (err) {
    logger.error('Failed to create notification:', err);
    return null; // Non-critical — never throw from notification service
  }
};

module.exports = { create };
