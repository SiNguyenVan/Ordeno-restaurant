const { db } = require('../database/db');

const CategoryRepository = {
    getAllCategoriesWithCount: () => {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.slug,
                c.description,
                c.sort_order,
                c.is_active,
                COUNT(m.id) AS total_items
            FROM categories c
            LEFT JOIN menu_items m ON m.category_id = c.id AND m.is_available = 1 AND m.is_deleted = 0
            WHERE c.is_deleted = 0 AND c.is_active = 1
            GROUP BY c.id, c.name, c.slug, c.description, c.sort_order, c.is_active
            ORDER BY c.sort_order ASC, c.id ASC
        `;
        return db.prepare(query).all();
    },

    getCategoryById: (id) => {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.slug,
                c.description,
                c.sort_order,
                c.is_active,
                COUNT(m.id) AS total_items
            FROM categories c
            LEFT JOIN menu_items m ON m.category_id = c.id AND m.is_available = 1 AND m.is_deleted = 0
            WHERE c.id = ? AND c.is_deleted = 0 AND c.is_active = 1
            GROUP BY c.id, c.name, c.slug, c.description, c.sort_order, c.is_active
        `;
        return db.prepare(query).get(id);
    },

    getCategoryBySlug: (slug) => {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.slug,
                c.description,
                c.sort_order,
                c.is_active,
                COUNT(m.id) AS total_items
            FROM categories c
            LEFT JOIN menu_items m ON m.category_id = c.id AND m.is_available = 1 AND m.is_deleted = 0
            WHERE c.slug = ? AND c.is_deleted = 0 AND c.is_active = 1
            GROUP BY c.id, c.name, c.slug, c.description, c.sort_order, c.is_active
        `;
        return db.prepare(query).get(slug);
    },

    createCategory: (data) => {
        const stmt = db.prepare(`
            INSERT INTO categories (name, slug, description, sort_order, is_active, is_deleted)
            VALUES (?, ?, ?, ?, ?, 0)
        `);
        const info = stmt.run(
            data.name,
            data.slug,
            data.description || null,
            data.sort_order || 0,
            data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
        );
        return CategoryRepository.getCategoryById(info.lastInsertRowid);
    },

    updateCategory: (id, data) => {
        const current = CategoryRepository.getCategoryById(id);
        if (!current) return null;

        const merged = {
            name: data.name !== undefined ? data.name : current.name,
            slug: data.slug !== undefined ? data.slug : current.slug,
            description: data.description !== undefined ? data.description : current.description,
            sort_order: data.sort_order !== undefined ? data.sort_order : current.sort_order,
            is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : current.is_active,
        };

        db.prepare(`
            UPDATE categories SET
                name = ?,
                slug = ?,
                description = ?,
                sort_order = ?,
                is_active = ?
            WHERE id = ? AND is_deleted = 0
        `).run(merged.name, merged.slug, merged.description, merged.sort_order, merged.is_active, id);

        return CategoryRepository.getCategoryById(id);
    },

    deleteCategory: (id) => {
        const item = CategoryRepository.getCategoryById(id);
        if (!item) return false;
        db.prepare('UPDATE categories SET is_deleted = 1, is_active = 0 WHERE id = ?').run(id);
        return true;
    },
};

module.exports = CategoryRepository;
