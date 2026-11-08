const { db } = require('../database/db');

const MenuItemRepository = {
    /**
     * Lấy danh sách món ăn cho khách hàng (chỉ lấy món đang khả dụng is_available = 1 và is_deleted = 0)
     */
    getAllMenuItems: ({
        search,
        category_id,
        is_on_promo,
        sort,
        page = 1,
        limit = 12,
    } = {}) => {
        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 12);
        const offset = (currentPage - 1) * pageSize;

        let whereClause = ` WHERE m.is_deleted = 0 AND m.is_available = 1`;
        const params = [];

        if (search) {
            whereClause += ` AND (m.name LIKE ? OR m.slug LIKE ?)`;
            params.push(`%${search.trim()}%`, `%${search.trim()}%`);
        }

        if (category_id) {
            whereClause += ` AND m.category_id = ?`;
            params.push(Number(category_id));
        }

        if (is_on_promo === 'true' || is_on_promo === true) {
            whereClause += ` AND (m.is_on_promo = 1 OR (m.discount_price IS NOT NULL AND m.discount_price < m.original_price))`;
        }

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM menu_items m
            LEFT JOIN categories c ON c.id = m.category_id
            ${whereClause}
        `;
        const { total = 0 } = db.prepare(countQuery).get(...params) || {};

        let orderClause = ` ORDER BY m.sort_order ASC, m.id ASC`;
        if (sort === 'price_asc') {
            orderClause = ` ORDER BY m.original_price ASC, m.id ASC`;
        } else if (sort === 'price_desc') {
            orderClause = ` ORDER BY m.original_price DESC, m.id ASC`;
        }

        const dataQuery = `
            SELECT 
                m.*,
                c.name AS category_name,
                c.slug AS category_slug
            FROM menu_items m
            LEFT JOIN categories c ON c.id = m.category_id
            ${whereClause}
            ${orderClause}
            LIMIT ? OFFSET ?
        `;
        const items = db.prepare(dataQuery).all(...params, pageSize, offset);

        return {
            items,
            pagination: {
                page: currentPage,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize) || 1,
            },
        };
    },

    /**
     * Lấy danh sách món ăn cho Admin (hiển thị cả món tạm hết, hỗ trợ lọc đa chiều)
     */
    getAllMenuItemsAdmin: ({
        search,
        category_id,
        is_available,
        is_best_seller,
        is_on_promo,
        is_new,
        sort,
        page = 1,
        limit = 10,
    } = {}) => {
        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 10);
        const offset = (currentPage - 1) * pageSize;

        let whereClause = ` WHERE m.is_deleted = 0`;
        const params = [];

        if (search && search.trim()) {
            whereClause += ` AND (m.name LIKE ? OR m.slug LIKE ?)`;
            params.push(`%${search.trim()}%`, `%${search.trim()}%`);
        }

        if (category_id && category_id !== 'ALL') {
            whereClause += ` AND m.category_id = ?`;
            params.push(Number(category_id));
        }

        if (is_available !== undefined && is_available !== 'ALL' && is_available !== '') {
            whereClause += ` AND m.is_available = ?`;
            params.push(is_available === 'true' || is_available === '1' || is_available === 1 ? 1 : 0);
        }

        if (is_best_seller === 'true' || is_best_seller === 1 || is_best_seller === '1') {
            whereClause += ` AND m.is_best_seller = 1`;
        }

        if (is_on_promo === 'true' || is_on_promo === 1 || is_on_promo === '1') {
            whereClause += ` AND (m.is_on_promo = 1 OR (m.discount_price IS NOT NULL AND m.discount_price < m.original_price))`;
        }

        if (is_new === 'true' || is_new === 1 || is_new === '1') {
            whereClause += ` AND m.is_new = 1`;
        }

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM menu_items m
            LEFT JOIN categories c ON c.id = m.category_id
            ${whereClause}
        `;
        const { total = 0 } = db.prepare(countQuery).get(...params) || {};

        let orderClause = ` ORDER BY m.sort_order ASC, m.id DESC`;
        if (sort === 'price_asc') {
            orderClause = ` ORDER BY COALESCE(m.discount_price, m.original_price) ASC, m.id DESC`;
        } else if (sort === 'price_desc') {
            orderClause = ` ORDER BY COALESCE(m.discount_price, m.original_price) DESC, m.id DESC`;
        } else if (sort === 'name_asc') {
            orderClause = ` ORDER BY m.name ASC`;
        } else if (sort === 'name_desc') {
            orderClause = ` ORDER BY m.name DESC`;
        } else if (sort === 'newest') {
            orderClause = ` ORDER BY m.id DESC`;
        }

        const dataQuery = `
            SELECT 
                m.*,
                c.name AS category_name,
                c.slug AS category_slug
            FROM menu_items m
            LEFT JOIN categories c ON c.id = m.category_id
            ${whereClause}
            ${orderClause}
            LIMIT ? OFFSET ?
        `;
        const items = db.prepare(dataQuery).all(...params, pageSize, offset);

        return {
            items,
            pagination: {
                page: currentPage,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize) || 1,
            },
        };
    },

    /**
     * Thống kê tổng hợp số lượng món ăn cho Admin
     */
    getAdminStats: () => {
        const stats = db.prepare(`
            SELECT 
                COUNT(*) AS total_dishes,
                SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) AS available_dishes,
                SUM(CASE WHEN is_available = 0 THEN 1 ELSE 0 END) AS out_of_stock_dishes,
                SUM(CASE WHEN is_best_seller = 1 THEN 1 ELSE 0 END) AS best_sellers,
                SUM(CASE WHEN is_on_promo = 1 OR (discount_price IS NOT NULL AND discount_price < original_price) THEN 1 ELSE 0 END) AS promo_dishes
            FROM menu_items
            WHERE is_deleted = 0
        `).get();

        const byCategory = db.prepare(`
            SELECT 
                c.id,
                c.name,
                c.slug,
                COUNT(m.id) AS total_items,
                SUM(CASE WHEN m.is_available = 1 THEN 1 ELSE 0 END) AS available_items
            FROM categories c
            LEFT JOIN menu_items m ON m.category_id = c.id AND m.is_deleted = 0
            WHERE c.is_deleted = 0
            GROUP BY c.id, c.name, c.slug
            ORDER BY c.sort_order ASC, c.id ASC
        `).all();

        return {
            ...stats,
            by_category: byCategory,
        };
    },

    getTopBestSellers: (limit = 5) => {
        const query = `
            SELECT 
                m.*,
                c.name AS category_name,
                c.slug AS category_slug
            FROM menu_items m
            LEFT JOIN categories c ON c.id = m.category_id
            WHERE m.is_deleted = 0 AND m.is_best_seller = 1 AND m.is_available = 1
            ORDER BY m.sort_order ASC, m.id ASC
            LIMIT ?
        `;
        return db.prepare(query).all(limit);
    },

    getMenuItemById: (idOrSlug) => {
        const isNumeric = !isNaN(Number(idOrSlug));
        const query = `
            SELECT 
                m.*,
                c.name AS category_name,
                c.slug AS category_slug,
                c.description AS category_description
            FROM menu_items m
            LEFT JOIN categories c ON c.id = m.category_id
            WHERE ${isNumeric ? 'm.id = ?' : 'm.slug = ?'} AND m.is_deleted = 0
        `;
        return db.prepare(query).get(isNumeric ? Number(idOrSlug) : String(idOrSlug));
    },

    getMenuItemsByIds: (ids = []) => {
        if (!Array.isArray(ids) || ids.length === 0) return [];
        const numericIds = ids
            .map((id) => Number(id))
            .filter((id) => !isNaN(id) && id > 0);
        if (numericIds.length === 0) return [];

        const placeholders = numericIds.map(() => '?').join(',');
        const query = `
            SELECT 
                m.*,
                c.name AS category_name,
                c.slug AS category_slug
            FROM menu_items m
            LEFT JOIN categories c ON c.id = m.category_id
            WHERE m.id IN (${placeholders}) AND m.is_deleted = 0
            ORDER BY m.sort_order ASC, m.id ASC
        `;
        return db.prepare(query).all(...numericIds);
    },

    findBySlug: (slug, excludeId = null) => {
        if (excludeId) {
            return db.prepare('SELECT id, name, slug FROM menu_items WHERE slug = ? AND id != ? AND is_deleted = 0').get(slug, excludeId);
        }
        return db.prepare('SELECT id, name, slug FROM menu_items WHERE slug = ? AND is_deleted = 0').get(slug);
    },

    createMenuItem: (data) => {
        const stmt = db.prepare(`
            INSERT INTO menu_items (
                category_id, name, slug, description, image_url,
                original_price, discount_price, discount_percent,
                is_best_seller, is_on_promo, is_new,
                attributes, is_available, is_deleted, sort_order
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, 0, ?
            )
        `);

        const info = stmt.run(
            data.category_id,
            data.name,
            data.slug,
            data.description || null,
            data.image_url || null,
            data.original_price,
            data.discount_price !== undefined ? data.discount_price : null,
            data.discount_percent || 0,
            data.is_best_seller ? 1 : 0,
            data.is_on_promo ? 1 : 0,
            data.is_new ? 1 : 0,
            typeof data.attributes === 'object' && data.attributes !== null
                ? JSON.stringify(data.attributes)
                : data.attributes || '{}',
            data.is_available !== undefined ? (data.is_available ? 1 : 0) : 1,
            data.sort_order || 0
        );

        return MenuItemRepository.getMenuItemById(info.lastInsertRowid);
    },

    updateMenuItem: (id, data) => {
        const current = MenuItemRepository.getMenuItemById(id);
        if (!current) return null;

        const merged = {
            category_id: data.category_id !== undefined ? data.category_id : current.category_id,
            name: data.name !== undefined ? data.name : current.name,
            slug: data.slug !== undefined ? data.slug : current.slug,
            description: data.description !== undefined ? data.description : current.description,
            image_url: data.image_url !== undefined ? data.image_url : current.image_url,
            original_price: data.original_price !== undefined ? data.original_price : current.original_price,
            discount_price: data.discount_price !== undefined ? data.discount_price : current.discount_price,
            discount_percent: data.discount_percent !== undefined ? data.discount_percent : current.discount_percent,
            is_best_seller: data.is_best_seller !== undefined ? (data.is_best_seller ? 1 : 0) : current.is_best_seller,
            is_on_promo: data.is_on_promo !== undefined ? (data.is_on_promo ? 1 : 0) : current.is_on_promo,
            is_new: data.is_new !== undefined ? (data.is_new ? 1 : 0) : current.is_new,
            attributes: data.attributes !== undefined
                ? (typeof data.attributes === 'object' && data.attributes !== null
                    ? JSON.stringify(data.attributes)
                    : data.attributes || '{}')
                : current.attributes,
            is_available: data.is_available !== undefined ? (data.is_available ? 1 : 0) : current.is_available,
            sort_order: data.sort_order !== undefined ? data.sort_order : current.sort_order,
        };

        const stmt = db.prepare(`
            UPDATE menu_items SET
                category_id = ?,
                name = ?,
                slug = ?,
                description = ?,
                image_url = ?,
                original_price = ?,
                discount_price = ?,
                discount_percent = ?,
                is_best_seller = ?,
                is_on_promo = ?,
                is_new = ?,
                attributes = ?,
                is_available = ?,
                sort_order = ?
            WHERE id = ? AND is_deleted = 0
        `);

        stmt.run(
            merged.category_id,
            merged.name,
            merged.slug,
            merged.description,
            merged.image_url,
            merged.original_price,
            merged.discount_price,
            merged.discount_percent,
            merged.is_best_seller,
            merged.is_on_promo,
            merged.is_new,
            merged.attributes,
            merged.is_available,
            merged.sort_order,
            id
        );

        return MenuItemRepository.getMenuItemById(id);
    },

    updateAvailability: (id, is_available) => {
        const val = is_available ? 1 : 0;
        db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ? AND is_deleted = 0').run(val, id);
        return MenuItemRepository.getMenuItemById(id);
    },

    deleteMenuItem: (id) => {
        const item = MenuItemRepository.getMenuItemById(id);
        if (!item) return false;
        db.prepare('UPDATE menu_items SET is_deleted = 1, is_available = 0 WHERE id = ?').run(id);
        return true;
    },
};

module.exports = MenuItemRepository;
