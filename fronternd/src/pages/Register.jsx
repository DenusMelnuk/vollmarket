import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import api from '../api';
import config from '../config';

function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${apiBaseUrl}/register`, form);
      alert(t('register.success'));
      navigate('/login');
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">{t('navbar.register')}</h1>
      <div>
        <div className="mb-4">
          <label className="block mb-1">{t('admin_dashboard.username')}</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">{t('admin_dashboard.password')}</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">{t('admin_dashboard.email')}</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('navbar.register')}
        </button>
      </div>
    </div>
  );
}

export default Register;
