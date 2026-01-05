
// src/middlewares/validate.js - Request Validation Middleware
const Joi = require('joi');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User/Auth schemas
  register: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('owner', 'manager', 'cashier', 'storekeeper', 'accountant', 'receptionist', 'driver', 'salesperson').required(),
    phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Product schemas
  createProduct: Joi.object({
    business_id: Joi.number().integer().required(),
    name: Joi.string().min(2).max(255).required(),
    sku: Joi.string().max(100).optional(),
    barcode: Joi.string().max(100).optional(),
    category: Joi.string().max(100).optional(),
    subcategory: Joi.string().max(100).optional(),
    description: Joi.string().optional(),
    vat_applicable: Joi.boolean().default(true),
    vat_rate: Joi.number().min(0).max(100).default(18),
    sale_price: Joi.number().min(0).required(),
    cost_price: Joi.number().min(0).optional(),
    stock_unit: Joi.string().valid('PCS', 'KG', 'G', 'L', 'ML', 'M', 'CM', 'BOX', 'PACK').default('PCS'),
    min_stock_level: Joi.number().min(0).default(0),
    reorder_point: Joi.number().min(0).default(0),
    suggested_reorder_quantity: Joi.number().min(0).default(0)
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    category: Joi.string().max(100).optional(),
    description: Joi.string().optional(),
    sale_price: Joi.number().min(0).optional(),
    cost_price: Joi.number().min(0).optional(),
    min_stock_level: Joi.number().min(0).optional(),
    reorder_point: Joi.number().min(0).optional(),
    active: Joi.boolean().optional()
  }),

  // Sale schemas
  createSale: Joi.object({
    business_id: Joi.number().integer().required(),
    branch_id: Joi.number().integer().required(),
    warehouse_id: Joi.number().integer().required(),
    channel: Joi.string().valid('POS', 'FRONTDESK', 'ONLINE', 'PHONE').required(),
    customer_id: Joi.number().integer().optional(),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        variant_id: Joi.number().integer().optional(),
        quantity: Joi.number().min(0.001).required(),
        unit_price: Joi.number().min(0).required(),
        discount: Joi.number().min(0).default(0)
      })
    ).min(1).required(),
    payment_method: Joi.string().valid('CASH', 'MOMO', 'CARD', 'BANK_TRANSFER', 'CREDIT').optional(),
    payment_amount: Joi.number().min(0).optional(),
    discount_amount: Joi.number().min(0).default(0),
    notes: Joi.string().optional()
  }),

  // Customer schemas
  createCustomer: Joi.object({
    business_id: Joi.number().integer().required(),
    customer_group_id: Joi.number().integer().optional(),
    name: Joi.string().min(2).max(255).required(),
    phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    credit_allowed: Joi.boolean().default(false),
    credit_limit: Joi.number().min(0).default(0),
    credit_terms: Joi.number().integer().min(0).default(30)
  }),

  // Expense schemas
  createExpense: Joi.object({
    business_id: Joi.number().integer().required(),
    branch_id: Joi.number().integer().required(),
    category_id: Joi.number().integer().required(),
    expense_date: Joi.date().required(),
    amount: Joi.number().min(0).required(),
    vat_amount: Joi.number().min(0).default(0),
    payment_method: Joi.string().valid('CASH', 'BANK_TRANSFER', 'CARD', 'MOMO').required(),
    payee: Joi.string().min(2).max(255).required(),
    description: Joi.string().optional()
  }),

  // Stock adjustment
  stockAdjustment: Joi.object({
    product_id: Joi.number().integer().required(),
    warehouse_id: Joi.number().integer().required(),
    quantity: Joi.number().required(),
    type: Joi.string().valid('in', 'out').required(),
    reason: Joi.string().required(),
    notes: Joi.string().optional()
  }),

  // Purchase Order
  createPurchaseOrder: Joi.object({
    business_id: Joi.number().integer().required(),
    supplier_id: Joi.number().integer().required(),
    warehouse_id: Joi.number().integer().required(),
    order_date: Joi.date().required(),
    expected_date: Joi.date().optional(),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        variant_id: Joi.number().integer().optional(),
        quantity: Joi.number().min(0.001).required(),
        unit_cost: Joi.number().min(0).required()
      })
    ).min(1).required(),
    notes: Joi.string().optional()
  })
};

module.exports = {
  validate,
  schemas
};