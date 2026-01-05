// src/controllers/cashbook.controller.js - Cash Book & Business Day Management
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, badRequestResponse } = require('../utils/response');
const { generateId } = require('../utils/generateId');

/**
 * @desc    Open business day
 * @route   POST /api/v1/cashbook/business-day/open
 * @access  Private (manager, owner)
 */
exports.openBusinessDay = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { branch_id, opening_float } = req.body;

    // Check if business day already open for this branch
    const [existingDay] = await connection.query(
      'SELECT * FROM business_days WHERE branch_id = ? AND status = "OPEN"',
      [branch_id]
    );

    if (existingDay.length > 0) {
      await connection.rollback();
      return badRequestResponse(res, 'Business day already open for this branch');
    }

    // Create business day
    const businessDayId = generateId('BD', Date.now());
    await connection.query(`
      INSERT INTO business_days (
        id, branch_id, business_date, opened_at, opening_float, status
      ) VALUES (?, ?, CURDATE(), NOW(), ?, 'OPEN')
    `, [businessDayId, branch_id, opening_float || 0]);

    // Create opening float cashbook entry
    if (opening_float > 0) {
      const cashbookId = generateId('CB', Date.now());
      await connection.query(`
        INSERT INTO cashbook_entries (
          id, business_id, business_day_id, branch_id, entry_type, 
          source, amount, description, created_at
        ) VALUES (?, 1, ?, ?, 'IN', 'FLOAT', ?, 'Opening float', NOW())
      `, [cashbookId, businessDayId, branch_id, opening_float]);
    }

    await connection.commit();

    const [businessDay] = await connection.query(
      'SELECT * FROM business_days WHERE id = ?',
      [businessDayId]
    );

    return createdResponse(res, 'Business day opened successfully', businessDay[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Open business day error:', error);
    return errorResponse(res, 500, 'Error opening business day', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Close business day
 * @route   POST /api/v1/cashbook/business-day/close
 * @access  Private (manager, owner)
 */
exports.closeBusinessDay = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { business_day_id, actual_closing_cash, notes } = req.body;

    // Get business day
    const [businessDays] = await connection.query(
      'SELECT * FROM business_days WHERE id = ? AND status = "OPEN"',
      [business_day_id]
    );

    if (businessDays.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Open business day not found');
    }

    const businessDay = businessDays[0];

    // Calculate expected cash from cashbook entries
    const [cashSummary] = await connection.query(`
      SELECT 
        SUM(CASE WHEN entry_type = 'IN' AND source IN ('SALE', 'FLOAT') THEN amount ELSE 0 END) as cash_in,
        SUM(CASE WHEN entry_type = 'OUT' THEN amount ELSE 0 END) as cash_out
      FROM cashbook_entries
      WHERE business_day_id = ?
    `, [business_day_id]);

    const cashIn = parseFloat(cashSummary[0].cash_in || 0);
    const cashOut = parseFloat(cashSummary[0].cash_out || 0);
    const expectedCash = cashIn - cashOut;
    const variance = parseFloat(actual_closing_cash) - expectedCash;

    // Update business day
    await connection.query(`
      UPDATE business_days 
      SET 
        closed_at = NOW(),
        expected_closing_cash = ?,
        actual_closing_cash = ?,
        variance = ?,
        status = 'CLOSED',
        closed_by = ?,
        notes = ?
      WHERE id = ?
    `, [expectedCash, actual_closing_cash, variance, req.user.id, notes || null, business_day_id]);

    await connection.commit();

    return successResponse(res, 200, 'Business day closed successfully', {
      business_day_id,
      expected_cash: expectedCash,
      actual_cash: actual_closing_cash,
      variance: variance,
      variance_percentage: expectedCash > 0 ? ((variance / expectedCash) * 100).toFixed(2) : 0
    });

  } catch (error) {
    await connection.rollback();
    console.error('Close business day error:', error);
    return errorResponse(res, 500, 'Error closing business day', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get current business day
 * @route   GET /api/v1/cashbook/business-day/current
 * @access  Private
 */
exports.getCurrentBusinessDay = async (req, res) => {
  try {
    const { branch_id } = req.query;

    const [businessDays] = await db.query(`
      SELECT bd.*, b.name as branch_name
      FROM business_days bd
      INNER JOIN branches b ON bd.branch_id = b.id
      WHERE bd.status = 'OPEN' ${branch_id ? 'AND bd.branch_id = ?' : ''}
      ORDER BY bd.opened_at DESC
    `, branch_id ? [branch_id] : []);

    return successResponse(res, 200, 'Current business day retrieved', businessDays[0] || null);

  } catch (error) {
    console.error('Get current business day error:', error);
    return errorResponse(res, 500, 'Error retrieving current business day', error);
  }
};

/**
 * @desc    Get cashbook entries
 * @route   GET /api/v1/cashbook/entries
 * @access  Private
 */
exports.getCashbookEntries = async (req, res) => {
  try {
    const { business_day_id, branch_id, date_from, date_to, entry_type } = req.query;

    let query = `
      SELECT 
        ce.*,
        bd.business_date,
        b.name as branch_name
      FROM cashbook_entries ce
      LEFT JOIN business_days bd ON ce.business_day_id = bd.id
      INNER JOIN branches b ON ce.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (business_day_id) {
      query += ' AND ce.business_day_id = ?';
      params.push(business_day_id);
    }

    if (branch_id) {
      query += ' AND ce.branch_id = ?';
      params.push(branch_id);
    }

    if (date_from) {
      query += ' AND DATE(ce.created_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(ce.created_at) <= ?';
      params.push(date_to);
    }

    if (entry_type) {
      query += ' AND ce.entry_type = ?';
      params.push(entry_type);
    }

    query += ' ORDER BY ce.created_at DESC';

    const [entries] = await db.query(query, params);

    // Calculate summary
    const totalIn = entries
      .filter(e => e.entry_type === 'IN')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const totalOut = entries
      .filter(e => e.entry_type === 'OUT')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return successResponse(res, 200, 'Cashbook entries retrieved successfully', {
      entries,
      summary: {
        total_in: totalIn,
        total_out: totalOut,
        net: totalIn - totalOut
      }
    });

  } catch (error) {
    console.error('Get cashbook entries error:', error);
    return errorResponse(res, 500, 'Error retrieving cashbook entries', error);
  }
};

/**
 * @desc    Add cashbook entry (expense, withdrawal)
 * @route   POST /api/v1/cashbook/entries
 * @access  Private (cashier, manager, owner)
 */
exports.addCashbookEntry = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      business_day_id,
      branch_id,
      entry_type,
      source,
      amount,
      description,
      payee_payer
    } = req.body;

    // Validate business day is open
    if (business_day_id) {
      const [businessDay] = await connection.query(
        'SELECT * FROM business_days WHERE id = ? AND status = "OPEN"',
        [business_day_id]
      );

      if (businessDay.length === 0) {
        await connection.rollback();
        return badRequestResponse(res, 'Business day is not open or does not exist');
      }
    }

    // Create cashbook entry
    const entryId = generateId('CB', Date.now());
    await connection.query(`
      INSERT INTO cashbook_entries (
        id, business_id, business_day_id, branch_id, entry_type,
        source, amount, description, created_at
      ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      entryId,
      business_day_id || null,
      branch_id,
      entry_type,
      source,
      amount,
      description || null
    ]);

    await connection.commit();

    const [entry] = await connection.query(
      'SELECT * FROM cashbook_entries WHERE id = ?',
      [entryId]
    );

    return createdResponse(res, 'Cashbook entry added successfully', entry[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Add cashbook entry error:', error);
    return errorResponse(res, 500, 'Error adding cashbook entry', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get business day history
 * @route   GET /api/v1/cashbook/business-day/history
 * @access  Private
 */
exports.getBusinessDayHistory = async (req, res) => {
  try {
    const { branch_id, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        bd.*,
        b.name as branch_name,
        u.name as closed_by_name
      FROM business_days bd
      INNER JOIN branches b ON bd.branch_id = b.id
      LEFT JOIN users u ON bd.closed_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += ' AND bd.branch_id = ?';
      params.push(branch_id);
    }

    if (date_from) {
      query += ' AND bd.business_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND bd.business_date <= ?';
      params.push(date_to);
    }

    // Get total
    const countQuery = query.replace(
      'SELECT bd.*, b.name as branch_name, u.name as closed_by_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY bd.business_date DESC, bd.opened_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [history] = await db.query(query, params);

    return successResponse(res, 200, 'Business day history retrieved successfully', {
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get business day history error:', error);
    return errorResponse(res, 500, 'Error retrieving business day history', error);
  }
};

/**
 * @desc    Get cash variance report
 * @route   GET /api/v1/cashbook/variance-report
 * @access  Private (manager, owner, accountant)
 */
exports.getCashVarianceReport = async (req, res) => {
  try {
    const { branch_id, date_from, date_to } = req.query;

    let query = `
      SELECT 
        bd.id,
        bd.business_date,
        b.name as branch_name,
        bd.expected_closing_cash,
        bd.actual_closing_cash,
        bd.variance,
        CASE 
          WHEN bd.variance = 0 THEN 'BALANCED'
          WHEN ABS(bd.variance) <= 1000 THEN 'MINOR'
          WHEN ABS(bd.variance) <= 10000 THEN 'MODERATE'
          ELSE 'MAJOR'
        END as variance_level
      FROM business_days bd
      INNER JOIN branches b ON bd.branch_id = b.id
      WHERE bd.status = 'CLOSED'
    `;
    const params = [];

    if (branch_id) {
      query += ' AND bd.branch_id = ?';
      params.push(branch_id);
    }

    if (date_from) {
      query += ' AND bd.business_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND bd.business_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY ABS(bd.variance) DESC, bd.business_date DESC';

    const [variances] = await db.query(query, params);

    // Calculate summary
    const totalVariance = variances.reduce((sum, v) => sum + parseFloat(v.variance), 0);
    const avgVariance = variances.length > 0 ? totalVariance / variances.length : 0;
    const daysWithVariance = variances.filter(v => v.variance !== 0).length;

    return successResponse(res, 200, 'Cash variance report retrieved successfully', {
      variances,
      summary: {
        total_days: variances.length,
        days_with_variance: daysWithVariance,
        total_variance: totalVariance,
        average_variance: parseFloat(avgVariance.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Get cash variance report error:', error);
    return errorResponse(res, 500, 'Error retrieving cash variance report', error);
  }
};

module.exports = exports;