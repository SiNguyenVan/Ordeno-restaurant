const { Router } = require('express');
const menuItemRoutes = require('./menuItem.routes');
const spaceTypeRoutes = require('./spaceType.routes');
const categoryRoutes = require('./category.routes');
const authRoutes = require('./auth.routes');
const staffRoutes = require('./staff.routes');
const bookingRoutes = require('./booking.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/staff', staffRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/space-types', spaceTypeRoutes);
router.use('/categories', categoryRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
