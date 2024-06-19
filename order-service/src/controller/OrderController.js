const { getChannel, connectToServices, getDb, create} = require('../config/db.js');
const { ObjectId } = require('mongodb');

async function createOrder(req, res) {
    const order = req.body;
  
    try {
    
      await connectToServices();
  
     
      const channel = getChannel();
  
   
      if (!channel) {
        throw new Error('Channel not available');
      }

      order.status = 'pendente';
      console.log("Enviando")
      channel.sendToQueue('pizza_orders', Buffer.from(JSON.stringify(order)));
  
      res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async function getAllOrders(req, res) {
    try {
     
      await connectToServices();
  
     
      const db = getDb();
  
      
      const orders = await db.collection('orders').find().toArray();
  
    
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error retrieving orders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async function updateOrderStatus(req, res) {
    const orderId = req.params.id;
    const newStatus = req.body.status;
  
    try {
    
      await connectToServices();
  
      const db = getDb();
   
      const result = await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status: newStatus } }
      );
      
      if (result.modifiedCount === 1) {
        
        if (newStatus === 'em entrega') {
          await notifyBot(orderId);
        }
        res.status(200).json({ message: 'Order status updated successfully' });
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }



  async function notifyBot(orderId, newStatus) {
    try {
    
      const client = await create('teste2499'); 
  
  
      const message = `Seu pedido com ID ${orderId} foi atualizado para o status: ${newStatus}`;
      await Promise.all([
        client.sendText('5516993225028@c.us', message)
    ]);
  
      console.log(`Bot notificado sobre a atualização do status do pedido ${orderId} para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao notificar o bot:', error);
    }
  }
  
  module.exports = {
    createOrder,
    getAllOrders,
    updateOrderStatus
  };
  
  