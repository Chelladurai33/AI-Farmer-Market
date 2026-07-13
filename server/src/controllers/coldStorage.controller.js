
const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');

const prisma = require('../utils/prisma');

// Haversine distance formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getNearbyColdStorages = async (req, res, next) => {
  try {
    const { lat, lng, radius = 100, cropType } = req.query;
    if (!lat || !lng) return sendError(res, 'Latitude and longitude are required', 400);

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    const storages = await prisma.coldStorage.findMany();
    let nearby = storages
      .map(s => ({
        ...s,
        distance: parseFloat(getDistance(userLat, userLng, s.latitude, s.longitude).toFixed(2)),
      }))
      .filter(s => s.distance <= maxRadius);

    if (cropType) {
      nearby = nearby.filter(s =>
        s.supportedCrops.some(c => c.toLowerCase().includes(cropType.toLowerCase()))
      );
    }

    nearby.sort((a, b) => a.distance - b.distance);

    return sendSuccess(res, nearby);
  } catch (err) {
    next(err);
  }
};

const createColdStorage = async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      address: z.string().min(5),
      latitude: z.number(),
      longitude: z.number(),
      capacityTons: z.number().positive(),
      supportedCrops: z.array(z.string()),
      minTemp: z.number(),
      maxTemp: z.number(),
      rentPerDay: z.number().positive(),
      phone: z.string(),
      operatingHours: z.string(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return sendValidationError(res, result.error.flatten().fieldErrors);

    const storage = await prisma.coldStorage.create({ data: result.data });
    return sendSuccess(res, storage, 201, 'Cold storage created');
  } catch (err) {
    next(err);
  }
};

const bookStorage = async (req, res, next) => {
  try {
    const schema = z.object({
      cropName: z.string(),
      quantityTons: z.number().positive(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return sendValidationError(res, result.error.flatten().fieldErrors);

    const storage = await prisma.coldStorage.findUnique({ where: { id: req.params.id } });
    if (!storage) return sendError(res, 'Cold storage not found', 404);

    const days = Math.ceil(
      (new Date(result.data.endDate) - new Date(result.data.startDate)) / (1000 * 60 * 60 * 24)
    );
    const totalCost = days * storage.rentPerDay * result.data.quantityTons;

    const booking = await prisma.storageBooking.create({
      data: {
        userId: req.user.id,
        storageId: req.params.id,
        cropName: result.data.cropName,
        quantityTons: result.data.quantityTons,
        startDate: new Date(result.data.startDate),
        endDate: new Date(result.data.endDate),
        totalCost,
        status: 'PENDING',
      },
      include: { storage: true },
    });

    return sendSuccess(res, booking, 201, 'Storage booked successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNearbyColdStorages, createColdStorage, bookStorage };
