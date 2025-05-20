import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/login', form);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">{t('navbar.login')}</h1>
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
        <button
          onClick={handleSubmit}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('navbar.login')}
        </button>
      </div>
    </div>
  );
}

export default Login;