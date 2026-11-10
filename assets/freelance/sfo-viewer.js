const viewer = document.querySelector('#sfo-viewer');
const stage = viewer.querySelector('.fl-sfo-stage');
const art = viewer.parentElement;
const poster = viewer.previousElementSibling;
const dialog = document.querySelector('.fl-sfo-dialog');
const toggle = document.querySelector('.fl-sfo-toggle');
const reset = viewer.querySelector('.fl-sfo-reset');
const expand = viewer.querySelector('.fl-sfo-expand');
const selection = viewer.querySelector('.fl-sfo-selection');
const status = document.querySelector('.fl-sfo-status');
const selectionHint = 'Select a part to inspect it.';
let modelView;

function showViewer(show) {
  viewer.hidden = !show;
  poster.hidden = show;
  art.classList.toggle('is-model-active', show);
  toggle.setAttribute('aria-expanded', String(show));
  toggle.textContent = show ? 'Back to image' : 'Explore in 3D';
  if (show) viewer.scrollIntoView({ block: 'nearest', behavior: 'instant' });
}

toggle.hidden = false;
toggle.addEventListener('click', async () => {
  if (modelView) {
    showViewer(viewer.hidden);
    if (!viewer.hidden) modelView.focus();
    return;
  }

  toggle.disabled = true;
  toggle.textContent = 'Loading 3D…';
  status.textContent = 'Loading the SFO Terminal 3W model.';
  try {
    modelView = await createViewer();
    showViewer(true);
    modelView.resize();
    modelView.focus();
    status.textContent = '';
  } catch (error) {
    console.error('SFO Terminal 3W viewer:', error);
    showViewer(false);
    status.textContent = 'The 3D model could not load. You can try again or use the project image.';
  } finally {
    toggle.disabled = false;
  }
});

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
  (viewer.hidden ? toggle : expand).focus({ preventScroll: true });
});

async function createViewer() {
  const { THREE, GLTFLoader, OrbitControls } = await import('./sfo-viewer-engine.js');
  const { scene: model } = await new GLTFLoader().loadAsync(
    new URL('./sfo-t3w-display.glb', import.meta.url).href,
  );
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8faff);
  const fill = new THREE.HemisphereLight(0xffffff, 0x9aaac0, 2);
  const sun = new THREE.DirectionalLight(0xfff5e8, 2.25);
  sun.position.set(4, 7, 5);
  scene.add(model, fill, sun);

  const fieldOfView = 38;
  const camera = new THREE.PerspectiveCamera(fieldOfView, 1, 0.02, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'SFO Terminal 3W interactive facade model');
  canvas.setAttribute('aria-describedby', 'sfo-viewer-help');
  canvas.title = 'Arrow keys to orbit, + or − to zoom, Enter to inspect the center.';
  stage.append(canvas);

  const controls = new OrbitControls(camera, canvas);
  const bounds = new THREE.Box3().setFromObject(model);
  const sphere = bounds.getBoundingSphere(new THREE.Sphere());
  const openingAngle = new THREE.Vector3(-1, 0.44, -0.23).normalize();
  const viewRight = new THREE.Vector3().crossVectors(camera.up, openingAngle).normalize();
  const viewUp = new THREE.Vector3().crossVectors(openingAngle, viewRight);
  const vertex = new THREE.Vector3();
  controls.maxDistance = sphere.radius * 9;
  controls.minDistance = 0.3;
  const render = () => renderer.render(scene, camera);
  controls.addEventListener('change', render);
  const fit = () => {
    const vertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const horizontal = vertical * camera.aspect;
    let distance = 0;
    // Fit the visible shape instead of the large empty corner inside its bounding box.
    model.traverse((part) => {
      if (!part.isMesh) return;
      const positions = part.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(part.matrixWorld).sub(sphere.center);
        const width = Math.abs(vertex.dot(viewRight)) / horizontal;
        const height = Math.abs(vertex.dot(viewUp)) / vertical;
        distance = Math.max(distance, vertex.dot(openingAngle) + Math.max(width, height) * 1.16);
      }
    });
    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(openingAngle, distance);
    controls.update();
    render();
  };

  let fitted = false;
  const resize = () => {
    if (!stage.clientWidth || !stage.clientHeight) return;
    const aspect = stage.clientWidth / stage.clientHeight;
    camera.aspect = aspect;
    // Keep the short edge usable when the expanded view is tall and narrow.
    const vertical = Math.tan(THREE.MathUtils.degToRad(fieldOfView / 2));
    const minHorizontal = Math.tan(THREE.MathUtils.degToRad(45 / 2));
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.max(vertical, minHorizontal / aspect)));
    camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    if (!fitted) {
      fitted = true;
      fit();
    } else {
      render();
    }
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
    showViewer(false);
    status.textContent = 'The 3D view was interrupted. Select Explore in 3D to try again.';
  }, { once: true });

  return { fit, resize, focus: () => canvas.focus({ preventScroll: true }) };
}
