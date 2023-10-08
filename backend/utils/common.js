const calculateRating = spots => {
    for (const spot of spots) {
        const Reviews = spot.Reviews;

        if(Reviews.length){
            let totalRatingSum = 0
            Reviews.forEach(review =>{
                totalRatingSum += review.stars
            }
            );
            // spot.dataValues.avgRating = totalRatingSum / Reviews.length;
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

module.exports = { setPreviewImage, calculateRating, pickAttributes };
