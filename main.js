import * as THREE from "three";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
camera.position.z = 25;
// camera.position.y = 10;
// camera.position.x = 2.5;
// camera.rotateX(-0.5);

// Create lights
const light = new THREE.PointLight(0xffffff, 100, 1000);
light.position.set(0, 5, 10);

// Create GLTF loader
const loader = new GLTFLoader();
let model;
loader.load(
  "/scene.gltf", // replace this with the path to your model
  function (gltf) {
    model = gltf.scene;

    scene.add(model);

    // Animate the camera to zoom in to the model
    animateCameraOnStart(new THREE.Vector3(0, 0, 15));
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

// Add event listener for mouse click
window.addEventListener("click", onMouseClick, false);

function onMouseClick(event) {
  event.stopPropagation();
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true);

  for (let i = 0; i < intersects.length; i++) {
    console.log(intersects[i].object);

    // Get the position of the clicked object
    const targetPosition = intersects[0].object.position.clone();

    // Animate the camera to the clicked object's position
    animateCameraPosition(targetPosition);
  }
}

// Variables to keep track of the currently hovered object and its original color
let hoveredObj = null;
let originalColor = null;

// Add event listener for mouse move
window.addEventListener("mousemove", onMouseMove, false);

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
      // Restore the original color of the previously hovered object
      if (hoveredObj) {
        hoveredObj.material.color.set(originalColor);
      }

      // Save the currently hovered object and its original color
      hoveredObj = intersects[0].object;
      originalColor = hoveredObj.material.color.getHex();

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

// Function to animate the camera position
function animateCameraPosition(targetPosition) {
  const coords = {
    x: camera.position.x,
    y: camera.position.y,
  };
  new TWEEN.Tween(coords)
    .to({ x: targetPosition.x, y: targetPosition.y })
    .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth
    .onUpdate(() => {
      camera.position.set(coords.x, coords.y, camera.position.z);
    })
    .start(); // Start the tween immediately
}

function animateCameraOnStart(targetPosition) {
  const coords = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };
  new TWEEN.Tween(coords)
    .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 2000) // 2000 ms = 2 seconds
    .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth
    .onUpdate(() => {
      camera.position.set(coords.x, coords.y, coords.z);
    })

    .start(); // Start the tween immediately
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  TWEEN.update();
}

animate();
