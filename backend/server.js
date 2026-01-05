require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});