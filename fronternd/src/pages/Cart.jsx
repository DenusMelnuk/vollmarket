import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import config from '../config';

function Cart() {
  const { t } = useTranslation();
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/orders'); // Ваш бекенд повертає дані для Cart.js
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error.response?.data?.error || error.message);
        alert(t('cart.fetch_error') + (error.response?.data?.error || ''));
      }
    };

    fetchOrders();
  }, [navigate, t]);

  const handleRemove = async (orderId) => { // Приймає orderId
    try {
      await api.delete(`/orders/${orderId}`);
      setCart(cart.filter(item => item.id !== orderId));
    } catch (error) {
      console.error("Error removing order:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || t('cart.remove_error'));
    }
  };

  const handleCheckout = async () => {
    // Ваша поточна логіка checkout, яка просто очищує кошик на фронтенді,
    // оскільки замовлення вже "reserved" на бекенді.
    try {
        setCart([]); // Очищуємо кошик на фронтенді
        alert(t('cart.order_placed_success'));
    } catch (error) {
        console.error("Error during checkout:", error.response?.data?.error || error.message);
        alert(error.response?.data?.error || t('cart.checkout_error'));
    }
  };

  // Тут теж зміна: item.product замість item.Product
  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('cart.title')}</h1>
      {cart.length === 0 ? (
        <p>{t('cart.empty')}</p>
      ) : (
        <div>
          {cart.map(item => (
            // Тут теж зміна: item.product замість item.Product
            <div key={item.id} className="flex items-center border-b py-4">
              <img
                src={item.product?.imageUrl ? `${config.apiBaseUrl.replace('/api', '')}${item.product.imageUrl}` : '/placeholder.jpg'}
                alt={item.product?.name || 'Product Image'}
                className="w-24 h-24 object-contain bg-white mr-4"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.product?.name || 'Unknown Product'}</h2>
                <p className="text-gray-600">${(item.product?.price || '0.00')} x {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t('cart.remove')}
              </button>
            </div>
          ))}
          <div className="mt-4">
            <p className="text-xl font-semibold">{t('cart.total')}: ${total.toFixed(2)}</p>
            <button
              onClick={handleCheckout}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('cart.checkout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
