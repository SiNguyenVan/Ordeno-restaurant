const { db } = require('../database/db');

const BookingRepository = {
  generateBookingCode: (bookingDate) => {
    const cleanDate = (bookingDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const prefix = `BK-${cleanDate}-`;
    const countRow = db
      .prepare('SELECT COUNT(*) AS count FROM bookings WHERE booking_code LIKE ?')
      .get(`${prefix}%`);
    const nextSeq = (countRow?.count || 0) + 1;
    const candidate = `${prefix}${String(nextSeq).padStart(3, '0')}`;

    const exists = db.prepare('SELECT id FROM bookings WHERE booking_code = ?').get(candidate);
    if (!exists) {
      return candidate;
    }
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${prefix}${randomSuffix}`;
  },

  getAdminStats: ({ booking_date = null } = {}) => {
    let whereClause = 'WHERE b.is_deleted = 0';
    const params = [];

    if (booking_date && booking_date.trim() !== '') {
      whereClause += ' AND b.booking_date = ?';
      params.push(booking_date.trim());
    }

    const statsQuery = `
      SELECT
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN b.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN b.status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed_count,
        SUM(CASE WHEN b.status = 'SEATED' THEN 1 ELSE 0 END) AS seated_count,
        SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_count,
        SUM(CASE WHEN b.booking_type = 'PARTY_EVENT' THEN 1 ELSE 0 END) AS party_event_count,
        SUM(CASE WHEN b.booking_type = 'DELIVERY' THEN 1 ELSE 0 END) AS delivery_count,
        COALESCE(SUM(CASE WHEN b.status != 'CANCELLED' THEN (b.guest_adults + COALESCE(b.guest_children, 0)) ELSE 0 END), 0) AS total_guests,
        COALESCE(SUM(
          CASE 
            WHEN b.status != 'CANCELLED' THEN
              CASE
                WHEN b.estimated_budget IS NOT NULL AND b.estimated_budget > 0 THEN b.estimated_budget
                ELSE COALESCE((SELECT SUM(bi.quantity * bi.unit_price) FROM booking_items bi WHERE bi.booking_id = b.id), 0)
              END
            ELSE 0
          END
        ), 0) AS total_estimated_budget
      FROM bookings b
      ${whereClause}
    `;

    const row = db.prepare(statsQuery).get(...params);

    const preorderQuery = `
      SELECT COALESCE(SUM(bi.quantity * bi.unit_price), 0) AS preorder_revenue
      FROM booking_items bi
      JOIN bookings b ON b.id = bi.booking_id
      ${whereClause} AND b.status != 'CANCELLED'
    `;
    const preorderRow = db.prepare(preorderQuery).get(...params);

    const estimatedRevenue = Number(row?.total_estimated_budget || 0);

    return {
      total_bookings: row?.total_bookings || 0,
      pending_count: row?.pending_count || 0,
      confirmed_count: row?.confirmed_count || 0,
      seated_count: row?.seated_count || 0,
      completed_count: row?.completed_count || 0,
      cancelled_count: row?.cancelled_count || 0,
      party_event_count: row?.party_event_count || 0,
      delivery_count: row?.delivery_count || 0,
      total_guests: row?.total_guests || 0,
      preorder_revenue: Number(preorderRow?.preorder_revenue || 0),
      estimated_revenue: estimatedRevenue,
    };
  },

  getBookingItems: (bookingId) => {
    const query = `
      SELECT 
        bi.id,
        bi.booking_id,
        bi.menu_item_id,
        bi.quantity,
        bi.unit_price,
        (bi.quantity * bi.unit_price) AS line_total,
        bi.note,
        mi.name AS item_name,
        mi.image_url AS item_image,
        mi.slug AS item_slug
      FROM booking_items bi
      LEFT JOIN menu_items mi ON mi.id = bi.menu_item_id
      WHERE bi.booking_id = ?
      ORDER BY bi.id ASC
    `;
    return db.prepare(query).all(bookingId);
  },

  getAdminList: ({
    search = '',
    space_type_id = '',
    status = '',
    booking_type = '',
    booking_date = '',
  } = {}) => {
    let query = `
      SELECT 
        b.*,
        st.name AS space_type_name,
        st.code AS space_type_code,
        st.surcharge_fee AS space_surcharge_fee,
        st.max_capacity AS space_max_capacity,
        st.name AS space_display_name,
        (SELECT COUNT(*) FROM booking_items bi WHERE bi.booking_id = b.id) AS preorder_items_count,
        (SELECT COALESCE(SUM(bi.quantity * bi.unit_price), 0) FROM booking_items bi WHERE bi.booking_id = b.id) AS preorder_total
      FROM bookings b
      LEFT JOIN space_types st ON st.id = b.space_type_id
      WHERE b.is_deleted = 0
    `;
    const params = [];

    if (search && search.trim() !== '') {
      query += ` AND (
        b.booking_code LIKE ? OR
        b.customer_name LIKE ? OR
        b.customer_phone LIKE ? OR
        b.customer_email LIKE ? OR
        b.event_type LIKE ?
      )`;
      const kw = `%${search.trim()}%`;
      params.push(kw, kw, kw, kw, kw);
    }

    if (space_type_id && space_type_id !== 'ALL' && space_type_id !== 'all') {
      query += ' AND b.space_type_id = ?';
      params.push(Number(space_type_id));
    }

    if (status && status !== 'ALL' && status !== 'all') {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (booking_type && booking_type !== 'ALL' && booking_type !== 'all') {
      query += ' AND b.booking_type = ?';
      params.push(booking_type);
    }

    if (booking_date && booking_date.trim() !== '') {
      query += ' AND b.booking_date = ?';
      params.push(booking_date.trim());
    }

    query += `
      ORDER BY 
        CASE WHEN b.status = 'PENDING' THEN 0 WHEN b.status = 'CONFIRMED' THEN 1 WHEN b.status = 'SEATED' THEN 2 ELSE 3 END ASC,
        b.booking_date DESC,
        b.booking_time ASC,
        b.id DESC
    `;

    const bookings = db.prepare(query).all(...params);

    return bookings.map((b) => {
      const roomSurchargeTotal =
        b.booking_type === 'DELIVERY'
          ? 0
          : (Number(b.space_surcharge_fee) || 0) * (Number(b.rooms_requested) || 1);

      return {
        ...b,
        total_guests: (Number(b.guest_adults) || 0) + (Number(b.guest_children) || 0),
        room_surcharge_total: roomSurchargeTotal,
        items: BookingRepository.getBookingItems(b.id),
      };
    });
  },

  getById: (id) => {
    const query = `
      SELECT 
        b.*,
        st.name AS space_type_name,
        st.code AS space_type_code,
        st.surcharge_fee AS space_surcharge_fee,
        st.max_capacity AS space_max_capacity,
        st.name AS space_display_name,
        (SELECT COUNT(*) FROM booking_items bi WHERE bi.booking_id = b.id) AS preorder_items_count,
        (SELECT COALESCE(SUM(bi.quantity * bi.unit_price), 0) FROM booking_items bi WHERE bi.booking_id = b.id) AS preorder_total
      FROM bookings b
      LEFT JOIN space_types st ON st.id = b.space_type_id
      WHERE b.id = ? AND b.is_deleted = 0
    `;
    const booking = db.prepare(query).get(id);
    if (!booking) return null;

    const roomSurchargeTotal =
      booking.booking_type === 'DELIVERY'
        ? 0
        : (Number(booking.space_surcharge_fee) || 0) * (Number(booking.rooms_requested) || 1);

    return {
      ...booking,
      total_guests: (Number(booking.guest_adults) || 0) + (Number(booking.guest_children) || 0),
      room_surcharge_total: roomSurchargeTotal,
      items: BookingRepository.getBookingItems(booking.id),
    };
  },

  getByCode: (code) => {
    const row = db
      .prepare('SELECT id FROM bookings WHERE UPPER(booking_code) = UPPER(?) AND is_deleted = 0')
      .get(code);
    if (!row) return null;
    return BookingRepository.getById(row.id);
  },

  lookupByContact: ({ phone = '', email = '', identifier = '' }) => {
    const conditions = [];
    const params = [];

    const cleanPhone = phone ? phone.trim() : '';
    if (cleanPhone) {
      conditions.push('(b.customer_phone = ? OR b.customer_phone LIKE ?)');
      params.push(cleanPhone, `%${cleanPhone}%`);
    }

    const cleanEmail = email ? email.trim() : '';
    if (cleanEmail) {
      conditions.push('LOWER(b.customer_email) = LOWER(?)');
      params.push(cleanEmail);
    }

    const cleanId = identifier ? identifier.trim() : '';
    if (cleanId) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId)) {
        conditions.push('LOWER(b.customer_email) = LOWER(?)');
        params.push(cleanId);
      } else {
        conditions.push(
          '(b.customer_phone = ? OR b.customer_phone LIKE ? OR UPPER(b.booking_code) = UPPER(?))'
        );
        params.push(cleanId, `%${cleanId}%`, cleanId);
      }
    }

    if (conditions.length === 0) {
      return [];
    }

    const query = `
      SELECT 
        b.*,
        st.name AS space_type_name,
        st.code AS space_type_code,
        st.surcharge_fee AS space_surcharge_fee,
        st.max_capacity AS space_max_capacity,
        st.name AS space_display_name,
        (SELECT COUNT(*) FROM booking_items bi WHERE bi.booking_id = b.id) AS preorder_items_count,
        (SELECT COALESCE(SUM(bi.quantity * bi.unit_price), 0) FROM booking_items bi WHERE bi.booking_id = b.id) AS preorder_total
      FROM bookings b
      LEFT JOIN space_types st ON st.id = b.space_type_id
      WHERE b.is_deleted = 0 AND (${conditions.join(' OR ')})
      ORDER BY b.booking_date DESC, b.booking_time DESC, b.id DESC
      LIMIT 20
    `;

    const bookings = db.prepare(query).all(...params);

    return bookings.map((b) => {
      const roomSurchargeTotal =
        b.booking_type === 'DELIVERY'
          ? 0
          : (Number(b.space_surcharge_fee) || 0) * (Number(b.rooms_requested) || 1);

      return {
        ...b,
        total_guests: (Number(b.guest_adults) || 0) + (Number(b.guest_children) || 0),
        room_surcharge_total: roomSurchargeTotal,
        items: BookingRepository.getBookingItems(b.id),
      };
    });
  },

  create: (data) => {
    const createTx = db.transaction((payload) => {
      const bookingCode =
        payload.booking_code || BookingRepository.generateBookingCode(payload.booking_date);

      const formattedTime =
        payload.booking_time && payload.booking_time.length === 5
          ? `${payload.booking_time}:00`
          : payload.booking_time || '19:00:00';

      const stmt = db.prepare(`
        INSERT INTO bookings (
          booking_code, booking_type, space_type_id, rooms_requested,
          customer_name, customer_phone, customer_email,
          booking_date, booking_time, duration_minutes,
          guest_adults, guest_children,
          event_type, estimated_budget,
          special_requests, status, admin_note, is_deleted,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      const spaceTypeId =
        payload.booking_type === 'DELIVERY' || !payload.space_type_id
          ? null
          : Number(payload.space_type_id);

      const result = stmt.run(
        bookingCode,
        payload.booking_type || 'REGULAR_TABLE',
        spaceTypeId,
        Number(payload.rooms_requested) || 1,
        payload.customer_name.trim(),
        payload.customer_phone.trim(),
        payload.customer_email ? payload.customer_email.trim() : null,
        payload.booking_date,
        formattedTime,
        Number(payload.duration_minutes) || 120,
        Number(payload.guest_adults) || 2,
        Number(payload.guest_children) || 0,
        payload.event_type || null,
        payload.estimated_budget !== null && payload.estimated_budget !== undefined
          ? Number(payload.estimated_budget)
          : null,
        payload.special_requests || null,
        payload.status || 'PENDING',
        payload.admin_note || null
      );

      const bookingId = result.lastInsertRowid;

      if (Array.isArray(payload.items) && payload.items.length > 0) {
        const itemStmt = db.prepare(`
          INSERT INTO booking_items (booking_id, menu_item_id, quantity, unit_price, note)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of payload.items) {
          if (item.menu_item_id) {
            itemStmt.run(
              bookingId,
              Number(item.menu_item_id),
              Number(item.quantity) || 1,
              Number(item.unit_price) || 0,
              item.note || null
            );
          }
        }
      }

      return bookingId;
    });

    const newId = createTx(data);
    return BookingRepository.getById(newId);
  },

  update: (id, data) => {
    const current = BookingRepository.getById(id);
    if (!current) return null;

    const updateTx = db.transaction((payload) => {
      const rawTime = payload.booking_time !== undefined ? payload.booking_time : current.booking_time;
      const formattedTime =
        rawTime && rawTime.length === 5 ? `${rawTime}:00` : rawTime;

      const nextBookingType =
        payload.booking_type !== undefined ? payload.booking_type : current.booking_type;

      const updated = {
        booking_type: nextBookingType,
        space_type_id:
          nextBookingType === 'DELIVERY'
            ? null
            : payload.space_type_id !== undefined
              ? payload.space_type_id
                ? Number(payload.space_type_id)
                : null
              : current.space_type_id,
        rooms_requested:
          payload.rooms_requested !== undefined
            ? Number(payload.rooms_requested)
            : current.rooms_requested,
        customer_name:
          payload.customer_name !== undefined ? payload.customer_name.trim() : current.customer_name,
        customer_phone:
          payload.customer_phone !== undefined
            ? payload.customer_phone.trim()
            : current.customer_phone,
        customer_email:
          payload.customer_email !== undefined
            ? payload.customer_email
              ? payload.customer_email.trim()
              : null
            : current.customer_email,
        booking_date: payload.booking_date !== undefined ? payload.booking_date : current.booking_date,
        booking_time: formattedTime,
        duration_minutes:
          payload.duration_minutes !== undefined
            ? Number(payload.duration_minutes)
            : current.duration_minutes,
        guest_adults:
          payload.guest_adults !== undefined ? Number(payload.guest_adults) : current.guest_adults,
        guest_children:
          payload.guest_children !== undefined
            ? Number(payload.guest_children)
            : current.guest_children,
        event_type: payload.event_type !== undefined ? payload.event_type || null : current.event_type,
        estimated_budget:
          payload.estimated_budget !== undefined
            ? payload.estimated_budget !== null && payload.estimated_budget !== ''
              ? Number(payload.estimated_budget)
              : null
            : current.estimated_budget,
        special_requests:
          payload.special_requests !== undefined
            ? payload.special_requests || null
            : current.special_requests,
        status: payload.status !== undefined ? payload.status : current.status,
        admin_note: payload.admin_note !== undefined ? payload.admin_note || null : current.admin_note,
      };

      const stmt = db.prepare(`
        UPDATE bookings SET
          booking_type = ?,
          space_type_id = ?,
          rooms_requested = ?,
          customer_name = ?,
          customer_phone = ?,
          customer_email = ?,
          booking_date = ?,
          booking_time = ?,
          duration_minutes = ?,
          guest_adults = ?,
          guest_children = ?,
          event_type = ?,
          estimated_budget = ?,
          special_requests = ?,
          status = ?,
          admin_note = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND is_deleted = 0
      `);

      stmt.run(
        updated.booking_type,
        updated.space_type_id,
        updated.rooms_requested,
        updated.customer_name,
        updated.customer_phone,
        updated.customer_email,
        updated.booking_date,
        updated.booking_time,
        updated.duration_minutes,
        updated.guest_adults,
        updated.guest_children,
        updated.event_type,
        updated.estimated_budget,
        updated.special_requests,
        updated.status,
        updated.admin_note,
        id
      );

      if (Array.isArray(payload.items) && payload.replace_items) {
        db.prepare('DELETE FROM booking_items WHERE booking_id = ?').run(id);
        const itemStmt = db.prepare(`
          INSERT INTO booking_items (booking_id, menu_item_id, quantity, unit_price, note)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const item of payload.items) {
          if (item.menu_item_id) {
            itemStmt.run(
              id,
              Number(item.menu_item_id),
              Number(item.quantity) || 1,
              Number(item.unit_price) || 0,
              item.note || null
            );
          }
        }
      }
    });

    updateTx(data);
    return BookingRepository.getById(id);
  },

  updateStatus: (id, status, admin_note) => {
    const current = BookingRepository.getById(id);
    if (!current) return null;

    const nextNote = admin_note !== undefined ? admin_note : current.admin_note;

    db.prepare(`
      UPDATE bookings SET
        status = ?,
        admin_note = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_deleted = 0
    `).run(status, nextNote, id);

    return BookingRepository.getById(id);
  },

  softDelete: (id) => {
    db.prepare(`
      UPDATE bookings SET
        is_deleted = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);
    return true;
  },
};

module.exports = BookingRepository;
