const nodemailer = require('nodemailer')

enviarMail = async (producto, precio, usuario, statusId) => {

    let cantidades = producto.split(',')

    const config = {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'computer.store.original@gmail.com',
            pass: 'ahqdrlukahufvbnt'
        }
    }

    const mensaje = {
        from: 'computer.store.original@gmail.com',
        to: usuario,
        subject: 'compra realizada de forma exitosa!' ,
        text: `muchas gracias por comprar en Computer Store a continuacion adjunto el detalle de su compra:
        producto/s: ${producto}
        cantidad de productos: ${cantidades.length}
        compra total: ${precio}
        estado compra: ${statusId}
                `
    }

    const transport = nodemailer.createTransport(config)

    const info = await transport.sendMail(mensaje)

    console.log(info)
}

module.exports = enviarMail