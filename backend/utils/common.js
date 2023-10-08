const { Op } = require("sequelize");

const calculateRating = spots => {
    for (const spot of spots) {
        const Reviews = spot.Reviews;

        if(Reviews.length){
            let totalRatingSum = 0
            Reviews.forEach(review =>{
                totalRatingSum += review.stars
            }
            );
            spot.dataValues.avgRating = Math.round(totalRatingSum * 100.0 / Reviews.length) / 100;
        }else{
            spot.dataValues.avgRating = 0
        }

    }
}

const setPreviewImage = spots => {
    for (const spot of spots) {
        const SpotImages = spot.SpotImages;

        if(SpotImages.length){
            spot.dataValues.previewImage = SpotImages[0]?.url
        }else{
            spot.dataValues.previewImage = null
        }

    }
}

const pickAttributes = (modelObj, attributes = []) => {
    const returnVal = {};
    attributes.forEach(attr => {
        returnVal[attr] = modelObj.dataValues[attr]
    })
    return returnVal;
}

const isQueryParamDefined = param => {
    return !(typeof param === "undefined" || (typeof param === "String" && param === ""))
}

// query("maxLng")
// .optional(true)
// .isFloat({ max: 180 })

// .withMessage("Maximum longitude is invalid"),
// query("minLng")
// .optional(true)
// .isFloat({ min: -180 })

// .withMessage("Minumum longitude is invalid"),
// query("maxLat")
// .optional(true)
// .isFloat({ max: 90 })
// .withMessage("Maximum latitude is invalid"),
// query("minLat")
// .optional(true)
// .isFloat({ min: -90 })
  // minLat: decimal, optional
  // maxLat: decimal, optional
  // minLng: decimal, optional
  // maxLng: decimal, optional
  // minPrice: decimal, optional, minimum: 0
  // maxPrice: decimal, optional, minimum: 0

const formWhereQuery = queryParams => {

    const where = {}
    // setting LAT
    if(queryParams.maxLat || queryParams.minLat){
        where.lat = {[Op.gte]: queryParams.minLat || "-90", [Op.lte]: queryParams.maxLat || "90" }
    }
    // setting LONG
    if(queryParams.maxLng || queryParams.minLng){
        where.lng = {[Op.gte]: queryParams.minLng || "-180", [Op.lte]: queryParams.maxLng || "180" }
    }
    // setting price
    if(queryParams.maxPrice && !queryParams.minPrice){
        where.price = {[Op.gte]: "0", [Op.lte]: queryParams.maxPrice}
    }else if (queryParams.minPrice && !queryParams.maxPrice){
        where.price = {[Op.gte]: queryParams.minPrice}
    }else if(queryParams.minPrice && queryParams.maxPrice){
        where.price = {[Op.gte]: queryParams.minPrice, [Op.lte]: queryParams.maxPrice}
    }
    return where;
}

module.exports = { setPreviewImage, calculateRating, pickAttributes, isQueryParamDefined, formWhereQuery };
