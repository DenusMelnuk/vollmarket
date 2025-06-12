import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };

    updateCartCount();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-10 mr-2" />
          <span className="text-xl font-bold">VOLLMART</span>
        </Link>
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div className={`md:flex items-center space-x-4 ${isOpen ? 'block' : 'hidden'} md:block`}>
          <Link to="/" className="block mt-4 md:mt-0 hover:text-blue-200">{t('navbar.home')}</Link>
          {token ? (
            <>
              <Link to="/cart" className="block mt-4 md:mt-0 hover:text-blue-200 relative">
                <FaShoppingCart className="inline-block mr-1" />
                {t('navbar.cart')}
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="block mt-4 md:mt-0 hover:text-blue-200">{t('navbar.admin')}</Link>
              )}
              <button onClick={handleLogout} className="block mt-4 md:mt-0 hover:text-blue-200">{t('navbar.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block mt-4 md:mt-0 hover:text-blue-200">{t('navbar.login')}</Link>
              <Link to="/register" className="block mt-4 md:mt-0 hover:text-blue-200">{t('navbar.register')}</Link>
            </>
          )}
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="block mt-4 md:mt-0 bg-blue-600 text-white border-none hover:bg-blue-700 p-1 rounded"
          >
            <option value="en">English</option>
            <option value="uk">Українська</option>
          </select>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;