const staffValidation = require('./staff.validation');
const menuItemValidation = require('./menuItem.validation');
const spaceValidation = require('./space.validation');
const bookingValidation = require('./booking.validation');

module.exports = {
  ...staffValidation,
  ...menuItemValidation,
  ...spaceValidation,
  ...bookingValidation,
};
