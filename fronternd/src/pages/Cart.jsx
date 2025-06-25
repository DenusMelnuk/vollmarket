import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import config from '../config';

function Cart() {
  const { t } = useTranslation();
  const [allOrders, setAllOrders] = useState([]);
  // Початковий фільтр для відображення "кошика" (зарезервованих замовлень)
  const [filterStatus, setFilterStatus] = useState('reserved');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.get('/orders');
      setAllOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data?.error || error.message);
      alert(t('cart.fetch_error') + (error.response?.data?.error || ''));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate, t]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'all') {
      return allOrders;
    }
    return allOrders.filter(order => order.status === filterStatus);
  }, [allOrders, filterStatus]);

  const handleRemove = async (orderId) => {
    if (!window.confirm(t('cart.confirm_remove'))) {
      return;
    }
    try {
      await api.delete(`/orders/${orderId}`);
      setAllOrders(prevOrders => prevOrders.filter(item => item.id !== orderId));
      alert(t('cart.remove_success'));
    } catch (error) {
      console.error("Error removing order:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || t('cart.remove_error'));
    }
  };

  // Функція для "оформлення" замовлення (зміни статусу на completed)
  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm(t('cart.confirm_complete_order'))) {
      return;
    }
    try {
      // Оновлюємо статус конкретного замовлення на 'completed'
      await api.patch(`/orders/${orderId}/status`, { status: 'completed' });

      // Оновлюємо стан allOrders, щоб відобразити зміну статусу
      setAllOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'completed' } : order
        )
      );
      alert(t('cart.order_completed_success'));
    } catch (error) {
      console.error("Error completing order:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || t('cart.complete_order_error'));
    }
  };

  // Функція для "скасування" замовлення (зміни статусу на canceled)
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t('cart.confirm_cancel_order'))) {
      return;
    }
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'canceled' });

      setAllOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'canceled' } : order
        )
      );
      alert(t('cart.order_canceled_success'));
    } catch (error) {
      console.error("Error canceling order:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || t('cart.cancel_order_error'));
    }
  };


  const total = filteredOrders.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('cart.title')}</h1>

      {/* Фільтр для замовлень */}
      <div className="mb-4">
        <button
          onClick={() => setFilterStatus('reserved')}
          className={`px-4 py-2 mr-2 rounded ${filterStatus === 'reserved' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {t('cart.filter_reserved')} ({allOrders.filter(o => o.status === 'reserved').length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 mr-2 rounded ${filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {t('cart.filter_completed')} ({allOrders.filter(o => o.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilterStatus('canceled')}
          className={`px-4 py-2 mr-2 rounded ${filterStatus === 'canceled' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {t('cart.filter_canceled')} ({allOrders.filter(o => o.status === 'canceled').length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {t('cart.filter_all')} ({allOrders.length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <p>{t('cart.empty_filtered')}</p>
      ) : (
        <div>
          {filteredOrders.map(item => (
            <div key={item.id} className="flex items-center border-b py-4">
              <img
                src={item.product?.imageUrl ? `${config.apiBaseUrl.replace('/api', '')}${item.product.imageUrl}` : '/placeholder.jpg'}
                alt={item.product?.name || 'Product Image'}
                className="w-24 h-24 object-contain bg-white mr-4"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.product?.name || 'Unknown Product'}</h2>
                <p className="text-gray-600">${(item.product?.price || '0.00')} x {item.quantity}</p>
                <p className="text-sm text-gray-500">{t('cart.status')}: {t(`cart.status_${item.status}`)}</p>
              </div>
              {/* Кнопки дій залежно від статусу */}
              {item.status === 'reserved' && (
                <>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
                  >
                    {t('cart.remove')}
                  </button>
                  <button
                    onClick={() => handleCompleteOrder(item.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                  >
                    {t('cart.complete_order')}
                  </button>
                  <button
                    onClick={() => handleCancelOrder(item.id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    {t('cart.cancel_order')}
                  </button>
                </>
              )}
              {item.status === 'completed' && (
                <span className="px-4 py-2 text-green-600 font-semibold">{t('cart.completed_label')}</span>
              )}
              {item.status === 'canceled' && (
                <span className="px-4 py-2 text-gray-600 font-semibold">{t('cart.canceled_label')}</span>
              )}
            </div>
          ))}
          <div className="mt-4">
            <p className="text-xl font-semibold">{t('cart.total')}: ${total.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
