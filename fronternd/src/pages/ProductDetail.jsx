import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import config from '../config';

function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', { productId: id, quantity });
      alert(t('product_detail.add_to_cart'));
    } catch (error) {
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">{t('product_detail.loading')}</div>;
  }

  if (!product) {
    return <div className="container mx-auto p-4">Product not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <img 
          src={product.imageUrl ? `${config.apiBaseUrl.replace('/api', '')}${product.imageUrl}` : '/placeholder.jpg'} 
          alt={product.name} 
          className="w-full md:w-1/2 h-64 object-contain bg-white" 
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-2">${product.price}</p>
          <p className="text-gray-500 mb-4">{product.description}</p>
          <div className="mb-4">
            <label className="block mb-1">{t('product_detail.quantity')}</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="p-2 border rounded w-20"
            />
          </div>
          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('product_detail.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;