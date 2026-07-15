const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in [${process.env.NODE_ENV || 'development'}] mode`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed. Server not started.', err);
    process.exit(1);
  });
