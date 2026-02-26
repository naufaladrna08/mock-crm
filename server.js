const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const contactRoutes = require('./routes/contactRoutes');
const leadRoutes = require('./routes/leadRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/lead', leadRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    code: 404,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});