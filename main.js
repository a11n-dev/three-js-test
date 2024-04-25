import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(10, 5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 8); // white directional light
directionalLight.position.set(0.25, 0.5, 1); // set the light's position
scene.add(directionalLight);

// Create OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.9;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to change color of intersected object and zoom in
function onMouseClick(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    if (event.button === 0) {
      // Left click
      intersects[0].object.material.color.set(0xff0000); // Change color to red
    } else if (event.button === 2) {
      // Right click
      intersects[0].object.material.color.set(0xffffff); // Change color back to white
    }
  }
}

window.addEventListener("mousedown", onMouseClick, false);

// // Load OBJ model
// const loader = new OBJLoader();
// loader.load(
//   "/091.obj", // replace this with the path to your model
//   function (group) {
//     // group.traverse(function (child) {
//     //   if (child instanceof THREE.Mesh) {
//     //     child.material = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Set an initial color
//     //   }
//     // });

//     scene.add(group);
//   },
//   function (xhr) {
//     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//   },
//   function (error) {
//     console.log("An error happened");
//   }
// );

// // Load GLTF or GLB model
// const loader = new GLTFLoader();
// loader.load(
//   "/untitled4.glb", // replace this with the path to your model
//   function (gltf) {
//     scene.add(gltf.scene);
//   },
//   function (xhr) {
//     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//   },
//   function (error) {
//     console.log("An error happened");
//   }
// );

// Load .dae model
const loader = new ColladaLoader();
loader.load(
  "/model.dae", // replace this with the path to your model
  function (collada) {
    scene.add(collada.scene);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

// Set camera position
camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  renderer.render(scene, camera);
}
animate();
