import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('canvas.webgl');
let mixer;
const clock = new THREE.Clock();

// scene
const scene = new THREE.Scene();

// light
const ambients = new THREE.AmbientLight(0xffffff, 2);
const dLight = new THREE.DirectionalLight(0xffffff, 3);
const lightHelper = new THREE.CameraHelper(dLight.shadow.camera);
dLight.position.set(.1, 5, 0);
dLight.castShadow = true;

scene.add(ambients, dLight, lightHelper);
dLight.shadow.camera.left = -10;
dLight.shadow.camera.right = 10;
dLight.shadow.camera.top = 10;
dLight.shadow.camera.bottom = -10;

dLight.shadow.camera.near = 0.5;
dLight.shadow.camera.far = 100;
dLight.shadow.camera.updateProjectionMatrix();
lightHelper.update();

// 3D museum
const loader = new GLTFLoader();
loader.load(
    import.meta.env.BASE_URL + '1234.glb',
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(gltf.animations[0]).play();
        }
    },
    (xhr) => {
        if (xhr.total) {
            console.log((xhr.loaded / xhr.total * 100).toFixed(0) + '% loaded');
        }
    },
    (error) => {
        console.error('An error happened', error);
    }
);

// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();

// // 1. Listen for click events on the canvas/window
// window.addEventListener('click', onPointerDown);

// function onPointerDown(event) {
//     // 2. Convert click position to normalized device coordinates (-1 to +1)
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // 3. Update the raycaster with the camera and mouse position
//     raycaster.setFromCamera(mouse, camera);

//     // 4. Calculate objects intersecting the picking ray
//     // Pass `scene.children` or an array of specific meshes (set `true` for recursive check)
//     const intersects = raycaster.intersectObjects(scene.children, true);

//     if (intersects.length > 0) {
//         // intersects[0] is the closest object hit by the ray
//         const selectedMesh = intersects[0].object;

//         console.log("Clicked mesh name:", selectedMesh.name);

//         // 5. Manipulate the mesh with code, e.g., change its color or position
//         selectedMesh.material.color.set(0xff0000);
//         selectedMesh.position.y += 0.5;
//     }
// }


// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2;
scene.add(camera);

// renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// animate
const animate = () => {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};
animate();