// src/controllers/staffSession.controller.js - Staff Cash Session Controller
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, badRequestResponse } = require('../utils/response');
const { generateId } = require('../utils/generateId');

/**
 * @desc    Open staff cash session
 * @route   POST /api/v1/staff-sessions/open
 * @access  Private (cashier, receptionist, salesperson)
 */
exports.openStaffSession = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { branch_id, business_day_id, opening_float } = req.body;
    const user_id = req.user.id;

    // Check if user already has an open session
    const [existingSessions] = await connection.query(
      'SELECT * FROM staff_cash_sessions WHERE user_id = ? AND status = "OPEN"',
      [user_id]
    );

    if (existingSessions.length > 0) {
      await connection.rollback();
      return badRequestResponse(res, 'You already have an open cash session. Please close it first.');
    }

    // Check if business day is open
    if (business_day_id) {
      const [businessDay] = await connection.query(
        'SELECT * FROM business_days WHERE id = ? AND status = "OPEN"',
        [business_day_id]
      );

      if (businessDay.length === 0) {
        await connection.rollback();
        return badRequestResponse(res, 'Business day is not open');
      }
    }

    // Create staff cash session
    const sessionId = generateId('SCS', Date.now());
    await connection.query(`
      INSERT INTO staff_cash_sessions (
        id, user_id, branch_id, business_day_id, opening_float,
        status, opened_at
      ) VALUES (?, ?, ?, ?, ?, 'OPEN', NOW())
    `, [sessionId, user_id, branch_id, business_day_id || null, opening_float || 0]);

    // Create cashbook entry for opening float
    if (opening_float > 0) {
      const cashbookId = generateId('CB', Date.now());
      await connection.query(`
        INSERT INTO cashbook_entries (
          id, business_id, business_day_id, staff_cash_session_id,
          branch_id, entry_type, source, amount, description, created_at
        ) VALUES (?, 1, ?, ?, ?, 'IN', 'FLOAT', ?, 'Opening float for staff session', NOW())
      `, [cashbookId, business_day_id, sessionId, branch_id, opening_float]);
    }

    await connection.commit();

    const [session] = await connection.query(
      'SELECT * FROM staff_cash_sessions WHERE id = ?',
      [sessionId]
    );

    return createdResponse(res, 'Staff cash session opened successfully', session[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Open staff session error:', error);
    return errorResponse(res, 500, 'Error opening staff session', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Close staff cash session
 * @route   POST /api/v1/staff-sessions/close
 * @access  Private
 */
exports.closeStaffSession = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { session_id, actual_cash, notes } = req.body;
    const user_id = req.user.id;

    // Get session
    const [sessions] = await connection.query(
      'SELECT * FROM staff_cash_sessions WHERE id = ? AND user_id = ? AND status = "OPEN"',
      [session_id, user_id]
    );

    if (sessions.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Open cash session not found for this user');
    }

    const session = sessions[0];

    // Calculate expected cash from cashbook entries
    const [cashSummary] = await connection.query(`
      SELECT 
        SUM(CASE WHEN entry_type = 'IN' THEN amount ELSE 0 END) as total_in,
        SUM(CASE WHEN entry_type = 'OUT' THEN amount ELSE 0 END) as total_out
      FROM cashbook_entries
      WHERE staff_cash_session_id = ?
    `, [session_id]);

    const totalIn = parseFloat(cashSummary[0].total_in || 0);
    const totalOut = parseFloat(cashSummary[0].total_out || 0);
    const expectedCash = totalIn - totalOut;
    const variance = parseFloat(actual_cash) - expectedCash;
    const variancePercentage = expectedCash > 0 ? (variance / expectedCash) * 100 : 0;

    // Flag for high variance (more than 1% or more than 10,000)
    const alertFlag = Math.abs(variance) > 10000 || Math.abs(variancePercentage) > 1;

    // Update session
    await connection.query(`
      UPDATE staff_cash_sessions 
      SET 
        total_cash_in = ?,
        total_cash_out = ?,
        expected_cash = ?,
        actual_cash = ?,
        closing_cash = ?,
        variance = ?,
        variance_percentage = ?,
        alert_flag = ?,
        status = 'CLOSED',
        closed_at = NOW(),
        notes = ?
      WHERE id = ?
    `, [
      totalIn,
      totalOut,
      expectedCash,
      actual_cash,
      actual_cash,
      variance,
      variancePercentage.toFixed(2),
      alertFlag,
      notes || null,
      session_id
    ]);

    // Create notification if there's a significant variance
    if (alertFlag) {
      await connection.query(`
        INSERT INTO notifications (
          business_id, user_id, notif_type, title, message,
          reference_id, priority, read_status, created_at
        ) VALUES (
          1, ?, 'CASH_VARIANCE', 'Cash Variance Alert',
          CONCAT('Staff session closed with variance of ', ?, ' RWF (', ?, '%)'),
          ?, 'HIGH', FALSE, NOW()
        )
      `, [
        req.user.id,
        variance.toFixed(2),
        variancePercentage.toFixed(2),
        session_id
      ]);

      // Also notify manager
      const [managers] = await connection.query(`
        SELECT DISTINCT u.id
        FROM users u
        INNER JOIN user_branches ub ON u.id = ub.user_id
        WHERE ub.branch_id = ? AND u.role IN ('manager', 'owner')
      `, [session.branch_id]);

      for (const manager of managers) {
        await connection.query(`
          INSERT INTO notifications (
            business_id, user_id, notif_type, title, message,
            reference_id, priority, read_status, created_at
          ) VALUES (
            1, ?, 'CASH_VARIANCE', 'Staff Cash Variance Alert',
            CONCAT('Staff member has cash variance of ', ?, ' RWF. Review required.'),
            ?, 'HIGH', FALSE, NOW()
          )
        `, [manager.id, variance.toFixed(2), session_id]);
      }
    }

    await connection.commit();

    return successResponse(res, 200, 'Staff cash session closed successfully', {
      session_id,
      opening_float: session.opening_float,
      total_in: totalIn,
      total_out: totalOut,
      expected_cash: expectedCash,
      actual_cash: actual_cash,
      variance: variance,
      variance_percentage: variancePercentage.toFixed(2),
      alert_flag: alertFlag
    });

  } catch (error) {
    await connection.rollback();
    console.error('Close staff session error:', error);
    return errorResponse(res, 500, 'Error closing staff session', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get current staff session
 * @route   GET /api/v1/staff-sessions/current
 * @access  Private
 */
exports.getCurrentSession = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [sessions] = await db.query(`
      SELECT 
        scs.*,
        b.name as branch_name,
        bd.business_date
      FROM staff_cash_sessions scs
      INNER JOIN branches b ON scs.branch_id = b.id
      LEFT JOIN business_days bd ON scs.business_day_id = bd.id
      WHERE scs.user_id = ? AND scs.status = 'OPEN'
      ORDER BY scs.opened_at DESC
      LIMIT 1
    `, [user_id]);

    if (sessions.length === 0) {
      return successResponse(res, 200, 'No open session found', null);
    }

    // Get current totals
    const [cashSummary] = await db.query(`
      SELECT 
        SUM(CASE WHEN entry_type = 'IN' THEN amount ELSE 0 END) as total_in,
        SUM(CASE WHEN entry_type = 'OUT' THEN amount ELSE 0 END) as total_out,
        COUNT(*) as transaction_count
      FROM cashbook_entries
      WHERE staff_cash_session_id = ?
    `, [sessions[0].id]);

    const sessionData = {
      ...sessions[0],
      current_total_in: parseFloat(cashSummary[0].total_in || 0),
      current_total_out: parseFloat(cashSummary[0].total_out || 0),
      current_expected_cash: parseFloat(cashSummary[0].total_in || 0) - parseFloat(cashSummary[0].total_out || 0),
      transaction_count: cashSummary[0].transaction_count
    };

    return successResponse(res, 200, 'Current session retrieved successfully', sessionData);

  } catch (error) {
    console.error('Get current session error:', error);
    return errorResponse(res, 500, 'Error retrieving current session', error);
  }
};

/**
 * @desc    Get staff session history
 * @route   GET /api/v1/staff-sessions/history
 * @access  Private
 */
exports.getSessionHistory = async (req, res) => {
  try {
    const { user_id, branch_id, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const queryUserId = user_id || req.user.id; // Default to current user

    let query = `
      SELECT 
        scs.*,
        u.name as staff_name,
        b.name as branch_name,
        bd.business_date
      FROM staff_cash_sessions scs
      INNER JOIN users u ON scs.user_id = u.id
      INNER JOIN branches b ON scs.branch_id = b.id
      LEFT JOIN business_days bd ON scs.business_day_id = bd.id
      WHERE 1=1
    `;
    const params = [];

    // Non-managers can only see their own sessions
    if (!['manager', 'owner', 'accountant'].includes(req.user.role)) {
      query += ' AND scs.user_id = ?';
      params.push(req.user.id);
    } else if (queryUserId) {
      query += ' AND scs.user_id = ?';
      params.push(queryUserId);
    }

    if (branch_id) {
      query += ' AND scs.branch_id = ?';
      params.push(branch_id);
    }

    if (date_from) {
      query += ' AND DATE(scs.opened_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(scs.opened_at) <= ?';
      params.push(date_to);
    }

    // Get total
    const countQuery = query.replace(
      'SELECT scs.*, u.name as staff_name, b.name as branch_name, bd.business_date',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY scs.opened_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [sessions] = await db.query(query, params);

    return successResponse(res, 200, 'Session history retrieved successfully', {
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get session history error:', error);
    return errorResponse(res, 500, 'Error retrieving session history', error);
  }
};

/**
 * @desc    Get staff variance report
 * @route   GET /api/v1/staff-sessions/variance-report
 * @access  Private (manager, owner, accountant)
 */
exports.getStaffVarianceReport = async (req, res) => {
  try {
    const { branch_id, date_from, date_to } = req.query;

    let query = `
      SELECT 
        u.id as user_id,
        u.name as staff_name,
        u.role,
        b.name as branch_name,
        COUNT(scs.id) as total_sessions,
        SUM(scs.variance) as total_variance,
        AVG(scs.variance) as average_variance,
        SUM(CASE WHEN scs.alert_flag = TRUE THEN 1 ELSE 0 END) as sessions_with_alerts,
        MAX(ABS(scs.variance)) as max_variance
      FROM staff_cash_sessions scs
      INNER JOIN users u ON scs.user_id = u.id
      INNER JOIN branches b ON scs.branch_id = b.id
      WHERE scs.status = 'CLOSED'
    `;
    const params = [];

    if (branch_id) {
      query += ' AND scs.branch_id = ?';
      params.push(branch_id);
    }

    if (date_from) {
      query += ' AND DATE(scs.opened_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(scs.opened_at) <= ?';
      params.push(date_to);
    }

    query += ' GROUP BY u.id, u.name, u.role, b.name ORDER BY total_variance DESC';

    const [report] = await db.query(query, params);

    return successResponse(res, 200, 'Staff variance report retrieved successfully', report);

  } catch (error) {
    console.error('Get staff variance report error:', error);
    return errorResponse(res, 500, 'Error retrieving staff variance report', error);
  }
};

exports.getSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get session
    const [sessions] = await db.query(`
      SELECT 
        scs.*,
        u.name as staff_name,
        b.name as branch_name,
        bd.business_date
      FROM staff_cash_sessions scs
      INNER JOIN users u ON scs.user_id = u.id
      INNER JOIN branches b ON scs.branch_id = b.id
      LEFT JOIN business_days bd ON scs.business_day_id = bd.id
      WHERE scs.id = ?
    `, [id]);

    if (sessions.length === 0) {
      return notFoundResponse(res, 'Session not found');
    }

    // Non-managers can only see their own sessions
    if (!['manager', 'owner', 'accountant'].includes(req.user.role) && 
        sessions[0].user_id !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own sessions');
    }

    // Get all cashbook entries for this session
    const [entries] = await db.query(`
      SELECT * FROM cashbook_entries
      WHERE staff_cash_session_id = ?
      ORDER BY created_at
    `, [id]);

    return successResponse(res, 200, 'Session details retrieved successfully', {
      session: sessions[0],
      transactions: entries
    });

  } catch (error) {
    console.error('Get session details error:', error);
    return errorResponse(res, 500, 'Error retrieving session details', error);
  }
};

module.exports = exports;