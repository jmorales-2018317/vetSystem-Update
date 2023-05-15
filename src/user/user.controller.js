'use strict'

const jwt = require('jsonwebtoken');
const User = require('./user.model');
//Desestructuración
const { validateData, encrypt, checkPassword } = require('../utils/validate');
const { createToken } = require('../services/jwt');

exports.test = (req, res)=>{
    res.send({message: 'Test function is running', user: req.user});
}

exports.register = async(req, res)=>{
    try{
        //capturar el formulario de registro (Body)
        let data = req.body;
        //Encriptar la contraseña
        data.password = await encrypt(data.password);
        //Guardar la información
        let user = new User(data);
        await user.save();
        return res.send({message: 'Account created sucessfully'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error creating account', error: err.message});
    }
}

exports.login = async(req, res)=>{
    try{
        console.log(req.user)
        //obtener la data a validar (username y password)
        let data = req.body;
        let credentials = {
            username: data.username,
            password: data.password
        }
        let msg = validateData(credentials);
        if(msg) return res.status(400).send({message: msg})
        //Validar que exista el usuario en la BD
        let user = await User.findOne({username: data.username});
        //Validar que la contraseña coincida
        if(user && await checkPassword(data.password, user.password)) {
            let token = await createToken(user)
            return res.send({message: 'User logged successfully', token});
        }
        //Mensaje de bienvenida
        return res.status(404).send({message: 'Invalid credentials'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error not logged'});
    }
}

exports.updateUser = async(req, res)=>{
    try{
        let logged = req.user;
        let idUser = req.params.id;
        let data ={
            name: req.body.name,
            surname: req.body.surname,
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            role: req.body.role
        };

        if(logged.sub != idUser) return res.send({message: 'You can only update your account'})

        let updateUser = await User.findOneAndUpdate(
            {_id: idUser},
            data,
            {new: true}
        );

        if(!updateUser) return res.status(404).send({message: 'User not found'});
        return res.send({updateUser});

    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error updating user'});
    }
}

exports.updatePassword = async(req, res)=>{
    try{

        let logged = req.user;
        let idUser = req.params.id;
        let data ={
            password: req.body.password,
            newPassword: req.body.newPassword
        };

        if(logged.sub != idUser) return res.send({message: 'You can only update the password of your account'})

        let infoUser = await User.findOne({_id: idUser});

        if(await checkPassword(data.password, infoUser.password)){
            data.newPassword = await encrypt(data.newPassword);
            let updateUser = await User.findOneAndUpdate(
                {_id: idUser},
                {password: data.newPassword},
                {new: true}
            )
            return res.send({message: 'Password updated successfully', data});
        }
        return res.send({message: 'Incorrect password'});
        
    }catch(err){
        console.error(err);
        return err;
    }
}

exports.deleteUser = async(req, res)=>{
    try{
        let token = req.headers.authorization.replace(/['"]+/g,'');
        let payload = jwt.decode(token, `${process.env.SECRET_KEY}`);
        let idUser = req.params.id;

        if(payload.sub != idUser) return res.send({message: 'You can only delete your account'});

        let deletedUser = await User.findOneAndDelete({_id: idUser});

        if(!deletedUser) return res.status(404).send({message: 'User not found'});
        return res.send({message: 'User deleted sucessfully', deletedUser})

    }catch(err){
            console.error(err);
            return res.status(500).send({message: 'Error removing user'})
    }
}
