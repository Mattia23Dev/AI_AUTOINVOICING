const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken, verifyToken } = require('../middlewares/jwt');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { OAuth2Client}  = require('google-auth-library');

const client = new OAuth2Client("604280477054-aj050p5dmg77u4joij3gj9stdsuci4pa.apps.googleusercontent.com");
//client_secret= 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
exports.register = async (req, res) => {
  try {
    const { email, name, company, phoneNumber, password } = req.body;
    const companyName = company;
    const phone = phoneNumber;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'L\'utente esiste già.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await stripe.customers.create({
      email,
    });

    const newUser = new User({
        email,
        name,
        phone,
        password: hashedPassword,
        companyName,
        stripe_id: customer.id,
    });

    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({ 
      message: 'Utente registrato con successo.', 
      success: true,
      data: {
        token,
        user: newUser,
      },
     });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ message: 'Errore durante la registrazione.' });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ message: 'Nome utente o password errati.' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Nome utente o password errati.' });
      }
  
      const token = generateToken(user);
  
      res.status(200).json({ 
        message: 'Accesso riuscito.', 
        data: {
          token,
          user: user,
        },
      });
    } catch (error) {
      console.error('Errore durante il login:', error);
      res.status(500).json({ message: 'Errore durante il login.' });
    }
  };

  exports.googleLogin = async (req, res) => {
    const {tokenId} = req.body;
  
    client.verifyIdToken({idToken: tokenId, audience: "604280477054-aj050p5dmg77u4joij3gj9stdsuci4pa.apps.googleusercontent.com"}).then((response) => {
      const {email_verified, name, email} = response.payload; 
      if (email_verified) {
        console.log('email verificata');
        User.findOne({email})
        .exec(async(err, user) => {
          if (err){
            console.log(err);
            return res.status(400).json({
              error: 'Qualcosa è andato storto..'
            })
          } else {
            if (user){
              const token = generateToken(user);
          
              res.json({
                success: true,
                data: {
                  token,
                  user: user,
                },
              });
            } else {
                let password = email+process.env.JWT_SECRET;
                const customer = await stripe.customers.create({
                  email,
                });
                
                let newUser = new User({
                  name,
                  email,
                  password: password,
                  stripe_id: customer.id,
                });
  
                await newUser.save((err, data) => {
                  if (err) {
                    console.log(err);
                    return res.status(400).json({
                      error: 'Qualcosa è andato storto..'
                    })
                  };
                  
    
                  const token = generateToken(newUser);
  
                  return res.status(201).json({
                    success: true,
                    data: {
                      token,
                      user: newUser,
                    },
                  });
                })
            }
          }
        })
      }
      console.log(response.payload);
    })
  };
