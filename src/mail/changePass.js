const nodemailer = require('nodemailer');
require('dotenv').config();

enviarPass = async (usuario, clave) => {

    const config = {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }

    const mensaje = {
        from: process.env.EMAIL,
        to: usuario ,
        subject: 'codigo para cambio de contraseña' ,
        text: `su codigo solicitado para el cambio de contraseña de su usuario en nuestra pagina 
                computer store es el siguiente ${clave}
                `
    }

    const transport = nodemailer.createTransport(config)

    const info = await transport.sendMail(mensaje)

    console.log(info)
}

module.exports = enviarPass
