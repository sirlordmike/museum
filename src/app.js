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
dLight.position.set(.5, 1, .3);
dLight.castShadow = true;
scene.add(ambients, dLight);

// 3D museum
const loader = new GLTFLoader();
loader.load(
    import.meta.env.BASE_URL + '123.glb',
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