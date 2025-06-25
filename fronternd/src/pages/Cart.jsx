import { useState, useEffect, useMemo } from 'react'; // Додано useMemo
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import config from '../config';

function Cart() {
  const { t } = useTranslation();
  const [allOrders, setAllOrders] = useState([]); // Зберігатиме всі замовлення користувача
  const [filterStatus, setFilterStatus] = useState('reserved'); // 'reserved', 'processed', 'all'
  const navigate = useNavigate();

  // Функція для завантаження замовлень
  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.get('/orders');
      setAllOrders(response.data); // Зберігаємо всі отримані замовлення
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data?.error || error.message);
      alert(t('cart.fetch_error') + (error.response?.data?.error || ''));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate, t]);

  // Фільтрація замовлень на основі обраного статусу
  const filteredOrders = useMemo(() => {
    if (filterStatus === 'all') {
      return allOrders;
    }
    return allOrders.filter(order => order.status === filterStatus);
  }, [allOrders, filterStatus]);

  // Функція для видалення замовлення (не продукту з кошика!)
  const handleRemove = async (orderId) => {
    if (!window.confirm(t('cart.confirm_remove'))) {
      return; // Скасувати, якщо користувач не підтвердив
    }
    try {
      await api.delete(`/orders/${orderId}`);
      // Оновлюємо список замовлень після видалення
      setAllOrders(prevOrders => prevOrders.filter(item => item.id !== orderId));
      alert(t('cart.remove_success'));
    } catch (error) {
      console.error("Error removing order:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || t('cart.remove_error'));
    }
  };

  // Функція для оформлення замовлення
  const handleCheckout = async (orderId) => {
    if (!window.confirm(t('cart.confirm_checkout'))) {
      return; // Скасувати
    }
    try {
      // Оновлюємо статус конкретного замовлення на 'processed'
      await api.patch(`/orders/${orderId}/status`, { status: 'processed' });

      // Оновлюємо стан allOrders, щоб відобразити зміну статусу
      setAllOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'processed' } : order
        )
      );
      alert(t('cart.order_placed_success'));
    } catch (error) {
      console.error("Error during checkout:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || t('cart.checkout_error'));
    }
  };

  // Розрахунок загальної суми для відфільтрованих замовлень
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
          onClick={() => setFilterStatus('processed')}
          className={`px-4 py-2 mr-2 rounded ${filterStatus === 'processed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {t('cart.filter_processed')} ({allOrders.filter(o => o.status === 'processed').length})
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
                    onClick={() => handleCheckout(item.id)} // Передаємо ID замовлення
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {t('cart.checkout_item')} {/* Змінив текст кнопки */}
                  </button>
                </>
              )}
              {item.status === 'processed' && (
                <span className="px-4 py-2 text-green-600 font-semibold">{t('cart.processed_label')}</span>
              )}
            </div>
          ))}
          <div className="mt-4">
            <p className="text-xl font-semibold">{t('cart.total')}: ${total.toFixed(2)}</p>
            {/* Загальна кнопка "Оформити всі" (якщо потрібно)
            {filterStatus === 'reserved' && filteredOrders.length > 0 && (
                <button
                    onClick={() => {
                        if (window.confirm(t('cart.confirm_checkout_all'))) {
                            // Логіка для оформлення всіх зарезервованих замовлень
                            // Можна зробити окремий запит до бекенду, наприклад:
                            // api.patch('/orders/bulk-status', { orderIds: filteredOrders.map(o => o.id), status: 'processed' });
                            alert(t('cart.all_orders_processed'));
                        }
                    }}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    {t('cart.checkout_all')}
                </button>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
