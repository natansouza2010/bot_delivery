const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const venom = require('venom-bot');


const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MONGO_URI = process.env.MONGO_URI;

let channel;
let db; // Instância do banco de dados
let ordersCollection;

async function connectToRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue('pizza_orders', { durable: true });
  console.log(`[*] Waiting for messages in pizza_orders. To exit press CTRL+C`);
}

async function connectToMongoDB() {
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  db = client.db(); // Armazena a instância do banco de dados
  ordersCollection = db.collection('orders');
}

async function startConsumers() {
  channel.consume(
    'pizza_orders',
    async (msg) => {
      if (msg !== null) {
        const order = JSON.parse(msg.content.toString());
        console.log(`[x] Received order: ${JSON.stringify(order)}`);

        // Salvar o pedido no MongoDB
        await ordersCollection.insertOne(order);
        console.log(`[x] Order saved to database with status: ${order.status}`);
      }
    },
    { noAck: true }
  );
}



let clientInstance = null;

async function create(sessionName) {
  if (!clientInstance) {
    clientInstance = await venom.create({
      session: sessionName, // Nome da sessão que você deseja usar
      // Outras configurações opcionais aqui, como 'headless': true para executar sem interface gráfica
    });
  }
  return clientInstance;
}


async function connectToServices() {
  await connectToRabbitMQ();
  await connectToMongoDB();
  await startConsumers();
}

function getChannel() {
  return channel;
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

module.exports = { connectToServices, getChannel, getDb , create};