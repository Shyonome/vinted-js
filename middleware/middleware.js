const cloudinary = require("cloudinary").v2;

const User = require('../models/User.js');

const isAuthenticated = async (request, response, next) => {

    const bearerToken = request.headers.authorization.replace("Bearer ", "");

    if (bearerToken) {
        
        const userIdentity = await User.findOne({ token: bearerToken });
        
        if (userIdentity) {

            request.user = userIdentity;
            
            return next();
            
        }
        else
            return response.status(400).json({ message: { error: 'access denied' } });

    } else {

        return response.status(400).json({ message: { error: 'Missing Bearer Token' } });

    }

  };
  
  module.exports = isAuthenticated;