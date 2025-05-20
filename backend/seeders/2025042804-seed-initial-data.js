// 2025042805-seed-initial-data.js
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Users', [{
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('Categories', [
      {
        name: 'Футболки',
        description: 'Спортивні футболки для тренувань',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Шорти',
        description: 'Спортивні шорти для бігу та тренувань',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    await queryInterface.bulkInsert('Products', [
      {
        name: 'Футболка Nike Pro',
        description: 'Дихаюча футболка для інтенсивних тренувань',
        price: 29.99,
        stock: 100,
        imageUrl: '/uploads/nike-pro.jpg',
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Шорти Adidas Run',
        description: 'Легкі шорти для бігу',
        price: 24.99,
        stock: 50,
        imageUrl: '/uploads/adidas-run.jpg',
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Orders', null, {});
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};