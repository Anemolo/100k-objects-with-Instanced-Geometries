import * as THREE from "three";
import random from "random";

let fragmentShader = `
varying vec3 vColor;

  void main(){
    vec3 color = vColor;
    gl_FragColor = vec4(color, 1.);
  }
`;

let vertexShader = `
#define PI 3.14159265359
attribute vec4 aCurve;
uniform float uTime;
uniform float uHold;
uniform vec2 uMouse;
uniform float uScale;

attribute vec3 aColor;
varying vec3 vColor;
  vec3 getCurvePosition(float progress, float radius, float offset){
    vec3 pos = vec3(0.);

    pos.x += cos(progress *PI *8.) * radius ;
    pos.y += sin(progress *PI*8. ) * radius + sin(progress * PI *2. + uTime) * 30.;

    pos.z += progress *200. - 200./2. + offset;
    return pos;
  }
  vec3 getSecondCurvePosition(float progress, float radius, float offset){
    vec3 pos = vec3(0.);
    pos.y += cos(progress * PI * 8.) * radius ;
    pos.x += sin(progress * PI * 8.) * radius  ;
    pos.z += (progress) *200.  + offset - 200./2.;
    pos = normalize(pos) * (radius );
    return pos;
  }
  vec2 getScreenNDC(vec3 pos){
    // https://stackoverflow.com/questions/26965787/how-to-get-accurate-fragment-screen-position-like-gl-fragcood-in-vertex-shader
    vec4 clipSpace = projectionMatrix* modelViewMatrix * vec4(pos, 1.);
    vec3 ndc = clipSpace.xyz / clipSpace.w; //perspective divide/normalize
    vec2 viewPortCoord = ndc.xy; //ndc is -1 to 1 in GL. scale for 0 to 1
    return viewPortCoord;
  }
  void main(){
    vec3 transformed = position.xyz;
    float aSpeed = aCurve.w;
    float aRadius = aCurve.x;
    float aZOffset = aCurve.z;
    float aProgress = mod(aCurve.y + uTime * aSpeed, 1.);

    vec3 curvePosition = getCurvePosition(aProgress, aRadius, aZOffset);

    vec3 spherePosition = mix(getSecondCurvePosition(aProgress, aRadius, aZOffset),curvePosition,  uHold);
    vec2 SphereViewportCoord =getScreenNDC( spherePosition); //ndc is -1 to 1 in GL. scale for 0 to 1

    float dist = length(uMouse - SphereViewportCoord);
    
    if(dist < 0.4){
      transformed *= 1.+ (1.-dist/0.4) *6.;
    }
    transformed *= 1.- abs(aProgress - 0.5) *2.;
    transformed *= uScale;
    transformed += spherePosition;

    gl_Position = projectionMatrix* modelViewMatrix * vec4(transformed, 1.);

    vColor = aColor;
  }
`;

let baseGeometry = new THREE.SphereBufferGeometry(1, 4, 4);
let baseCube = new THREE.BoxBufferGeometry(1, 1, 1);
export class Spheres extends THREE.Mesh {
  constructor(config, colors) {
    super();
    this.config = config;
    this.colors = colors;
    this.uniforms = {
      uTime: new THREE.Uniform(0),
      uMouse: new THREE.Uniform(new THREE.Vector2(-1, -1)),
      uHold: new THREE.Uniform(0),
      uScale: new THREE.Uniform(config.scale)
    };
    let material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: this.uniforms
    });
    this.material = material;
  }
  init() {
    let instancedGeometry = new THREE.InstancedBufferGeometry().copy(
      this.config.useCube ? baseCube : baseGeometry
    );
    let instanceCount = this.config.nInstances;
    instancedGeometry.maxInstancedCount = instanceCount;
    this.uniforms.uScale.value = this.config.scale;
    let aCurve = [];
    let aColor = [];

    for (let i = 0; i < instanceCount; i++) {
      let radius = random.float(30, 40);
      let progress = random.float();
      let offset = random.float(-5, 5);
      let speed = random.float(0.02, 0.07);
      aCurve.push(radius);
      aCurve.push(progress);
      aCurve.push(offset);
      aCurve.push(speed);
      let color = this.colors[Math.floor(Math.random() * this.colors.length)];
      aColor.push(color.r, color.g, color.b);
    }

    // forloop

    instancedGeometry.addAttribute(
      "aCurve",
      new THREE.InstancedBufferAttribute(new Float32Array(aCurve), 4, false)
    );
    instancedGeometry.addAttribute(
      "aColor",
      new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
    );

    this.geometry = instancedGeometry;
  }
  clean() {
    this.geometry.dispose();
  }
  update(time) {
    this.uniforms.uTime.value = time;
  }
  onMouseMove(mouse) {
    this.uniforms.uMouse.value.set(mouse.x, mouse.y);
  }
  dispose() {
    this.geometry.dispose();
    baseGeometry.dispose();
    this.material.dispose();
  }
}
