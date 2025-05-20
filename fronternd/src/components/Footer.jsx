import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-blue-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.about')}</h3>
            <p className="text-sm">
              {t('footer.about_description')}
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-blue-200">
                  {t('navbar.home')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm hover:text-blue-200">
                  {t('navbar.cart')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm hover:text-blue-200">
                  {t('navbar.login')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-blue-200">
                  {t('navbar.register')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-sm hover:text-blue-200">
                  {t('navbar.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
            <p className="text-sm">{t('footer.email')}: support@vollmart.com</p>
            <p className="text-sm">{t('footer.phone')}: +1 (123) 456-7890</p>
            <p className="text-sm">{t('footer.address')}: 123 Sport St, City, Country</p>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-blue-500 pt-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Vollmart Shop. {t('footer.rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;