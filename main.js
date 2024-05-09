import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

// Create renderer
const renderer = new THREE.WebGLRenderer({
  antialias: false, // Antialiasing. Can slow down performance.
  depth: true,
  logarithmicDepthBuffer: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create scene with sky blue background
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x87ceeb);

// Create camera
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(-1068, 1500, -1610); // Set camera position
camera.lookAt(new THREE.Vector3(230, -84, -263)); // Set camera direction

// Create light
const light = new THREE.DirectionalLight(0xffffff, 7);

// light.position.set(-275, 934, 268);
// light.target.position.set(-41, 155, -549);
light.position.set(-830, 750, -1000);
light.target.position.set(300, -80, -380);
light.castShadow = true;
light.shadow.camera.top = 1024;
light.shadow.camera.bottom = -1024;
light.shadow.camera.left = -1024;
light.shadow.camera.right = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 1500;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 4096;
light.shadow.mapSize.height = 4096;

light.shadow.camera.updateProjectionMatrix();

scene.add(light);
scene.add(light.target);

// Create controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(300, -60, -300);

// Load 3D model
const loader = new GLTFLoader();
let model;

loader.load(
  "model.glb",
  function (gltf) {
    model = gltf.scene;

    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (["building", "furnicular"].some((str) => object.name.toLocaleLowerCase().includes(str))) {
          object.castShadow = true;
          object.receiveShadow = true;
        } else {
          object.receiveShadow = true;
        }
      }
    });

    scene.add(model);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error(error);
  }
);

// Animations
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Mouse moove animation for camera

window.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Add event listener for mouse click
window.addEventListener("click", onMouseClick, false);

let clickedObj = null;

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
    console.log(intersects[i].object, intersects[i].object instanceof THREE.Mesh);

    clickedObj = intersects[i].object;

    // // Get the position of the clicked object
    // const targetPosition = intersects[0].object.position.clone();

    // // Animate the camera to the clicked object's position
    // animateCameraPosition(targetPosition);
  }
}

// Add event listener for window resize
window.addEventListener("resize", () => {
  // Update renderer size and camera aspect ratio
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
  camera.updateProjectionMatrix();
});

// Helpers

//Create a helper for the shadow camera (optional)
// const helper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(helper);

// Create stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Create a new button element
// const button = document.createElement("button");
// button.textContent = "Show Camera Info";
// button.style.position = "absolute";
// button.style.top = "10px";
// button.style.right = "10px";

// // Add an event listener to the button
// button.addEventListener("click", function () {
//   alert("Camera Position: " + camera.position.x + ", " + camera.position.y + ", " + camera.position.z + "\n" + "Camera Target: " + controls.target.x + ", " + controls.target.y + ", " + controls.target.z);
// });

// document.body.appendChild(button);

function animate() {
  requestAnimationFrame(animate);
  // controls.update();

  if (model) {
    model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, (mouse.x * Math.PI) / 30, 0.05);
    model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, (mouse.y * Math.PI) / 200, 0.025);
  }

  stats.update(); // Update stats
  renderer.render(scene, camera);
}

animate();
