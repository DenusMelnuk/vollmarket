import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Локалізаційні ресурси
const resources = {
  en: {
    translation: {
      "navbar": {
        "home": "Home",
        "cart": "Cart",
        "admin": "Admin",
        "logout": "Logout",
        "login": "Login",
        "register": "Register",
        "language": "Language"
      },
      "home": {
        "title": "Products",
        "all_categories": "All Categories"
      },
      "product_detail": {
        "quantity": "Quantity",
        "add_to_cart": "Add to Cart",
        "loading": "Loading..."
      },
      "cart": {
    "title": "Your Orders",
    "empty": "Your order list is empty.",
    "empty_filtered": "No orders found with this status.",
    "remove": "Remove",
    "checkout_item": "Process Order", // Змінив, бо тепер це оформлення окремого замовлення
    "checkout_all": "Process All Reserved", // Якщо додамо таку кнопку
    "order_placed_success": "Order status updated successfully!",
    "login_to_checkout": "Please log in to proceed with checkout.",
    "fetch_error": "Failed to load orders: ",
    "remove_error": "Failed to remove order.",
    "checkout_error": "Failed to process order.",
    "confirm_remove": "Are you sure you want to remove this order?",
    "confirm_checkout": "Are you sure you want to process this order?",
    "confirm_checkout_all": "Are you sure you want to process all reserved orders?",
    "all_orders_processed": "All reserved orders have been processed.",
    "total": "Total",
    "status": "Status",
    "status_reserved": "Reserved",
    "status_processed": "Processed",
    "status_completed": "Completed", // Якщо додамо ще статус
    "status_cancelled": "Cancelled", // Якщо додамо ще статус
    "processed_label": "Processed",
    "filter_reserved": "Reserved",
    "filter_processed": "Processed",
    "filter_all": "All Orders"
      },
      "admin_dashboard": {
        "title": "Admin Dashboard",
        "add_product": "Add Product",
        "edit_product": "Edit Product",
        "update_product": "Update Product",
        "products": "Products",
        "name": "Name",
        "description": "Description",
        "price": "Price",
        "stock": "Stock",
        "image": "Image",
        "category": "Category",
        "select_category": "Select Category",
        "cancel": "Cancel",
        "edit": "Edit",
        "delete": "Delete",
        "confirm_delete_product": "Are you sure you want to delete this product?",
        "product_added": "Product added successfully",
        "product_updated": "Product updated successfully",
        "product_deleted": "Product deleted successfully",
        "categories": "Categories",
        "add_category": "Add Category",
        "edit_category": "Edit Category",
        "update_category": "Update Category",
        "category_name": "Category Name",
        "confirm_delete_category": "Are you sure you want to delete this category?",
        "category_added": "Category added successfully",
        "category_updated": "Category updated successfully",
        "category_deleted": "Category deleted successfully",
        "previous": "Previous",
        "next": "Next",
        "page": "Page",
        "of": "of",
        "error": "An error occurred",
        "username": "Username",
        "password": "Password",
        "email": "Email"
      },
      "admin_orders": {
        "title": "Orders",
        "order_id": "Order ID",
        "user": "User",
        "product": "Product",
        "quantity": "Quantity",
        "status": "Status",
        "date": "Date"
      },
      "register": {
        "success": "User registered successfully"
      },
      "footer": {
        "about": "About Us",
        "about_description": "Sportswear Shop offers high-quality athletic clothing for all your fitness needs.",
        "links": "Quick Links",
        "contact": "Contact Us",
        "email": "Email",
        "phone": "Phone",
        "address": "Address",
        "rights_reserved": "All rights reserved."
      }
    }
  },
  uk: {
    translation: {
      "navbar": {
        "home": "Головна",
        "cart": "Кошик",
        "admin": "Адмін",
        "logout": "Вийти",
        "login": "Увійти",
        "register": "Зареєструватися",
        "language": "Мова"
      },
      "home": {
        "title": "Товари",
        "all_categories": "Усі категорії"
      },
      "product_detail": {
        "quantity": "Кількість",
        "add_to_cart": "Додати до кошика",
        "loading": "Завантаження..."
      },
      "cart": {
        "title": "Кошик",
         "empty": "Ваш список замовлень порожній.",
    "empty_filtered": "Немає замовлень з таким статусом.",
    "remove": "Видалити",
    "checkout_item": "Оформити",
    "checkout_all": "Оформити всі зарезервовані",
    "order_placed_success": "Статус замовлення успішно оновлено!",
    "login_to_checkout": "Будь ласка, увійдіть, щоб оформити замовлення.",
    "fetch_error": "Не вдалося завантажити замовлення: ",
    "remove_error": "Не вдалося видалити замовлення.",
    "checkout_error": "Не вдалося оформити замовлення.",
    "confirm_remove": "Ви впевнені, що хочете видалити це замовлення?",
    "confirm_checkout": "Ви впевнені, що хочете оформити це замовлення?",
    "confirm_checkout_all": "Ви впевнені, що хочете оформити всі зарезервовані замовлення?",
    "all_orders_processed": "Усі зарезервовані замовлення оформлено.",
    "total": "Всього",
    "status": "Статус",
    "status_reserved": "Зарезервовано",
    "status_processed": "Оформлено",
    "status_completed": "Виконано",
    "status_cancelled": "Скасовано",
    "processed_label": "Оформлено",
    "filter_reserved": "Зарезервовані",
    "filter_processed": "Оформлені",
    "filter_all": "Усі замовлення"
      },
      "admin_dashboard": {
        "title": "Панель адміністратора",
        "add_product": "Додати товар",
        "edit_product": "Редагувати товар",
        "update_product": "Оновити товар",
        "products": "Товари",
        "name": "Назва",
        "description": "Опис",
        "price": "Ціна",
        "stock": "Запас",
        "image": "Зображення",
        "category": "Категорія",
        "select_category": "Оберіть категорію",
        "cancel": "Скасувати",
        "edit": "Редагувати",
        "delete": "Видалити",
        "confirm_delete_product": "Ви впевнені, що хочете видалити цей товар?",
        "product_added": "Товар успішно додано",
        "product_updated": "Товар успішно оновлено",
        "product_deleted": "Товар успішно видалено",
        "categories": "Категорії",
        "add_category": "Додати категорію",
        "edit_category": "Редагувати категорію",
        "update_category": "Оновити категорію",
        "category_name": "Назва категорії",
        "confirm_delete_category": "Ви впевнені, що хочете видалити цю категорію?",
        "category_added": "Категорію успішно додано",
        "category_updated": "Категорію успішно оновлено",
        "category_deleted": "Категорію успішно видалено",
        "previous": "Попередня",
        "next": "Наступна",
        "page": "Сторінка",
        "of": "з",
        "error": "Сталася помилка",
        "username": "Ім'я користувача",
        "password": "Пароль",
        "email": "Електронна пошта"
      },
      "admin_orders": {
        "title": "Замовлення",
        "order_id": "ID замовлення",
        "user": "Користувач",
        "product": "Товар",
        "quantity": "Кількість",
        "status": "Статус",
        "date": "Дата"
      },
      "register": {
        "success": "Користувача успішно зареєстровано"
      },
      "footer": {
        "about": "Про нас",
        "about_description": "Магазин спортивного одягу пропонує якісний одяг для всіх ваших спортивних потреб.",
        "links": "Швидкі посилання",
        "contact": "Зв'яжіться з нами",
        "email": "Електронна пошта",
        "phone": "Телефон",
        "address": "Адреса",
        "rights_reserved": "Усі права захищено."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
