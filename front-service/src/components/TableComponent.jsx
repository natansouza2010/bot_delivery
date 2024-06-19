import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, Center, Button } from '@chakra-ui/react';

const TableComponent = ({ orders, onUpdateStatus }) => {
  const handleUpdateStatus = (orderId, currentStatus) => {
    // Lógica para atualizar o status aqui
    if (currentStatus === 'confirmado') {
      onUpdateStatus(orderId, 'em entrega');
    } else {
      onUpdateStatus(orderId, 'confirmado');
    }
  };

  return (
    <Center>
      <Table variant="simple" colorScheme="brand" size="md" mt={8} borderWidth="1px" borderRadius="lg">
        <TableCaption placement="top">Pedidos</TableCaption>
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Pizzas</Th>
            <Th>Entrega</Th>
            <Th>Endereço</Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th>Ação</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order._id}>
              <Td>{order.name}</Td>
              <Td>
                {Array.isArray(order.pizzas) ? (
                  <ul>
                    {order.pizzas.map((pizza, index) => (
                      <li key={index}>
                        {typeof pizza === 'string' ? pizza : pizza.pizza}
                        {typeof pizza !== 'string' && pizza.quantity ? ` (${pizza.quantity})` : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'Informação de pizza inválida'
                )}
              </Td>
              <Td>{order.delivery ? 'Sim' : 'Não'}</Td>
              <Td>{order.address}</Td>
              <Td>{`R$ ${order.totalPrice.toFixed(2)}`}</Td>
              <Td>{order.status}</Td>
              <Td>
                <Button colorScheme="teal" size="sm" onClick={() => handleUpdateStatus(order._id, order.status)}>
                  Atualizar Status
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default TableComponent;