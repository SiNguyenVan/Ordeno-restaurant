PRAGMA foreign_keys = ON;

-- 1. BẢNG DANH MỤC LOẠI PHÒNG / KHÔNG GIAN (SPACE_TYPES)
CREATE TABLE IF NOT EXISTS space_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    total_quantity INTEGER NOT NULL DEFAULT 1,
    min_capacity INTEGER DEFAULT 1,
    max_capacity INTEGER NOT NULL DEFAULT 6,
    surcharge_fee NUMERIC(12, 2) DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG DANH MỤC THỰC ĐƠN (CATEGORIES)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER NOT NULL DEFAULT 0
);

-- 3. BẢNG MÓN ĂN (MENU_ITEMS)
CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    original_price NUMERIC(12, 2) NOT NULL,
    discount_price NUMERIC(12, 2),
    discount_percent INTEGER,
    is_best_seller INTEGER DEFAULT 0,
    is_on_promo INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    attributes TEXT DEFAULT '{}',
    is_available INTEGER DEFAULT 1,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG GÓI TIỆC / SET MENU TIỆC (PARTY_PACKAGES)
CREATE TABLE IF NOT EXISTS party_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(12, 2) NOT NULL,
    price_unit TEXT DEFAULT 'Bàn',
    min_guests INTEGER DEFAULT 10,
    perks TEXT,
    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER NOT NULL DEFAULT 0
);

-- Chi tiết các món trong Gói tiệc (PARTY_PACKAGE_ITEMS)
CREATE TABLE IF NOT EXISTS party_package_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_package_id INTEGER NOT NULL REFERENCES party_packages(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1
);

-- 5. BẢNG ĐẶT BÀN, ĐẶT TIỆC & ĐẶT SHIP (BOOKINGS)
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT UNIQUE NOT NULL,
    booking_type TEXT NOT NULL DEFAULT 'REGULAR_TABLE',
    space_type_id INTEGER REFERENCES space_types(id),
    rooms_requested INTEGER NOT NULL DEFAULT 1,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    booking_date TEXT NOT NULL,
    booking_time TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 120,
    guest_adults INTEGER NOT NULL DEFAULT 2,
    guest_children INTEGER DEFAULT 0,
    event_type TEXT,
    party_package_id INTEGER REFERENCES party_packages(id),
    estimated_budget NUMERIC(14, 2),
    special_requests TEXT,
    status TEXT DEFAULT 'PENDING',
    admin_note TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG ĐẶT MÓN TRƯỚC / ĐẶT SHIP KÈM ĐƠN (BOOKING_ITEMS)
CREATE TABLE IF NOT EXISTS booking_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category_id, is_available);
CREATE INDEX IF NOT EXISTS idx_menu_flags ON menu_items(is_best_seller, is_on_promo);
CREATE INDEX IF NOT EXISTS idx_menu_items_deleted ON menu_items(is_deleted);
CREATE INDEX IF NOT EXISTS idx_categories_deleted ON categories(is_deleted);
CREATE INDEX IF NOT EXISTS idx_space_types_deleted ON space_types(is_deleted);
CREATE INDEX IF NOT EXISTS idx_booking_availability ON bookings(space_type_id, booking_date, status);
CREATE INDEX IF NOT EXISTS idx_booking_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_deleted ON bookings(is_deleted);
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(booking_date, status, is_deleted);

-- 7. BẢNG NHÂN SỰ & QUẢN TRỊ VIÊN (USERS)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'STAFF',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    salary NUMERIC(12, 2) DEFAULT 0,
    hire_date DATE DEFAULT (DATE('now')),
    last_login DATETIME,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(is_deleted);
