'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spot.belongsTo(models.User,
        {
          foreignKey: "ownerId",
          as: "Owner",
          onDelete: 'CASCADE'
        }
      )
      Spot.hasMany( models.Review,
        {
          foreignKey: "spotId",
          onDelete: 'CASCADE'
        }
      )
      Spot.hasMany(models.Booking,
        {
          foreignKey: "spotId",
          onDelete: 'CASCADE'
        }
      )
      Spot.hasMany(models.SpotImage,
        {
          foreignKey: "spotId",
          onDelete: 'CASCADE'
        }
      )
    }

  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Street address is required"
        }
      },
    },
    city: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notNull: {
          msg: "City is required"
        }
      },
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "State is required"
        },
        //isIn: [['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']],
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Country is required"
        }
      },
    },
    lat: {
      type: DataTypes.DECIMAL(9,7),
      allowNull: false,
      validate: {
        min: -90,
        max: 90,
        notNull: {
          msg: 'Latitude is not valid'
        }
      }
    },
    lng: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: false,
      validate: {
        min: -180,
        max: 180,
        notNull: {
          msg: 'Longitude is not valid'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Name is required"
        },
        len: [1, 50]
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Description is required"
        },
        len: [1, 255]
      },
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        min: 0,
        notNull: {
          msg: "Price per day is required"
        },

      },
    }
  }, {
    sequelize,
    validate: {
      bothCoordsOrNone() {
        if ((this.latitude === null) !== (this.longitude === null)) {
          throw new Error('Either both latitude and longitude, or neither!');
        }
      }
    },
    modelName: 'Spot',
  });
  return Spot;
};
