const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const employeeRoutes = require('./routes/employeesRoutes');
const sessionRoutes = require('./routes/sessionsRoutes');

app.use('/api/employees', employeesRoutes);
app.use('/api/sessions', sessionsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

module.exports = app;
