-- ============================================================================
-- DATABASE CREATION & SETUP
-- Target Engine: Microsoft SQL Server 2016 / 2019 / 2022 / SQL Server Express
-- Project: The Royal Bakery (TRB) Pre-Order & Cake Customization System
-- System Synergy: Natively integrated & compatible with DanuPOS
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TRB_PreOrder_DB')
BEGIN
    CREATE DATABASE TRB_PreOrder_DB;
    PRINT '>> Database [TRB_PreOrder_DB] created successfully.';
END
GO

USE TRB_PreOrder_DB;
GO

-- ============================================================================
-- 1. SYSTEM USERS TABLE
-- Corresponds to Menu 2.1 & 2.2 (/create-users, /manage-users) [Screenshots #02, #03]
-- ============================================================================
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    user_id             INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    username            VARCHAR(50) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL, -- SHA256 / BCrypt Hash
    full_name           NVARCHAR(100) NOT NULL,
    user_role           VARCHAR(30) NOT NULL,  -- 'Admin', 'Supervisor', 'Cashier', 'Kitchen', 'Accountant'
    phone_number        VARCHAR(20) NULL,
    is_active           BIT NOT NULL DEFAULT 1,
    created_at          DATETIME NOT NULL DEFAULT GETDATE(),
    last_login_at       DATETIME NULL
);
GO

-- ============================================================================
-- 2. CUSTOMERS DIRECTORY TABLE
-- Corresponds to Menu 2.6 (/customer_list) & Counter Intake [Screenshots #07, #08]
-- Indexed on [mobile] for sub-15ms counter lookup & auto-fill
-- ============================================================================
IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL DROP TABLE dbo.Customers;
GO

CREATE TABLE dbo.Customers (
    customer_id         INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    title               VARCHAR(10) NULL,      -- 'Mr', 'Mrs', 'Miss', 'M/S', 'Dr', 'Rev'
    first_name          NVARCHAR(100) NOT NULL,
    last_name           NVARCHAR(100) NULL,
    mobile              VARCHAR(20) NOT NULL,  -- Primary search identifier
    landline            VARCHAR(20) NULL,
    delivery_address    NVARCHAR(500) NULL,
    email               VARCHAR(100) NULL,
    city                NVARCHAR(100) NULL DEFAULT N'Colombo',
    notes               NVARCHAR(500) NULL,
    created_at          DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- High-speed index for instant counter typing lookup
CREATE NONCLUSTERED INDEX IX_Customers_Mobile ON dbo.Customers(mobile);
CREATE NONCLUSTERED INDEX IX_Customers_FirstName ON dbo.Customers(first_name);
GO

-- ============================================================================
-- 3. MAIN PRODUCT CATEGORIES TABLE
-- Corresponds to Menu 2.4 (/manage-categories) [Screenshot #05]
-- ============================================================================
IF OBJECT_ID('dbo.MainCategories', 'U') IS NOT NULL DROP TABLE dbo.MainCategories;
GO

CREATE TABLE dbo.MainCategories (
    main_cat_id         VARCHAR(20) NOT NULL PRIMARY KEY, -- e.g. 'MCAT1', 'MCAT2'
    category_name       VARCHAR(100) NOT NULL,            -- 'Bread', 'Cake', 'Pastry', 'Showroom'
    chef_description    NVARCHAR(200) NULL,               -- Head Chef (e.g. 'Cheff Premaratna', 'Cheff Wickramapala')
    display_order       INT NOT NULL DEFAULT 0,
    is_active           BIT NOT NULL DEFAULT 1,
    created_at          DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================================
-- 4. SUB PRODUCT CATEGORIES TABLE
-- Corresponds to Menu 2.5 (/manage-sub-categories) [Screenshot #06]
-- ============================================================================
IF OBJECT_ID('dbo.SubCategories', 'U') IS NOT NULL DROP TABLE dbo.SubCategories;
GO

CREATE TABLE dbo.SubCategories (
    sub_cat_id          VARCHAR(20) NOT NULL PRIMARY KEY, -- e.g. 'SCAT1', 'SCAT2'
    main_cat_id         VARCHAR(20) NOT NULL,
    sub_category_name   VARCHAR(100) NOT NULL,            -- 'Buns', 'Drawing Cakes', 'Structure Cakes', 'Gateaux'
    description         NVARCHAR(255) NULL,
    is_active           BIT NOT NULL DEFAULT 1,
    created_at          DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_SubCategories_MainCategory FOREIGN KEY (main_cat_id) 
        REFERENCES dbo.MainCategories(main_cat_id) ON DELETE CASCADE
);
GO

-- ============================================================================
-- 5. PRODUCTS & CATALOG ITEMS TABLE (850+ Items)
-- Corresponds to Menu 2.3 (/add-product) [Screenshot #04]
-- Includes DanuPOS item cross-reference code
-- ============================================================================
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
GO

CREATE TABLE dbo.Products (
    product_id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    product_code        VARCHAR(50) NULL UNIQUE,          -- Custom code or barcode
    main_cat_id         VARCHAR(20) NOT NULL,
    sub_cat_id          VARCHAR(20) NULL,
    product_name        NVARCHAR(200) NOT NULL,
    net_weight          VARCHAR(50) NULL,                 -- '450g', '1kg', '2lbs'
    unit_price          DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    is_discountable     BIT NOT NULL DEFAULT 0,           -- 1 = 'Discount', 0 = 'Non Discount'
    description         NVARCHAR(MAX) NULL,
    is_available        BIT NOT NULL DEFAULT 1,           -- 1 = Available, 0 = Out of Stock
    danupos_item_code   VARCHAR(50) NULL,                 -- Cross-reference with DanuPOS SQL Database
    created_at          DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Products_MainCategory FOREIGN KEY (main_cat_id) 
        REFERENCES dbo.MainCategories(main_cat_id),
    CONSTRAINT FK_Products_SubCategory FOREIGN KEY (sub_cat_id) 
        REFERENCES dbo.SubCategories(sub_cat_id)
);
GO

-- Indexes for instant counter autocomplete & barcode lookup
CREATE NONCLUSTERED INDEX IX_Products_Name ON dbo.Products(product_name);
CREATE NONCLUSTERED INDEX IX_Products_Code ON dbo.Products(product_code);
CREATE NONCLUSTERED INDEX IX_Products_DanuPOS ON dbo.Products(danupos_item_code);
GO

-- ============================================================================
-- 6. ORDERS (PRE-ORDER MASTER HEADER) TABLE
-- Corresponds to Menu 3.1 & 3.2 (/add-order, /manage_orders) [Screenshots #08-#12]
-- ============================================================================
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
GO

CREATE TABLE dbo.Orders (
    order_id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    order_number        VARCHAR(50) NOT NULL UNIQUE,      -- e.g. 'TRB-2026-0001' (Printed barcode)
    invoice_no          VARCHAR(50) NULL,                 -- Formal A5 Invoice Number
    customer_id         INT NOT NULL,
    ordered_by          NVARCHAR(100) NULL,               -- Contact person name if placed on behalf
    order_date          DATETIME NOT NULL DEFAULT GETDATE(),
    delivery_date       DATE NOT NULL,                    -- d_delivery
    delivery_time       VARCHAR(30) NOT NULL,             -- time (e.g. '10:30 AM', '04:00 PM')
    delivery_type       VARCHAR(30) NOT NULL DEFAULT 'Showroom Pickup', -- 'Showroom Pickup' / 'Delivery'
    delivery_address    NVARCHAR(500) NULL,               -- Showroom address or delivery address
    
    -- Financial Totals
    sub_total           DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    discount_amount     DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    total_amount        DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    advance_amount      DECIMAL(18,2) NOT NULL DEFAULT 0.00, -- Deposit paid at booking
    balance_amount      DECIMAL(18,2) NOT NULL DEFAULT 0.00, -- Remaining balance to settle
    
    -- Status Lifecycles
    order_status        VARCHAR(30) NOT NULL DEFAULT 'Pending', 
    -- 'Pending', 'Authorized', 'Baking', 'Ready', 'Delivered', 'Cancelled'
    
    payment_status      VARCHAR(30) NOT NULL DEFAULT 'Advance Paid',
    -- 'Unpaid', 'Advance Paid', 'Fully Paid', 'Refunded'
    
    -- User Audits
    created_by_user_id  INT NOT NULL,
    authorized_by_user_id INT NULL,
    authorized_at       DATETIME NULL,
    cancelled_by_user_id  INT NULL,
    cancellation_reason NVARCHAR(500) NULL,
    cancelled_at        DATETIME NULL,
    updated_at          DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Orders_Customer FOREIGN KEY (customer_id) 
        REFERENCES dbo.Customers(customer_id),
    CONSTRAINT FK_Orders_CreatedByUser FOREIGN KEY (created_by_user_id) 
        REFERENCES dbo.Users(user_id)
);
GO

-- High-speed indexes for Kitchen display and date filters
CREATE NONCLUSTERED INDEX IX_Orders_DeliveryDate ON dbo.Orders(delivery_date, delivery_time);
CREATE NONCLUSTERED INDEX IX_Orders_Status ON dbo.Orders(order_status);
CREATE NONCLUSTERED INDEX IX_Orders_Customer ON dbo.Orders(customer_id);
GO

-- ============================================================================
-- 7. ORDER ITEMS & CAKE CUSTOMIZATION SPECIFICATIONS TABLE
-- Corresponds to Menu 3.1 (/add-order) Item Grid [Screenshot #08]
-- Captures exact trbsys.net Cake Greeting fields (1st-29th, Occasions, Icing text)
-- ============================================================================
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
GO

CREATE TABLE dbo.OrderItems (
    order_item_id       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    order_id            INT NOT NULL,
    product_id          INT NOT NULL,
    product_name        NVARCHAR(200) NOT NULL,
    quantity            DECIMAL(10,2) NOT NULL DEFAULT 1.00, -- odr_qty
    unit_price          DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    total_price         DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    item_notes          NVARCHAR(500) NULL,                 -- odr_gre_des (Special instruction)
    
    -- EXACT TRBSYS.NET CAKE CUSTOMIZATION ATTRIBUTES
    greeting_milestone  VARCHAR(30) NULL,  -- 'None', '1st', '2nd', '3rd', ... '29th'
    greeting_occasion   VARCHAR(100) NULL, -- 'None', 'Happy Birthday', 'Happy Anniversary', 
                                           -- 'Happy Holy Communion', 'Congratulations', 'Happy Valentine''s Day'
    greeting_icing_text NVARCHAR(500) NULL,-- Greetings info2 (Recipient Name / Custom cake wording)
    cake_shape_flavor   VARCHAR(100) NULL, -- Ribbon, Chocolate, Coffee, Butter, Round, Heart, Square
    cake_colour_theme   VARCHAR(100) NULL, -- Pink & White, Blue & Gold, etc.
    
    kitchen_status      VARCHAR(30) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Baking', 'Decorating', 'Completed'
    
    CONSTRAINT FK_OrderItems_Order FOREIGN KEY (order_id) 
        REFERENCES dbo.Orders(order_id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Product FOREIGN KEY (product_id) 
        REFERENCES dbo.Products(product_id)
);
GO

CREATE NONCLUSTERED INDEX IX_OrderItems_OrderId ON dbo.OrderItems(order_id);
GO

-- ============================================================================
-- 8. ORDER PAYMENTS (ADVANCE & BALANCE SETTLEMENT) TABLE
-- Corresponds to Menu 3.3 (Make Payment Modal) & Menu 6 (Payment Reports)
-- [Screenshots #08, #18, #19]
-- ============================================================================
IF OBJECT_ID('dbo.OrderPayments', 'U') IS NOT NULL DROP TABLE dbo.OrderPayments;
GO

CREATE TABLE dbo.OrderPayments (
    payment_id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    order_id            INT NOT NULL,
    receipt_no          VARCHAR(50) NOT NULL UNIQUE,       -- Printed on 80mm thermal receipt
    payment_type        VARCHAR(30) NOT NULL,              -- 'Advance Deposit', 'Balance Settlement', 'Full Payment', 'Refund'
    payment_method      VARCHAR(30) NOT NULL DEFAULT 'Cash',-- 'Cash', 'Card / POS', 'Bank Transfer', 'Credit'
    amount_paid         DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    tendered_amount     DECIMAL(18,2) NULL,                -- Cash handed by customer
    change_returned     DECIMAL(18,2) NULL,                -- Change given back
    danupos_ref_no      VARCHAR(100) NULL,                 -- Cross-POS reference transaction ID
    notes               NVARCHAR(255) NULL,
    cashier_user_id     INT NOT NULL,
    payment_date        DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_OrderPayments_Order FOREIGN KEY (order_id) 
        REFERENCES dbo.Orders(order_id),
    CONSTRAINT FK_OrderPayments_User FOREIGN KEY (cashier_user_id) 
        REFERENCES dbo.Users(user_id)
);
GO

CREATE NONCLUSTERED INDEX IX_OrderPayments_OrderId ON dbo.OrderPayments(order_id);
CREATE NONCLUSTERED INDEX IX_OrderPayments_Date ON dbo.OrderPayments(payment_date);
GO

-- ============================================================================
-- 9. KITCHEN PRODUCTION & CHEF WORKSHEET TABLE
-- Corresponds to Menu 4 (/reports_cheff) & Menu 5 (/delivery) [Screenshots #13, #21]
-- ============================================================================
IF OBJECT_ID('dbo.KitchenProduction', 'U') IS NOT NULL DROP TABLE dbo.KitchenProduction;
GO

CREATE TABLE dbo.KitchenProduction (
    production_id       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    order_item_id       INT NOT NULL UNIQUE,
    assigned_chef       NVARCHAR(100) NULL, -- 'Cheff Premaratna', 'Cheff Wickramapala'
    scheduled_bake_date DATE NOT NULL,
    delivery_time_slot  VARCHAR(30) NOT NULL,
    production_status   VARCHAR(30) NOT NULL DEFAULT 'Queued', -- 'Queued', 'In Oven', 'Decorating', 'Finished'
    completed_at        DATETIME NULL,
    remarks             NVARCHAR(500) NULL,
    
    CONSTRAINT FK_KitchenProduction_OrderItem FOREIGN KEY (order_item_id) 
        REFERENCES dbo.OrderItems(order_item_id) ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_KitchenProduction_Schedule ON dbo.KitchenProduction(scheduled_bake_date, delivery_time_slot);
GO

-- ============================================================================
-- 10. SYSTEM CONFIGURATION & STORE SETTINGS TABLE
-- ============================================================================
IF OBJECT_ID('dbo.StoreSettings', 'U') IS NOT NULL DROP TABLE dbo.StoreSettings;
GO

CREATE TABLE dbo.StoreSettings (
    setting_key         VARCHAR(50) NOT NULL PRIMARY KEY,
    setting_value       NVARCHAR(MAX) NOT NULL,
    description         NVARCHAR(200) NULL
);
GO

-- ============================================================================
-- 11. AUDIT LOGS TABLE (For Security, Price Changes & Cancellations)
-- Corresponds to Menu 3.4 (/cancel_orders) [Screenshot #09]
-- ============================================================================
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
GO

CREATE TABLE dbo.AuditLogs (
    log_id              BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    action_type         VARCHAR(50) NOT NULL, -- 'ORDER_CANCELLED', 'PRICE_OVERRIDE', 'BILL_AUTHORIZED', 'LOGIN'
    table_name          VARCHAR(50) NULL,
    record_id           INT NULL,
    user_id             INT NULL,
    description         NVARCHAR(MAX) NOT NULL,
    ip_address          VARCHAR(50) NULL,
    log_time            DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================================
-- 12. REPORTING VIEWS (For Chef Sheets, Deliveries & Management)
-- ============================================================================

-- View 1: Chef Production Daily Worksheet (/reports_cheff)
GO
CREATE OR ALTER VIEW dbo.vw_ChefProductionWorksheet AS
SELECT 
    kp.production_id,
    o.order_number,
    c.first_name + ' ' + ISNULL(c.last_name, '') AS customer_name,
    c.mobile AS customer_mobile,
    o.delivery_date,
    o.delivery_time,
    p.product_name,
    oi.quantity,
    p.net_weight,
    oi.greeting_milestone,
    oi.greeting_occasion,
    oi.greeting_icing_text,
    oi.cake_shape_flavor,
    oi.item_notes,
    kp.assigned_chef,
    kp.production_status,
    o.order_status
FROM dbo.KitchenProduction kp
INNER JOIN dbo.OrderItems oi ON kp.order_item_id = oi.order_item_id
INNER JOIN dbo.Orders o ON oi.order_id = o.order_id
INNER JOIN dbo.Products p ON oi.product_id = p.product_id
INNER JOIN dbo.Customers c ON o.customer_id = c.customer_id
WHERE o.order_status NOT IN ('Cancelled');
GO

-- View 2: Today's Delivery & Collection Run Sheet (/delivery)
GO
CREATE OR ALTER VIEW dbo.vw_TodayDeliverySheet AS
SELECT 
    o.order_id,
    o.order_number,
    c.first_name + ' ' + ISNULL(c.last_name, '') AS customer_name,
    c.mobile,
    o.delivery_date,
    o.delivery_time,
    o.delivery_type,
    o.delivery_address,
    o.total_amount,
    o.advance_amount,
    o.balance_amount,
    o.payment_status,
    o.order_status
FROM dbo.Orders o
INNER JOIN dbo.Customers c ON o.customer_id = c.customer_id
WHERE o.order_status NOT IN ('Cancelled');
GO

-- ============================================================================
-- 13. SEED DATA (Default Users, Categories, Settings)
-- ============================================================================

-- Insert Default Administrative & Staff Users
INSERT INTO dbo.Users (username, password_hash, full_name, user_role, is_active)
VALUES 
('admin', 'Admin@Royal508501', N'System Administrator', 'Admin', 1),
('supervisor', 'Super@TRB2026', N'Showroom Floor Supervisor', 'Supervisor', 1),
('cashier1', 'Cashier@TRB1', N'Showroom Counter Cashier 01', 'Cashier', 1),
('chef_prema', 'Chef@Prema2026', N'Cheff Premaratna', 'Kitchen', 1),
('chef_wickrama', 'Chef@Wickrama2026', N'Cheff Wickramapala', 'Kitchen', 1);

-- Insert Default Main Categories matching trbsys.net
INSERT INTO dbo.MainCategories (main_cat_id, category_name, chef_description, display_order)
VALUES 
('MCAT1', 'Cake', N'Cheff Premaratna', 1),
('MCAT2', 'Cake-2', N'Cheff Wickramapala', 2),
('MCAT3', 'Bread', N'Cheff Wickramapala', 3),
('MCAT4', 'Pastry', N'Cheff Premaratna', 4),
('MCAT5', 'Shoteats', N'Cheff Premaratna', 5),
('MCAT6', 'Showroom', N'Floor Manager', 6),
('MCAT7', 'Restaurant', N'Restaurant Chef', 7),
('MCAT8', 'Kitchen', N'Head Kitchen Chef', 8);

-- Insert Default Sub Categories
INSERT INTO dbo.SubCategories (sub_cat_id, main_cat_id, sub_category_name, description)
VALUES 
('SCAT1', 'MCAT1', 'Drawing Cakes', N'Artistic decorated custom theme cakes'),
('SCAT2', 'MCAT1', 'Structure Cakes', N'Multi-tier wedding and anniversary cakes'),
('SCAT3', 'MCAT1', 'Cake Pieces', N'Gateaux and individual dessert slices'),
('SCAT4', 'MCAT3', 'Buns', N'Daily fresh bakery buns'),
('SCAT5', 'MCAT3', 'Special Loaves', N'Sandwich, brown, and whole-wheat bread');

-- Insert Initial Store Settings
INSERT INTO dbo.StoreSettings (setting_key, setting_value, description)
VALUES 
('STORE_NAME', N'The Royal Bakery', N'Official Business Name'),
('STORE_ADDRESS', N'No. 508, Galle Road, Colombo 06', N'Showroom Address'),
('STORE_HOTLINE', N'011-2588501 / 011-2508501', N'Contact Numbers'),
('RECEIPT_FOOTER', N'Thank you for ordering with The Royal Bakery! Please bring this slip for pickup.', N'80mm Slip Footer Notice');

PRINT '>> TRB Pre-Order MSSQL Database Schema created & seeded successfully!';
GO