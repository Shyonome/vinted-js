const express = require('express');
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const User = require('../models/User.js');
const Offer = require('../models/Offer.js');
const Transaction = require('../models/Transaction.js');

const authenticate = require('../middleware/middleware.js');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/*----------*/

router.post('/user/signup', async (request, response) => {

    try {

        const checkEmailAccount = await User.findOne({ email: request.fields.email });
        const checkAccountUsername = await User.findOne({ username: request.fields.username });

        if (request.fields.username && checkEmailAccount === null && checkAccountUsername === null) {

            const password = request.fields.password;
            const salt = uid2(16);
            const hash = SHA256(password + salt).toString(encBase64);
            const token = uid2(16);

            if (request.files.avatar) {

                let pictureToUpload = request.files.avatar.path;
                const avatar = await cloudinary.uploader.upload(pictureToUpload);
    
                const newUser = new User({
                    email: request.fields.email,
                    account: {
                      username: request.fields.username,
                      phone: request.fields.phone,
                      avatar: avatar,
                    },
                    token: token,
                    hash: hash,
                    salt: salt
                });

                await newUser.save();

            } else {

                const newUser = new User({
                    email: request.fields.email,
                    account: {
                      username: request.fields.username,
                      phone: request.fields.phone,
                      avatar: {},
                    },
                    token: token,
                    hash: hash,
                    salt: salt
                });

                await newUser.save();

            }

            const checkCreatedAccount = await User.findOne({ email: request.fields.email });

            response.status(200).json({
                _id: checkCreatedAccount._id,
                token: checkCreatedAccount.token,
                account: checkCreatedAccount.account
            });

        } else {

            response.status(200).json({ message: { error: 'email already exists or username is invalid' } });

        }
        
    } catch (error) {
        
        response.status(400).json({ message: { error: error.message } });

    }

});

router.post('/user/login', async (request, response) => {

    try {

        const password = request.fields.password;
        const checkEmailAccount = await User.findOne({ email: request.fields.email });

        if(password && checkEmailAccount !== null) {

            const findHash = SHA256(password + checkEmailAccount.salt).toString(encBase64);

            if (findHash === checkEmailAccount.hash) {

                response.status(200).json({
                    _id: checkEmailAccount._id,
                    token: checkEmailAccount.token,
                    account: checkEmailAccount.account
                });
                
            } else {

                response.status(401).json({ message: { error: "Unauthorized" } });

            }
            

        } else {

            response.status(401).json({ message: { error: 'Unauthorized' } });

        }
        
    } catch (error) {
        
        response.status(400).json({ message: error.message });

    }

});

router.post('/offer/publish', authenticate, async (request, response) => {
    
    try {

        if (request.files.picture) {
            
            let pictureToUpload = request.files.picture.path;
            const product = await cloudinary.uploader.upload(pictureToUpload);
            
            const newOffer = new Offer({
                product_name: request.fields.title,
                product_description: request.fields.description,
                product_price: request.fields.price,
                product_details: [
                    {
                        MARQUE: request.fields.brand
                    },
                    {
                        TAILLE: request.fields.size
                    },
                    {
                        ÉTAT: request.fields.condition
                    },
                    {
                        COULEUR: request.fields.color
                    },
                {
                    EMPLACEMENT: request.fields.city
                }
            ],
            owner: request.user,
            product_image: product
        });

        newOffer.save();
        
        response.status(200).json({
            _id: product.asset_id,
            product_name: request.fields.title,
            product_description: request.fields.description,
            product_price: request.fields.price,
            product_details: [
                {
                    MARQUE: request.fields.brand
                },
                {
                    TAILLE: request.fields.size
                },
                {
                    ÉTAT: request.fields.condition
                },
                {
                    COULEUR: request.fields.color
                },
                {
                    EMPLACEMENT: request.fields.city
                }
            ],
                owner: {
                    account: {
                        username: request.user.account.username,
                        phone: request.user.account.phone,
                        avatar: request.user.account.avatar
                    }
                },
                product_image: product
            });
        
        } else {

            const newOffer = new Offer({
                product_name: request.fields.title,
                product_description: request.fields.description,
                product_price: request.fields.price,
                product_details: [
                    {
                        MARQUE: request.fields.brand
                    },
                    {
                        TAILLE: request.fields.size
                    },
                    {
                        ÉTAT: request.fields.condition
                    },
                    {
                        COULEUR: request.fields.color
                    },
                {
                    EMPLACEMENT: request.fields.city
                }
            ],
            owner: request.user,
        });

        newOffer.save();
        
        response.status(200).json({
            product_name: request.fields.title,
            product_description: request.fields.description,
            product_price: request.fields.price,
            product_details: [
                {
                    MARQUE: request.fields.brand
                },
                {
                    TAILLE: request.fields.size
                },
                {
                    ÉTAT: request.fields.condition
                },
                {
                    COULEUR: request.fields.color
                },
                {
                    EMPLACEMENT: request.fields.city
                }
            ],
                owner: {
                    account: {
                        username: request.user.account.username,
                        phone: request.user.account.phone,
                        avatar: request.user.account.avatar
                    }
                },
            });

        }
        
    } catch (error) {
        
        response.status(200).json({ message: error.message });

    }

});

router.post("/payment", async (request, response) => {
    const stripeToken = request.fields.token;
    const stripeResponse = await stripe.charges.create({
        amount: request.fields.amount * 100,
        description: request.fields.description,
        currency: "eur",
        source: stripeToken,
    });
    if (stripeResponse.status === "succeeded") {
        response.status(200).json({ message: "Paiement validé" });
      } else {
        response.status(400).json({ message: "An error occured" });
    }
    
    const newTransaction = new Transaction({
        annonce: "6193d609d77fbfe9b986948a",
        owner: request.fields.ownerId,
    })

    newTransaction.save();

});

/*----------*/

module.exports = router;