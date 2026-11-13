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
        const sunset = gltf.scene;
        scene.add(sunset);

const site = "https://kinetic-movements.local";

async function applyVisitorPicture(sunset) {
  try {
    // 1. Get the newest museum entry (newest comes first)
    const entries = await fetch(`${site}/wp-json/wp/v2/museum?per_page=1`)
      .then(r => r.json());
    if (!entries.length) return;

    const imageId = entries[0].acf.image;
    if (!imageId) return;

        // 2. Turn the image ID into the actual file link
    const media = await fetch(`${site}/wp-json/wp/v2/media/${imageId}`)
      .then(r => r.json());
    const imageUrl = media.source_url;

    // 3. Put it on the mesh called pPlane2
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    textureLoader.load(imageUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      sunset.traverse((child) => {
        if (child.isMesh && child.name === "pPlane2") {
          child.material = child.material.clone();
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      });
    });

  } catch (err) {
    console.error("Visitor picture failed:", err);
  }
}

// Call it right after the model is added to the scene:
applyVisitorPicture(sunset);

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