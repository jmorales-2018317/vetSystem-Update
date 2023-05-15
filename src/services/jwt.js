'use strict'

const jwt = require('jsonwebtoken');

exports.createToken = async(user)=>{
    try{
        let payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        role: user.role,
        iat: Date.now(), //Formato UNIX fecha en segundos a partis de el 1 de enero 1970
        exp:Date.now() + (60 * 120) //Fecha actual más 2 horas.

        }
        return jwt.sign(payload, `${process.env.SECRET_KEY}`);
    }catch(err){
        console.error(err);
        return err;
    }
}