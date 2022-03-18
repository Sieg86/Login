<template>
  <div data-app>
    <div class="login-page">
      <div class="ml-6">
        <h1>Ma page de login</h1>
      </div>
      <div class="form-login">
        <div class="login-form">
          <!-- <form: v-on:submit="login">   -->
          <input
            type="text"
            v-model="email"
            name="email"
            placeholder="Email"
            v-on:keyup.enter="login"
          />
          <v-text-field
            class="btnShow"
            v-model="password"
            :type="show1 ? 'text' : 'password'"
            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="show1 = !show1"
            name="password"
            placeholder="Mot de passe"
            v-on:keyup.enter="login"
          />
          <button @click="login" class="btnLogin">login</button>
          <br />
          <!-- <button v-on:click="testRoute">Test Route</button> -->
          <br />
          <p>
            <span class="login-error">{{ this.msg }}</span>
          </p>
          <v-row justify="center">
            <v-dialog v-model="dialog" max-width="400" persistent>
              <v-card>
                <v-card-title class="text-h5">
                  Réinitialisation du mot de passe
                </v-card-title>

                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="Mot de passe*"
                        type="password"
                        required
                        :rules="rules"
                        v-model="newPass"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        label="Répéter mot de passe*"
                        type="password"
                        required
                        :rules="rulesRepeat"
                        v-model="repeatNewPass"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn
                    color="green darken-1 btnLogin"
                    text
                    @click="resetPassword()"
                  >
                    Valider
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "LoginComponent",
  data() {
    return {
      idu: null,
      email: "",
      password: "",
      show1: false,
      accessToken: "a",
      msg: "",
      newPass: "",
      repeatNewPass: "",
      dialog: false,
      rules: [
        (v) => !!v || "Un mot de passe est requis",
        (v) => (v && v.length >= 5) || "5 Caractères minimum",
        (v) => /(?=.*[A-Z])/.test(v) || "Un majuscule minimum",
        (v) => /(?=.*\d)/.test(v) || "Un nombre minimum",
        (v) => /([!@$%])/.test(v) || "Un caractère spécial [!@#$%] minimum",
        // (v) => (v == this.repeatNewPass && v == this.newPass) || "Les mots de passes ne correspondent pas",
      ],
      rulesRepeat: [
        (v) => !!v || "Un mot de passe est requis",
        (v) => (v && v.length >= 5) || "5 Caractères minimum",
        (v) => /(?=.*[A-Z])/.test(v) || "Un majuscule minimum",
        (v) => /(?=.*\d)/.test(v) || "Un nombre minimum",
        (v) => /([!@$%])/.test(v) || "Un caractère spécial [!@#$%] minimum",
        (v) => v == this.newPass || "Les mots de passes ne correspondent pas",
      ],
    };
  },
  mounted() {
    if (this.$router.history.current.params.msg) {
      this.msg = this.$router.history.current.params.msg;
    }
  },
  methods: {
    emitCustomEvent() {
      this.$emit("custom-event-name", true);
    },
    resetPassword() {
      if (this.repeatNewPass === this.newPass) {
        axios
          .post(process.env.VUE_APP_SERVERURL + "changePassword", {
            idu: this.idu,
            password: this.newPass,
          })
          .then(() => {
            this.password = this.newPass;
            this.dialog = false;
            this.login();
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    verify() {
      axios
        .post(process.env.VUE_APP_SERVERURL + "verify", this.accessToken, {
          headers: {
            authorization: this.accessToken,
            withCredentials: true,
          },
        })
        .then((res) => {
          // console.log("res", res);
          if (!res.msg) {
            document.cookie =
              "accessToken" + "=" + (res.accessToken || "") + "; path=/";
            this.$router.push({
              name: "Accueil",
              params: { refreshToken: this.refreshToken },
            });
          }
          this.msg = res.msg;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    login() {
      // console.log("url", process.env.VUE_APP_SERVERURL + "login")
      axios({
        url: process.env.VUE_APP_SERVERURL + "login",
        data: {
          email: this.email,
          password: this.password,
        },
        method: "POST",
      })
        .then((response) => {
          // console.log("r", response);
          if (response.status == 200) {
            if (response.data.text === "Mot de passe réinitialisé") {
              this.idu = response.data.idu;
              // this.$router.push({
              //   name: "resetPassword",
              //   params: { idu: response.data.idu },
              // });
              this.dialog = true;
            } else {
              // console.log("Logged in");
              // router.push('Dashboard');
              // console.log(response);
              this.accessToken = response.data.accessToken;
              this.refreshToken = response.data.refreshToken;
              // console.log(this.refreshToken);
              this.verify();
            }
          } else {
            this.msg = response.data.msg;
          }
        })
        .catch((errors, res) => {
          console.log("Cannot log in", res);

          this.msg = "Connexion impossible : " + errors.response.data.text;
        });
    },
  },
};
</script>
<style scoped>
@import url(https://fonts.googleapis.com/css?family=Roboto:300);
.btnShow button {
  background-color: transparent !important;
}

.ml-6 {
  margin-left: 6rem;
  margin-bottom: 1rem;
}
.login-page {
  width: 360px;
  padding: 8% 0 0;
  margin: auto;
}
.form-login {
  position: relative;
  z-index: 1;
  background: #ffffff;
  max-width: 360px;
  margin: 0 auto 100px;
  padding: 45px;
  text-align: center;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
}
.form-login input {
  font-family: "Roboto", sans-serif;
  outline: 0;
  background: #f2f2f2;
  width: 100%;
  border: 0;
  margin: 0 0 15px;
  padding: 15px;
  box-sizing: border-box;
  font-size: 18px;
}
.btnLogin {
  font-family: "Roboto", sans-serif;
  text-transform: uppercase;
  outline: 0;
  background: #337ab7;
  width: 100%;
  border: 0;
  padding: 15px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}
.btnLogin:hover {
  font-family: "Roboto", sans-serif;
  text-transform: uppercase;
  background: transparent;
  width: 100%;
  border: 1px solid #337ab7;
  padding: 15px;
  color: #337ab7;
  font-size: 14px;
  cursor: pointer;
}

.form-login .message {
  margin: 15px 0 0;
  color: #b3b3b3;
  font-size: 12px;
}
.form-login .message a {
  color: #4caf50;
  text-decoration: none;
}
.form-login .register-form {
  display: none;
}
</style>
