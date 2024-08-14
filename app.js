// const express = require('express');
// const { connect } = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();
// connect();

// app.use(cors());
// app.use(express.json());

// // Test route for root URL
// app.get('/', (req, res) => {
//     res.send('Server is running');
//   });

// app.use('/api/auth', authRoutes);
// // app.use('/api', paymentRoutes);

// const PORT = process.env.PORT || 5050;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const { connect } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
connect();

app.use(cors());
app.use(express.json()); // No need for bodyParser separately

// Test route for root URL
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', authRoutes);
// app.use('/api/payments', paymentRoutes); // Uncomment if needed

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));