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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    api.get('/cart')
      .then(response => setCart(response.data))
      .catch(error => console.error(error));
  }, [navigate]);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      setCart(cart.filter(item => item.productId !== productId));
    } catch (error) {
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      alert(t('cart.login_to_checkout'));
      return;
    }

    try {
      await api.post('/orders');
      setCart([]);
      alert(t('cart.order_placed'));
    } catch (error) {
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.Product.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('cart.title')}</h1>
      {cart.length === 0 ? (
        <p>{t('cart.empty')}</p>
      ) : (
        <div>
          {cart.map(item => (
            <div key={item.productId} className="flex items-center border-b py-4">
              <img 
                src={item.Product.imageUrl ? `${config.apiBaseUrl.replace('/api', '')}${item.Product.imageUrl}` : '/placeholder.jpg'} 
                alt={item.Product.name} 
                className="w-24 h-24 object-contain bg-white mr-4" 
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.Product.name}</h2>
                <p className="text-gray-600">${item.Product.price} x {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemove(item.productId)}
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