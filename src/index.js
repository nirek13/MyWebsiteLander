import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'; // Optional for glowing effect
import GUI from 'lil-gui';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {};

// Define variables for the galaxy
let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    // Destroy old galaxy
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry();
    parameters.count = 1000000;
    parameters.size = 0.001;
    parameters.radius = 20;
    parameters.branches = 4;
    parameters.spin = 0.821;
    parameters.randomness = 1.238;
    parameters.randomnessPower = 8.119;
    parameters.insideColor = '#b80adb';
    parameters.outsideColor = '#1f44b2';
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        // Position
        const i3 = i * 3;
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    /**
     * Points
     */
    points = new THREE.Points(geometry, material);
    scene.add(points);
};

// Galaxy parameters
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;

generateGalaxy();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// Handle window resize
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-8.54, 4.51, 8.86);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);

controls.enabled = false; // Disable controls by default

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Post-Processing Setup
 */
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Uncomment the following lines to add a bloom effect (optional)
// const bloomPass = new UnrealBloomPass();
// composer.addPass(bloomPass);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Rotate the galaxy
    if (points) {
        points.rotation.y = elapsedTime * 0.1; // Adjust the speed by changing the multiplier

        const positions = points.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(elapsedTime + positions[i]) * 0.001; // Shift X
            positions[i + 1] += Math.cos(elapsedTime + positions[i + 1]) * 0.001; // Shift Y
            positions[i + 2] += Math.sin(elapsedTime + positions[i + 2]) * 0.001; // Shift Z
        }

        points.geometry.attributes.position.needsUpdate = true;
    }

    // Render the scene with post-processing
    composer.render();

    window.requestAnimationFrame(tick);
};

tick();

/**
 * Scroll Effect
 */
const textElements = [document.getElementById('hud'), document.querySelector('.brag')];

const blackOverlay = document.getElementById('black-overlay'); // Assuming you have a black overlay in your HTML


const onScroll = () => {

    const scrollPosition = window.scrollY;
    const maxScroll = 1000; // Maximum scroll distance for the transition
    const newPageContent = document.getElementById('new-page-content');

    // Calculate opacity based on the scroll position
    const opacity = Math.max(0, 1 - scrollPosition / maxScroll * 100); // Fade out Three.js scene
    const blackOpacity = Math.min(1, (scrollPosition - maxScroll / 2) / (maxScroll / 2)); // Fade in black overlay
    const scrollContentOpacity = Math.max(0, (scrollPosition - maxScroll + 400) / maxScroll * 1000); // Fade in scroll content
    newPageContent.style.opacity = 0;


    textElements.forEach((el) => {
        el.style.opacity = opacity; // Adjust text opacity
        el.style.transition = 'opacity 0.2s ease'; // Smooth transition for text opacity
    });
    const viewportHeight = window.innerHeight;
    const topQuarterHeight = viewportHeight / 2;
    console.log(scrollPosition, topQuarterHeight , viewportHeight)
    if (scrollY < topQuarterHeight) {
        newPageContent.style.opacity = 1;
        newPageContent.style.transition = 'opacity 0.5s ease';
        console.log('loading in')
    }
    else{
        newPageContent.style.opacity = 0;
        newPageContent.style.transition = 'opacity 0.5s ease';
    }

    // Fade out the Three.js canvas (replace '.webgl' with your actual Three.js element)
    const webglCanvas = document.querySelector('.webgl');
    if (webglCanvas) {
        webglCanvas.style.opacity = opacity; // Fade out canvas
        webglCanvas.style.transition = 'opacity 0.5s ease'; // Smooth fade transition

    }



        console.log("F")

};

// Add scroll event listener
window.addEventListener('scroll', onScroll);
