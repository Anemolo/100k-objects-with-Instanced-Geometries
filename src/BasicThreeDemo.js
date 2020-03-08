import "./styles.css";
import * as THREE from "three";
import Stats from "stats.js";

export class BasicThreeDemo {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      stencil: false
    });
    this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
    this.renderer.setPixelRatio(Math.max(1.5, window.devicePixelRatio));

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    container.append(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.offsetWidth / container.offsetHeight,
      0.1,
      10000
    );
    this.camera.position.z = 50;
    this.scene = new THREE.Scene();

    this.clock = new THREE.Clock();
    this.assets = {};
    this.disposed = false;
    this.tick = this.tick.bind(this);
    this.init = this.init.bind(this);
    this.setSize = this.setSize.bind(this);
  }
  loadAssets() {
    return new Promise((resolve, reject) => {
      // const manager = new THREE.LoadingManager(resolve);
      // this.text.load(manager);
    });
  }
  init() {
    this.tick();
  }
  getViewSizeAtDepth(depth = 0) {
    const fovInRadians = (this.camera.fov * Math.PI) / 180;
    const height = Math.abs(
      (this.camera.position.z - depth) * Math.tan(fovInRadians / 2) * 2
    );
    return { width: height * this.camera.aspect, height };
  }
  setSize(width, height, updateStyle) {
    this.renderer.setSize(width, height, false);
  }
  onResize() {}
  dispose() {
    this.disposed = true;
  }
  update() {}
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  tick() {
    if (this.disposed) return;
    if (resizeRendererToDisplaySize(this.renderer, this.setSize)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
      this.onResize();
    }
    this.stats.begin();
    this.update();
    this.render();
    this.stats.end();
    requestAnimationFrame(this.tick);
  }
}

function resizeRendererToDisplaySize(renderer, setSize) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    setSize(width, height, false);
  }
  return needResize;
}
