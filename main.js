import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import TWEEN from "@tweenjs/tween.js";

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 200;
// camera.position.y = 10;
// camera.position.x = 2.5;
// camera.rotateX(-0.5);

// Create controls
const controls = new OrbitControls(camera, renderer.domElement);

// Create lights
// const light = new THREE.PointLight(0xffffff, 5, 1000);
// light.position.set(0, 5, 1000);
const light = new THREE.DirectionalLight(0xffffff, 5);

// // Create a helper for the camera
// const cameraHelper = new THREE.CameraHelper(camera);
// scene.add(cameraHelper);

// // Create a helper for the light
// const lightHelper = new THREE.PointLightHelper(light);
// scene.add(lightHelper);

// Create GLTF loader
const loader = new GLTFLoader();
let model;
loader.load(
  "/terrain_Lic_glbl.glb", // replace this with the path to your model
  function (gltf) {
    model = gltf.scene;

    // Ensure each mesh has a unique material
    model.traverse((object) => {
      if (object.isMesh) {
        object.material = object.material.clone();
      }
    });

    // Scale the model
    // model.scale.set(0.1, 0.1, 0.1);

    scene.add(model);

    // Update the camera position based on the model's bounding box
    model.traverse((object) => {
      if (object.isMesh) {
        object.geometry.computeBoundingBox();
        const boundingBox = object.geometry.boundingBox;
        const position = new THREE.Vector3();
        boundingBox.getCenter(position);
        const size = boundingBox.getSize(new THREE.Vector3());

        // Set the camera to look at the center of the bounding box
        camera.lookAt(position);

        // Position the camera at the top of the bounding box
        camera.position.set(position.x, position.y + size.y / 2, position.z);
        // light.position.set(position.x, position.y + size.y / 2, 500);
      }
    });
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error(error);
    console.log("An error happened");
  }
);

// Add lights
scene.add(light);

// Create raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add event listener for mouse move
window.addEventListener("mousemove", onMouseMove, false);

// Variables to keep track of the currently hovered object and its original color
let hoveredObj = null;
let originalColor = null;

function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    // If the hovered object has changed
    if (hoveredObj !== intersects[0].object) {
      console.log(intersects[0].object.name);

      // Restore the original color of the previously hovered object
      if (hoveredObj) {
        hoveredObj.material.color.set(originalColor);
      }

      // Save the currently hovered object and its original color
      hoveredObj = intersects[0].object;
      originalColor = hoveredObj.material.color.getHex();

      if (!intersects[0].object.name.toLowerCase().includes("building")) return;

      // Change the color of the hovered object
      hoveredObj.material.color.set(0xff0000); // Change this to the hover color you want
    }
  } else {
    // If no objects are intersected, restore the original color of the previously hovered object
    if (hoveredObj) {
      hoveredObj.material.color.set(originalColor);
      hoveredObj = null;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  // // Update helpers
  // cameraHelper.update();
  // lightHelper.update();

  controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
  renderer.render(scene, camera);
}

animate();
