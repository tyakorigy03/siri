// complete-seed.js - Complete MySQL Database Seeder
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'business_accounting',
  multipleStatements: true
};

// Helper function to generate readable IDs
function generateId(prefix, number) {
  const timestamp = Date.now().toString().slice(-6);
  const padded = number.toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${padded}`;
}

// Helper to get current date formatted
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function seed() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 Connected to MySQL database');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tablesToTruncate = [
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
    
    for (const table of tablesToTruncate) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Cleared existing data\n');

    // ============================================================
    // PHASE 1: CURRENCIES & BUSINESS
    // ============================================================
    console.log('📦 Seeding Phase 1: Currencies & Business...');
    
    await connection.query(`
      INSERT INTO currencies (code, name, symbol, exchange_rate, is_base, active)
      VALUES 
        ('RWF', 'Rwandan Franc', 'FRw', 1.000000, TRUE, TRUE),
        ('USD', 'US Dollar', '$', 0.001000, FALSE, TRUE),
        ('EUR', 'Euro', '€', 0.000900, FALSE, TRUE),
        ('KES', 'Kenyan Shilling', 'KSh', 0.130000, FALSE, TRUE)
    `);

    await connection.query(`
      INSERT INTO business (name, tin, business_type, vat_enabled, default_vat_rate, pricing_mode, base_currency, email, phone)
      VALUES ('TechRetail Group', 'TIN-123456789', 'RETAIL', TRUE, 18.00, 'INCLUSIVE', 'RWF', 'info@techretail.rw', '+250788123456')
    `);

    await connection.query(`
      INSERT INTO branches (business_id, name, code, branch_type, address, city, country, phone, active)
      VALUES 
        (1, 'Downtown Main Store', 'BR-DWTN', 'MAIN', 'KN 5 Ave, Kigali', 'Kigali', 'Rwanda', '+250788111222', TRUE),
        (1, 'Airport Branch', 'BR-ARPT', 'OUTLET', 'Kigali International Airport', 'Kigali', 'Rwanda', '+250788333444', TRUE),
        (1, 'Kimironko Store', 'BR-KIMI', 'STORE', 'Kimironko Market', 'Kigali', 'Rwanda', '+250788555666', TRUE)
    `);

    console.log('✓ Phase 1 completed\n');

    // ============================================================
    // PHASE 2: USERS & ROLES
    // ============================================================
    console.log('📦 Seeding Phase 2: Users & Roles...');
     const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);
    
    await connection.query(`
      INSERT INTO users (name, email, password_hash, role, phone, active)
      VALUES 
        ('John Doe', 'john@techretail.rw', '${password_hash}', 'owner', '+250788111001', TRUE),
        ('Jane Smith', 'jane@techretail.rw', '${password_hash}', 'manager', '+250788111002', TRUE),
        ('Mike Johnson', 'mike@techretail.rw', '${password_hash}', 'cashier', '+250788111003', TRUE),
        ('Sarah Williams', 'sarah@techretail.rw', '${password_hash}', 'storekeeper', '+250788111004', TRUE),
        ('David Brown', 'david@techretail.rw', '${password_hash}', 'accountant', '+250788111005', TRUE),
        ('Emma Davis', 'emma@techretail.rw', '${password_hash}', 'receptionist', '+250788111006', TRUE),
        ('James Wilson', 'james@techretail.rw', '${password_hash}', 'driver', '+250788111007', TRUE),
        ('Lisa Anderson', 'lisa@techretail.rw', '${password_hash}', 'salesperson', '+250788111008', TRUE)
    `);

    await connection.query(`
      INSERT INTO user_branches (user_id, branch_id, role, is_primary)
      VALUES 
        (1, 1, 'owner', TRUE),
        (1, 2, 'owner', FALSE),
        (1, 3, 'owner', FALSE),
        (2, 1, 'branch_manager', TRUE),
        (3, 1, 'cashier', TRUE),
        (4, 1, 'warehouse_supervisor', TRUE),
        (5, 1, 'head_accountant', TRUE),
        (6, 2, 'front_desk', TRUE),
        (7, 1, 'delivery_driver', TRUE),
        (8, 1, 'sales_rep', TRUE)
    `);

    console.log('✓ Phase 2 completed\n');

    // ============================================================
    // PHASE 3: CUSTOMERS & SUPPLIERS
    // ============================================================
    console.log('📦 Seeding Phase 3: Customers & Suppliers...');
    
    await connection.query(`
      INSERT INTO customer_groups (business_id, name, discount_percentage, description)
      VALUES 
        (1, 'Retail', 0.00, 'Walk-in retail customers'),
        (1, 'Wholesale', 10.00, 'Bulk buyers - 10% discount'),
        (1, 'VIP', 15.00, 'Premium customers - 15% discount'),
        (1, 'Corporate', 12.00, 'Corporate accounts')
    `);

    await connection.query(`
      INSERT INTO customers (business_id, customer_group_id, name, phone, email, credit_allowed, credit_limit, credit_terms, credit_score)
      VALUES 
        (1, 1, 'Walk-in Customer', NULL, NULL, FALSE, 0.00, 0, 'GOOD'),
        (1, 4, 'ABC Corporation Ltd', '+250788123456', 'accounts@abc.rw', TRUE, 5000000.00, 30, 'EXCELLENT'),
        (1, 4, 'XYZ Enterprises', '+250788987654', 'info@xyz.rw', TRUE, 3000000.00, 45, 'GOOD'),
        (1, 2, 'Prime Stores', '+250788555777', 'prime@stores.rw', TRUE, 2000000.00, 30, 'GOOD'),
        (1, 1, 'Individual Customer', '+250788666888', 'customer@email.com', FALSE, 0.00, 0, 'GOOD')
    `);

    await connection.query(`
      INSERT INTO suppliers (business_id, name, tin, phone, email, payment_terms, rating)
      VALUES 
        (1, 'Tech Distributors Ltd', 'SUP-TIN-111', '+250788111222', 'sales@techdist.rw', 'Net 30', 'EXCELLENT'),
        (1, 'Global Electronics Inc', 'SUP-TIN-222', '+250788333444', 'orders@global.com', 'Net 45', 'GOOD'),
        (1, 'Local Supplies Co', 'SUP-TIN-333', '+250788555777', 'info@localsupplies.rw', 'Net 15', 'GOOD'),
        (1, 'Premium Tech Imports', 'SUP-TIN-444', '+250788999000', 'imports@premtech.rw', 'Net 60', 'EXCELLENT')
    `);

    console.log('✓ Phase 3 completed\n');

    // ============================================================
    // PHASE 4: PRODUCTS & INVENTORY
    // ============================================================
    console.log('📦 Seeding Phase 4: Products & Inventory...');
    
    await connection.query(`
      INSERT INTO products (business_id, name, sku, barcode, category, vat_applicable, vat_rate, sale_price, cost_price, stock_unit, min_stock_level, reorder_point, suggested_reorder_quantity)
      VALUES 
        (1, 'Laptop Dell XPS 13', 'SKU-LAP-001', 'BAR-123456789', 'Electronics', TRUE, 18.00, 1500000.00, 1200000.00, 'PCS', 5.000, 10.000, 15.000),
        (1, 'iPhone 15 Pro', 'SKU-PHN-001', 'BAR-987654321', 'Electronics', TRUE, 18.00, 1800000.00, 1500000.00, 'PCS', 3.000, 8.000, 12.000),
        (1, 'Samsung Galaxy S24', 'SKU-PHN-002', 'BAR-456789123', 'Electronics', TRUE, 18.00, 1400000.00, 1150000.00, 'PCS', 5.000, 10.000, 15.000),
        (1, 'Wireless Mouse Logitech', 'SKU-ACC-001', 'BAR-789123456', 'Accessories', TRUE, 18.00, 35000.00, 25000.00, 'PCS', 20.000, 30.000, 50.000),
        (1, 'USB-C Cable', 'SKU-ACC-002', 'BAR-321654987', 'Accessories', TRUE, 18.00, 15000.00, 10000.00, 'PCS', 50.000, 75.000, 100.000),
        (1, 'External Hard Drive 1TB', 'SKU-STR-001', 'BAR-147258369', 'Storage', TRUE, 18.00, 180000.00, 140000.00, 'PCS', 10.000, 15.000, 25.000),
        (1, 'Bluetooth Headphones', 'SKU-AUD-001', 'BAR-963852741', 'Audio', TRUE, 18.00, 120000.00, 90000.00, 'PCS', 15.000, 20.000, 30.000),
        (1, 'Office Chair Executive', 'SKU-FUR-001', 'BAR-159753486', 'Furniture', TRUE, 18.00, 350000.00, 280000.00, 'PCS', 5.000, 8.000, 12.000),
        (1, 'Keyboard Mechanical RGB', 'SKU-ACC-003', 'BAR-753951456', 'Accessories', TRUE, 18.00, 85000.00, 65000.00, 'PCS', 10.000, 15.000, 25.000),
        (1, 'Monitor 27 inch 4K', 'SKU-DSP-001', 'BAR-852963741', 'Display', TRUE, 18.00, 450000.00, 360000.00, 'PCS', 8.000, 12.000, 20.000)
    `);

    await connection.query(`
      INSERT INTO warehouses (business_id, branch_id, name, warehouse_type, active)
      VALUES 
        (1, 1, 'Downtown Main Warehouse', 'MAIN', TRUE),
        (1, 2, 'Airport Storage', 'RETAIL', TRUE),
        (1, 3, 'Kimironko Warehouse', 'MAIN', TRUE)
    `);

    await connection.query(`
      INSERT INTO inventory_stock (product_id, warehouse_id, quantity, reserved_quantity)
      VALUES 
        (1, 1, 25.000, 0.000),
        (2, 1, 15.000, 0.000),
        (3, 1, 30.000, 0.000),
        (4, 1, 150.000, 0.000),
        (5, 1, 400.000, 0.000),
        (6, 1, 45.000, 0.000),
        (7, 1, 60.000, 0.000),
        (8, 1, 20.000, 0.000),
        (9, 1, 35.000, 0.000),
        (10, 1, 18.000, 0.000),
        (1, 2, 10.000, 0.000),
        (2, 2, 8.000, 0.000),
        (4, 2, 80.000, 0.000),
        (5, 2, 200.000, 0.000),
        (7, 2, 25.000, 0.000)
    `);

    console.log('✓ Phase 4 completed\n');

    // ============================================================
    // PHASE 5: PURCHASING
    // ============================================================
    console.log('📦 Seeding Phase 5: Purchasing...');
    
    const po1 = generateId('PO', 1);
    const po2 = generateId('PO', 2);
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    await connection.query(`
      INSERT INTO purchase_orders (id, business_id, supplier_id, warehouse_id, order_number, status, order_date, expected_date, total_amount, created_by)
      VALUES 
        (?, 1, 1, 1, 'PO-2025-001', 'APPROVED', ?, ?, 60000000.00, 2),
        (?, 1, 2, 1, 'PO-2025-002', 'RECEIVED', ?, ?, 5000000.00, 2)
    `, [po1, formatDate(today), formatDate(futureDate), po2, formatDate(today), formatDate(today)]);

    await connection.query(`
      INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost, line_total)
      VALUES 
        (?, 1, 30.000, 1200000.00, 36000000.00),
        (?, 2, 20.000, 1500000.00, 30000000.00),
        (?, 4, 100.000, 25000.00, 2500000.00),
        (?, 5, 200.000, 10000.00, 2000000.00),
        (?, 7, 50.000, 90000.00, 4500000.00)
    `, [po1, po1, po2, po2, po2]);

    const pi1 = generateId('PI', 1);
    const pi2 = generateId('PI', 2);
    
    await connection.query(`
      INSERT INTO purchase_invoices (id, business_id, supplier_id, purchase_order_id, invoice_number, invoice_date, due_date, total_excl_vat, vat_amount, withholding_tax_rate, withholding_tax_amount, total_incl_vat, net_payable, status, created_by)
      VALUES 
        (?, 1, 1, ?, 'INV-TECH-2025-001', ?, DATE_ADD(?, INTERVAL 30 DAY), 50847457.63, 9152542.37, 3.00, 1525423.73, 60000000.00, 58474576.27, 'UNPAID', 2),
        (?, 1, 2, ?, 'INV-GLOB-2025-045', ?, DATE_ADD(?, INTERVAL 45 DAY), 4237288.14, 762711.86, 3.00, 127118.64, 5000000.00, 4872881.36, 'PAID', 2)
    `, [pi1, po1, formatDate(today), formatDate(today), pi2, po2, formatDate(today), formatDate(today)]);

    await connection.query(`
      INSERT INTO purchase_invoice_items (purchase_invoice_id, product_id, quantity, unit_cost, line_total)
      VALUES 
        (?, 1, 30.000, 1200000.00, 36000000.00),
        (?, 2, 20.000, 1500000.00, 30000000.00),
        (?, 4, 100.000, 25000.00, 2500000.00),
        (?, 5, 200.000, 10000.00, 2000000.00),
        (?, 7, 50.000, 90000.00, 4500000.00)
    `, [pi1, pi1, pi2, pi2, pi2]);

    const sp1 = generateId('SP', 1);
    
    await connection.query(`
      INSERT INTO supplier_payments (id, business_id, supplier_id, purchase_invoice_id, payment_date, amount, payment_method, reference_number, created_by)
      VALUES (?, 1, 2, ?, ?, 4872881.36, 'BANK_TRANSFER', 'TXN-BANK-78945', 5)
    `, [sp1, pi2, formatDate(today)]);

    console.log('✓ Phase 5 completed\n');

    // ============================================================
    // PHASE 6: BUSINESS DAYS & SALES
    // ============================================================
    console.log('📦 Seeding Phase 6: Business Days & Sales...');
    
    const bd1 = generateId('BD', 1);
    const openTime = new Date();
    openTime.setHours(8, 0, 0);
    
    await connection.query(`
      INSERT INTO business_days (id, branch_id, business_date, opened_at, opening_float, status)
      VALUES (?, 1, ?, ?, 500000.00, 'OPEN')
    `, [bd1, formatDate(today), openTime.toISOString().slice(0, 19).replace('T', ' ')]);

    const scs1 = generateId('SCS', 1);
    const sessionTime = new Date();
    sessionTime.setHours(8, 30, 0);
    
    await connection.query(`
      INSERT INTO staff_cash_sessions (id, user_id, branch_id, business_day_id, opening_float, status, opened_at)
      VALUES (?, 3, 1, ?, 200000.00, 'OPEN', ?)
    `, [scs1, bd1, sessionTime.toISOString().slice(0, 19).replace('T', ' ')]);

    const sale1 = generateId('SAL', 1);
    const sale2 = generateId('SAL', 2);
    const sale3 = generateId('SAL', 3);
    const sale4 = generateId('SAL', 4);
    
    await connection.query(`
      INSERT INTO sales (id, business_id, branch_id, warehouse_id, channel, customer_id, sale_number, sale_date, total_excl_vat, vat_amount, total_incl_vat, discount_amount, grand_total, amount_paid, payment_status, business_day_id, served_by)
      VALUES 
        (?, 1, 1, 1, 'POS', 1, 'SAL-2025-0001', ?, 1271186.44, 228813.56, 1500000.00, 0.00, 1500000.00, 1500000.00, 'PAID', ?, 3),
        (?, 1, 1, 1, 'POS', 5, 'SAL-2025-0002', ?, 2542372.88, 457627.12, 3000000.00, 0.00, 3000000.00, 3000000.00, 'PAID', ?, 3),
        (?, 1, 1, 1, 'FRONTDESK', 2, 'SAL-2025-0003', ?, 8474576.27, 1525423.73, 10000000.00, 0.00, 10000000.00, 0.00, 'CREDIT', ?, 6),
        (?, 1, 1, 1, 'POS', 1, 'SAL-2025-0004', ?, 5084745.76, 915254.24, 6000000.00, 0.00, 6000000.00, 6000000.00, 'PAID', ?, 8)
    `, [
      sale1, formatDate(today), bd1,
      sale2, formatDate(today), bd1,
      sale3, formatDate(today), bd1,
      sale4, formatDate(today), bd1
    ]);

    await connection.query(`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, line_total)
      VALUES 
        (?, 1, 1.000, 1500000.00, 0.00, 1500000.00)
    `, [sale1]);

    await connection.query(`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, line_total)
      VALUES 
        (?, 2, 1.000, 1800000.00, 0.00, 1800000.00),
        (?, 4, 10.000, 35000.00, 0.00, 350000.00),
        (?, 5, 30.000, 15000.00, 0.00, 450000.00),
        (?, 7, 20.000, 120000.00, 0.00, 2400000.00)
    `, [sale2, sale2, sale2, sale2]);

    await connection.query(`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, line_total)
      VALUES 
        (?, 1, 5.000, 1500000.00, 0.00, 7500000.00),
        (?, 6, 10.000, 180000.00, 0.00, 1800000.00),
        (?, 4, 20.000, 35000.00, 0.00, 700000.00)
    `, [sale3, sale3, sale3]);

    await connection.query(`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, line_total)
      VALUES 
        (?, 10, 10.000, 450000.00, 0.00, 4500000.00),
        (?, 9, 15.000, 85000.00, 0.00, 1275000.00),
        (?, 4, 5.000, 35000.00, 0.00, 175000.00)
    `, [sale4, sale4, sale4]);

    const pay1 = generateId('PAY', 1);
    const pay2 = generateId('PAY', 2);
    const pay3 = generateId('PAY', 3);
    
    await connection.query(`
      INSERT INTO payments (id, business_id, sale_id, payment_date, method, amount, reference_number, received_by)
      VALUES 
        (?, 1, ?, ?, 'CASH', 1500000.00, NULL, 3),
        (?, 1, ?, ?, 'MOMO', 3000000.00, 'MOMO-TXN-789456', 3),
        (?, 1, ?, ?, 'CARD', 6000000.00, 'CARD-AUTH-951753', 8)
    `, [pay1, sale1, formatDate(today), pay2, sale2, formatDate(today), pay3, sale4, formatDate(today)]);

    console.log('✓ Phase 6 completed\n');

    // ============================================================
    // PHASE 7: RECEIVABLES & VAT
    // ============================================================
    console.log('📦 Seeding Phase 7: Receivables & VAT...');
    
    const rec1 = generateId('REC', 1);
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);
    
    await connection.query(`
      INSERT INTO receivables (id, business_id, customer_id, sale_id, amount_due, due_date, status)
      VALUES (?, 1, 2, ?, 10000000.00, ?, 'OPEN')
    `, [rec1, sale3, formatDate(dueDate)]);

    const currentPeriod = formatDate(today).slice(0, 7); // YYYY-MM
    const vat1 = generateId('VAT', 1);
    const vat2 = generateId('VAT', 2);
    const vat3 = generateId('VAT', 3);
    const vat4 = generateId('VAT', 4);
    const vat5 = generateId('VAT', 5);
    
    await connection.query(`
      INSERT INTO vat_entries (id, business_id, entry_type, source_type, source_id, transaction_date, taxable_amount, vat_amount, vat_rate, period)
      VALUES (?, 1, 'OUTPUT', 'SALE', ?, ?, 1271186.44, 228813.56, 18.00, ?)
    `, [vat1, sale1, formatDate(today), currentPeriod]);

    await connection.query(`
      INSERT INTO vat_entries (id, business_id, entry_type, source_type, source_id, transaction_date, taxable_amount, vat_amount, vat_rate, period)
      VALUES (?, 1, 'OUTPUT', 'SALE', ?, ?, 2542372.88, 457627.12, 18.00, ?)
    `, [vat2, sale2, formatDate(today), currentPeriod]);

    await connection.query(`
      INSERT INTO vat_entries (id, business_id, entry_type, source_type, source_id, transaction_date, taxable_amount, vat_amount, vat_rate, period)
      VALUES (?, 1, 'OUTPUT', 'SALE', ?, ?, 8474576.27, 1525423.73, 18.00, ?)
    `, [vat3, sale3, formatDate(today), currentPeriod]);

    await connection.query(`
      INSERT INTO vat_entries (id, business_id, entry_type, source_type, source_id, transaction_date, taxable_amount, vat_amount, vat_rate, period)
      VALUES (?, 1, 'OUTPUT', 'SALE', ?, ?, 5084745.76, 915254.24, 18.00, ?)
    `, [vat4, sale4, formatDate(today), currentPeriod]);

    await connection.query(`
      INSERT INTO vat_entries (id, business_id, entry_type, source_type, source_id, transaction_date, taxable_amount, vat_amount, vat_rate, period)
      VALUES (?, 1, 'INPUT', 'PURCHASE', ?, ?, 50847457.63, 9152542.37, 18.00, ?)
    `, [vat5, pi1, formatDate(today), currentPeriod]);

    console.log('✓ Phase 7 completed\n');

    // ============================================================
    // PHASE 8: INVENTORY MOVEMENTS & CASHBOOK
    // ============================================================
    console.log('📦 Seeding Phase 8: Inventory & Cashbook...');
    
    const inv1 = generateId('INV', 1);
    const inv2 = generateId('INV', 2);
    const inv3 = generateId('INV', 3);
    const inv4 = generateId('INV', 4);
    
    await connection.query(`
      INSERT INTO inventory_movements (id, product_id, warehouse_id, movement_type, quantity_in, quantity_out, reference_type, reference_id, notes, created_by)
      VALUES (?, 4, 1, 'SALE', 0.000, 10.000, 'SALE', ?, 'POS Sale', 3)
    `, [inv3, sale2]);

    await connection.query(`
      INSERT INTO inventory_movements (id, product_id, warehouse_id, movement_type, quantity_in, quantity_out, reference_type, reference_id, notes, created_by)
      VALUES (?, 1, 1, 'PURCHASE', 30.000, 0.000, 'PURCHASE_INVOICE', ?, 'Purchase received', 4)
    `, [inv4, pi1]);

    const cb1 = generateId('CB', 1);
    const cb2 = generateId('CB', 2);
    const cb3 = generateId('CB', 3);
    const cb4 = generateId('CB', 4);
    
    await connection.query(`
      INSERT INTO cashbook_entries (id, business_id, business_day_id, staff_cash_session_id, branch_id, entry_type, source, amount, reference_id, description)
      VALUES (?, 1, ?, ?, 1, 'IN', 'FLOAT', 200000.00, ?, 'Opening float')
    `, [cb1, bd1, scs1, scs1]);

    await connection.query(`
      INSERT INTO cashbook_entries (id, business_id, business_day_id, staff_cash_session_id, branch_id, entry_type, source, amount, reference_id, description)
      VALUES (?, 1, ?, ?, 1, 'IN', 'SALE', 1500000.00, ?, 'Cash payment')
    `, [cb2, bd1, scs1, sale1]);

    await connection.query(`
      INSERT INTO cashbook_entries (id, business_id, business_day_id, staff_cash_session_id, branch_id, entry_type, source, amount, reference_id, description)
      VALUES (?, 1, ?, ?, 1, 'IN', 'SALE', 3000000.00, ?, 'MOMO payment')
    `, [cb3, bd1, scs1, sale2]);

    await connection.query(`
      INSERT INTO cashbook_entries (id, business_id, business_day_id, staff_cash_session_id, branch_id, entry_type, source, amount, reference_id, description)
      VALUES (?, 1, ?, ?, 1, 'IN', 'SALE', 6000000.00, ?, 'Card payment')
    `, [cb4, bd1, scs1, sale4]);

    console.log('✓ Phase 8 completed\n');

    // ============================================================
    // PHASE 9: BANK ACCOUNTS & EXPENSES
    // ============================================================
    console.log('📦 Seeding Phase 9: Bank & Expenses...');
    
    await connection.query(`
      INSERT INTO bank_accounts (business_id, branch_id, account_name, bank_name, account_number, account_type, current_balance, status)
      VALUES 
        (1, 1, 'TechRetail Operating Account', 'Bank of Kigali', '4001234567890', 'CHECKING', 15000000.00, 'ACTIVE'),
        (1, 1, 'TechRetail Savings', 'Equity Bank', '3001234567891', 'SAVINGS', 5000000.00, 'ACTIVE'),
        (1, NULL, 'MTN Mobile Money', 'MTN Rwanda', '250788123456', 'MOMO', 2000000.00, 'ACTIVE')
    `);

    await connection.query(`
      INSERT INTO expense_categories (business_id, name, code, is_tax_deductible, active)
      VALUES 
        (1, 'Rent & Utilities', 'EXP-RENT', TRUE, TRUE),
        (1, 'Salaries & Wages', 'EXP-SAL', TRUE, TRUE),
        (1, 'Marketing & Advertising', 'EXP-MKTG', TRUE, TRUE),
        (1, 'Office Supplies', 'EXP-SUPP', TRUE, TRUE),
        (1, 'Transportation', 'EXP-TRANS', TRUE, TRUE),
        (1, 'Bank Charges', 'EXP-BANK', TRUE, TRUE)
    `);

    const exp1 = generateId('EXP', 1);
    const exp2 = generateId('EXP', 2);
    
    await connection.query(`
      INSERT INTO expenses (id, business_id, branch_id, category_id, expense_date, amount, vat_amount, payment_method, payee, description, status, approved_by)
      VALUES 
        (?, 1, 1, 1, ?, 500000.00, 90000.00, 'BANK_TRANSFER', 'Kigali Property Management', 'Monthly rent for Downtown store', 'PAID', 2),
        (?, 1, 1, 4, ?, 150000.00, 27000.00, 'CASH', 'Office Depot Rwanda', 'Stationery and supplies', 'PAID', 2)
    `, [exp1, formatDate(today), exp2, formatDate(today)]);

    console.log('✓ Phase 9 completed\n');

    // ============================================================
    // PHASE 10: EMPLOYEES & PAYROLL
    // ============================================================
    console.log('📦 Seeding Phase 10: Employees & Payroll...');
    
    await connection.query(`
      INSERT INTO employees (user_id, business_id, employee_number, full_name, tin, position, branch_id, basic_salary, hire_date, status)
      VALUES 
        (3, 1, 'EMP-001', 'Mike Johnson', 'TIN-EMP-001', 'Senior Cashier', 1, 300000.00, '2023-01-15', 'ACTIVE'),
        (4, 1, 'EMP-002', 'Sarah Williams', 'TIN-EMP-002', 'Store Keeper', 1, 350000.00, '2023-02-01', 'ACTIVE'),
        (6, 1, 'EMP-003', 'Emma Davis', 'TIN-EMP-003', 'Receptionist', 2, 280000.00, '2023-03-10', 'ACTIVE'),
        (7, 1, 'EMP-004', 'James Wilson', 'TIN-EMP-004', 'Delivery Driver', 1, 250000.00, '2023-04-05', 'ACTIVE'),
        (8, 1, 'EMP-005', 'Lisa Anderson', 'TIN-EMP-005', 'Sales Representative', 1, 320000.00, '2023-05-20', 'ACTIVE')
    `);

    const payroll1 = generateId('PAY', 1);
    const payroll2 = generateId('PAY', 2);
    
    await connection.query(`
      INSERT INTO payroll (id, business_id, employee_id, period, payment_date, basic_salary, gross_salary, paye_tax, social_security, total_deductions, net_salary, status)
      VALUES 
        (?, 1, 1, ?, ?, 300000.00, 300000.00, 30000.00, 9000.00, 39000.00, 261000.00, 'PAID'),
        (?, 1, 2, ?, ?, 350000.00, 350000.00, 40000.00, 10500.00, 50500.00, 299500.00, 'PAID')
    `, [payroll1, currentPeriod, formatDate(today), payroll2, currentPeriod, formatDate(today)]);

    console.log('✓ Phase 10 completed\n');

    // ============================================================
    // PHASE 11: ASSETS & LOANS
    // ============================================================
    console.log('📦 Seeding Phase 11: Assets & Loans...');
    
    const asset1 = generateId('AST', 1);
    const asset2 = generateId('AST', 2);
    const purchaseDate = new Date('2023-01-01');
    
    await connection.query(`
      INSERT INTO assets (id, business_id, branch_id, asset_name, asset_type, purchase_date, purchase_cost, useful_life_years, depreciation_method, accumulated_depreciation, current_book_value, status)
      VALUES 
        (?, 1, 1, 'Store Building - Downtown', 'BUILDING', ?, 50000000.00, 20, 'STRAIGHT_LINE', 5000000.00, 45000000.00, 'ACTIVE'),
        (?, 1, 1, 'Delivery Truck Toyota', 'VEHICLE', ?, 15000000.00, 5, 'STRAIGHT_LINE', 6000000.00, 9000000.00, 'ACTIVE')
    `, [asset1, formatDate(purchaseDate), asset2, formatDate(purchaseDate)]);

    const loan1 = generateId('LOAN', 1);
    const loanStartDate = new Date('2024-01-01');
    const loanEndDate = new Date('2026-12-31');
    
    await connection.query(`
      INSERT INTO loans (id, business_id, loan_type, lender_name, principal_amount, interest_rate, loan_start_date, loan_end_date, outstanding_balance, status)
      VALUES (?, 1, 'BANK_LOAN', 'Bank of Kigali', 20000000.00, 12.50, ?, ?, 15000000.00, 'ACTIVE')
    `, [loan1, formatDate(loanStartDate), formatDate(loanEndDate)]);

    const loanPay1 = generateId('LP', 1);
    
    await connection.query(`
      INSERT INTO loan_payments (id, loan_id, payment_date, principal_paid, interest_paid, total_payment, outstanding_after_payment)
      VALUES (?, ?, ?, 500000.00, 150000.00, 650000.00, 15000000.00)
    `, [loanPay1, loan1, formatDate(today)]);

    console.log('✓ Phase 11 completed\n');

    // ============================================================
    // PHASE 12: LOYALTY & PROMOTIONS
    // ============================================================
    console.log('📦 Seeding Phase 12: Loyalty & Promotions...');
    
    await connection.query(`
      INSERT INTO loyalty_programs (business_id, name, points_per_currency, redemption_rate, active)
      VALUES (1, 'TechRetail Rewards', 1.00, 100.00, TRUE)
    `);

    await connection.query(`
      INSERT INTO customer_loyalty_points (customer_id, loyalty_program_id, points_earned, points_redeemed, points_balance)
      VALUES 
        (2, 1, 10000, 2000, 8000),
        (3, 1, 5000, 500, 4500),
        (4, 1, 3000, 0, 3000)
    `);

    const promo1 = generateId('PROMO', 1);
    const promoStart = new Date();
    const promoEnd = new Date();
    promoEnd.setDate(today.getDate() + 90);
    
    await connection.query(`
      INSERT INTO promotions (id, business_id, name, promotion_type, discount_value, start_date, end_date, active)
      VALUES (?, 1, 'New Year Electronics Sale', 'PERCENTAGE', 10.00, ?, ?, TRUE)
    `, [promo1, formatDate(promoStart), formatDate(promoEnd)]);

    console.log('✓ Phase 12 completed\n');

    // ============================================================
    // PHASE 13: SERVICES & DELIVERIES
    // ============================================================
    console.log('📦 Seeding Phase 13: Services & Deliveries...');
    
    await connection.query(`
      INSERT INTO services (business_id, name, category, price, vat_applicable, active)
      VALUES 
        (1, 'Technical Support - 1 Hour', 'IT Services', 50000.00, TRUE, TRUE),
        (1, 'Product Installation', 'Installation', 75000.00, TRUE, TRUE),
        (1, 'Equipment Repair', 'Repair', 100000.00, TRUE, TRUE)
    `);

    await connection.query(`
      INSERT INTO delivery_zones (business_id, name, delivery_fee, estimated_days, active)
      VALUES 
        (1, 'Kigali City Center', 5000.00, 1, TRUE),
        (1, 'Kigali Suburbs', 10000.00, 1, TRUE),
        (1, 'Outside Kigali', 20000.00, 2, TRUE)
    `);

    const delivery1 = generateId('DEL', 1);
    
    await connection.query(`
      INSERT INTO deliveries (id, business_id, sale_id, delivery_zone_id, delivery_address, delivery_fee, delivery_date, driver_id, status, tracking_number)
      VALUES (?, 1, ?, 1, 'KN 10 Ave, Nyarugenge, Kigali', 5000.00, ?, 7, 'DELIVERED', 'TRK-2025-001')
    `, [delivery1, sale3, formatDate(today)]);

    console.log('✓ Phase 13 completed\n');

    // ============================================================
    // PHASE 14: COMMISSION & NOTIFICATIONS
    // ============================================================
    console.log('📦 Seeding Phase 14: Commission & Notifications...');
    
    await connection.query(`
      INSERT INTO commission_rules (business_id, name, commission_type, commission_value, active)
      VALUES 
        (1, 'Sales Staff Commission', 'PERCENTAGE', 2.00, TRUE),
        (1, 'Manager Bonus', 'PERCENTAGE', 1.00, TRUE)
    `);

    const comm1 = generateId('COM', 1);
    const comm2 = generateId('COM', 2);
    
    await connection.query(`
      INSERT INTO commission_earned (id, business_id, user_id, sale_id, commission_amount, period, paid)
      VALUES 
        (?, 1, 8, ?, 120000.00, ?, FALSE),
        (?, 1, 3, ?, 30000.00, ?, FALSE)
    `, [comm1, sale4, currentPeriod, comm2, sale1, currentPeriod]);

    await connection.query(`
      INSERT INTO notifications (business_id, user_id, notif_type, title, message, priority, read_status)
      VALUES 
        (1, 4, 'LOW_STOCK', 'Low Stock Alert', 'Product "USB-C Cable" is below reorder point', 'HIGH', FALSE),
        (1, 5, 'OVERDUE_PAYMENT', 'Payment Overdue', 'Invoice from Tech Distributors Ltd is overdue', 'HIGH', FALSE),
        (1, 2, 'CASH_VARIANCE', 'Cash Variance Detected', 'Cash session has variance of 5000 RWF', 'MEDIUM', FALSE),
        (1, 1, 'SYSTEM_ALERT', 'Daily Report Ready', 'Your daily sales report is ready for review', 'LOW', FALSE)
    `);

    console.log('✓ Phase 14 completed\n');

    // ============================================================
    // PHASE 15: INVENTORY FORECAST
    // ============================================================
    console.log('📦 Seeding Phase 15: Inventory Forecast...');
    
    await connection.query(`
      INSERT INTO inventory_forecast (product_id, warehouse_id, forecasted_demand_next_period, suggested_order_quantity, forecast_period, alert_flag)
      VALUES 
        (1, 1, 35.000, 20.000, ?, TRUE),
        (2, 1, 25.000, 15.000, ?, TRUE),
        (4, 1, 200.000, 100.000, ?, FALSE),
        (5, 1, 350.000, 150.000, ?, FALSE)
    `, [currentPeriod, currentPeriod, currentPeriod, currentPeriod]);

    console.log('✓ Phase 15 completed\n');

    console.log('\n=================================');
    console.log('✅ Seeding completed successfully!');
    console.log('=================================\n');
    console.log('📊 Sample Data Summary:');
    console.log('=================================');
    console.log(`✓ Business: 1`);
    console.log(`✓ Branches: 3`);
    console.log(`✓ Users: 8`);
    console.log(`✓ Customers: 5`);
    console.log(`✓ Suppliers: 4`);
    console.log(`✓ Products: 10`);
    console.log(`✓ Sales: 4`);
    console.log(`✓ Purchase Orders: 2`);
    console.log(`✓ Purchase Invoices: 2`);
    console.log(`✓ Employees: 5`);
    console.log(`✓ Assets: 2`);
    console.log(`✓ Loans: 1`);
    console.log(`✓ Notifications: 4`);
    console.log('=================================\n');
    console.log('🎯 Sample IDs generated:');
    console.log(`   Purchase Order: ${po1}`);
    console.log(`   Purchase Invoice: ${pi1}`);
    console.log(`   Business Day: ${bd1}`);
    console.log(`   Sale: ${sale1}`);
    console.log(`   Payment: ${pay1}`);
    console.log(`   Receivable: ${rec1}`);
    console.log(`   VAT Entry: ${vat1}`);
    console.log(`   Inventory Movement: ${inv1}`);
    console.log(`   Cashbook Entry: ${cb1}`);
    console.log(`   Asset: ${asset1}`);
    console.log(`   Loan: ${loan1}`);
    console.log('=================================\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run seeder
seed()
  .then(() => {
    console.log('\n✅ Database seeding finished successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Seeding failed:', err);
    process.exit(1);
  }); 