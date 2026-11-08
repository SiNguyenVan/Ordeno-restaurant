const slugify = require('slugify');
const { CategoryRepository } = require('../repositories');

function createSafeCategorySlug(name) {
    if (!name || typeof name !== 'string') return '';
    return slugify(name, {
        lower: true,
        locale: 'vi',
        strict: true,
        trim: true,
    });
}

const CategoryService = {
    getAllCategories: async () => {
        return CategoryRepository.getAllCategoriesWithCount();
    },

    getCategoryById: async (idOrSlug) => {
        if (!isNaN(idOrSlug)) {
            return CategoryRepository.getCategoryById(Number(idOrSlug));
        }
        return CategoryRepository.getCategoryBySlug(idOrSlug);
    },

    createCategory: async (data) => {
        const slug = data.slug && data.slug.trim()
            ? createSafeCategorySlug(data.slug.trim())
            : createSafeCategorySlug(data.name);

        return CategoryRepository.createCategory({
            ...data,
            slug: slug || `cat-${Date.now().toString().slice(-4)}`,
        });
    },

    updateCategory: async (id, data) => {
        const current = CategoryRepository.getCategoryById(id);
        if (!current) {
            const err = new Error('Không tìm thấy danh mục để cập nhật');
            err.status = 404;
            throw err;
        }

        let slug = current.slug;
        if (data.slug && data.slug.trim()) {
            slug = createSafeCategorySlug(data.slug.trim());
        } else if (data.name && data.name.trim() !== current.name && !data.slug) {
            slug = createSafeCategorySlug(data.name);
        }

        return CategoryRepository.updateCategory(id, {
            ...data,
            slug,
        });
    },

    deleteCategory: async (id) => {
        const current = CategoryRepository.getCategoryById(id);
        if (!current) {
            const err = new Error('Không tìm thấy danh mục để xóa');
            err.status = 404;
            throw err;
        }

        if (current.total_items > 0) {
            const err = new Error(`Không thể xóa danh mục "${current.name}" vì vẫn còn ${current.total_items} món ăn đang thuộc danh mục này`);
            err.status = 400;
            throw err;
        }

        CategoryRepository.deleteCategory(id);
        return {
            success: true,
            message: `Đã xóa danh mục "${current.name}" thành công`,
        };
    },
};

module.exports = CategoryService;
