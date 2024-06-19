const venom = require('venom-bot');
const axios = require('axios');

venom.create({ session: 'pizza', headless: false }).then((client) => {
  start(client);
});

const sessions = {}; // Para armazenar o estado da conversa

// Preços das pizzas
const pizzaPrices = {
  Pepperoni: 52,
  'Quatro Queijos': 54,
  'Frango com Catupiry': 49,
};

// Taxa de entrega
const deliveryFee = 6;

function start(client) {
  client.onMessage((message) => {
    const chatId = message.from;

    // Inicialização da sessão se não existir
    if (!sessions[chatId]) {
      sessions[chatId] = { step: 0, order: { pizzas: [] } };
    }

    const session = sessions[chatId];

    // Gerenciamento dos passos da conversa
    switch (session.step) {
      case 0:
        client.sendText(chatId, 'Olá! Bem-vindo ao *Rabide* 🍕.\nQual é o seu nome ?');
        session.step++;
        break;

      case 1:
        session.order.name = message.body;
        sendPizzaOptions(client, chatId);
        session.step++;
        break;

      case 2:
        switch (message.body) {
          case '1':
            session.currentPizza = 'Pepperoni';
            break;
          case '2':
            session.currentPizza = 'Quatro Queijos';
            break;
          case '3':
            session.currentPizza = 'Frango com Catupiry';
            break;
          default:
            client.sendText(chatId, 'Opção inválida. Por favor, responda com o número da opção desejada.');
            return; // Não avança de etapa se a opção for inválida
        }
        client.sendText(chatId, `Você escolheu ${session.currentPizza}. \nQuantas unidades você gostaria de pedir?`);
        session.step++;
        break;

      case 3:
        const quantity = parseInt(message.body, 10);
        if (isNaN(quantity) || quantity <= 0) {
          client.sendText(chatId, 'Por favor, insira um número inteiro válido para a quantidade. ');
        } else {
          session.order.pizzas.push({ pizza: session.currentPizza, quantity: quantity });
          client.sendText(chatId, `🍕 Você selecionou ${quantity} unidades de ${session.currentPizza} \nGostaria de pedir mais alguma coisa? \n 1 - Sim \n 2 - Não.`);
          session.step++;
        }
        break;

      case 4:
        if (message.body === '1') {
          sendPizzaOptions(client, chatId);
          session.step = 2;
        } else if (message.body === '2') {
          session.step++;
          client.sendText(chatId, 'Você gostaria de delivery ou retirada?\n1-  Delivery \n2 -  Retirada. \n');
        } else {
          client.sendText(chatId, 'Resposta inválida.\n Por favor, responda com "1" para Sim ou "2" para Não.');
        }
        break;

      case 5:
        if (message.body === '1') {
          
          session.order.delivery = true;
          session.order.deliveryFee = deliveryFee; // Adiciona taxa de entrega ao pedido
          client.sendText(chatId, 'Por favor, informe o endereço de entrega: ');
          session.step++;
        } else if (message.body === '2') {
          session.order.delivery = false;
          session.order.deliveryFee = 0; // Não há taxa de entrega se for retirada
          client.sendText(chatId, `Confirmando seu pedido, ${session.order.name}:\n${getOrderSummary(session.order)}\nEstá correto? \n  1  - Sim \n 2 - para Não.\n`);
          session.step += 2;
        } else {
          client.sendText(chatId, 'Opção inválida. \n Por favor, responda com "1" para Delivery ou "2" para Retirada.');
        }
        break;

      case 6:
        session.order.address = message.body;
        client.sendText(chatId, `Você informou o endereço: ${session.order.address}. \nEstá correto?\n1  - Sim\n2 - para Não.\n`);
        session.step++;
        break;

      case 7:
        if (message.body === '1') {
          client.sendText(chatId, `Confirmando seu pedido, ${session.order.name}:\n${getOrderSummary(session.order)}\nEndereço: ${session.order.address}\nEstá correto?\n1  - Sim\n2 - para Não.\n`);
          session.step++;
        } else if (message.body === '2') {
          client.sendText(chatId, 'Por favor, informe o endereço de entrega correto.');
          session.step = 6; // Volta para a etapa de endereço
        } else {
          client.sendText(chatId, 'Resposta inválida. \n Por favor, responda com "1" para Sim ou "2" para Não.');
        }
        break;

      case 8:
        if (message.body === '1') {
          session.order.phone = message.from; 
          client.sendText(chatId, `Pedido confirmado! \n Obrigado por comprar na nossa pizzaria, ${session.order.name}.`);
          const orderInfo = {
            name: session.order.name,
            pizzas: session.order.pizzas,
            delivery: session.order.delivery,
            deliveryFee: session.order.deliveryFee,
            address: session.order.address,
            totalPrice: getTotalPrice(session.order),
            phone: session.order.phone, // Adiciona o telefone do cliente
            sessionId: session._id
          };
          console.log(orderInfo)
          
         
          axios.post('http://localhost:3000/api/order/create', orderInfo)
            .then(response => {
              console.log('Pedido enviado para a API:', response.data);
            })
            .catch(error => {
              console.error('Erro ao enviar pedido para a API:', error);
            });
            console.log("teste2")
          delete sessions[chatId];
        } else if (message.body === '2') {
          client.sendText(chatId, 'Pedido cancelado. Você pode iniciar um novo pedido a qualquer momento.');
          delete sessions[chatId]; 
        } else {
          client.sendText(chatId, 'Resposta inválida.\n Por favor, responda com "1" para Sim ou "2" para Não.');
        }
        break;

      default:
        client.sendText(chatId, 'Desculpe, algo deu errado. Vamos começar de novo. Qual é o seu nome?');
        session.step = 1;
        break;
    }
  });
}

function sendPizzaOptions(client, chatId) {
  client.sendText(chatId, ` 🍕 *Aqui estão os sabores de pizza que temos*: \n
  1. Pepperoni - R$52
  2. Quatro Queijos - R$54
  3. Frango com Catupiry - R$49
  \n
  Por favor, responda com o número da opção desejada: `);
  }
  
  function getOrderSummary(order) {
    let total = 0;
    let summary = '📋 Resumo do seu pedido:';
    order.pizzas.forEach((item, index) => {
      const price = pizzaPrices[item.pizza] * item.quantity;
      total += price;
      summary += `\n${index + 1}. ${item.quantity} x ${item.pizza} - R$${price}`;
    });
    summary += `\nTaxa de entrega: R$${order.deliveryFee}`;
    summary += `\nTotal: R$${total + order.deliveryFee}`;
    return summary;
  }

  
  
  function getTotalPrice(order) {
    let total = 0;
    order.pizzas.forEach((item) => {
      const price = pizzaPrices[item.pizza] * item.quantity;
      total += price;
    });
    total += order.deliveryFee;
    return total;
  }