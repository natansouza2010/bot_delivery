const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    // Conectar ao RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'pizza_orders';

    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    // Conectar ao MongoDB
    const client = new MongoClient(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    const db = client.db();
    const ordersCollection = db.collection('orders');

    channel.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          const order = JSON.parse(msg.content.toString());
          console.log(`[x] Received order: ${JSON.stringify(order)}`);

          // Salvar o pedido no MongoDB
          await ordersCollection.insertOne(order);
          console.log(`[x] Order saved to database`);

          // Acknowledge message
          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

start();