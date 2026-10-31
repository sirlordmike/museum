import * as THREE from 'https://esm.sh';
import { OrbitControls } from 'https://esm.sh/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://esm.sh/examples/jsm/loaders/FBXLoader.js';


const canvas = document.querySelector('canvas.webgl');
let mixer;
const clock = new THREE.Clock();

//scene
const scene = new THREE.Scene();

//light
const ambients = new THREE.AmbientLight(0xffffff, 2);
const dLight = new THREE.DirectionalLight(0xffffff, 3);

dLight.castShadow = true;
//scene.add(new THREE.CameraHelper(dLight.shadow.camera));
scene.add(ambients, dLight);

//3d Museum
const loader = new GLTFLoader();
loader.load(
    '123.glb', // Replace with your GLB file path or Blob URL
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
          // 1. Dig down into the GLB hierarchy
        model.traverse((child) => {
        // Only Meshes (the actual 3D shapes) can cast or receive shadows
        if (child.isMesh) {
            
            // OPTION A: Target ALL meshes on the character
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
        // Check if the model has animations
        if (gltf.animations && gltf.animations.length > 0) {
            // Create the AnimationMixer and bind it to the model
            mixer = new THREE.AnimationMixer(model);
            
            // Play the first animation clip found in the file
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error happened', error);
    }
);



//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, .1, 100);
camera.position.z = 2;
scene.add(camera);

//rendering
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.shadowMap.enabled = true;
renderer.render(scene, camera);

//resize
window.addEventListener('resize', () => {
    //camera
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    //renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
});


//controls
const controls = new OrbitControls(camera, canvas);

//animate
const animate = () => {
// Get the time elapsed since the last frame
    const delta = clock.getDelta();

    // Update the mixer to progress the animation
    if (mixer) {
        mixer.update(delta);
    }
    
    renderer.render(scene, camera);
    
    controls.update;
    controls.enableDamping = true;
    requestAnimationFrame(animate);
}
animate();



