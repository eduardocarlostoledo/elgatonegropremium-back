const { User, Order } = require('../db')
const { encrypt, compare } = require('../helpers/bcrypt');
const { Op } = require("sequelize");
const {uploadImage, deleteImage}=require('../utils/cloudinary')
const fs =require('fs-extra');
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

const putUser = async (user,image, id) => {
  const { name, lastname, email, password, phonenumber, country, city, address, admin , status } = user

  if (!user&&!image) throw Error('User data missing')
  else {
    try {
      // const userBD = await User.findOne({ where: { email: `${email}` } });
      // if (userBD) throw Error('The email already exists')
      if (password) {
        const passwordHash = await encrypt(password);
        const changeUser = await User.update({ admin , status , name, lastname, email, password: passwordHash, phonenumber, country, city, address }, { where: { id } })
        return changeUser
      }
      if(image){
        //invoco la funcion para subir la imagen a cloudinary
        const userToUpdate=await User.findByPk(id)
        const result=await uploadImage(image.tempFilePath)
        if(userToUpdate.image && userToUpdate.image.public_id) deleteImage(userToUpdate.image.public_id)
        await User.update({image:{public_id:result.public_id,secure_url:result.secure_url}}, { where: { id } })
        //borro la imagen de la carpeta uploads para que solo quede guardada en cloudinary
        await fs.remove(image.tempFilePath)
      }
      const changeUser = await User.update({ admin, status, name, lastname, email, password, phonenumber, country, city, address }, { where: { id } })
      return changeUser


    } catch (error) {
      throw Error(error.message)
    }
  }
}


const postUserGoogle = async (req, res) => { 
  try {
    const { name, lastname, email, image} = req.body;
    if (!name || !lastname || !email) return res.json({ msg: 'Missing required fields', success: false  });

    // const userBD = await User.findOne({ where: { email: `${email}` } });
    // if (userBD) {
    //   return res.json({ msg: 'The email already exists', success: false  });
    // }
    await User.create({
      name: name,
      lastname: lastname,
      email: email,
      image: {public_id:null,secure_url: image},
      password: "XDRWQDFF11asedfa123"
    });
    return res.json({ msg: `User create succesfully`, success: true });

  } catch (error) {
     return res.json({ msg: `Error 404 - ${error}` });
  }
}



const postUsers = async (req, res) => {
  const infoUser = {}
  const regexName = /^([a-zA-Z ]+)$/i;
  const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8,20}$/
  const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
 
  try {
    const { name, lastname, email, password} = req.body;

    if (!name || !lastname || !password || !email) return res.json({ msg: 'Missing required fields' });


    if (email && email.length > 0 && email != "") {
      if (regexEmail.test(email)) {
        const userBD = await User.findOne({ where: { email: `${email}` } });
        if (userBD) {
          return res.json({ msg: 'The email already exists' });
        } else {
          infoUser.email = `${email}`
        }
      }
    }

    if (name && name.length > 0 && name != "") {
      if (regexName.test(name)) {
        infoUser.name = `${name}`
      } else {
        return res.json({ msg: 'The name is invalid' });
      }
    }

    if (lastname && lastname.length > 0 && lastname != "") {
      if (regexName.test(lastname)) {
        infoUser.lastname = `${lastname}`
      } else {
        return res.json({ msg: 'The lastname is invalid' });
      }
    }

    if (password && password.length > 0 && password != "") {
      if (regexPassword.test(password)) {
        const passwordHash = await encrypt(password);
        infoUser.password = `${passwordHash}`
      } else {
        return res.json({ msg: 'The password is invalid' });
      }
    }

    await User.create({
      name: name,
      lastname: lastname,
      password: infoUser.password,
      email: email,
    });
    return res.json({ msg: `User create succesfully` });
  } catch (error) {
    return res.json({ msg: `Error 404 - ${error}` });
  }
};

const loginGoogle = async (req, res) => { 
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: `${email}` } });
    
      res.status(200).send({
        data: user,
        success: true,
      });
    

  } catch (error) {
    return res.json({ msg: `Error 404 - ${error}` });s
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: `${email}` } });
    if (!user) return res.json({ msg: 'User not found',success: false, });

    const checkPassword = await compare(password, user.password);

    if (checkPassword) {
      res.status(200).send({
        data: user,
        success: true,
      });
    }
    if (!checkPassword) {
      return res.json({ msg: 'Invalid password', success: false, });


    }
  } catch (error) {
    return res.json({ msg: `Error 404 - ${error}` });
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

module.exports = {
  putUser, getUsers, getUserId, loginUser, postUsers, deleteUser, postUserGoogle, loginGoogle,findUser
}