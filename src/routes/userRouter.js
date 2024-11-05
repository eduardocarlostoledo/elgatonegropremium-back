const { Router } = require("express");
const passport=require("passport");
const {
  putUser,
  getUsers,
  getUserId,
  loginUser,
  postUsers,
  deleteUser,
  postUserGoogle,
  loginGoogle,
  findUser,
  recuperarPassword,
} = require("../controllers/usersController.js");
const { verificaToken } = require("../helpers/verificaToken.js");
const { verifyAdmin } = require("../helpers/verifyAdmin.js");

const userRouter = Router();

userRouter.get("/verificaUsuario", verificaToken);
userRouter.get("/verificaAdmin", verifyAdmin);
//////////////////////////////// CREAR USUARIO ///////////////////////////////////////
userRouter.post("/register", postUsers); // users/register

//////////////////////////////// CREAR USUARIO ///////////////////////////////////////
userRouter.post("/google", postUserGoogle); // users/google

//////////////////////////////// INICIAR SESSION  ///////////////////////////////////////
userRouter.post("/login", loginUser);
userRouter.post("/loginGoogle", loginGoogle);

userRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Ruta de callback para Google
userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Redirige al usuario a la página deseada tras un inicio de sesión exitoso
    res.redirect("/dashboard");
  }
);

// Ruta de logout
userRouter.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

//////////////////////////////// MODIFICAR USUARIO  ///////////////////////////////////////
userRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  let image = false;
  if (req.files) image = req.files.image;
  try {
    const user = await putUser(req.body, image, id);
    res.status(200).json("Usuario actualizado");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

///////////////////////////// PERMITIR CAMBIO DE CONTRASEÑA Y ENVIO DE MAIL /////////////////////////////
userRouter.post("/changePass", recuperarPassword);

//ruta para verificar si user existe y si es valida la exp reg...
userRouter.get("/", async (req, res) => {
  const regex_FullText = /^([a-zA-Z ]+)/i;

  const { name } = req.query;
  console.log("ruta de get/", name);
  let users;

  try {
    if (name) {
      if (name.trim() === "") {
        users = await getUsers();
        res.status(200).json({ data: users, message: "Listado de usuarios" });
      } else {
        if (regex_FullText.test(name)) {
          users = await findUser(name.trim()); // aca
          if (users.length == 0) {
            res.status(500).json({
              status: false,
              msg: `No se encontro ningun User con el atributo ${name}`,
              errorCode: 12,
            });
          } else {
            res
              .status(200)
              .json({ data: users, message: "Listado de usuarios" });
          }
        } else {
          res.status(500).json({
            status: false,
            msg: `Formato de busqueda invalido`,
            errorCode: 14,
          });
        }
      }
    } else {
      users = await getUsers();
      res.status(200).json({ data: users, message: "Listado de usuarios" });
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: `Entro al catch, ${error.message}`,
      errorCode: 400,
    });
  }
});

//////////////////////////////// TRAER USUARIO POR PARAMETRO ////////////////////////////////
userRouter.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await getUserId(userId);
    if (result) {
      res.status(200).json({ data: result, message: "Usuario solicitado" });
    } else {
      res.status(404).json({ error: "Usuario no encontrado por ID" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//////////////////////////////// BORRAR USUARIO ////////////////////////////////
userRouter.delete("/delete/:id", deleteUser);

module.exports = { userRouter };
