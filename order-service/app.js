const express = require('express');
const bodyParser = require('body-parser');
const { connectToServices } = require('./src/config/db.js');
const orderRouter = require('./src/routes/OrderRoutes.js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(orderRouter);

app.get('/api/status', async (req, res)=>{
  return res.status(200).json({
      service: 'order-api',
      status: 'up',
      httpStatus: 200,

  });
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  connectToServices();
});

