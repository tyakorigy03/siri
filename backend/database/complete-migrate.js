

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'business_accounting',
  multipleStatements: true
};

async function migrate() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 Connected to MySQL database');

    // Drop all tables
    console.log('🗑️  Dropping existing tables...');
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
    
    const dropTables = [
      'audit_logs', 'notifications', 'commission_earned', 'commission_rules',
      'deliveries', 'delivery_zones', 'service_bookings', 'services',
      'loan_payments', 'loans', 'depreciation_entries', 'assets',
      'social_security_contributions', 'payroll', 'employees',
      'expenses', 'expense_categories', 'regulatory_payments',
      'income_tax_entries', 'tax_configurations', 'vat_entries',
      'cashbook_entries', 'staff_cash_sessions', 'bank_reconciliations',
      'bank_transactions', 'bank_accounts', 'loyalty_transactions',
      'customer_loyalty_points', 'loyalty_programs', 'customer_statements',
      'receivables', 'product_exchanges', 'refunds', 'payments', 'promotion_usage',
      'sale_items', 'sales', 'quotation_items', 'quotations', 'business_days',
      'supplier_payments', 'purchase_invoice_items', 'purchase_invoices',
      'purchase_order_items', 'purchase_orders', 'stock_transfer_items',
      'stock_transfers', 'serial_numbers', 'product_batches', 'inventory_forecast',
      'inventory_movements', 'inventory_stock', 'warehouses', 'product_pricing_tiers',
      'product_variants', 'product_attributes', 'products', 'customer_groups',
      'customers', 'suppliers', 'user_branches', 'users', 'branches', 'business',
      'exchange_rate_history', 'currencies'
    ];
    
    for (const table of dropTables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    
    await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);
    console.log('✓ Tables dropped\n');

    console.log('📦 Creating tables...\n');

    // ============================================================
    // PHASE 1: CORE MASTER TABLES
    // ============================================================
    console.log('Creating Phase 1: Core Master Tables...');
    
    await connection.query(`
      CREATE TABLE currencies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(3) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        symbol VARCHAR(10),
        exchange_rate DECIMAL(12,6) DEFAULT 1.000000,
        is_base BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE exchange_rate_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        currency_code VARCHAR(3) NOT NULL,
        rate DECIMAL(12,6) NOT NULL,
        effective_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (currency_code) REFERENCES currencies(code) ON DELETE CASCADE,
        INDEX idx_currency_date (currency_code, effective_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE business (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tin VARCHAR(50),
        business_type ENUM('RETAIL', 'WHOLESALE', 'RESTAURANT', 'HOTEL', 'SERVICE', 'MANUFACTURING', 'MIXED') DEFAULT 'RETAIL',
        vat_enabled BOOLEAN DEFAULT FALSE,
        default_vat_rate DECIMAL(5,2) DEFAULT 18.00,
        pricing_mode ENUM('INCLUSIVE', 'EXCLUSIVE') DEFAULT 'INCLUSIVE',
        base_currency VARCHAR(3) DEFAULT 'RWF',
        fiscal_year_start INT DEFAULT 1,
        logo_url VARCHAR(500),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (base_currency) REFERENCES currencies(code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE branches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        branch_type ENUM('MAIN', 'STORE', 'WAREHOUSE', 'OFFICE', 'OUTLET') DEFAULT 'STORE',
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(255),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        INDEX idx_business_id (business_id),
        INDEX idx_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        role ENUM('owner', 'manager', 'cashier', 'storekeeper', 'accountant', 'receptionist', 'driver', 'salesperson') NOT NULL,
        phone VARCHAR(20),
        dashboard_preferences JSON,
        active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE user_branches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        branch_id INT NOT NULL,
        role VARCHAR(50),
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_branch (user_id, branch_id),
        INDEX idx_user_id (user_id),
        INDEX idx_branch_id (branch_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE customer_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        discount_percentage DECIMAL(5,2) DEFAULT 0.00,
        credit_limit_multiplier DECIMAL(5,2) DEFAULT 1.00,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        customer_group_id INT,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        tin VARCHAR(50),
        address TEXT,
        credit_allowed BOOLEAN DEFAULT FALSE,
        credit_limit DECIMAL(15,2) DEFAULT 0.00,
        credit_terms INT DEFAULT 30,
        current_balance DECIMAL(15,2) DEFAULT 0.00,
        total_purchases DECIMAL(15,2) DEFAULT 0.00,
        credit_score ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BLOCKED') DEFAULT 'GOOD',
        last_payment_date DATE,
        notes TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_group_id) REFERENCES customer_groups(id) ON DELETE SET NULL,
        INDEX idx_phone (phone),
        INDEX idx_business (business_id),
        INDEX idx_credit_score (credit_score)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        tin VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        payment_terms VARCHAR(100),
        credit_limit DECIMAL(15,2) DEFAULT 0.00,
        current_balance DECIMAL(15,2) DEFAULT 0.00,
        total_purchases DECIMAL(15,2) DEFAULT 0.00,
        rating ENUM('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR') DEFAULT 'GOOD',
        notes TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        INDEX idx_business (business_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE product_attributes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        attribute_values JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        barcode VARCHAR(100),
        category VARCHAR(100),
        subcategory VARCHAR(100),
        description TEXT,
        has_variants BOOLEAN DEFAULT FALSE,
        vat_applicable BOOLEAN DEFAULT TRUE,
        vat_rate DECIMAL(5,2) DEFAULT 18.00,
        sale_price DECIMAL(15,2) NOT NULL,
        cost_price DECIMAL(15,2),
        stock_unit ENUM('PCS', 'KG', 'G', 'L', 'ML', 'M', 'CM', 'BOX', 'PACK') DEFAULT 'PCS',
        min_stock_level DECIMAL(15,3) DEFAULT 0.000,
        max_stock_level DECIMAL(15,3) DEFAULT 0.000,
        reorder_point DECIMAL(15,3) DEFAULT 0.000,
        suggested_reorder_quantity DECIMAL(15,3) DEFAULT 0.000,
        track_serial BOOLEAN DEFAULT FALSE,
        track_batch BOOLEAN DEFAULT FALSE,
        image_url VARCHAR(500),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        INDEX idx_business (business_id),
        INDEX idx_sku (sku),
        INDEX idx_barcode (barcode),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variant_name VARCHAR(255),
        sku VARCHAR(100) UNIQUE,
        barcode VARCHAR(100) UNIQUE,
        attributes JSON,
        sale_price DECIMAL(15,2),
        cost_price DECIMAL(15,2),
        image_url VARCHAR(500),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product (product_id),
        INDEX idx_sku (sku)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE product_pricing_tiers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        variant_id INT,
        customer_group_id INT NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        min_quantity DECIMAL(15,3) DEFAULT 1.000,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_group_id) REFERENCES customer_groups(id) ON DELETE CASCADE,
        INDEX idx_product_group (product_id, customer_group_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 1 completed\n');

    // ============================================================
    // PHASE 2: INVENTORY & WAREHOUSE
    // ============================================================
    console.log('Creating Phase 2: Inventory & Warehouse...');
    
    await connection.query(`
      CREATE TABLE warehouses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        branch_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        warehouse_type ENUM('MAIN', 'RETAIL', 'TRANSIT', 'COLD_STORAGE') DEFAULT 'MAIN',
        address TEXT,
        capacity_sqm DECIMAL(10,2),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        INDEX idx_branch_id (branch_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE inventory_stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variant_id INT,
        warehouse_id INT NOT NULL,
        quantity DECIMAL(15,3) DEFAULT 0.000,
        reserved_quantity DECIMAL(15,3) DEFAULT 0.000,
        last_counted_at TIMESTAMP NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_warehouse_id (warehouse_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE product_batches (
        id VARCHAR(50) PRIMARY KEY,
        product_id INT NOT NULL,
        variant_id INT,
        warehouse_id INT NOT NULL,
        batch_number VARCHAR(100) NOT NULL,
        manufacture_date DATE,
        expiry_date DATE,
        quantity DECIMAL(15,3) NOT NULL,
        cost_price DECIMAL(15,2),
        status ENUM('ACTIVE', 'EXPIRED', 'RECALLED', 'SOLD_OUT') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        INDEX idx_expiry (expiry_date),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE serial_numbers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variant_id INT,
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        warehouse_id INT,
        status ENUM('IN_STOCK', 'SOLD', 'RETURNED', 'DEFECTIVE', 'WARRANTY') DEFAULT 'IN_STOCK',
        sale_id VARCHAR(50),
        purchase_date DATE,
        warranty_expiry DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_serial (serial_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE inventory_movements (
        id VARCHAR(50) PRIMARY KEY,
        product_id INT NOT NULL,
        variant_id INT,
        warehouse_id INT NOT NULL,
        movement_type ENUM('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN', 'RETURN', 'DAMAGE', 'COUNT') NOT NULL,
        quantity_in DECIMAL(15,3) DEFAULT 0.000,
        quantity_out DECIMAL(15,3) DEFAULT 0.000,
        batch_id VARCHAR(50),
        reference_type VARCHAR(50),
        reference_id VARCHAR(50),
        cost_price DECIMAL(15,2),
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_product_id (product_id),
        INDEX idx_warehouse_id (warehouse_id),
        INDEX idx_type (movement_type),
        INDEX idx_reference (reference_type, reference_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE stock_transfers (
        id VARCHAR(50) PRIMARY KEY,
        from_warehouse_id INT NOT NULL,
        to_warehouse_id INT NOT NULL,
        status ENUM('PENDING', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED') DEFAULT 'PENDING',
        requested_by INT NOT NULL,
        approved_by INT,
        shipped_by INT,
        received_by INT,
        transfer_date DATE,
        expected_date DATE,
        received_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_from_warehouse (from_warehouse_id),
        INDEX idx_to_warehouse (to_warehouse_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE stock_transfer_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transfer_id VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        variant_id INT,
        batch_id VARCHAR(50),
        quantity_requested DECIMAL(15,3) NOT NULL,
        quantity_shipped DECIMAL(15,3) DEFAULT 0.000,
        quantity_received DECIMAL(15,3) DEFAULT 0.000,
        notes TEXT,
        FOREIGN KEY (transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        INDEX idx_transfer (transfer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE inventory_forecast (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variant_id INT,
        warehouse_id INT NOT NULL,
        forecasted_demand_next_period DECIMAL(15,3),
        suggested_order_quantity DECIMAL(15,3),
        forecast_period VARCHAR(7),
        confidence_score DECIMAL(5,2),
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        alert_flag BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        INDEX idx_alert_flag (alert_flag),
        INDEX idx_period (forecast_period)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 2 completed\n');

    // Continue with remaining phases...
    console.log('Creating Phase 3: Purchasing...');
    
    await connection.query(`
      CREATE TABLE purchase_orders (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        supplier_id INT NOT NULL,
        warehouse_id INT NOT NULL,
        order_number VARCHAR(100) UNIQUE,
        status ENUM('DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED') DEFAULT 'DRAFT',
        order_date DATE NOT NULL,
        expected_date DATE,
        received_date DATE,
        total_amount DECIMAL(15,2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'RWF',
        exchange_rate DECIMAL(12,6) DEFAULT 1.000000,
        notes TEXT,
        created_by INT,
        approved_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_supplier_id (supplier_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE purchase_order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_order_id VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        variant_id INT,
        quantity DECIMAL(15,3) NOT NULL,
        unit_cost DECIMAL(15,2) NOT NULL,
        line_total DECIMAL(15,2) NOT NULL,
        received_quantity DECIMAL(15,3) DEFAULT 0.000,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        INDEX idx_purchase_order (purchase_order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE purchase_invoices (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        supplier_id INT NOT NULL,
        purchase_order_id VARCHAR(50),
        invoice_number VARCHAR(100),
        invoice_date DATE NOT NULL,
        due_date DATE,
        total_excl_vat DECIMAL(15,2) NOT NULL,
        vat_amount DECIMAL(15,2) DEFAULT 0.00,
        withholding_tax_rate DECIMAL(5,2) DEFAULT 0.00,
        withholding_tax_amount DECIMAL(15,2) DEFAULT 0.00,
        import_duty DECIMAL(15,2) DEFAULT 0.00,
        total_incl_vat DECIMAL(15,2) NOT NULL,
        net_payable DECIMAL(15,2),
        amount_paid DECIMAL(15,2) DEFAULT 0.00,
        amount_remaining DECIMAL(15,2),
        status ENUM('DRAFT', 'UNPAID', 'PARTIAL', 'PAID', 'OVERDUE') DEFAULT 'UNPAID',
        currency VARCHAR(3) DEFAULT 'RWF',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_supplier_id (supplier_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE purchase_invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_invoice_id VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        variant_id INT,
        batch_number VARCHAR(100),
        quantity DECIMAL(15,3) NOT NULL,
        unit_cost DECIMAL(15,2) NOT NULL,
        line_total DECIMAL(15,2) NOT NULL,
        FOREIGN KEY (purchase_invoice_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        INDEX idx_purchase_invoice_id (purchase_invoice_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE supplier_payments (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        supplier_id INT NOT NULL,
        purchase_invoice_id VARCHAR(50),
        payment_date DATE NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        payment_method ENUM('CASH', 'BANK_TRANSFER', 'CHECK', 'MOMO') NOT NULL,
        reference_number VARCHAR(100),
        currency VARCHAR(3) DEFAULT 'RWF',
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (purchase_invoice_id) REFERENCES purchase_invoices(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_supplier (supplier_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 3 completed\n');

    console.log('Creating Phase 4: Sales & POS...');
    
    await connection.query(`
      CREATE TABLE business_days (
        id VARCHAR(50) PRIMARY KEY,
        branch_id INT NOT NULL,
        business_date DATE NOT NULL,
        opened_at TIMESTAMP NOT NULL,
        closed_at TIMESTAMP NULL,
        opening_float DECIMAL(15,2) DEFAULT 0.00,
        expected_closing_cash DECIMAL(15,2) DEFAULT 0.00,
        actual_closing_cash DECIMAL(15,2) DEFAULT 0.00,
        variance DECIMAL(15,2) DEFAULT 0.00,
        status ENUM('OPEN', 'CLOSED', 'RECONCILED') DEFAULT 'OPEN',
        closed_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_branch_id (branch_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE quotations (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        branch_id INT NOT NULL,
        customer_id INT NOT NULL,
        quotation_number VARCHAR(100) UNIQUE,
        quotation_date DATE NOT NULL,
        valid_until DATE,
        total_excl_vat DECIMAL(15,2) NOT NULL,
        vat_amount DECIMAL(15,2) DEFAULT 0.00,
        total_incl_vat DECIMAL(15,2) NOT NULL,
        status ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED') DEFAULT 'DRAFT',
        currency VARCHAR(3) DEFAULT 'RWF',
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_customer (customer_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE quotation_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quotation_id VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        variant_id INT,
        quantity DECIMAL(15,3) NOT NULL,
        unit_price DECIMAL(15,2) NOT NULL,
        line_total DECIMAL(15,2) NOT NULL,
        FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        INDEX idx_quotation (quotation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE promotions (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        promotion_type ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'BUNDLE') DEFAULT 'PERCENTAGE',
        discount_value DECIMAL(15,2),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE sales (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        branch_id INT NOT NULL,
        warehouse_id INT NOT NULL,
        channel ENUM('POS', 'FRONTDESK', 'ONLINE', 'PHONE') NOT NULL,
        customer_id INT,
        sale_number VARCHAR(100) UNIQUE,
        sale_date DATE NOT NULL,
        total_excl_vat DECIMAL(15,2) NOT NULL,
        vat_amount DECIMAL(15,2) DEFAULT 0.00,
        total_incl_vat DECIMAL(15,2) NOT NULL,
        discount_amount DECIMAL(15,2) DEFAULT 0.00,
        grand_total DECIMAL(15,2) NOT NULL,
        amount_paid DECIMAL(15,2) DEFAULT 0.00,
        payment_status ENUM('PAID', 'PARTIAL', 'UNPAID', 'CREDIT') DEFAULT 'PAID',
        business_day_id VARCHAR(50),
        currency VARCHAR(3) DEFAULT 'RWF',
        notes TEXT,
        served_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        FOREIGN KEY (business_day_id) REFERENCES business_days(id) ON DELETE SET NULL,
        FOREIGN KEY (served_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_branch_id (branch_id),
        INDEX idx_payment_status (payment_status),
        INDEX idx_sale_date (sale_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        variant_id INT,
        quantity DECIMAL(15,3) NOT NULL,
        unit_price DECIMAL(15,2) NOT NULL,
        discount DECIMAL(15,2) DEFAULT 0.00,
        line_total DECIMAL(15,2) NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        INDEX idx_sale_id (sale_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE promotion_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        promotion_id VARCHAR(50) NOT NULL,
        sale_id VARCHAR(50) NOT NULL,
        discount_applied DECIMAL(15,2) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE payments (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        sale_id VARCHAR(50) NOT NULL,
        payment_date DATE NOT NULL,
        method ENUM('CASH', 'MOMO', 'CARD', 'BANK_TRANSFER', 'CHECK') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'RWF',
        reference_number VARCHAR(100),
        received_by INT,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_sale_id (sale_id),
        INDEX idx_method (method)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE refunds (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        original_sale_id VARCHAR(50) NOT NULL,
        refund_type ENUM('CASH_REFUND', 'CREDIT_NOTE', 'EXCHANGE') DEFAULT 'CASH_REFUND',
        refund_date DATE NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        vat_amount DECIMAL(15,2) DEFAULT 0.00,
        reason TEXT,
        status ENUM('PENDING', 'APPROVED', 'COMPLETED') DEFAULT 'PENDING',
        approved_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (original_sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_original_sale_id (original_sale_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE product_exchanges (
        id VARCHAR(50) PRIMARY KEY,
        refund_id VARCHAR(50) NOT NULL,
        original_sale_id VARCHAR(50) NOT NULL,
        new_sale_id VARCHAR(50),
        returned_product_id INT NOT NULL,
        exchanged_product_id INT NOT NULL,
        price_difference DECIMAL(15,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE CASCADE,
        FOREIGN KEY (original_sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (returned_product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (exchanged_product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 4 completed\n');

    console.log('Creating Phase 5: Customer Accounts...');
    
    await connection.query(`
      CREATE TABLE receivables (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        customer_id INT NOT NULL,
        sale_id VARCHAR(50) NOT NULL,
        amount_due DECIMAL(15,2) NOT NULL,
        amount_paid DECIMAL(15,2) DEFAULT 0.00,
        due_date DATE,
        status ENUM('OPEN', 'PARTIAL', 'PAID', 'OVERDUE') DEFAULT 'OPEN',
        reminder_flag BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        INDEX idx_customer_id (customer_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE customer_statements (
        id VARCHAR(50) PRIMARY KEY,
        customer_id INT NOT NULL,
        transaction_date DATE NOT NULL,
        transaction_type ENUM('SALE', 'PAYMENT', 'REFUND', 'ADJUSTMENT') NOT NULL,
        reference_id VARCHAR(50),
        debit DECIMAL(15,2) DEFAULT 0.00,
        credit DECIMAL(15,2) DEFAULT 0.00,
        balance DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        INDEX idx_customer_date (customer_id, transaction_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE loyalty_programs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        points_per_currency DECIMAL(10,2) DEFAULT 1.00,
        redemption_rate DECIMAL(10,2) DEFAULT 100.00,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE customer_loyalty_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        loyalty_program_id INT NOT NULL,
        points_earned INT DEFAULT 0,
        points_redeemed INT DEFAULT 0,
        points_balance INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (loyalty_program_id) REFERENCES loyalty_programs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE loyalty_transactions (
        id VARCHAR(50) PRIMARY KEY,
        customer_id INT NOT NULL,
        transaction_type ENUM('EARN', 'REDEEM', 'EXPIRE', 'ADJUSTMENT') NOT NULL,
        points INT NOT NULL,
        reference_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 5 completed\n');

    console.log('Creating Phase 6: Financial Management...');
    
    await connection.query(`
      CREATE TABLE bank_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        branch_id INT,
        account_name VARCHAR(255) NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        account_type ENUM('CHECKING', 'SAVINGS', 'MOMO') DEFAULT 'CHECKING',
        currency VARCHAR(3) DEFAULT 'RWF',
        current_balance DECIMAL(15,2) DEFAULT 0.00,
        status ENUM('ACTIVE', 'INACTIVE', 'CLOSED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE bank_transactions (
        id VARCHAR(50) PRIMARY KEY,
        bank_account_id INT NOT NULL,
        transaction_date DATE NOT NULL,
        trans_type ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'FEE', 'INTEREST') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        balance_after DECIMAL(15,2),
        description TEXT,
        reconciled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
        INDEX idx_account_date (bank_account_id, transaction_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE bank_reconciliations (
        id VARCHAR(50) PRIMARY KEY,
        bank_account_id INT NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        statement_balance DECIMAL(15,2) NOT NULL,
        book_balance DECIMAL(15,2) NOT NULL,
        variance DECIMAL(15,2) DEFAULT 0.00,
        status ENUM('IN_PROGRESS', 'COMPLETED') DEFAULT 'IN_PROGRESS',
        reconciled_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (reconciled_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE staff_cash_sessions (
        id VARCHAR(50) PRIMARY KEY,
        user_id INT NOT NULL,
        branch_id INT NOT NULL,
        business_day_id VARCHAR(50),
        opening_float DECIMAL(15,2) DEFAULT 0.00,
        closing_cash DECIMAL(15,2) DEFAULT 0.00,
        variance DECIMAL(15,2) DEFAULT 0.00,
        status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
        alert_flag BOOLEAN DEFAULT FALSE,
        opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        FOREIGN KEY (business_day_id) REFERENCES business_days(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE cashbook_entries (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        business_day_id VARCHAR(50),
        staff_cash_session_id VARCHAR(50),
        branch_id INT NOT NULL,
        entry_type ENUM('IN', 'OUT') NOT NULL,
        source ENUM('SALE', 'PAYMENT', 'REFUND', 'EXPENSE', 'FLOAT', 'OTHER') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        reference_id VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (business_day_id) REFERENCES business_days(id) ON DELETE SET NULL,
        FOREIGN KEY (staff_cash_session_id) REFERENCES staff_cash_sessions(id) ON DELETE SET NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        INDEX idx_business_day_id (business_day_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 6 completed\n');

    console.log('Creating Phase 7: Tax Management...');
    
    await connection.query(`
      CREATE TABLE tax_configurations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        tax_type ENUM('VAT', 'INCOME_TAX', 'WITHHOLDING_TAX', 'PAYROLL_TAX') NOT NULL,
        tax_name VARCHAR(100) NOT NULL,
        rate DECIMAL(5,2) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE vat_entries (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        entry_type ENUM('INPUT', 'OUTPUT') NOT NULL,
        source_type ENUM('SALE', 'PURCHASE', 'REFUND') NOT NULL,
        source_id VARCHAR(50) NOT NULL,
        transaction_date DATE NOT NULL,
        taxable_amount DECIMAL(15,2) NOT NULL,
        vat_amount DECIMAL(15,2) NOT NULL,
        vat_rate DECIMAL(5,2) NOT NULL,
        period VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        INDEX idx_type (entry_type),
        INDEX idx_period (period)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE income_tax_entries (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        period VARCHAR(7) NOT NULL,
        fiscal_year INT NOT NULL,
        gross_revenue DECIMAL(15,2) NOT NULL,
        total_expenses DECIMAL(15,2) DEFAULT 0.00,
        taxable_income DECIMAL(15,2) NOT NULL,
        tax_rate DECIMAL(5,2) NOT NULL,
        tax_amount DECIMAL(15,2) NOT NULL,
        status ENUM('DRAFT', 'FILED', 'PAID') DEFAULT 'DRAFT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE regulatory_payments (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        payment_type ENUM('PROPERTY_TAX', 'BUSINESS_LICENSE', 'OTHER') NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        due_date DATE,
        status ENUM('UNPAID', 'PAID') DEFAULT 'UNPAID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 7 completed\n');

    console.log('Creating Phase 8: Expense & HR...');
    
    await connection.query(`
      CREATE TABLE expense_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20),
        is_tax_deductible BOOLEAN DEFAULT TRUE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE expenses (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        branch_id INT NOT NULL,
        category_id INT NOT NULL,
        expense_date DATE NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        vat_amount DECIMAL(15,2) DEFAULT 0.00,
        payment_method ENUM('CASH', 'BANK_TRANSFER', 'CARD', 'MOMO') NOT NULL,
        payee VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('DRAFT', 'APPROVED', 'PAID') DEFAULT 'DRAFT',
        approved_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_expense_date (expense_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        business_id INT NOT NULL,
        employee_number VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        tin VARCHAR(50),
        position VARCHAR(100),
        branch_id INT,
        basic_salary DECIMAL(15,2) NOT NULL,
        hire_date DATE NOT NULL,
        status ENUM('ACTIVE', 'TERMINATED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE payroll (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        employee_id INT NOT NULL,
        period VARCHAR(7) NOT NULL,
        payment_date DATE NOT NULL,
        basic_salary DECIMAL(15,2) NOT NULL,
        gross_salary DECIMAL(15,2) NOT NULL,
        paye_tax DECIMAL(15,2) DEFAULT 0.00,
        social_security DECIMAL(15,2) DEFAULT 0.00,
        total_deductions DECIMAL(15,2) NOT NULL,
        net_salary DECIMAL(15,2) NOT NULL,
        status ENUM('DRAFT', 'APPROVED', 'PAID') DEFAULT 'DRAFT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        INDEX idx_period (period)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE social_security_contributions (
        id VARCHAR(50) PRIMARY KEY,
        payroll_id VARCHAR(50) NOT NULL,
        employee_id INT NOT NULL,
        period VARCHAR(7) NOT NULL,
        employee_contribution DECIMAL(15,2) NOT NULL,
        employer_contribution DECIMAL(15,2) NOT NULL,
        total_contribution DECIMAL(15,2) NOT NULL,
        remittance_status ENUM('PENDING', 'REMITTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payroll_id) REFERENCES payroll(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 8 completed\n');

    console.log('Creating Phase 9: Assets & Loans...');
    
    await connection.query(`
      CREATE TABLE assets (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        branch_id INT,
        asset_name VARCHAR(255) NOT NULL,
        asset_type ENUM('BUILDING', 'VEHICLE', 'EQUIPMENT', 'FURNITURE', 'COMPUTER') NOT NULL,
        purchase_date DATE NOT NULL,
        purchase_cost DECIMAL(15,2) NOT NULL,
        useful_life_years INT NOT NULL,
        depreciation_method ENUM('STRAIGHT_LINE', 'DECLINING_BALANCE') DEFAULT 'STRAIGHT_LINE',
        accumulated_depreciation DECIMAL(15,2) DEFAULT 0.00,
        current_book_value DECIMAL(15,2),
        status ENUM('ACTIVE', 'DISPOSED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE depreciation_entries (
        id VARCHAR(50) PRIMARY KEY,
        asset_id VARCHAR(50) NOT NULL,
        period VARCHAR(7) NOT NULL,
        depreciation_amount DECIMAL(15,2) NOT NULL,
        accumulated_depreciation DECIMAL(15,2) NOT NULL,
        book_value DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE loans (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        loan_type ENUM('BANK_LOAN', 'SUPPLIER_CREDIT', 'PERSONAL_LOAN') NOT NULL,
        lender_name VARCHAR(255) NOT NULL,
        principal_amount DECIMAL(15,2) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        loan_start_date DATE NOT NULL,
        loan_end_date DATE NOT NULL,
        outstanding_balance DECIMAL(15,2),
        status ENUM('ACTIVE', 'PAID_OFF') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE loan_payments (
        id VARCHAR(50) PRIMARY KEY,
        loan_id VARCHAR(50) NOT NULL,
        payment_date DATE NOT NULL,
        principal_paid DECIMAL(15,2) NOT NULL,
        interest_paid DECIMAL(15,2) NOT NULL,
        total_payment DECIMAL(15,2) NOT NULL,
        outstanding_after_payment DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 9 completed\n');

    console.log('Creating Phase 10: Services & Deliveries...');
    
    await connection.query(`
      CREATE TABLE services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price DECIMAL(15,2) NOT NULL,
        vat_applicable BOOLEAN DEFAULT TRUE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE service_bookings (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        customer_id INT NOT NULL,
        service_id INT NOT NULL,
        branch_id INT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        amount DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE delivery_zones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        delivery_fee DECIMAL(15,2) NOT NULL,
        estimated_days INT DEFAULT 1,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE deliveries (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        sale_id VARCHAR(50) NOT NULL,
        delivery_zone_id INT,
        delivery_address TEXT NOT NULL,
        delivery_fee DECIMAL(15,2) DEFAULT 0.00,
        delivery_date DATE,
        driver_id INT,
        status ENUM('PENDING', 'DISPATCHED', 'DELIVERED', 'FAILED') DEFAULT 'PENDING',
        tracking_number VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (delivery_zone_id) REFERENCES delivery_zones(id) ON DELETE SET NULL,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_tracking (tracking_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 10 completed\n');

    console.log('Creating Phase 11: Commission & Analytics...');
    
    await connection.query(`
      CREATE TABLE commission_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        commission_type ENUM('PERCENTAGE', 'FIXED_PER_SALE') NOT NULL,
        commission_value DECIMAL(15,2) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE commission_earned (
        id VARCHAR(50) PRIMARY KEY,
        business_id INT NOT NULL,
        user_id INT NOT NULL,
        sale_id VARCHAR(50) NOT NULL,
        commission_amount DECIMAL(15,2) NOT NULL,
        period VARCHAR(7) NOT NULL,
        paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        INDEX idx_user_period (user_id, period)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 11 completed\n');

    console.log('Creating Phase 12: Notifications & Audit...');
    
    await connection.query(`
      CREATE TABLE notifications (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        user_id INT NOT NULL,
        notif_type ENUM('LOW_STOCK', 'OVERDUE_PAYMENT', 'CASH_VARIANCE', 'SYSTEM_ALERT', 'APPROVAL_REQUEST') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        reference_id VARCHAR(50),
        priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_unread (user_id, read_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        business_id INT NOT NULL,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        record_id VARCHAR(50) NOT NULL,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_table_record (table_name, record_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Phase 12 completed\n');

    console.log('\n✅ All tables created successfully!');
    console.log('==================================================');
    console.log('📊 Database Structure Summary:');
    console.log('==================================================');
    console.log('Phase 1:  Core Master Tables');
    console.log('Phase 2:  Inventory & Warehouse Management');
    console.log('Phase 3:  Purchasing & Supplier Management');
    console.log('Phase 4:  Sales & POS');
    console.log('Phase 5:  Customer Accounts & Loyalty');
    console.log('Phase 6:  Financial Management');
    console.log('Phase 7:  Tax Management');
    console.log('Phase 8:  Expense & HR Management');
    console.log('Phase 9:  Assets & Loans');
    console.log('Phase 10: Services & Deliveries');
    console.log('Phase 11: Commission & Analytics');
    console.log('Phase 12: Notifications & Audit');
    console.log('==================================================\n');
    console.log('🎯 System supports:');
    console.log('   ✓ Small retailers (1 user, 1 branch)');
    console.log('   ✓ Medium businesses (10-50 users, multiple branches)');
    console.log('   ✓ Large enterprises (100+ users, multiple businesses)');
    console.log('   ✓ Restaurants, Hotels, Retail, Wholesale, Services');
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });