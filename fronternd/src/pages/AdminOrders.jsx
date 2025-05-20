import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';

function AdminOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const user = jwtDecode(token);
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    axios.get('http://localhost:3000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setOrders(response.data))
      .catch(error => console.error(error));
  }, [token, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('admin_orders.title')}</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">{t('admin_orders.order_id')}</th>
              <th className="p-2 border">{t('admin_orders.user')}</th>
              <th className="p-2 border">{t('admin_orders.product')}</th>
              <th className="p-2 border">{t('admin_orders.quantity')}</th>
              <th className="p-2 border">{t('admin_orders.status')}</th>
              <th className="p-2 border">{t('admin_orders.date')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-100">
                <td className="p-2 border">{order.id}</td>
                <td className="p-2 border">{order.User.username} ({order.User.email})</td>
                <td className="p-2 border">{order.Product.name} (${order.Product.price})</td>
                <td className="p-2 border">{order.quantity}</td>
                <td className="p-2 border">{order.status}</td>
                <td className="p-2 border">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;