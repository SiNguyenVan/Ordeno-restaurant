const { db } = require('../database/db');

const optimizeImageUrl = (url, width = 600) => {
  if (!url) return url;
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${width}&q=80`;
  }
  return url;
};

const formatSpaceTypeForPublic = (st) => ({
  ...st,
  image: optimizeImageUrl(st.image_url, 480),
  image_url: optimizeImageUrl(st.image_url, 480),
  capacity:
    st.min_capacity && st.max_capacity
      ? `${st.min_capacity} – ${st.max_capacity} guests`
      : st.max_capacity
        ? `Up to ${st.max_capacity} guests`
        : 'Unlimited',
  surcharge:
    st.surcharge_fee > 0
      ? `+${new Intl.NumberFormat('vi-VN').format(st.surcharge_fee)} VND`
      : 'Complimentary',
  badge:
    st.code === 'VIP'
      ? 'VIP Lounge'
      : st.code === 'GARDEN'
        ? 'Zen Garden'
        : st.code === 'BANQUET'
          ? 'Grand Banquet'
          : 'Standard Dining',
});

const SpaceTypeRepository = {
  getAllSpaceTypes: () => {
    const query = `
      SELECT *
      FROM space_types
      WHERE is_deleted = 0 AND is_active = 1
      ORDER BY sort_order ASC, id ASC
    `;
    const rows = db.prepare(query).all();
    return rows.map(formatSpaceTypeForPublic);
  },

  getAdminStats: () => {
    const query = `
      SELECT 
        COUNT(*) AS total_space_types,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_space_types,
        COALESCE(SUM(total_quantity), 0) AS total_room_units,
        COALESCE(SUM(total_quantity * max_capacity), 0) AS max_capacity,
        COALESCE(AVG(CASE WHEN surcharge_fee > 0 THEN surcharge_fee END), 0) AS avg_surcharge
      FROM space_types
      WHERE is_deleted = 0
    `;
    const row = db.prepare(query).get();

    return {
      total_space_types: row?.total_space_types || 0,
      active_space_types: row?.active_space_types || 0,
      total_room_units: row?.total_room_units || 0,
      max_capacity: row?.max_capacity || 0,
      avg_surcharge: Math.round(row?.avg_surcharge || 0),
    };
  },

  getAdminList: ({ search = '', status = '' } = {}) => {
    let query = `
      SELECT 
        st.*,
        (SELECT COUNT(*) FROM bookings b WHERE b.space_type_id = st.id AND b.is_deleted = 0) AS bookings_count
      FROM space_types st
      WHERE st.is_deleted = 0
    `;
    const params = [];

    if (search && search.trim() !== '') {
      query += ' AND (st.name LIKE ? OR st.code LIKE ? OR st.description LIKE ?)';
      const kw = `%${search.trim()}%`;
      params.push(kw, kw, kw);
    }

    if (status !== '' && status !== undefined && status !== null && status !== 'ALL' && status !== 'all') {
      query += ' AND st.is_active = ?';
      params.push(Number(status) === 1 ? 1 : 0);
    }

    query += ' ORDER BY st.sort_order ASC, st.id ASC';
    return db.prepare(query).all(...params);
  },

  getSpaceTypeById: (id) => {
    const query = `
      SELECT 
        st.*,
        (SELECT COUNT(*) FROM bookings b WHERE b.space_type_id = st.id AND b.is_deleted = 0) AS bookings_count
      FROM space_types st
      WHERE st.id = ? AND st.is_deleted = 0
    `;
    return db.prepare(query).get(id);
  },

  getSpaceTypeByCode: (code) => {
    const query = 'SELECT * FROM space_types WHERE UPPER(code) = UPPER(?) AND is_deleted = 0';
    return db.prepare(query).get(code);
  },

  create: (data) => {
    const {
      code,
      name,
      description = null,
      image_url = null,
      total_quantity = 1,
      min_capacity = 1,
      max_capacity = 6,
      surcharge_fee = 0,
      sort_order = 0,
      is_active = 1,
    } = data;

    const cleanCode = code.toUpperCase().trim();

    // Restore if a soft-deleted record with the same code exists
    const existingSoftDeleted = db
      .prepare('SELECT id FROM space_types WHERE UPPER(code) = ? AND is_deleted = 1')
      .get(cleanCode);

    if (existingSoftDeleted) {
      db.prepare(`
        UPDATE space_types SET
          name = ?,
          description = ?,
          image_url = ?,
          total_quantity = ?,
          min_capacity = ?,
          max_capacity = ?,
          surcharge_fee = ?,
          sort_order = ?,
          is_active = ?,
          is_deleted = 0,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name.trim(),
        description,
        image_url,
        Number(total_quantity) || 1,
        Number(min_capacity) || 1,
        Number(max_capacity) || 6,
        Number(surcharge_fee) || 0,
        Number(sort_order) || 0,
        is_active ? 1 : 0,
        existingSoftDeleted.id
      );
      return SpaceTypeRepository.getSpaceTypeById(existingSoftDeleted.id);
    }

    const stmt = db.prepare(`
      INSERT INTO space_types (
        code, name, description, image_url,
        total_quantity, min_capacity, max_capacity, surcharge_fee,
        sort_order, is_active, is_deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      cleanCode,
      name.trim(),
      description,
      image_url,
      Number(total_quantity) || 1,
      Number(min_capacity) || 1,
      Number(max_capacity) || 6,
      Number(surcharge_fee) || 0,
      Number(sort_order) || 0,
      is_active ? 1 : 0
    );

    return SpaceTypeRepository.getSpaceTypeById(result.lastInsertRowid);
  },

  update: (id, data) => {
    const current = SpaceTypeRepository.getSpaceTypeById(id);
    if (!current) return null;

    const updated = {
      code: data.code !== undefined ? data.code.toUpperCase().trim() : current.code,
      name: data.name !== undefined ? data.name.trim() : current.name,
      description: data.description !== undefined ? data.description : current.description,
      image_url: data.image_url !== undefined ? data.image_url : current.image_url,
      total_quantity:
        data.total_quantity !== undefined ? Number(data.total_quantity) : current.total_quantity,
      min_capacity:
        data.min_capacity !== undefined ? Number(data.min_capacity) : current.min_capacity,
      max_capacity:
        data.max_capacity !== undefined ? Number(data.max_capacity) : current.max_capacity,
      surcharge_fee:
        data.surcharge_fee !== undefined ? Number(data.surcharge_fee) : current.surcharge_fee,
      sort_order: data.sort_order !== undefined ? Number(data.sort_order) : current.sort_order,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : current.is_active,
    };

    const stmt = db.prepare(`
      UPDATE space_types SET
        code = ?,
        name = ?,
        description = ?,
        image_url = ?,
        total_quantity = ?,
        min_capacity = ?,
        max_capacity = ?,
        surcharge_fee = ?,
        sort_order = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_deleted = 0
    `);

    stmt.run(
      updated.code,
      updated.name,
      updated.description,
      updated.image_url,
      updated.total_quantity,
      updated.min_capacity,
      updated.max_capacity,
      updated.surcharge_fee,
      updated.sort_order,
      updated.is_active,
      id
    );

    return SpaceTypeRepository.getSpaceTypeById(id);
  },

  updateStatus: (id, isActive) => {
    db.prepare(`
      UPDATE space_types SET
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_deleted = 0
    `).run(isActive ? 1 : 0, id);

    return SpaceTypeRepository.getSpaceTypeById(id);
  },

  softDelete: (id) => {
    db.prepare(`
      UPDATE space_types SET
        is_deleted = 1,
        is_active = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);
    return true;
  },
};

module.exports = SpaceTypeRepository;
