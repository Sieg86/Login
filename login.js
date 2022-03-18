const { conn } = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
var mysql = require("mysql");
const SECRET = process.env.SECRET;

function login(req, res) {
  // console.log(req)
  // A adapter en fonction des circonstances (Sequelize si possible/authorisé)
  let sql = "SELECT * FROM users WHERE email ='" + req.body.email + "'";
  // console.log(sql);
  let query = conn.query(sql, async (err, results) => {
    if (err) throw err;
    // console.log(results);
    if (results.length == 0) {
      return res.status(404).send({
        text: "Utilisateur inconnu",
      });
    }

    let user = results[0];
    //Welcome1! mdp par défaut
    bcrypt.compare("Welcome1!", user.mdp).then(function (result) {
      // result == true
      if (result === true) {
        // console.log(result);
        return res
          .json({
            text: "Mot de passe réinitialisé",
            idu: user.idu,
          })
          .send();
      } else {
        bcrypt.compare(
          req.body.password,
          results[0].mdp,
          //Création token jwt
          function (err, response) {
            if (err) console.log(err);
            if (response) {
              let accessToken = jwt.sign(
                {
                  user: {
                    idu: user.idu,
                    email: user.email,
                    role: user.role,
                  },
                },
                SECRET,
                {
                  algorithm: "HS256",
                  expiresIn: "15m",
                }
              );
              // console.log("user", user.idu);
              let refreshToken = jwt.sign(
                {
                  idu: user.idu,
                },
                SECRET,
                {
                  algorithm: "HS256",
                  expiresIn: "30m",
                }
              );

              console.log(
                results[0].nom + "-" + results[0].prenom + " : Connected"
              );
              res.cookie("jwt", accessToken, {});
              res.json({
                accessToken,
                refreshToken,
              });
              res.send();
            } else {
              return res.status(401).send({
                text: "Mauvaise combinaison Utilisateur / Mot de passe",
              });
            }
          }
        );
      }
    });
  });
}

module.exports = {
  login,
};
