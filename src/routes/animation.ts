import {browser} from "$app/environment";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const TokyoModel = "src/lib/models/LittlestTokyo.glb"

let mixer: THREE.AnimationMixer;

if (browser) {
  const clock = new THREE.Clock();
  const container = document.getElementById( 'container' );

  const stats = new Stats();
  container.appendChild( stats.dom );

  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  const pmremGenerator = new THREE.PMREMGenerator( renderer );

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xbfe3dd );
  scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

  const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
  camera.position.set( 10, 5, 10 );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 0, 0 );
  controls.update();
  controls.enablePan = true;
  controls.enableDamping = true;

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader( dracoLoader );
  loader.load( TokyoModel, function ( gltf ) {
    const model = gltf.scene;
    model.position.set( 1, 1, 0 );
    model.scale.set( 0.015, 0.015, 0.015 );
    scene.add( model );

    mixer = new THREE.AnimationMixer( model );
    mixer.clipAction( gltf.animations[ 0 ] ).play();

    animate();
    }, undefined, function ( e ) {
      console.error( e );
  } );

  window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  };

  const animate = () => {
    requestAnimationFrame( animate );
    const delta = clock.getDelta();
    mixer.update( delta );
    controls.update();
    stats.update();
    renderer.render( scene, camera );
  }
}
