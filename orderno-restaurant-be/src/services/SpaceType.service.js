const { SpaceTypeRepository } = require('../repositories');
const HttpError = require('../utils/HttpError');

const SpaceTypeService = {
  getAllSpaceTypes: async () => {
    return SpaceTypeRepository.getAllSpaceTypes();
  },

  getAdminStats: async () => {
    return SpaceTypeRepository.getAdminStats();
  },

  getAdminList: async (params = {}) => {
    return SpaceTypeRepository.getAdminList(params);
  },

  getSpaceTypeById: async (id) => {
    const spaceType = SpaceTypeRepository.getSpaceTypeById(id);
    if (!spaceType) {
      throw new HttpError(404, 'Space type not found');
    }
    return spaceType;
  },

  createSpaceType: async (data) => {
    const existing = SpaceTypeRepository.getSpaceTypeByCode(data.code);
    if (existing) {
      throw new HttpError(409, `Space type code '${data.code.toUpperCase()}' already exists`);
    }
    return SpaceTypeRepository.create(data);
  },

  updateSpaceType: async (id, data) => {
    const existing = SpaceTypeRepository.getSpaceTypeById(id);
    if (!existing) {
      throw new HttpError(404, 'Space type not found');
    }

    if (data.code && data.code.toUpperCase() !== existing.code.toUpperCase()) {
      const codeCheck = SpaceTypeRepository.getSpaceTypeByCode(data.code);
      if (codeCheck && codeCheck.id !== Number(id)) {
        throw new HttpError(409, `Space type code '${data.code.toUpperCase()}' already exists`);
      }
    }

    return SpaceTypeRepository.update(id, data);
  },

  updateStatus: async (id, isActive) => {
    const existing = SpaceTypeRepository.getSpaceTypeById(id);
    if (!existing) {
      throw new HttpError(404, 'Space type not found');
    }

    return SpaceTypeRepository.updateStatus(id, isActive);
  },

  deleteSpaceType: async (id) => {
    const existing = SpaceTypeRepository.getSpaceTypeById(id);
    if (!existing) {
      throw new HttpError(404, 'Space type not found');
    }

    SpaceTypeRepository.softDelete(id);
    return { success: true, message: 'Dining space type soft-deleted successfully' };
  },
};

module.exports = SpaceTypeService;
