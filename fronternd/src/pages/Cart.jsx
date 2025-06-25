// src/components/Cart.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import config from '../config';

function Cart() {
  const { t } = useTranslation();
  const [cart, setCart] = useState([]); // Буде зберігати замовлення
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Змінено URL, якщо ви використовуєте /admin/orders для адміна,
        // а для користувача - просто /orders, як я змінив вище
        const response = await api.get('/orders'); // Це буде /api/orders
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error.response?.data?.error || error.message);
        // Додайте більш детальну обробку помилок для користувача
        alert(t('cart.fetch_error') + (error.response?.data?.error || ''));
      }
    };

    fetchOrders();
  }, [navigate, t]); // Додано t в залежності useEffect

  // Функція для видалення замовлення (не продукту з кошика!)
  const handleRemove = async (orderId) => { // Приймає orderId, не productId
    try {
      await api.delete(`/orders/${orderId}`); // Викликає DELETE /api/orders/:orderId
      setCart(cart.filter(item => item.id !== orderId)); // Фільтруємо замовлення за id
    } catch (error) {
      console.error("Error removing order:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || t('cart.remove_error'));
    }
  };

  // Функція для оформлення замовлення
  // Увага: У вашому початковому коді handleCheckout був порожнім POST запитом
  // до /orders. Це нелогічно. Зазвичай, "оформлення замовлення" означає
  // перетворення тимчасового кошика на постійне замовлення або
  // підтвердження вже існуючих резервів.
  // Я припустив, що кошик містить вже існуючі "зарезервовані" замовлення
  // і ця кнопка просто очищує кошик. Якщо логіка інша - потрібно змінити.
  const handleCheckout = async () => {
    // Якщо ваша логіка "кошика" - це просто список замовлень, які ще не завершені,
    // і "checkout" означає їх "підтвердження" або "сплату",
    // то тут вам потрібно зробити запит до бекенду, щоб змінити статус цих замовлень.
    // Наприклад: await api.post('/orders/checkout', { orderIds: cart.map(item => item.id) });
    // Або якщо кожне "item" в cart - це вже готове замовлення, то просто очистити
    // кошик на фронтенді, бо воно вже створено на бекенді.

    // Якщо при натисканні "Оформити замовлення" ви маєте на увазі, що потрібно
    // створити НОВЕ замовлення (а не просто отримати список існуючих),
    // тоді вам потрібно передати productId та quantity до handleCheckout
    // з якихось інших джерел, наприклад, з localStorage, де зберігається кошик.

    // З огляду на ваш `POST /orders` маршрут, який приймає `productId` і `quantity`,
    // припустимо, що `handleCheckout` має створювати нові замовлення.
    // Або ж `cart` вже містить створені на бекенді замовлення.
    // Я залишу його поки як очистку, припускаючи, що `cart` вже містить
    // дані про "замовлені" товари (з бекенду).

    // Якщо "Оформити замовлення" (handleCheckout) створює НОВЕ замовлення
    // (наприклад, з кошика, який зберігається локально або в Redux),
    // вам потрібно буде пройтися по елементах кошика і для кожного
    // зробити POST запит до `/api/orders`
    // const localCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    // for (const item of localCartItems) {
    //     try {
    //         await api.post('/orders', { productId: item.id, quantity: item.quantity });
    //     } catch (error) {
    //         console.error(`Error placing order for product ${item.id}:`, error);
    //         alert(`Failed to order ${item.name}: ` + (error.response?.data?.error || ''));
    //         return; // Зупинити, якщо є помилка
    //     }
    // }

    // Якщо `cart` (стейт) вже містить дані з бекенду (тобто це вже зарезервовані замовлення),
    // тоді кнопка "Оформити замовлення" може просто очистити відображення кошика
    // або змінити статус цих замовлень на бекенді.
    // Для простоти, я залишу очищення стейту, але реальна логіка може бути іншою.

    // Я припускаю, що Cart.js відображає вже СТВОРЕНІ на бекенді "замовлення"
    // (що відповідає вашому GET /orders).
    // Тому кнопка "Оформити замовлення" не створює нових замовлень, а може,
    // наприклад, перенаправляти на сторінку оплати або просто очищувати фронтенд кошик,
    // оскільки "замовлення" вже існують.
    try {
        // Якщо тут має бути якась дія на бекенді (наприклад, зміна статусу замовлень на 'completed')
        // await api.post('/orders/complete', { orderIds: cart.map(item => item.id) });
        // Або якщо це просто підтвердження, то може й без запиту до бекенду,
        // оскільки вони вже "reserved".
        setCart([]); // Очищуємо кошик на фронтенді
        alert(t('cart.order_placed_success')); // Змінено текст повідомлення
    } catch (error) {
        console.error("Error during checkout:", error.response?.data?.error || error.message);
        alert(error.response?.data?.error || t('cart.checkout_error'));
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
            <div key={item.id} className="flex items-center border-b py-4"> {/* Використовуємо item.id як ключ */}
              <img
                src={item.Product?.imageUrl ? `${config.apiBaseUrl.replace('/api', '')}${item.Product.imageUrl}` : '/placeholder.jpg'} // Додав ? для безпеки
                alt={item.Product?.name || 'Product Image'} // Додав ? для безпеки
                className="w-24 h-24 object-contain bg-white mr-4"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.Product?.name || 'Unknown Product'}</h2> {/* Додав ? для безпеки */}
                <p className="text-gray-600">${item.Product?.price || '0.00'} x {item.quantity}</p> {/* Додав ? для безпеки */}
              </div>
              <button
                onClick={() => handleRemove(item.id)} // Передаємо order.id для видалення
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
