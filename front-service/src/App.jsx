import { useState, useEffect } from 'react'

import { ChakraProvider, Center, Spinner, Flex } from '@chakra-ui/react';
import TableComponent from './components/TableComponent';
import axios from 'axios';

const App = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      
      console.log(newStatus)
      const response = await axios.put(`http://localhost:3000/api/order/${orderId}/status`, { status: newStatus });
      console.log(response.data.message); 
      const updatedOrders = orders.map(order => {
        if (order._id === orderId) {
          return { ...order, status: newStatus }; 
        }
        return order;
      });
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <ChakraProvider>
      <Center>
        {loading ? (
          <Flex align="center" justify="center" h="100vh">
            <Spinner size="xl" color="teal" />
          </Flex>
        ) : (
          <TableComponent orders={orders} onUpdateStatus={handleUpdateStatus} />
        )}
      </Center>
    </ChakraProvider>
  );
};


export default App
