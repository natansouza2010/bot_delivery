const express = require('express');
const { createOrder, getAllOrders, updateOrderStatus  } = require('../controller/OrderController.js');
const router = express.Router();

router.post('/api/order/create', createOrder);
router.get('/api/orders/', getAllOrders);
router.put('/api/order/:id/status', updateOrderStatus )

module.exports = router;