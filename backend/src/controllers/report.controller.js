// src/controllers/report.controller.js - Report Controller
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get sales summary report
 * @route   GET /api/v1/reports/sales-summary
 * @access  Private
 */
exports.getSalesSummary = async (req, res) => {
  try {
    const { date_from, date_to, branch_id, group_by = 'day' } = req.query;

    let query = `
      SELECT 
        ${group_by === 'day' ? 'DATE(s.sale_date)' : 
          group_by === 'week' ? 'YEARWEEK(s.sale_date)' : 
          group_by === 'month' ? 'DATE_FORMAT(s.sale_date, "%Y-%m")' : 
          'YEAR(s.sale_date)'} as period,
        COUNT(DISTINCT s.id) as total_transactions,
        SUM(s.grand_total) as total_sales,
        SUM(s.vat_amount) as total_vat,
        SUM(s.discount_amount) as total_discounts,
        AVG(s.grand_total) as average_transaction,
        SUM(CASE WHEN s.payment_status = 'PAID' THEN s.grand_total ELSE 0 END) as paid_sales,
        SUM(CASE WHEN s.payment_status = 'CREDIT' THEN s.grand_total ELSE 0 END) as credit_sales,
        COUNT(DISTINCT s.customer_id) as unique_customers
      FROM sales s
      WHERE 1=1
    `;
    const params = [];

    if (date_from) {
      query += ' AND s.sale_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND s.sale_date <= ?';
      params.push(date_to);
    }

    if (branch_id) {
      query += ' AND s.branch_id = ?';
      params.push(branch_id);
    }

    query += ` GROUP BY period ORDER BY period DESC`;

    const [summary] = await db.query(query, params);

    return successResponse(res, 200, 'Sales summary report retrieved successfully', summary);

  } catch (error) {
    console.error('Get sales summary error:', error);
    return errorResponse(res, 500, 'Error retrieving sales summary', error);
  }
};

/**
 * @desc    Get sales by channel report
 * @route   GET /api/v1/reports/sales-by-channel
 * @access  Private
 */
exports.getSalesByChannel = async (req, res) => {
  try {
    const { date_from, date_to, branch_id } = req.query;

    let query = `
      SELECT 
        s.channel,
        COUNT(*) as transaction_count,
        SUM(s.grand_total) as total_sales,
        AVG(s.grand_total) as average_sale,
        SUM(s.vat_amount) as total_vat
      FROM sales s
      WHERE 1=1
    `;
    const params = [];

    if (date_from) {
      query += ' AND s.sale_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND s.sale_date <= ?';
      params.push(date_to);
    }

    if (branch_id) {
      query += ' AND s.branch_id = ?';
      params.push(branch_id);
    }

    query += ' GROUP BY s.channel ORDER BY total_sales DESC';

    const [channelSales] = await db.query(query, params);

    return successResponse(res, 200, 'Sales by channel report retrieved successfully', channelSales);

  } catch (error) {
    console.error('Get sales by channel error:', error);
    return errorResponse(res, 500, 'Error retrieving sales by channel', error);
  }
};

/**
 * @desc    Get top selling products
 * @route   GET /api/v1/reports/top-products
 * @access  Private
 */
exports.getTopProducts = async (req, res) => {
  try {
    const { date_from, date_to, branch_id, limit = 20 } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.category,
        SUM(si.quantity) as total_quantity_sold,
        COUNT(DISTINCT si.sale_id) as number_of_sales,
        SUM(si.line_total) as total_revenue,
        AVG(si.unit_price) as average_price
      FROM sale_items si
      INNER JOIN sales s ON si.sale_id = s.id
      INNER JOIN products p ON si.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (date_from) {
      query += ' AND s.sale_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND s.sale_date <= ?';
      params.push(date_to);
    }

    if (branch_id) {
      query += ' AND s.branch_id = ?';
      params.push(branch_id);
    }

    query += ` GROUP BY p.id, p.name, p.sku, p.category 
               ORDER BY total_revenue DESC 
               LIMIT ?`;
    params.push(parseInt(limit));

    const [topProducts] = await db.query(query, params);

    return successResponse(res, 200, 'Top products report retrieved successfully', topProducts);

  } catch (error) {
    console.error('Get top products error:', error);
    return errorResponse(res, 500, 'Error retrieving top products', error);
  }
};

/**
 * @desc    Get inventory valuation report
 * @route   GET /api/v1/reports/inventory-valuation
 * @access  Private
 */
exports.getInventoryValuation = async (req, res) => {
  try {
    const { branch_id, category } = req.query;

    let query = `
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        SUM(ist.quantity) as total_units,
        SUM(ist.quantity * p.cost_price) as total_cost_value,
        SUM(ist.quantity * p.sale_price) as total_retail_value,
        SUM((ist.quantity * p.sale_price) - (ist.quantity * p.cost_price)) as potential_profit
      FROM inventory_stock ist
      INNER JOIN products p ON ist.product_id = p.id
      INNER JOIN warehouses w ON ist.warehouse_id = w.id
      WHERE p.active = TRUE AND ist.quantity > 0
    `;
    const params = [];

    if (branch_id) {
      query += ' AND w.branch_id = ?';
      params.push(branch_id);
    }

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    query += ' GROUP BY p.category ORDER BY total_retail_value DESC';

    const [valuation] = await db.query(query, params);

    // Get total summary
    const [total] = await db.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        SUM(ist.quantity) as total_units,
        SUM(ist.quantity * p.cost_price) as total_cost_value,
        SUM(ist.quantity * p.sale_price) as total_retail_value
      FROM inventory_stock ist
      INNER JOIN products p ON ist.product_id = p.id
      INNER JOIN warehouses w ON ist.warehouse_id = w.id
      WHERE p.active = TRUE AND ist.quantity > 0
      ${branch_id ? 'AND w.branch_id = ?' : ''}
    `, branch_id ? [branch_id] : []);

    return successResponse(res, 200, 'Inventory valuation report retrieved successfully', {
      by_category: valuation,
      total: total[0]
    });

  } catch (error) {
    console.error('Get inventory valuation error:', error);
    return errorResponse(res, 500, 'Error retrieving inventory valuation', error);
  }
};

/**
 * @desc    Get VAT report
 * @route   GET /api/v1/reports/vat-report
 * @access  Private
 */
exports.getVATReport = async (req, res) => {
  try {
    const { period, business_id } = req.query;

    if (!period) {
      return badRequestResponse(res, 'Period (YYYY-MM) is required');
    }

    const [vatSummary] = await db.query(`
      SELECT 
        entry_type,
        SUM(taxable_amount) as total_taxable,
        SUM(vat_amount) as total_vat,
        COUNT(*) as transaction_count
      FROM vat_entries
      WHERE period = ? AND business_id = ?
      GROUP BY entry_type
    `, [period, business_id || 1]);

    // Calculate net VAT payable
    const inputVAT = vatSummary.find(v => v.entry_type === 'INPUT')?.total_vat || 0;
    const outputVAT = vatSummary.find(v => v.entry_type === 'OUTPUT')?.total_vat || 0;
    const netVATPayable = outputVAT - inputVAT;

    // Get detailed breakdown
    const [details] = await db.query(`
      SELECT 
        ve.*,
        CASE 
          WHEN ve.source_type = 'SALE' THEN s.sale_number
          WHEN ve.source_type = 'PURCHASE' THEN pi.invoice_number
        END as reference_number
      FROM vat_entries ve
      LEFT JOIN sales s ON ve.source_type = 'SALE' AND ve.source_id = s.id
      LEFT JOIN purchase_invoices pi ON ve.source_type = 'PURCHASE' AND ve.source_id = pi.id
      WHERE ve.period = ? AND ve.business_id = ?
      ORDER BY ve.created_at DESC
    `, [period, business_id || 1]);

    return successResponse(res, 200, 'VAT report retrieved successfully', {
      period,
      summary: vatSummary,
      net_vat_payable: netVATPayable,
      details
    });

  } catch (error) {
    console.error('Get VAT report error:', error);
    return errorResponse(res, 500, 'Error retrieving VAT report', error);
  }
};

/**
 * @desc    Get profit & loss statement
 * @route   GET /api/v1/reports/profit-loss
 * @access  Private
 */
exports.getProfitLoss = async (req, res) => {
  try {
    const { date_from, date_to, branch_id } = req.query;

    // Get revenue
    let revenueQuery = `
      SELECT 
        SUM(grand_total) as total_revenue,
        SUM(total_excl_vat) as revenue_excl_vat
      FROM sales
      WHERE 1=1
    `;
    const revenueParams = [];

    if (date_from) {
      revenueQuery += ' AND sale_date >= ?';
      revenueParams.push(date_from);
    }

    if (date_to) {
      revenueQuery += ' AND sale_date <= ?';
      revenueParams.push(date_to);
    }

    if (branch_id) {
      revenueQuery += ' AND branch_id = ?';
      revenueParams.push(branch_id);
    }

    const [revenue] = await db.query(revenueQuery, revenueParams);

    // Get cost of goods sold
    let cogsQuery = `
      SELECT 
        SUM(si.quantity * COALESCE(p.cost_price, 0)) as total_cogs
      FROM sale_items si
      INNER JOIN sales s ON si.sale_id = s.id
      INNER JOIN products p ON si.product_id = p.id
      WHERE 1=1
    `;
    const cogsParams = [];

    if (date_from) {
      cogsQuery += ' AND s.sale_date >= ?';
      cogsParams.push(date_from);
    }

    if (date_to) {
      cogsQuery += ' AND s.sale_date <= ?';
      cogsParams.push(date_to);
    }

    if (branch_id) {
      cogsQuery += ' AND s.branch_id = ?';
      cogsParams.push(branch_id);
    }

    const [cogs] = await db.query(cogsQuery, cogsParams);

    // Get expenses
    let expenseQuery = `
      SELECT 
        SUM(amount) as total_expenses
      FROM expenses
      WHERE status = 'PAID'
    `;
    const expenseParams = [];

    if (date_from) {
      expenseQuery += ' AND expense_date >= ?';
      expenseParams.push(date_from);
    }

    if (date_to) {
      expenseQuery += ' AND expense_date <= ?';
      expenseParams.push(date_to);
    }

    if (branch_id) {
      expenseQuery += ' AND branch_id = ?';
      expenseParams.push(branch_id);
    }

    const [expenses] = await db.query(expenseQuery, expenseParams);

    // Calculate P&L
    const totalRevenue = parseFloat(revenue[0].total_revenue || 0);
    const totalCOGS = parseFloat(cogs[0].total_cogs || 0);
    const totalExpenses = parseFloat(expenses[0].total_expenses || 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue * 100) : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;

    return successResponse(res, 200, 'Profit & Loss statement retrieved successfully', {
      revenue: {
        total: totalRevenue,
        excl_vat: parseFloat(revenue[0].revenue_excl_vat || 0)
      },
      cost_of_goods_sold: totalCOGS,
      gross_profit: grossProfit,
      gross_margin_percentage: parseFloat(grossMargin.toFixed(2)),
      operating_expenses: totalExpenses,
      net_profit: netProfit,
      net_margin_percentage: parseFloat(netMargin.toFixed(2)),
      period: {
        from: date_from || 'All time',
        to: date_to || 'Present'
      }
    });

  } catch (error) {
    console.error('Get P&L error:', error);
    return errorResponse(res, 500, 'Error retrieving P&L statement', error);
  }
};

/**
 * @desc    Get cash flow report
 * @route   GET /api/v1/reports/cash-flow
 * @access  Private
 */
exports.getCashFlow = async (req, res) => {
  try {
    const { date_from, date_to, branch_id } = req.query;

    let query = `
      SELECT 
        entry_type,
        source,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM cashbook_entries
      WHERE 1=1
    `;
    const params = [];

    if (date_from) {
      query += ' AND DATE(created_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(created_at) <= ?';
      params.push(date_to);
    }

    if (branch_id) {
      query += ' AND branch_id = ?';
      params.push(branch_id);
    }

    query += ' GROUP BY entry_type, source ORDER BY entry_type, total_amount DESC';

    const [cashflow] = await db.query(query, params);

    // Calculate totals
    const totalIn = cashflow
      .filter(c => c.entry_type === 'IN')
      .reduce((sum, c) => sum + parseFloat(c.total_amount), 0);

    const totalOut = cashflow
      .filter(c => c.entry_type === 'OUT')
      .reduce((sum, c) => sum + parseFloat(c.total_amount), 0);

    const netCashFlow = totalIn - totalOut;

    return successResponse(res, 200, 'Cash flow report retrieved successfully', {
      details: cashflow,
      summary: {
        total_in: totalIn,
        total_out: totalOut,
        net_cash_flow: netCashFlow
      }
    });

  } catch (error) {
    console.error('Get cash flow error:', error);
    return errorResponse(res, 500, 'Error retrieving cash flow report', error);
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/reports/dashboard
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const today = new Date().toISOString().split('T')[0];

    // Today's sales
    const [todaySales] = await db.query(`
      SELECT 
        COUNT(*) as transaction_count,
        SUM(grand_total) as total_sales,
        AVG(grand_total) as average_sale
      FROM sales
      WHERE sale_date = ? ${branch_id ? 'AND branch_id = ?' : ''}
    `, branch_id ? [today, branch_id] : [today]);

    // Low stock items
    const [lowStock] = await db.query(`
      SELECT COUNT(*) as low_stock_count
      FROM inventory_stock ist
      INNER JOIN products p ON ist.product_id = p.id
      INNER JOIN warehouses w ON ist.warehouse_id = w.id
      WHERE ist.quantity <= p.reorder_point
      ${branch_id ? 'AND w.branch_id = ?' : ''}
    `, branch_id ? [branch_id] : []);

    // Pending receivables
    const [receivables] = await db.query(`
      SELECT 
        COUNT(*) as overdue_count,
        SUM(amount_due - amount_paid) as total_overdue
      FROM receivables
      WHERE status IN ('OPEN', 'PARTIAL', 'OVERDUE')
        AND due_date < CURDATE()
    `);

    // Monthly revenue
    const [monthlyRevenue] = await db.query(`
      SELECT SUM(grand_total) as revenue
      FROM sales
      WHERE YEAR(sale_date) = YEAR(CURDATE())
        AND MONTH(sale_date) = MONTH(CURDATE())
        ${branch_id ? 'AND branch_id = ?' : ''}
    `, branch_id ? [branch_id] : []);

    return successResponse(res, 200, 'Dashboard statistics retrieved successfully', {
      today: {
        sales_count: todaySales[0].transaction_count,
        total_sales: todaySales[0].total_sales || 0,
        average_sale: todaySales[0].average_sale || 0
      },
      inventory: {
        low_stock_items: lowStock[0].low_stock_count
      },
      receivables: {
        overdue_count: receivables[0].overdue_count,
        total_overdue: receivables[0].total_overdue || 0
      },
      this_month: {
        revenue: monthlyRevenue[0].revenue || 0
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse(res, 500, 'Error retrieving dashboard statistics', error);
  }
};

module.exports = exports;