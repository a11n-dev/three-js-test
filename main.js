import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Create scene with sky blue background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera position: -741.6409898730601, 876.5241262621785, -1308.0756974837911
// Controls target: 219.46391328480834, -51.05676237652733, -216.5350433801921
// Create camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(-950, 1000, -1500); // Set camera position
camera.lookAt(new THREE.Vector3(200, -50, -200)); // Set camera direction
// camera.lookAt(scene.position);

// Create light
const light = new THREE.DirectionalLight(0xffffff, 8);
light.position.set(-950, 1000, -1500);
scene.add(light);

// Create renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true, // Antialiasing. Can slow down performance.
  alpha: true, // Transparency. Can slow down performance.
  logarithmicDepthBuffer: true, // Logarithmic depth buffer. Can improve the appearance of large scenes.
  powerPreference: "high-performance", // Preference for high performance.
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create controls
// const controls = new OrbitControls(camera, renderer.domElement);

// Load 3D model
const loader = new GLTFLoader();
loader.load(
  "model_1.glb",
  function (gltf) {
    scene.add(gltf.scene);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error(error);
  }
);

// Helpers

// // Create axes helper
// const axesHelper = new THREE.AxesHelper(1500);
// scene.add(axesHelper);

function animate() {
  requestAnimationFrame(animate);
  // controls.update();

  // console.log("Camera position:", controls.object.position);
  // console.log("Controls target:", controls.target);
  renderer.render(scene, camera);
}

animate();
