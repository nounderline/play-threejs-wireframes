import * as THREE from 'three';
import { OBJExporter } from './three-extra';

const VertexSharder = `#
attribute vec3 center;
varying vec3 vCenter;

void main() {

  vCenter = center;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`;

const FragmentSharder = `#
uniform float thickness;

varying vec3 vCenter;

void main() {
vec3 afwidth = fwidth( vCenter.xyz );

vec3 edge3 = smoothstep( ( thickness - 1.0 ) * afwidth, thickness * afwidth, vCenter.xyz );

float edge = 1.0 - min( min( edge3.x, edge3.y ), edge3.z );

gl_FragColor.rgb = gl_FrontFacing ? vec3( 0.9, 0.9, 1.0 ) : vec3( 0.4, 0.4, 0.5 );
gl_FragColor.a = edge;

}`;

function setupGeometry(
  geometry,
  { width = 200, height = 200, xFactor = 4000, yFactor = 2000 } = {}
) {
  const camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 50);
  camera.position.z = 1;

  const mesh = makeLineMesh(geometry);

  const scene = new THREE.Scene();
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(width, height);
  renderer.setAnimationLoop(animation);

  document.body.appendChild(renderer.domElement);

  mesh.rotation.x = 1.0;

  function animation(time) {
    mesh.rotation.y = time / yFactor;

    renderer.render(scene, camera);
  }

  console.log(scene);
}

const Geometries = [
  new THREE.SphereGeometry(0.15, 8, 8),
  new THREE.BoxGeometry(0.2, 0.2, 0.2, 2, 2, 2),
  new THREE.ConeGeometry(0.15, 0.28, 9, 3),
  new THREE.IcosahedronGeometry(0.16, 1),
  new THREE.OctahedronGeometry(0.16, 1),
  new THREE.TetrahedronGeometry(0.16, 1),
  new THREE.CylinderGeometry(0.12, 0.12, 0.16, 12),
];

Geometries.forEach((geometry) => {
  setupGeometry(geometry);
});

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function makeWireframeMesh(geometry) {
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00, //The color chosen for the mesh
    wireframe: true, //Shade in or wireframe?
  });

  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function makeLineMesh(geometry) {
  const wireframe = new THREE.WireframeGeometry(geometry);
  const line = new THREE.LineSegments(wireframe);
  line.material.depthTest = false;
  //line.material.opacity = 0.25;
  line.material.transparent = true;

  return line;
}
