<template>
  <amplify-authenticator>
    <div id="app">
      <camera />
    </div>
    <div id="logout">
      <amplify-sign-out></amplify-sign-out>
    </div>
  </amplify-authenticator>
</template>

<script>
import camera from "./components/camera.vue";

export default {
  name: "App",
  components: {
    camera,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  background-color: #f0f0f0;
}
#video {
  background-color: #000000;
}
#canvas {
  display: none;
}
#logout {
  width: 640px;
  margin: auto;
}
#statusBar {
  background-color: darkslategray;
  margin: auto;
  width: 640px;
  text-emphasis: bold;
  color: white;
}
li {
  display: inline;
  padding: 5px;
}
div {
  padding: 10px;
}

button {
  margin: 0 10px 20px 0;
  width: 120px;
}

.hidden {
  display: none;
}
</style>
