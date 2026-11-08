const { BookingRepository, SpaceTypeRepository, MenuItemRepository } = require('../repositories');
const HttpError = require('../utils/HttpError');

const calculateBookingPricing = ({
  bookingType,
  spaceTypeId,
  roomsRequested,
  items,
  existingPreorderTotal = null,
}) => {
  let resolvedSpaceTypeId = null;
  let roomSurcharge = 0;

  if (bookingType !== 'DELIVERY') {
    const spaceType = SpaceTypeRepository.getSpaceTypeById(spaceTypeId);
    if (!spaceType) {
      throw new HttpError(404, 'Selected dining space does not exist');
    }
    resolvedSpaceTypeId = Number(spaceType.id);
    const roomsCount = Math.max(1, Number(roomsRequested) || 1);
    roomSurcharge = (Number(spaceType.surcharge_fee) || 0) * roomsCount;
  }

  let resolvedItems = undefined;
  let itemsSubtotal = 0;

  if (Array.isArray(items)) {
    resolvedItems = [];
    for (const item of items) {
      const menuItem = MenuItemRepository.getMenuItemById(item.menu_item_id);
      if (!menuItem) {
        throw new HttpError(404, `Menu item #${item.menu_item_id} does not exist`);
      }
      if (!menuItem.is_available) {
        throw new HttpError(400, `Menu item '${menuItem.name}' is currently out of stock`);
      }
      const unitPrice =
        menuItem.discount_price !== null && menuItem.discount_price !== undefined
          ? Number(menuItem.discount_price)
          : Number(menuItem.original_price) || 0;
      const quantity = Math.max(1, Number(item.quantity) || 1);

      resolvedItems.push({
        menu_item_id: Number(menuItem.id),
        quantity,
        unit_price: unitPrice,
        note: item.note || null,
      });

      itemsSubtotal += quantity * unitPrice;
    }
  } else if (existingPreorderTotal !== null && existingPreorderTotal !== undefined) {
    itemsSubtotal = Number(existingPreorderTotal) || 0;
  }

  const estimatedBudget = itemsSubtotal + roomSurcharge;

  return {
    space_type_id: resolvedSpaceTypeId,
    items: resolvedItems,
    estimated_budget: estimatedBudget,
  };
};

const BookingService = {
  getAdminStats: async (params) => {
    return BookingRepository.getAdminStats(params);
  },

  getAdminList: async (params) => {
    return BookingRepository.getAdminList(params);
  },

  getById: async (id) => {
    const booking = BookingRepository.getById(id);
    if (!booking) {
      throw new HttpError(404, 'Reservation not found');
    }
    return booking;
  },

  getByCode: async (code) => {
    const booking = BookingRepository.getByCode(code);
    if (!booking) {
      throw new HttpError(404, `Reservation with code '${code}' not found`);
    }
    return booking;
  },

  lookupByContact: async ({ phone, email, identifier }) => {
    return BookingRepository.lookupByContact({ phone, email, identifier });
  },

  createBooking: async (data) => {
    const bookingType = data.booking_type || 'REGULAR_TABLE';
    const pricing = calculateBookingPricing({
      bookingType,
      spaceTypeId: data.space_type_id,
      roomsRequested: data.rooms_requested,
      items: data.items || [],
    });

    return BookingRepository.create({
      ...data,
      booking_type: bookingType,
      space_type_id: pricing.space_type_id,
      items: pricing.items,
      estimated_budget: pricing.estimated_budget,
    });
  },

  updateBooking: async (id, data) => {
    const existing = BookingRepository.getById(id);
    if (!existing) {
      throw new HttpError(404, 'Reservation not found');
    }

    const nextBookingType =
      data.booking_type !== undefined ? data.booking_type : existing.booking_type;
    const nextSpaceTypeId =
      data.space_type_id !== undefined ? data.space_type_id : existing.space_type_id;
    const nextRoomsRequested =
      data.rooms_requested !== undefined ? data.rooms_requested : existing.rooms_requested;

    const pricing = calculateBookingPricing({
      bookingType: nextBookingType,
      spaceTypeId: nextSpaceTypeId,
      roomsRequested: nextRoomsRequested,
      items: Array.isArray(data.items) ? data.items : undefined,
      existingPreorderTotal: existing.preorder_total,
    });

    const updatePayload = {
      ...data,
      booking_type: nextBookingType,
      space_type_id: pricing.space_type_id,
      estimated_budget: pricing.estimated_budget,
    };

    if (Array.isArray(pricing.items)) {
      updatePayload.items = pricing.items;
      updatePayload.replace_items = true;
    }

    return BookingRepository.update(id, updatePayload);
  },

  updateStatus: async (id, status, admin_note) => {
    const existing = BookingRepository.getById(id);
    if (!existing) {
      throw new HttpError(404, 'Reservation not found');
    }

    return BookingRepository.updateStatus(id, status, admin_note);
  },

  deleteBooking: async (id) => {
    const existing = BookingRepository.getById(id);
    if (!existing) {
      throw new HttpError(404, 'Reservation not found');
    }

    BookingRepository.softDelete(id);
    return {
      success: true,
      message: `Reservation ${existing.booking_code} soft-deleted successfully`,
    };
  },
};

module.exports = BookingService;
