const slugify = require('slugify');
const { MenuItemRepository, CategoryRepository } = require('../repositories');

/**
 * Sinh slug tiếng Việt chuẩn SEO từ chuỗi tên bằng thư viện slugify
 */
function createSafeSlug(text) {
    if (!text || typeof text !== 'string') return '';
    return slugify(text, {
        lower: true,
        locale: 'vi',
        strict: true,
        trim: true,
    });
}

/**
 * Tạo slug duy nhất từ tên món ăn trong cơ sở dữ liệu
 */
function generateUniqueSlugFromName(name, excludeId = null) {
    let slug = createSafeSlug(name);
    if (!slug) slug = `dish-${Date.now().toString().slice(-4)}`;

    let existing = MenuItemRepository.findBySlug(slug, excludeId);
    if (!existing) return slug;

    let counter = 2;
    while (existing) {
        const candidate = `${slug}-${counter}`;
        existing = MenuItemRepository.findBySlug(candidate, excludeId);
        if (!existing) return candidate;
        counter++;
    }
    return `${slug}-${Date.now().toString().slice(-4)}`;
}

/**
 * Làm sạch attributes của món ăn (loại bỏ trường options / preparation style nếu có)
 */
function sanitizeAttributes(raw) {
    if (!raw) return '{}';
    let parsed = {};
    if (typeof raw === 'object') {
        parsed = { ...raw };
    } else if (typeof raw === 'string') {
        try {
            parsed = JSON.parse(raw);
        } catch {
            return '{}';
        }
    }
    delete parsed.options;
    delete parsed.preparation_options;
    return JSON.stringify(parsed);
}

const MenuItemService = {
    /**
     * Lấy danh sách món ăn cho trang công khai (chỉ lấy món khả dụng)
     */
    getAllMenuItems: async (filters = {}) => {
        return MenuItemRepository.getAllMenuItems(filters);
    },

    /**
     * Lấy danh sách món ăn cho Admin (hiển thị đầy đủ, hỗ trợ lọc đa chiều)
     */
    getAllMenuItemsAdmin: async (filters = {}) => {
        return MenuItemRepository.getAllMenuItemsAdmin(filters);
    },

    /**
     * Thống kê số lượng món ăn tổng hợp cho Admin Dashboard
     */
    getAdminStats: async () => {
        return MenuItemRepository.getAdminStats();
    },

    /**
     * Lấy top món bán chạy nhất
     */
    getTopBestSellers: async (limit = 5) => {
        return MenuItemRepository.getTopBestSellers(limit);
    },

    /**
     * Lấy chi tiết món ăn theo ID
     */
    getMenuItemById: async (id) => {
        const item = MenuItemRepository.getMenuItemById(id);
        if (!item) {
            const err = new Error('Không tìm thấy món ăn hoặc món ăn đã bị xóa');
            err.status = 404;
            throw err;
        }
        return item;
    },

    /**
     * Lấy danh sách chi tiết các món ăn theo mảng ID (dùng cho giỏ hàng)
     */
    getMenuItemsByIds: async (ids = []) => {
        return MenuItemRepository.getMenuItemsByIds(ids);
    },

    /**
     * Tạo món ăn mới - BE tự động sinh slug từ tên món gửi từ FE
     */
    createMenuItem: async (data) => {
        // 1. Kiểm tra danh mục tồn tại
        const category = CategoryRepository.getCategoryById(data.category_id);
        if (!category) {
            const err = new Error('Danh mục món ăn không tồn tại hoặc đã bị ẩn');
            err.status = 400;
            throw err;
        }

        // 2. Tự động sinh slug bằng thư viện slugify tại BE từ tên món gửi về từ FE
        const uniqueSlug = generateUniqueSlugFromName(data.name);

        // 3. Tính phần trăm giảm giá tự động nếu có discount_price
        const originalPrice = Number(data.original_price);
        const discountPrice = data.discount_price !== undefined && data.discount_price !== null && data.discount_price !== ''
            ? Number(data.discount_price)
            : null;

        let discountPercent = 0;
        let isOnPromo = Boolean(data.is_on_promo);

        if (discountPrice !== null && discountPrice < originalPrice && originalPrice > 0) {
            discountPercent = Math.round((1 - discountPrice / originalPrice) * 100);
            isOnPromo = true;
        }

        const payload = {
            ...data,
            slug: uniqueSlug,
            original_price: originalPrice,
            discount_price: discountPrice,
            discount_percent: discountPercent,
            is_on_promo: isOnPromo ? 1 : 0,
            is_best_seller: Boolean(data.is_best_seller) ? 1 : 0,
            is_new: Boolean(data.is_new) ? 1 : 0,
            is_available: data.is_available !== undefined ? (data.is_available ? 1 : 0) : 1,
            sort_order: Number(data.sort_order) || 0,
            attributes: sanitizeAttributes(data.attributes),
        };

        return MenuItemRepository.createMenuItem(payload);
    },

    /**
     * Cập nhật thông tin món ăn - BE tự cập nhật slug nếu tên món thay đổi
     */
    updateMenuItem: async (id, data) => {
        const current = MenuItemRepository.getMenuItemById(id);
        if (!current) {
            const err = new Error('Không tìm thấy món ăn để cập nhật');
            err.status = 404;
            throw err;
        }

        // 1. Kiểm tra danh mục nếu có thay đổi
        if (data.category_id && data.category_id !== current.category_id) {
            const category = CategoryRepository.getCategoryById(data.category_id);
            if (!category) {
                const err = new Error('Danh mục món ăn không tồn tại hoặc đã bị ẩn');
                err.status = 400;
                throw err;
            }
        }

        // 2. Tự động sinh lại slug mới từ tên bằng slugify nếu tên món thay đổi
        let finalSlug = current.slug;
        if (data.name && data.name.trim() && data.name.trim() !== current.name) {
            finalSlug = generateUniqueSlugFromName(data.name.trim(), id);
        }

        // 3. Tính toán lại giá và % giảm giá
        const originalPrice = data.original_price !== undefined ? Number(data.original_price) : Number(current.original_price);
        const discountPrice = data.discount_price !== undefined
            ? (data.discount_price !== null && data.discount_price !== '' ? Number(data.discount_price) : null)
            : (current.discount_price !== null ? Number(current.discount_price) : null);

        let discountPercent = 0;
        let isOnPromo = data.is_on_promo !== undefined ? Boolean(data.is_on_promo) : Boolean(current.is_on_promo);

        if (discountPrice !== null && discountPrice < originalPrice && originalPrice > 0) {
            discountPercent = Math.round((1 - discountPrice / originalPrice) * 100);
            isOnPromo = true;
        } else if (discountPrice === null) {
            discountPercent = 0;
        }

        const payload = {
            ...data,
            slug: finalSlug,
            original_price: originalPrice,
            discount_price: discountPrice,
            discount_percent: discountPercent,
            is_on_promo: isOnPromo ? 1 : 0,
            ...(data.attributes !== undefined ? { attributes: sanitizeAttributes(data.attributes) } : {}),
        };

        return MenuItemRepository.updateMenuItem(id, payload);
    },

    /**
     * Đổi nhanh trạng thái còn hàng / tạm hết
     */
    updateAvailability: async (id, is_available) => {
        const current = MenuItemRepository.getMenuItemById(id);
        if (!current) {
            const err = new Error('Không tìm thấy món ăn');
            err.status = 404;
            throw err;
        }
        return MenuItemRepository.updateAvailability(id, is_available);
    },

    /**
     * Xóa mềm món ăn (is_deleted = 1)
     */
    deleteMenuItem: async (id) => {
        const current = MenuItemRepository.getMenuItemById(id);
        if (!current) {
            const err = new Error('Không tìm thấy món ăn để xóa');
            err.status = 404;
            throw err;
        }
        const success = MenuItemRepository.deleteMenuItem(id);
        return {
            success,
            message: `Đã xóa món ăn "${current.name}" thành công`,
        };
    },
};

module.exports = MenuItemService;
