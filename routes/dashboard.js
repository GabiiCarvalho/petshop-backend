const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, dashboardController.getDashboardData);
router.get('/financeiro', authMiddleware, dashboardController.getFinancialOverview);
router.get('/servicos/:servicoId', authMiddleware, dashboardController.getServiceMetrics);

module.exports = router;