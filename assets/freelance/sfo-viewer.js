const viewer = document.querySelector('#sfo-viewer');
const stage = viewer.querySelector('.fl-sfo-stage');
const art = viewer.parentElement;
const dialog = document.querySelector('.fl-sfo-dialog');
const reset = viewer.querySelector('.fl-sfo-reset');
const expand = viewer.querySelector('.fl-sfo-expand');
const selection = viewer.querySelector('.fl-sfo-selection');
const placeholder = viewer.querySelector('.fl-sfo-placeholder');
const status = placeholder.querySelector('.fl-sfo-status');
const retry = placeholder.querySelector('.fl-sfo-retry');
const selectionHint = 'Select a part to inspect it.';
let modelView;

function showLoadError(message) {
  reset.disabled = true;
  expand.disabled = true;
  placeholder.hidden = false;
  retry.hidden = false;
  status.textContent = message;
}

async function loadViewer() {
  status.textContent = 'Loading 3D model…';
  retry.hidden = true;
  try {
    modelView = await createViewer();
    modelView.resize();
    placeholder.hidden = true;
    reset.disabled = false;
    expand.disabled = false;
  } catch (error) {
    console.error('SFO Terminal 3W viewer:', error);
    showLoadError('The 3D model could not load.');
  }
}

retry.addEventListener('click', loadViewer);
if ('IntersectionObserver' in window) {
  status.textContent = 'Loading 3D model…';
  const visibility = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    visibility.disconnect();
    loadViewer();
  }, { rootMargin: '400px' });
  visibility.observe(viewer);
} else {
  loadViewer();
}

reset.addEventListener('click', () => modelView.fit());
expand.hidden = typeof dialog.showModal !== 'function';
expand.addEventListener('click', () => {
  if (dialog.open) {
    dialog.close();
    return;
  }
  dialog.append(viewer);
  dialog.showModal();
  expand.textContent = 'Close expanded view';
  expand.focus();
  modelView.resize();
});
dialog.addEventListener('close', () => {
  art.append(viewer);
  expand.textContent = 'Expand view';
  modelView?.resize();
  (modelView ? expand : retry).focus({ preventScroll: true });
});

async function createViewer() {
  const { THREE, GLTFLoader, OrbitControls } = await import('./sfo-viewer-engine.js?v=2');
  const { scene: model } = await new GLTFLoader().loadAsync(
    new URL('./sfo-t3w-display.glb', import.meta.url).href,
  );
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  const fill = new THREE.HemisphereLight(0xffffff, 0x9aaac0, 2);
  const sun = new THREE.DirectionalLight(0xfff5e8, 2.25);
  sun.position.set(4, 7, 5);
  scene.add(model, fill, sun);

  const bounds = new THREE.Box3().setFromObject(model);
  const target = bounds.getCenter(new THREE.Vector3());
  const distance = bounds.getSize(new THREE.Vector3()).length();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.02, distance * 4);
  // Match the axonometric angle of the original portfolio render.
  const openingAngle = new THREE.Vector3(-0.815, 0.479, -0.327).normalize();
  const viewRight = new THREE.Vector3().crossVectors(camera.up, openingAngle).normalize();
  const viewUp = new THREE.Vector3().crossVectors(openingAngle, viewRight);
  const vertex = new THREE.Vector3();
  const projected = new THREE.Vector2();
  const min = new THREE.Vector2(Infinity, Infinity);
  const max = new THREE.Vector2(-Infinity, -Infinity);
  model.traverse((part) => {
    if (!part.isMesh) return;
    const positions = part.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(part.matrixWorld).sub(target);
      projected.set(vertex.dot(viewRight), vertex.dot(viewUp));
      min.min(projected);
      max.max(projected);
    }
  });
  const frameSize = max.clone().sub(min).multiplyScalar(1.16);
  const frameCenter = min.add(max).multiplyScalar(0.5);
  target.addScaledVector(viewRight, frameCenter.x).addScaledVector(viewUp, frameCenter.y);
  camera.position.copy(target).addScaledVector(openingAngle, distance);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'SFO Terminal 3W interactive facade model');
  canvas.setAttribute('aria-describedby', 'sfo-viewer-help');
  canvas.title = 'Arrow keys to orbit, + or − to zoom, Enter to inspect the center.';
  stage.append(canvas);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.minZoom = 0.2;
  controls.maxZoom = 20;
  controls.update();
  controls.saveState();
  const render = () => renderer.render(scene, camera);
  controls.addEventListener('change', render);

  const resize = () => {
    if (!stage.clientWidth || !stage.clientHeight) return;
    const aspect = stage.clientWidth / stage.clientHeight;
    const halfHeight = Math.max(frameSize.y, frameSize.x / aspect) / 2;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.right = halfHeight * aspect;
    camera.left = -camera.right;
    camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(stage);

  const raycaster = new THREE.Raycaster();
  const highlight = new THREE.MeshStandardMaterial({
    color: 0xff9b59, emissive: 0x542004, roughness: 0.75, side: THREE.DoubleSide,
  });
  const originalMaterials = new Map();
  function inspect(x, y) {
    for (const [mesh, material] of originalMaterials) mesh.material = material;
    originalMaterials.clear();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const hit = raycaster.intersectObject(model, true)[0];
    const element = hit?.object.parent;
    if (element?.userData.name) {
      element.traverse((part) => {
        if (!part.isMesh) return;
        originalMaterials.set(part, part.material);
        part.material = highlight;
      });
    }
    selection.textContent = element?.userData.name || selectionHint;
    render();
  }

  let pointer;
  // Let the page keep scrolling until a visitor interacts with the inline model.
  canvas.addEventListener('wheel', (event) => {
    if (document.activeElement !== canvas && !dialog.open) event.stopImmediatePropagation();
  }, { capture: true, passive: true });
  canvas.addEventListener('pointerdown', (event) => {
    pointer = event.isPrimary && event.button === 0
      ? { id: event.pointerId, x: event.clientX, y: event.clientY }
      : null;
  });
  canvas.addEventListener('pointercancel', () => { pointer = null; });
  canvas.addEventListener('pointerup', (event) => {
    const start = pointer;
    pointer = null;
    if (start?.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
    const rect = canvas.getBoundingClientRect();
    inspect(2 * (event.clientX - rect.left) / rect.width - 1, 1 - 2 * (event.clientY - rect.top) / rect.height);
  });
  canvas.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowLeft': controls.rotateLeft(0.13); break;
      case 'ArrowRight': controls.rotateLeft(-0.13); break;
      case 'ArrowUp': controls.rotateUp(0.13); break;
      case 'ArrowDown': controls.rotateUp(-0.13); break;
      case '+':
      case '=': controls.dollyIn(0.88); break;
      case '-': controls.dollyOut(0.88); break;
      case 'Enter': inspect(0, 0); break;
      default: return;
    }
    event.preventDefault();
  });

  canvas.addEventListener('webglcontextlost', () => {
    observer.disconnect();
    controls.dispose();
    renderer.dispose();
    canvas.remove();
    modelView = null;
    selection.textContent = selectionHint;
    if (dialog.open) dialog.close();
    showLoadError('The 3D view was interrupted.');
  }, { once: true });

  return { fit: () => controls.reset(), resize };
}
