
const jwt = require('jsonwebtoken');
const { User } = require('../db')
const { encrypt, compare } = require('../helpers/bcrypt');
const { Op } = require("sequelize");
const { uploadImage, deleteImage } = require('../utils/cloudinary')
const fs = require('fs-extra');
const enviarPass = require('../mail/changePass')

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ msg: 'User not found', success: false });
    }

    const checkPassword = await compare(password, user.password);
    if (!checkPassword) {
      return res.json({ msg: 'Invalid password', success: false });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        admin: user.admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN } // Ejemplo: '1d' (1 día)
    );

    // Enviar el token junto con los datos del usuario
    res.status(200).json( {
      msg: 'Login successful',      
      user: {
        token,
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        image: user.image,
        phonenumber: user.phonenumber,
        country: user.country,
        city: user.city,
        email: user.email,
        admin: user.admin,
        status: user.status,
      },
      success: true,
    });
  } catch (error) {
    return res.json({ msg: `Error 404 - ${error.message}` });
  }
};

const loginGoogle = async (req, res) => {
  //console.log("login google", req.body)
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    //console.log(user)
    if (!user) {
      return res.json({ msg: 'User not found', success: false });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        admin: user.admin,
        status: user.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Enviar el token y los datos del usuario
    res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        token,
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        image: user.image,
        phonenumber: user.phonenumber,
        country: user.country,
        city: user.city,
        email: user.email,
        admin: user.admin,
        status: user.status,
      },
      success: true,
    });
  } catch (error) {
    return res.json({ msg: `Error 404 - ${error.message}` });
  }
};

//esta ruta se usa para consultar si el usuario existe....
const getUsers = async () => {
  try {
    const result = await User.findAll();
  
    if (result) return result;
    throw new Error("Empy users database:");
  } catch (error) {
    throw new Error("Error retrieving Users Database" + error.message);
  }
};

const getUserId = async (userId) => {
  try {
    const result = await User.findByPk(userId);
    if (result) return result;
    throw new Error("User not found with ID: " + userId);
  } catch (error) {
    throw new Error("Error retrieving User by ID: " + error.message);
  }
};
const putUser = async (user, image, id) => {
  const {
    name,
    lastname,
    email,
    password,
    phonenumber,
    country,
    city,
    address,
    admin,
    status
  } = user;

  if (!user && !image) throw Error('User data missing');

  try {
    const fieldsToUpdate = {
      admin,
      status,
      name,
      lastname,
      email,
      phonenumber,
      country,
      city,
      address
    };

    // Si hay contraseña, hashearla y agregarla a los campos
    if (password) {
      const passwordHash = await encrypt(password);
      fieldsToUpdate.password = passwordHash;
    }

    // Si hay imagen, subir a Cloudinary y preparar campos
    if (image) {
      const userToUpdate = await User.findByPk(id);
      const result = await uploadImage(image.tempFilePath);

      if (userToUpdate.image?.public_id) {
        await deleteImage(userToUpdate.image.public_id);
      }

      fieldsToUpdate.image = {
        public_id: result.public_id,
        secure_url: result.secure_url
      };

      await fs.remove(image.tempFilePath);
    }

    const changeUser = await User.update(fieldsToUpdate, { where: { id } });
    return changeUser;

  } catch (error) {
    throw Error(error.message);
  }
};


const postUserGoogle = async (req, res) => {
  console.log("post user google", req.body)
  try {
    const { name, lastname, email, image } = req.body;
    if (!name || !lastname || !email) return res.json({ msg: 'Missing required fields', success: false });
    
    const userBD = await User.findOne({ where: { email: `${email}` } });
    if (userBD) {
    return res.json({ msg: 'The email already exists', success: false  });
    }

    const user = await User.create({
      name: name,
      lastname: lastname,
      email: email,
      image: { public_id: null, secure_url: image },
      password: "XDRWQDFF11asedfa123"
    });
    return res.json({ msg: `User create succesfully`, success: true, user });    

  } catch (error) {
    return res.json({ msg: `Error 404 - ${error}` });
  }
}

//registro de usuarios y verificacion de datos iniciales
const postUsers = async (req, res) => {
  // Regex para nombres y apellidos (letras y espacios)
  const regexName = /^[a-zA-Z\s]+$/; // Más simple y permite espacios

  // Regex para la contraseña:
  // - ^           : Inicio de la cadena
  // - (?=.*[a-z]) : Debe contener al menos una letra minúscula
  // - (?=.*[A-Z]) : Debe contener al menos una letra mayúscula
  // - (?=.*\d)    : Debe contener al menos un dígito
  // - (?=.*[!@#$%^&*()_+={}[\]|:;"'<>,.?/~`]) : Debe contener al menos un símbolo de la lista
  // - .{8,20}     : Debe tener entre 8 y 20 caracteres en total (de cualquier tipo)
  // - $           : Fin de la cadena
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|:;"'<>,.?/~`]).{8,20}$/;

  // Regex para el email
  const regexEmail = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/; // Eliminado 'g' flag, no es necesario aquí y puede causar problemas.

  try {
    const { name, lastname, email, password } = req.body;

    // 1. Validación de campos obligatorios
    if (!name || !lastname || !password || !email) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const infoUser = {}; // Objeto para almacenar la información validada

    // 2. Validación de Email
    if (!regexEmail.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    const userBD = await User.findOne({ where: { email } }); // shorthand para { email: email }
    if (userBD) {
      return res.status(409).json({ msg: 'The email already exists' }); // 409 Conflict para recurso existente
    }
    infoUser.email = email;

    // 3. Validación de Nombre
    if (!regexName.test(name)) {
      return res.status(400).json({ msg: 'The name is invalid (only letters and spaces allowed)' });
    }
    // Opcional: limitar longitud si no se hace en el frontend o si se quiere validar en backend también
    if (name.length < 2 || name.length > 15) {
      return res.status(400).json({ msg: 'Name must be between 2 and 15 characters' });
    }
    infoUser.name = name;

    // 4. Validación de Apellido
    if (!regexName.test(lastname)) {
      return res.status(400).json({ msg: 'The lastname is invalid (only letters and spaces allowed)' });
    }
    // Opcional: limitar longitud si no se hace en el frontend o si se quiere validar en backend también
    if (lastname.length < 2 || lastname.length > 15) {
      return res.status(400).json({ msg: 'Lastname must be between 2 and 15 characters' });
    }
    infoUser.lastname = lastname;

    // 5. Validación de Contraseña
    if (!regexPassword.test(password)) {
      return res.status(400).json({ msg: 'Password must be between 8-20 characters and include at least one uppercase letter, one lowercase letter, one number, and one symbol.' });
    }
    const passwordHash = await encrypt(password); // Asumiendo que `encrypt` es una función para hashear
    infoUser.password = passwordHash;

    // 6. Creación del usuario
    await User.create(infoUser); // Usar el objeto infoUser directamente
    return res.status(201).json({ msg: `User created successfully` }); // 201 Created para éxito en creación
  } catch (error) {
    console.error("Error creating user:", error); // Log del error para depuración
    return res.status(500).json({ msg: `Internal server error: ${error.message}` }); // 500 para errores internos
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await await User.destroy({
      where: {
        id: `${id}`
      }
    });
    if (!deletedUser) return res.json({ msg: 'Username does not exist' });
    return res.json({ msg: 'User Deleted' });
  } catch (error) {
    return res.json({ msg: `Error 404 - ${error}` });
  }
};

//Busco el User por query 
const findUser = async (name) => {

  const results = await User.findAll({
    where: {
      name: { [Op.iLike]: `%${name}%` },
    }
  });
  return results
}

//recuperar contraseña
const recuperarPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el email existe en la base de datos
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado', success: false });
    }

    // Verificar si el usuario está activo
    if (!user.status) {
      return res.status(403).json({ msg: 'El usuario está baneado', success: false });
    }

    // Generar un código de recuperación de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Enviar el correo con el código de recuperación
    await enviarPass(email, code);

    // Responder con éxito y el código generado
    res.status(200).json({ msg: 'Correo enviado con éxito', pass: code, success: true });

  } catch (error) {
    // Manejar errores y responder con un mensaje adecuado
    console.error('Error en el cambio de contraseña:', error);
    res.status(500).json({ msg: 'Error en el servidor. No se pudo enviar el correo.', success: false });
  }

}

module.exports = {
  putUser, getUsers, getUserId, loginUser, postUsers, deleteUser, postUserGoogle, loginGoogle, findUser, recuperarPassword
}