# Business Management System - Backend API

Complete business management system supporting small retailers to large enterprises. Handles inventory, sales, purchasing, accounting, payroll, and reporting.

## 🚀 Features

- ✅ **Authentication & Authorization** - JWT-based with role-based access control
- ✅ **Multi-Business & Multi-Branch** - Support for multiple businesses and branches
- ✅ **Product Management** - Full CRUD with variants, images, and stock tracking
- ✅ **Sales & POS** - Complete POS system with multiple payment methods
- ✅ **Inventory Management** - Real-time stock tracking with forecasting
- ✅ **Purchase Management** - PO, invoices, supplier payments
- ✅ **VAT & Tax Compliance** - Automatic VAT calculations and tracking
- ✅ **Accounts Receivable/Payable** - Credit management
- ✅ **Expense Tracking** - Categorized expenses with approvals
- ✅ **Payroll System** - Employee payroll with PAYE and social security
- ✅ **File Uploads** - Cloudinary integration for images and documents
- ✅ **Comprehensive Reporting** - Sales, inventory, financial reports

## 📋 Prerequisites

- Node.js >= 14.0.0
- MySQL >= 8.0 or MariaDB >= 10.5
- Cloudinary account (for file uploads)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- Database credentials
- JWT secrets (generate strong random strings)
- Cloudinary credentials

### 4. Setup database
```bash
# Run migrations
npm run migrate

# Seed sample data (optional)
npm run seed
```

### 5. Start the server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Cloudinary configs
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, validation, upload, error handling
│   ├── routes/          # API routes
│   ├── services/        # Business logic (optional)
│   ├── utils/           # Helper functions
│   └── app.js           # Express app setup
├── database/
│   ├── complete-migrate.js
│   └── complete-seed.js
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json
└── server.js            # Entry point
```

## 🔐 Authentication

All API requests (except `/auth/register` and `/auth/login`) require authentication.

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "cashier",
  "phone": "+250788123456"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Use Token
```http
GET /api/v1/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `PUT /api/v1/auth/change-password` - Change password

### Products
- `GET /api/v1/products` - List products (with pagination, search, filters)
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product (with image upload)
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product (soft delete)
- `GET /api/v1/products/categories` - Get product categories

### Sales
- `GET /api/v1/sales` - List sales (with filters)
- `GET /api/v1/sales/:id` - Get sale details
- `POST /api/v1/sales` - Create sale (POS transaction)
- `POST /api/v1/sales/:id/payment` - Add payment to sale
- `GET /api/v1/sales/summary` - Get sales summary

## 🎭 User Roles

- **owner** - Full system access
- **manager** - Branch management, approvals
- **cashier** - POS operations, sales
- **storekeeper** - Inventory management
- **accountant** - Financial records, reports
- **receptionist** - Front desk sales (hotels/restaurants)
- **driver** - Delivery management
- **salesperson** - Sales, commissions

## 🖼️ File Uploads

Upload files with multipart/form-data:

```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Product Name",
  "sale_price": 100000,
  "image": <file>
}
```

Supported file types: jpg, jpeg, png, pdf, xlsx, xls, csv
Max file size: 5MB (configurable)

## 📊 Sample Requests

### Create a Sale
```http
POST /api/v1/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "business_id": 1,
  "branch_id": 1,
  "warehouse_id": 1,
  "channel": "POS",
  "customer_id": 2,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 1500000,
      "discount": 0
    },
    {
      "product_id": 4,
      "quantity": 5,
      "unit_price": 35000,
      "discount": 5000
    }
  ],
  "payment_method": "CASH",
  "payment_amount": 3170000,
  "discount_amount": 0
}
```

### List Products with Filters
```http
GET /api/v1/products?page=1&limit=20&search=laptop&category=Electronics&active=true
Authorization: Bearer <token>
```

## 🔄 Database Scripts

```bash
# Reset database (drop all tables and recreate)
npm run migrate

# Seed sample data
npm run seed

# Full reset (migrate + seed)
npm run reset
```

## 🛡️ Security Features

- ✅ Helmet.js security headers
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS protection
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation (Joi)
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection

## 📈 Performance

- Connection pooling (10 connections default)
- Response compression
- Efficient indexing on database
- Pagination on list endpoints
- Cloudinary CDN for images

## 🐛 Error Handling

All errors return standardized format:
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "details": "Additional error info (dev mode only)"
  }
}
```

## 📝 Development

### Hot reload (development)
```bash
npm run dev
```

### Environment modes
- `development` - Detailed error messages, console logs
- `production` - Minimal error details, optimized

## 🚧 TODO / Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Email notifications (nodemailer)
- [ ] SMS notifications (Twilio)
- [ ] Advanced reporting with charts
- [ ] Export to PDF/Excel
- [ ] Backup/restore functionality
- [ ] Multi-currency conversion
- [ ] Advanced inventory forecasting (ML)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for businesses of all sizes**