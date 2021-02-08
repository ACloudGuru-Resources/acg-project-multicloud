<template>
  <div class="container">
    <div class="buttonBar">
      <button
        type="button"
        class="btn btn-success"
        :disabled="!this.hasCapture"
        @click="onStart"
      >
        Start Camera
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="this.hasCapture"
        @click="onCapture"
      >
        Capture Photo
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="!this.hasCapture"
        @click="onUpload"
      >
        Upload Photo
      </button>
      <select v-model="camera">
        <option>-- Select Device --</option>
        <option
          v-for="device in devices"
          :key="device.deviceId"
          :value="device.deviceId"
          >{{ device.label }}</option
        >
      </select>
    </div>

    <div class="camera">
      <vue-web-cam
        ref="webcam"
        height="480,"
        width="640,"
        :device-id="deviceId"
        @started="onStarted"
        @stopped="onStopped"
        @error="onError"
        @cameras="onCameras"
        @camera-change="onCameraChange"
        v-show="!this.hasCapture"
      />
      <img :src="img" v-show="this.hasCapture" />
    </div>
    <div id="statusBar">
      <span>{{ this.statusMessage }} </span>
    </div>
  </div>
</template>

<script>
import { WebCam } from "vue-web-cam";
import { Storage } from "aws-amplify";

export default {
  name: "camera",
  components: {
    "vue-web-cam": WebCam,
  },
  data() {
    return {
      img: null,
      camera: null,
      deviceId: null,
      devices: [],
      hasCapture: false,
      statusMessage: "Status",
    };
  },
  computed: {
    device: function() {
      return this.devices.find((n) => n.deviceId === this.deviceId);
    },
  },
  props: {},
  watch: {
    camera: function(id) {
      this.deviceId = id;
    },
    devices: function() {
      // Once we have a list select the first one
      const [first] = this.devices;
      if (first) {
        this.camera = first.deviceId;
        this.deviceId = first.deviceId;
      }
    },
  },
  methods: {
    onCapture() {
      this.img = this.$refs.webcam.capture();
      this.hasCapture = true;
      this.onStop();
    },
    onStarted(stream) {
      console.log("On Started Event", stream);
    },
    onStopped(stream) {
      console.log("On Stopped Event", stream);
    },
    onStop() {
      this.$refs.webcam.stop();
    },
    onStart() {
      this.img = null;
      this.hasCapture = false;
      this.$refs.webcam.start();
    },
    onError(error) {
      console.log("On Error Event", error);
    },
    onCameras(cameras) {
      this.devices = cameras;
      console.log("On Cameras Event", cameras);
    },
    onCameraChange(deviceId) {
      this.deviceId = deviceId;
      this.camera = deviceId;
      console.log("On Camera Change Event", deviceId);
    },
    onUpload() {
      var imageData = this.img;
      var base64ContentArray = imageData.split(",");
      const contentType = base64ContentArray[0].match(
        /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
      )[0];

      const bufferContent = Buffer.from(
        imageData.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      var filename = Date.now().toString();
      switch (contentType) {
        case "image/jpeg" || "image/jpg":
          filename = filename.concat(".jpg");
          break;
        case "image/png":
          filename = filename.concat(".png");
          break;
        default:
      }

      console.log(contentType, filename);
      Storage.put(filename, bufferContent, {
        level: "private",
        contentType: contentType,
      })
        .then((result) => {
          this.statusMessage = "Success: Image Uploaded!";
          console.log(result);
        })
        .catch((err) => {
          this.statusMessage = "Error:" & err;
          console.log(err);
        });
    },
  },
};
</script>
