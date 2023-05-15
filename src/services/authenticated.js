'use strict'

//Verificar si el token es válido (expiración, si es válido);

const jwt = require('jsonwebtoken');

//Función middleware (Barrera lógica)
exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: `Doesn´t contain headers "AUTHORIZATION"`});
    }else{
        try{
            //obtener el token
            let token = req.headers.authorization.replace(/['"]+/g, '');
            //decodificar el token
            var payload = jwt.decode(token, `${process.env.SECRET_KEY}`);
            //validar que no haya expirado
            if(payload.exp >= Date.now()){
                return res.status(401).send({message: 'Expired token'});
            }
        }catch(err){
            console.error(err);
            return res.status(400).send({message: 'Invalid token'});
        }
        req.user = payload;
        next();
    }
}