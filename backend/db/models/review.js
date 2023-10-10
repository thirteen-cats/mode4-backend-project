'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      Review.hasMany( models.ReviewImage,
        {
          foreignKey: "reviewId",
          // onDelete: "CASCADE"
        }
      )
      // Review.hasMany( models.ReviewImage,
      //   {
      //     foreignKey: "reviewId",
      //     as: "previewImage",
      //     onDelete: "CASCADE"
      //   }
      // )
      Review.belongsTo( models.User,
        {
          foreignKey: "userId"
        }
      )

      Review.belongsTo( models.Spot,
        {
          foreignKey: "spotId"
        }
      )
    }
  }
  Review.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        // emptyValidate(value) {
        //   if(value === '') {
        //     throw new Error("Cannot be empty")
        //   }
        // },
        notNull: {
          msg: "Review text is required"
        }
      }
    },
    stars: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        isInt: {
          msg: "Stars must be an integer from 1 to 5"
        },
        min: 1,
        max: 5
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
