const SpaceTypeService = require('../services/SpaceType.service');

const SpaceTypeController = {
  getAllSpaceTypes: async (req, res, next) => {
    try {
      const spaceTypes = await SpaceTypeService.getAllSpaceTypes();
      res.status(200).json({
        success: true,
        count: spaceTypes.length,
        data: spaceTypes,
      });
    } catch (error) {
      next(error);
    }
  },

  getAdminStats: async (req, res, next) => {
    try {
      const stats = await SpaceTypeService.getAdminStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  getAdminList: async (req, res, next) => {
    try {
      const { search, status } = req.query;
      const spaceTypes = await SpaceTypeService.getAdminList({ search, status });
      res.status(200).json({
        success: true,
        count: spaceTypes.length,
        data: spaceTypes,
      });
    } catch (error) {
      next(error);
    }
  },

  getSpaceTypeById: async (req, res, next) => {
    try {
      const spaceType = await SpaceTypeService.getSpaceTypeById(req.params.id);
      res.status(200).json({
        success: true,
        data: spaceType,
      });
    } catch (error) {
      next(error);
    }
  },

  createSpaceType: async (req, res, next) => {
    try {
      const created = await SpaceTypeService.createSpaceType(req.body);
      res.status(201).json({
        success: true,
        message: 'Dining space created successfully',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  updateSpaceType: async (req, res, next) => {
    try {
      const updated = await SpaceTypeService.updateSpaceType(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Dining space updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { is_active } = req.body;
      const updated = await SpaceTypeService.updateStatus(req.params.id, is_active);
      res.status(200).json({
        success: true,
        message: `Space status updated to ${is_active ? 'available' : 'unavailable'}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteSpaceType: async (req, res, next) => {
    try {
      const result = await SpaceTypeService.deleteSpaceType(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = SpaceTypeController;
