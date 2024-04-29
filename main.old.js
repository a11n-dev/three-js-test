import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import TWEEN from "@tweenjs/tween.js";

// Create scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // white directional light
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

      // Get the center of the clicked object
      const targetPosition = new THREE.Vector3(intersects[0].object.position.x, intersects[0].object.position.y, intersects[0].object.position.z);
      console.log("Clicked object:", intersects[0].object);

      console.log("Clicked object center:", targetPosition);

      // Animate the camera to the center of the clicked object
      animateCameraPosition(camera, targetPosition);
      // intersects[0].object.material.color.set(0xff0000); // Change color to red
    } else if (event.button === 2) {
      // Right click
      // intersects[0].object.material.color.set(0xffffff); // Change color back to white
    }
  }
}

window.addEventListener("mousedown", onMouseClick, false);

// Load .dae model
const loader = new ColladaLoader();
let targetPosition;

loader.load(
  "/model.dae", // replace this with the path to your model
  function (collada) {
    scene.add(collada.scene);

    // Set the target position for the camera
    targetPosition = new THREE.Vector3();
    collada.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeBoundingBox();
        targetPosition.copy(child.geometry.boundingBox.getCenter());
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

// Function to animate the camera position
function animateCameraPosition(camera, targetPosition) {
  new TWEEN.Tween(camera.position)
    .to(targetPosition, 2000) // 2000 milliseconds = 2 seconds
    .easing(TWEEN.Easing.Quadratic.InOut) // Use an ease-in-out function
    .onUpdate(() => {
      camera.position.set(targetPosition.x, targetPosition.y, camera.position.z); // Update the camera's position
    })
    .onComplete(() => {
      console.log("Camera animation completed");
    })
    .start(); // Start the tween immediately
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  renderer.render(scene, camera);

  // Start the camera animation once the model has been loaded
  if (targetPosition && !cameraAnimationStarted) {
    animateCameraPosition(camera, targetPosition);
    cameraAnimationStarted = true;
  }

  TWEEN.update(); // Update all tweens in the scene
}

let cameraAnimationStarted = false;
animate();
