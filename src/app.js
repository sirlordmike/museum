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
    import.meta.env.BASE_URL + '12345.glb',
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

loader.load(
    import.meta.env.BASE_URL + 'uploadmesh.glb',
    (gltf) => {
        const model2 = gltf.scene;
        scene.add(model2);
       console.log(model2.type);
       model2.traverse(child => console.log(child.name,child.type));
       const pPlane2 = model2.getObjectByName('pPlane2');
       window.pPlane2 = pPlane2;
       loadMuseumTexture();
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

const fileInput = document.createElement('input');
fileInput.type = 'file';
document.body.appendChild(fileInput);
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = (e) => {
            const newTextureUrl = e.target.result;
            updateTexture(newTextureUrl);
        }
        reader.readAsDataURL(file);
    }
} );

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