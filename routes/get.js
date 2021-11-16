const express = require('express');
const router = express.Router();

const Offer = require('../models/Offer.js');

/*----------*/

router.get('/offer', async (request, response) => {

    try {

        const title = request.query.title;
        const priceMin = request.query.priceMin;
        const priceMax = request.query.priceMax;
        const sort = request.query.sort;
        const page = request.query.page;

        let storedOffers = undefined;

        if (!title && !priceMin && !priceMax && !sort && !page) {
            
            storedOffers = await Offer.find();
    
        } else if (!page && (title || priceMin || priceMax || sort)) {

            if (title && !priceMax && !priceMin && !sort) {

                storedOffers = await Offer
                .find({product_name: new RegExp(request.query.title, "i")})
                .populate("owner")
                .limit(2);
    
            } else if (title && priceMax && !priceMin && !sort) {

                storedOffers = await Offer
                .find({
                    product_name: new RegExp(title, "i"),
                    product_price: { $lte: Number(priceMax) }
                })
                .populate("owner")
                .limit(2);
    
            } else if (priceMin && priceMax && !title && !sort) {

                storedOffers = await Offer
                .find({
                    product_price: { $lte: Number(priceMax) },
                    product_price: { $gte: Number(priceMin) }
                })
                .populate("owner")
                .limit(2);
    
            } else if (sort && !priceMin && !priceMax && !title) {

                if (sort === "price-desc") {

                    storedOffers = await Offer
                    .find()
                    .sort({ product_price: "desc" })
                    .populate("owner")
                    .limit(2);
        
                } else if (sort === "price-asc") {

                    storedOffers = await Offer
                    .find()
                    .sort({ product_price: "asc" })
                    .populate("owner")
                    .limit(2);
        
                }

            } else if (sort && title && !priceMin && !priceMax) {

                if (sort === "price-desc") {

                    storedOffers = await Offer
                    .find({product_name: new RegExp(title, "i")})
                    .sort({ product_price: "desc" })
                    .populate("owner")
                    .limit(2);
        
                } else if (sort === "price-asc") {

                    storedOffers = await Offer
                    .find({product_name: new RegExp(title, "i")})
                    .sort({ product_price: "asc" })
                    .populate("owner")
                    .limit(2)
        
                }

            } else {

                storedOffers = await Offer
                .find()
                .populate("owner")
                .limit(2);

            }

        } else if (page) {

            storedOffers = await Offer.find()
            .populate("owner")
            .limit(2).skip(page);

        }

        response.status(200).json({
            count: 1,
            offers: [
                {
                    product_details: storedOffers[0].product_details,
                    product_image: {
                        secure_url: storedOffers[0].product_image.secure_url
                    },
                    _id: storedOffers[0]._id,
                    product_name: storedOffers[0].product_name,
                    product_description: storedOffers[0].product_description,
                    product_price: storedOffers[0].product_price,
                    owner: {
                        account: {
                            username: storedOffers[0].owner.account.username,
                            phone: storedOffers[0].owner.account.phone,
                            avatar: {
                                secure_url: storedOffers[0].owner.account.avatar.secure_url,
                                originial_filename: storedOffers[0].owner.account.avatar.originial_filename
                            }
                        },
                        _id: storedOffers[0].owner._id
                    }
                }
            ]
        });

    } catch (error) {
        
        response.status(400).json({ message: error.message });

    }

});

router.get('/offer/:id', async (request, response) => {

    try {

        const storedOffers = await Offer.findById(request.params.id).populate("owner");

        if (storedOffers) {

            response.status(200).json({
                product_details: storedOffers.product_details,
                product_picture: [],
                _id: storedOffers._id,
                product_name: storedOffers.product_name,
                product_description: storedOffers.product_description,
                product_price: storedOffers.product_price,
                owner: {
                    account: {
                        username: storedOffers.owner.account.username,
                        phone: storedOffers.owner.account.phone,
                        avatar: storedOffers.owner.account.avatar
                    },
                    _id: storedOffers.owner._id,
                },
                product_image: storedOffers.product_image
            });
    
        } else {
    
            response.status(400).json({ message: { error: "Id not found" } });
    
        }
        
    } catch (error) {
        
        response.status(400).json({ message: error.message });

    }

});

/*----------*/

module.exports = router;