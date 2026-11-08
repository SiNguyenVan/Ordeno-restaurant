-- 1. XÓA DỮ LIỆU CŨ TRƯỚC KHI SEED
DELETE FROM booking_items;
DELETE FROM bookings;
DELETE FROM party_package_items;
DELETE FROM party_packages;
DELETE FROM menu_items;
DELETE FROM categories;
DELETE FROM space_types;

-- 2. BẢNG DANH MỤC LOẠI PHÒNG / KHÔNG GIAN NHÀ HÀNG (SPACE_TYPES)
INSERT INTO space_types (
    id, code, name, description, image_url,
    total_quantity, min_capacity, max_capacity, surcharge_fee,
    sort_order, is_active, is_deleted
) VALUES
(1, 'STANDARD', 'Phòng Thường (Khu Vực Chung)',
 'Không gian mở hiện đại, ấm cúng, phù hợp hẹn hò, cặp đôi hoặc gia đình nhỏ.',
 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
 25, 1, 6, 0.00, 1, 1, 0),

(2, 'VIP', 'Phòng VIP Sakura Riêng Tư',
 'Phòng khép kín cách âm cao cấp, máy lạnh riêng, phù hợp tiếp đối tác hoặc họp mặt gia đình cần sự riêng tư.',
 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c',
 10, 4, 18, 200000.00, 2, 1, 0),

(3, 'GARDEN', 'Phòng Sân Vườn Ánh Sao',
 'Không gian sân vườn ngoài trời thoáng đãng, nhiều cây xanh, lý tưởng cho tiệc sinh nhật, liên hoan buổi tối.',
 'https://images.unsplash.com/photo-1543007630-9710e4a00a20',
 3, 10, 45, 0.00, 3, 1, 0),

(4, 'BANQUET', 'Sảnh Tiệc Lớn Hoàng Gia',
 'Không gian sảnh tiệc rộng lớn với sân khấu và âm thanh ánh sáng chuyên nghiệp.',
 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf',
 2, 20, 100, 500000.00, 4, 1, 0);

-- 3. BẢNG DANH MỤC THỰC ĐƠN (CATEGORIES)
INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES
(1, 'Sashimi tươi sống', 'sashimi-tuoi-song', 'Hải sản nhập khẩu hàng không mỗi ngày, tươi ngon ngọt thịt phục vụ cùng wasabi tươi.', 1, 1),
(2, 'Lẩu và món nóng', 'lau-va-mon-nong', 'Nước dùng ninh xương thảo mộc truyền thống kết hợp thịt bò Wagyu và hải sản hảo hạng.', 2, 1),
(3, 'Sushi & Cuộn Maki', 'sushi-va-maki', 'Cơm trộn giấm chuẩn Nhật cùng cá béo ngậy được nắn thủ công tỉ mỉ.', 3, 1),
(4, 'Đồ uống & Tráng miệng', 'do-uong-trang-mieng', 'Rượu Sake trứ danh, trà thanh nhiệt và kem Matcha tráng miệng mát lạnh.', 4, 1);

-- 4. BẢNG MÓN ĂN (MENU_ITEMS)
INSERT INTO menu_items (id, category_id, name, slug, description, image_url, original_price, discount_price, discount_percent, is_best_seller, is_on_promo, is_new, attributes, is_available, sort_order) VALUES
(1, 1, 'Set Sashimi Thuyền 5 Loại Thượng Hạng', 'set-sashimi-thuyen-5-loai', 
 'Gồm Cá hồi Na Uy, Cá ngừ Akami, Sò đỏ Hokkigai, Bạch tuộc Tako và Bụng cá hồi béo ngậy.', 
 'https://images.unsplash.com/photo-1534482421-64566f976cfa', 790000.00, 671000.00, 15, 1, 1, 0, 
 json_object('origin', 'Na Uy & Nhật Bản', 'unit', 'Thuyền lớn', 'serving', '3-4 người', 'raw', 1), 1, 1),

(2, 1, 'Sashimi Cá Hồi Na Uy Tươi (10 lát)', 'sashimi-ca-hoi-na-uy-10-lat', 
 'Từng lát cá hồi dày dặn béo ngậy, giữ trọn độ ngọt thanh nguyên bản.', 
 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c', 290000.00, NULL, NULL, 1, 0, 0, 
 json_object('origin', 'Na Uy', 'unit', 'Đĩa 10 lát', 'serving', '1-2 người', 'raw', 1), 1, 2),

(3, 1, 'Sashimi Sò Điệp Nhật Hokkaido Hotate', 'sashimi-so-diep-nhat-hokkaido', 
 'Sò điệp vùng Hokkaido mọng nước, vị ngọt bùi tự nhiên tan trong miệng.', 
 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56', 350000.00, 315000.00, 10, 0, 1, 1, 
 json_object('origin', 'Hokkaido, Nhật Bản', 'unit', 'Phần 6 miếng', 'serving', '1-2 người', 'raw', 1), 1, 3),

(4, 2, 'Lẩu Bò Wagyu A5 Nấm Matsutake', 'lau-bo-wagyu-a5-nam-matsutake', 
 'Nước lẩu Dashi ngọt thanh, thịt bò Wagyu vân mỡ cẩm thạch mềm tan cùng nấm quý tươi mát.', 
 'https://images.unsplash.com/photo-1547592180-85f173990554', 1250000.00, 999000.00, 20, 1, 1, 0, 
 json_object('serving', '3-4 người', 'spicy_level', 0, 'beef_grade', 'Wagyu A5', 'unit', 'Nồi lẩu'), 1, 1),

(5, 2, 'Lẩu Hải Sản Miso Cay Đậm Đà', 'lau-hai-san-miso-cay', 
 'Vị chua cay nồng ấm từ tương Miso đỏ, ăn kèm Tôm sú, Mực lá, Ngao hai cùi tươi rói.', 
 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624', 590000.00, NULL, NULL, 0, 0, 0, 
 json_object('serving', '2-3 người', 'spicy_level', 2, 'unit', 'Nồi lẩu'), 1, 2),

(6, 2, 'Bò Nướng Đá Núi Lửa Sốt Teriyaki', 'bo-nuong-da-nui-lua-sot-teriyaki', 
 'Thịt thăn ngoại bò Black Angus áp chảo trên phiến đá nóng 300 độ C, ngậy thơm bơ tỏi.', 
 'https://images.unsplash.com/photo-1544025162-d76694265947', 480000.00, NULL, NULL, 1, 0, 0, 
 json_object('serving', '2 người', 'weight', '250g', 'unit', 'Phần đá nóng'), 1, 3),

(7, 3, 'Cuộn Rồng Lửa Bơ Sáp (Dragon Roll)', 'cuon-rong-lua-bo-sap-dragon-roll', 
 'Nhân lươn nướng Unagi giòn rụm, phủ bơ sáp béo bùi và trứng tôm Ebiko cam óng ánh.', 
 'https://images.unsplash.com/photo-1611143669185-af224c5e3252', 220000.00, 176000.00, 20, 1, 1, 0, 
 json_object('pieces', 8, 'unit', 'Cuộn 8 khoanh'), 1, 1),

(8, 3, 'Set Thuyền Sushi Cá Hồi Khò Phô Mai', 'set-thuyen-sushi-ca-hoi-kho-pho-mai', 
 'Sushi cá hồi khò lửa thơm lừng sốt phô mai Mayo béo ngậy chấm sốt ngọt đặc trưng.', 
 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', 320000.00, NULL, NULL, 0, 0, 1, 
 json_object('pieces', 10, 'unit', 'Thuyền 10 miếng'), 1, 2),

(9, 4, 'Rượu Sake Vảy Vàng Gekkeikan 720ml', 'ruou-sake-vay-vang-gekkeikan-720ml', 
 'Dòng rượu Sake truyền thống danh tiếng từ Kyoto, điểm xuyết những lá vàng nguyên chất óng ánh.', 
 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', 890000.00, 750000.00, 15, 1, 1, 0, 
 json_object('alcohol', '15%', 'volume', '720ml', 'origin', 'Kyoto, Nhật Bản'), 1, 1),

(10, 4, 'Trà Trái Cây Nhiệt Đới Hạt Chia', 'tra-trai-cay-nhiet-doi-hat-chia', 
 'Thanh mát giải ngấy cùng trà Ô Long hữu cơ kết hợp cam vàng, dâu tây và chanh dây tươi.', 
 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd', 65000.00, NULL, NULL, 0, 0, 0, 
 json_object('unit', 'Ly'), 1, 2),

(11, 4, 'Kem Matcha Thượng Hạng Kèm Bánh Mochi', 'kem-matcha-thuong-hang-kem-banh-mochi', 
 'Kem tươi vị trà xanh Uji đậm đà béo nhẹ, ăn cùng bánh nếp Mochi đậu đỏ dẻo thơm.', 
 'https://images.unsplash.com/photo-1563805042-7684c019e1cb', 85000.00, NULL, NULL, 1, 0, 0, 
 json_object('origin', 'Kyoto Uji Matcha', 'unit', 'Ly'), 1, 3);

-- 5. BẢNG GÓI TIỆC (PARTY_PACKAGES) & CÁC MÓN TRONG GÓI (PARTY_PACKAGE_ITEMS)
INSERT INTO party_packages (id, name, slug, description, image_url, price, price_unit, min_guests, perks, is_active) VALUES
(1, 'Set Tiệc Sum Vầy Đoàn Viên', 'set-tiec-sum-vay-doan-vien', 
 'Thích hợp cho tiệc gia đình, tiệc sinh nhật từ 6 đến 10 khách, trọn vẹn từ khai vị đến lẩu.', 
 'https://images.unsplash.com/photo-1528605248644-14dd04022da1', 3500000.00, 'TABLE', 6, 
 'Tặng bánh sinh nhật mini, miễn phí backdrop trang trí bóng bay tiêu chuẩn, hỗ trợ in bảng tên.', 1),

(2, 'Set Tiệc Doanh Nhân & Kỷ Niệm VIP', 'set-tiec-doanh-nhan-vip', 
 'Trải nghiệm ẩm thực đẳng cấp với bò Wagyu A5, rượu Sake vảy vàng và ưu đãi không gian VIP riêng biệt.', 
 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf', 850000.00, 'PERSON', 10, 
 'Tặng 1 chai Sake vảy vàng cho mỗi bàn 6 người, miễn 100% phụ thu phòng VIP riêng, giảm 10% đồ uống thêm.', 1);

INSERT INTO party_package_items (party_package_id, menu_item_id, quantity) VALUES
(1, 1, 1),
(1, 7, 2),
(1, 4, 1),
(1, 10, 6),
(1, 11, 6);

INSERT INTO party_package_items (party_package_id, menu_item_id, quantity) VALUES
(2, 1, 1),
(2, 3, 2),
(2, 6, 2),
(2, 4, 1),
(2, 9, 1);

-- 6. BẢNG ĐẶT BÀN, ĐẶT TIỆC & ĐẶT SHIP (BOOKINGS)
INSERT INTO bookings (
    id, booking_code, booking_type, space_type_id, rooms_requested, 
    customer_name, customer_phone, customer_email, booking_date, booking_time, duration_minutes, 
    guest_adults, guest_children, event_type, party_package_id, estimated_budget, 
    special_requests, status, admin_note
) VALUES
(1, 'BK-20261110-001', 'REGULAR_TABLE', 1, 1, 
 'Nguyễn Văn An', '0912345678', 'an.nguyen@gmail.com', '2026-11-10', '19:00:00', 120, 
 4, 1, NULL, NULL, NULL, 
 'Bàn gần cửa sổ, chuẩn bị trước 1 ghế ăn em bé.', 'CONFIRMED', 'Lễ tân đã gọi điện thoại xác nhận.'),

(2, 'BK-20261115-002', 'PARTY_EVENT', 2, 1, 
 'Trần Thị Thu Trang', '0988776655', 'thutrang.tran@company.com', '2026-11-15', '18:30:00', 180, 
 8, 2, 'Tiệc Sinh Nhật Gia Đình', 1, 4500000.00, 
 'Trang trí bóng tông màu pastel vàng trắng, khách mang theo bánh kem riêng.', 'CONFIRMED', 'Đã nhận cọc 1 triệu qua VietQR lúc 10/11.'),

(3, 'BK-20261120-003', 'PARTY_EVENT', 3, 1, 
 'Lê Hoàng Nam', '0903112233', 'nam.lehoang@yahoo.com', '2026-11-20', '19:30:00', 150, 
 25, 0, 'Liên Hoan Công Ty Cuối Năm', 2, 22000000.00, 
 'Cần chuẩn bị micro phát biểu và hệ thống âm thanh ngoài trời.', 'PENDING', 'Chờ Quản lý gọi tư vấn thêm gói rượu.'),

(4, 'BK-20261112-004', 'REGULAR_TABLE', 1, 1, 
 'Phạm Minh Tuấn', '0945667788', 'tuanpm@fpt.com.vn', '2026-11-12', '12:00:00', 90, 
 2, 0, NULL, NULL, NULL, 
 'Ăn trưa tiếp đối tác, lên món nhanh giúp bàn anh.', 'CONFIRMED', 'Đã báo bếp ưu tiên ra món.'),

(5, 'BK-20261110-005', 'DELIVERY', NULL, 1, 
 'Hoàng Bích Ngọc', '0938123456', 'bichngoc.hoang@gmail.com', '2026-11-10', '18:30:00', 60, 
 4, 0, 'Giao Hàng Tận Nơi (Ship)', NULL, 1283000.00, 
 'Giao đến: Căn hộ A24.08, Vinhomes Golden River Ba Son, Quận 1, TP.HCM. Đóng gói kèm đá khô giữ lạnh Sashimi và 4 bộ đũa muỗng.', 'CONFIRMED', 'Đã thanh toán chuyển khoản 100%, tài xế giao hàng riêng của nhà hàng xuất phát lúc 18:00.'),

(6, 'BK-20261111-006', 'DELIVERY', NULL, 1, 
 'Đỗ Quang Huy', '0977889900', 'quanghuy.do@techcombank.com.vn', '2026-11-11', '12:15:00', 45, 
 6, 0, 'Đặt Ship Tiệc Văn Phòng', NULL, 2230000.00, 
 'Giao đến: Tầng 15, Tòa nhà Vietcombank Tower, 198 Trần Quang Khải, Hoàn Kiếm, Hà Nội. Xuất hóa đơn VAT cho công ty.', 'PENDING', 'Đang chờ kế toán xác nhận thông tin xuất hóa đơn VAT trước khi bếp chế biến.'),

(7, 'BK-20261108-007', 'DELIVERY', NULL, 1, 
 'Vũ Thảo My', '0919556677', 'thaomy.vu@outlook.com', '2026-11-08', '19:00:00', 60, 
 5, 2, 'Đặt Ship Lẩu Tại Gia', NULL, 1919000.00, 
 'Giao đến: Biệt thự số 18 Đường Thảo Điền, Phường Thảo Điền, TP. Thủ Đức. Giao đúng 19h00 để gia đình dùng bữa tối.', 'COMPLETED', 'Đã giao thành công lúc 18:50, khách phản hồi hài lòng về bao bì giữ nhiệt.'),

(8, 'BK-20261109-008', 'DELIVERY', NULL, 1, 
 'Ngô Tuấn Kiệt', '0966334455', 'tuankiet.ngo@gmail.com', '2026-11-09', '20:00:00', 60, 
 2, 0, 'Giao Hàng Tận Nơi (Ship)', NULL, 1340000.00, 
 'Giao đến: 88 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội. Gọi điện trước khi giao 10 phút.', 'CANCELLED', 'Khách báo bận đột xuất xin hủy đơn trước giờ bếp chuẩn bị, hẹn đặt lại vào cuối tuần.');

-- 7. BẢNG MÓN ĐẶT TRƯỚC / ĐẶT SHIP THEO ĐƠN (BOOKING_ITEMS)
INSERT INTO booking_items (booking_id, menu_item_id, quantity, unit_price, note) VALUES
(1, 1, 1, 671000.00, 'Lấy ít wasabi cay'),
(1, 6, 1, 480000.00, 'Thịt làm chín vừa (Medium Well)');

INSERT INTO booking_items (booking_id, menu_item_id, quantity, unit_price, note) VALUES
(4, 8, 1, 320000.00, 'Làm bớt ngọt'),
(4, 10, 2, 65000.00, 'Ít đường (30%)');

INSERT INTO booking_items (booking_id, menu_item_id, quantity, unit_price, note) VALUES
(5, 1, 1, 671000.00, 'Đóng hộp giữ nhiệt kèm túi đá gel'),
(5, 7, 2, 176000.00, 'Tách riêng sốt Mayo và gừng hồng'),
(5, 10, 4, 65000.00, 'Đóng ly seal kỹ, để đá riêng');

INSERT INTO booking_items (booking_id, menu_item_id, quantity, unit_price, note) VALUES
(6, 8, 2, 320000.00, 'Khò chín kỹ, thêm nhiều sốt ngọt'),
(6, 6, 2, 480000.00, 'Thái miếng vừa ăn, bọc giấy bạc giữ nóng'),
(6, 3, 2, 315000.00, 'Kèm thêm wasabi tươi');

INSERT INTO booking_items (booking_id, menu_item_id, quantity, unit_price, note) VALUES
(7, 4, 1, 999000.00, 'Đóng túi nước lẩu riêng, rau nấm rửa sạch đóng khay'),
(7, 2, 2, 290000.00, 'Cắt lát dày, ướp đá lạnh'),
(7, 11, 4, 85000.00, 'Đóng hộp xốp giữ lạnh kèm đá khô');

INSERT INTO booking_items (booking_id, menu_item_id, quantity, unit_price, note) VALUES
(8, 5, 1, 590000.00, 'Làm cay vừa'),
(8, 9, 1, 750000.00, 'Ướp lạnh sẵn');
