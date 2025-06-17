import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import api from '@/api';
import config from '@/config';

function AdminDashboard() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null,
    categoryId: ''
  });
  const [categoryForm, setCategoryForm] = useState({
    name: ''
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
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

    // Fetch products with pagination
    api.get('/products', {
      params: { page, limit }
    })
      .then(response => {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      })
      .catch(error => console.error(error));

    // Fetch categories
    api.get('/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error(error));
  }, [token, navigate, page]);

  // Product Form Handlers
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  const handleProductFileChange = (e) => {
    setProductForm({ ...productForm, image: e.target.files[0] });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      formData.append('categoryId', productForm.categoryId);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(t('admin_dashboard.product_updated'));
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(t('admin_dashboard.product_added'));
      }

      // Reset form and close modal
      setProductForm({ name: '', description: '', price: '', stock: '', image: null, categoryId: '' });
      setEditingProductId(null);
      setIsProductModalOpen(false);

      // Refresh products
      const response = await api.get('/products', { params: { page, limit } });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      alert(error.response?.data?.error || t('admin_dashboard.error'));
    }
  };

  const handleProductEdit = (product) => {
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: null,
      categoryId: product.categoryId
    });
    setEditingProductId(product.id);
    setIsProductModalOpen(true);
  };

  const handleProductDelete = async (id) => {
    if (window.confirm(t('admin_dashboard.confirm_delete_product'))) {
      try {
        await api.delete(`/products/${id}`);
        alert(t('admin_dashboard.product_deleted'));
        setProducts(products.filter(product => product.id !== id));
        // Refresh pagination if needed
        if (products.length === 1 && page > 1) {
          setPage(page - 1);
        }
      } catch (error) {
        alert(error.response?.data?.error || t('admin_dashboard.error'));
      }
    }
  };

  const openProductModal = () => {
    setProductForm({ name: '', description: '', price: '', stock: '', image: null, categoryId: '' });
    setEditingProductId(null);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductForm({ name: '', description: '', price: '', stock: '', image: null, categoryId: '' });
    setEditingProductId(null);
    setIsProductModalOpen(false);
  };

  // Category Form Handlers
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({ ...categoryForm, [name]: value });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await api.put(`/categories/${editingCategoryId}`, { name: categoryForm.name });
        alert(t('admin_dashboard.category_updated'));
      } else {
        await api.post('/categories', { name: categoryForm.name });
        alert(t('admin_dashboard.category_added'));
      }

      // Reset form and close modal
      setCategoryForm({ name: '' });
      setEditingCategoryId(null);
      setIsCategoryModalOpen(false);

      // Refresh categories
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      alert(error.response?.data?.error || t('admin_dashboard.error'));
    }
  };

  const handleCategoryEdit = (category) => {
    setCategoryForm({ name: category.name });
    setEditingCategoryId(category.id);
    setIsCategoryModalOpen(true);
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm(t('admin_dashboard.confirm_delete_category'))) {
      try {
        await api.delete(`/categories/${id}`);
        alert(t('admin_dashboard.category_deleted'));
        setCategories(categories.filter(category => category.id !== id));
      } catch (error) {
        alert(error.response?.data?.error || t('admin_dashboard.error'));
      }
    }
  };

  const openCategoryModal = () => {
    setCategoryForm({ name: '' });
    setEditingCategoryId(null);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryForm({ name: '' });
    setEditingCategoryId(null);
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('admin_dashboard.title')}</h1>

      {/* Products Section */}
      <h2 className="text-xl font-semibold mb-2">{t('admin_dashboard.products')}</h2>
      <div className="mb-8">
        <button
          onClick={openProductModal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('admin_dashboard.add_product')}
        </button>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">
              {editingProductId ? t('admin_dashboard.edit_product') : t('admin_dashboard.add_product')}
            </h2>
            <form onSubmit={handleProductSubmit}>
              <div className="mb-4">
                <label className="block mb-1">{t('admin_dashboard.name')}</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">{t('admin_dashboard.description')}</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">{t('admin_dashboard.price')}</label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleProductInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">{t('admin_dashboard.stock')}</label>
                <input
                  type="number"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleProductInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">{t('admin_dashboard.image')}</label>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png"
                  onChange={handleProductFileChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">{t('admin_dashboard.category')}</label>
                <select
                  name="categoryId"
                  value={productForm.categoryId}
                  onChange={handleProductInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">{t('admin_dashboard.select_category')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  {t('admin_dashboard.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingProductId ? t('admin_dashboard.update_product') : t('admin_dashboard.add_product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {products.map(product => (
          <div key={product.id} className="border rounded p-4">
            <img 
              src={product.imageUrl ? `${config.apiBaseUrl.replace('/api', '')}${product.imageUrl}` : '/placeholder.jpg'} 
              alt={product.name} 
              className="w-full h-48 object-contain bg-white mb-2" 
            />
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">${product.price}</p>
            <p className="text-gray-500">{t('admin_dashboard.stock')}: {product.stock}</p>
            <p className="text-gray-500">
              {product.Category ? product.Category.name : t('admin_dashboard.no_category')}
              </p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleProductEdit(product)}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                {t('admin_dashboard.edit')}
              </button>
              <button
                onClick={() => handleProductDelete(product.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t('admin_dashboard.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 mb-8">
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

      {/* Categories Section */}
      <h2 className="text-xl font-semibold mb-2">{t('admin_dashboard.categories')}</h2>
      <div className="mb-8">
        <button
          onClick={openCategoryModal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('admin_dashboard.add_category')}
        </button>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategoryId ? t('admin_dashboard.edit_category') : t('admin_dashboard.add_category')}
            </h2>
            <form onSubmit={handleCategorySubmit}>
              <div className="mb-4">
                <label className="block mb-1">{t('admin_dashboard.category_name')}</label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  {t('admin_dashboard.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCategoryId ? t('admin_dashboard.update_category') : t('admin_dashboard.add_category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(category => (
          <div key={category.id} className="border rounded p-4">
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleCategoryEdit(category)}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                {t('admin_dashboard.edit')}
              </button>
              <button
                onClick={() => handleCategoryDelete(category.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t('admin_dashboard.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;