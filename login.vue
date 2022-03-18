<template>
  <div id="app">
    <LoginSynchrone
      v-on:custom-event-name="onChildClick"
      v-if="isHidden === false"
    />
  </div>
</template>

<script>
import "@/assets/styles/index.css";
import LoginComponent from "../components/loginComponent.vue";
export default {
  name: "App",
  components: {
    LoginComponent,
  },
  data() {
    return {
      login: "",
      password: "",
      entity: "",
      isHidden: false,
    };
  },
  methods: {
    // Triggered when `childToParent` event is emitted by the child.
    onChildClick(value) {
      this.isHidden = value;
    },
  },
};
</script>

<style></style>
