const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Створюємо ENUM тип окремо
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_orders_status" AS ENUM ('reserved', 'completed', 'cancelled');
    `);

    await queryInterface.createTable('orders', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: 'enum_orders_status',
        defaultValue: 'reserved',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_orders_status";`);
  },
};
