import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import config from '../config';

function Home() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    api.get('/products', {
      params: { categoryId: selectedCategory, page, limit }
    })
      .then(response => {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      })
      .catch(error => console.error(error));

    api.get('/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error(error));
  }, [selectedCategory, page]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('home.title')}</h1>

      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="p-2 border rounded"
        >
          <option value="">{t('home.all_categories')}</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <Link key={product.id} to={`/product/${product.id}`} className="border rounded p-4">
            <img 
              src={product.imageUrl ? `${config.apiBaseUrl.replace('/api', '')}${product.imageUrl}` : '/placeholder.jpg'} 
              alt={product.name} 
              className="w-full h-48 object-contain bg-white mb-2" 
            />
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">${product.price}</p>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 mr-2"
        >
          {t('admin_dashboard.previous')}
        </button>
        <span className="px-4 py-2">
          {t('admin_dashboard.page')} {page} {t('admin_dashboard.of')} {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {t('admin_dashboard.next')}
        </button>
      </div>
    </div>
  );
}

export default Home;