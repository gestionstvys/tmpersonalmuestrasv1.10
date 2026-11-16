(() => {
  let THREE;
  let GLTFLoader;
  let OrbitControls;
  let DecalGeometry;
  const products = {
    sudaderas: {
      slug: 'sudaderas',
      title: 'Sudadera Deportiva Estilo Americano',
      category: 'Sudaderas',
      categoryHref: 'catalogo.html#sudaderas',
      model: 'hoodie',
      description: 'Vista 3D referencial de una sudadera personalizable. Confirma el corte, los tonos y los detalles del modelo real antes de pedir.'
    },
    soccer: {
      slug: 'soccer',
      title: 'Playera Soccer Personalizable',
      category: 'Playeras de Soccer',
      categoryHref: 'catalogo.html#soccer',
      model: 'shirt',
      description: 'Vista 3D referencial de una playera de soccer personalizable. No representa una camiseta oficial ni incluye insignias de equipos.'
    },
    basicas: {
      slug: 'basicas',
      title: 'Playera Básica',
      category: 'Playeras Básicas',
      categoryHref: 'catalogo.html#basicas',
      model: 'shirt',
      description: 'Vista 3D referencial de una playera básica. Pregunta por los modelos, colores y tallas que se pueden solicitar.'
    },
    ponchos: {
      slug: 'ponchos',
      title: 'Poncho',
      category: 'Ponchos',
      categoryHref: 'catalogo.html#ponchos',
      model: 'poncho',
      description: 'Vista 3D aproximada de una prenda tipo poncho. La forma y los acabados del producto final deben confirmarse.'
    }
  };

  const relatedItems = [
    { slug: 'sudaderas', title: 'Sudadera Deportiva Estilo Americano', category: 'Sudaderas', image: 'https://images.unsplash.com/photo-1741875379341-7d20aadb02c2?auto=format&fit=crop&w=180&h=180&q=75', alt: 'Foto referencial de sudadera negra' },
    { slug: 'soccer', title: 'Playera Soccer Personalizable', category: 'Playeras de Soccer', image: 'codigo/img/catalogo/playera-soccer-frente.svg', alt: 'Ilustración referencial de playera de soccer sin logos' },
    { slug: 'basicas', title: 'Playera Básica', category: 'Playeras Básicas', image: 'https://images.unsplash.com/photo-1560800125-e06c763fdc2c?auto=format&fit=crop&w=180&h=180&q=75', alt: 'Foto referencial de playera lisa' },
    { slug: 'ponchos', title: 'Poncho', category: 'Ponchos', image: 'https://images.unsplash.com/photo-1761253468214-8a1a7edd1a7a?auto=format&fit=crop&w=180&h=180&q=75', alt: 'Foto referencial de una persona con poncho' }
  ];

  const params = new URLSearchParams(window.location.search);
  const requestedProduct = products[params.get('producto')];
  const product = requestedProduct || products.sudaderas;
  const stage = document.getElementById('preview-3d');
  const canvas = document.getElementById('garment-canvas-3d');
  const status = document.getElementById('stage-status');
  const fallback = document.getElementById('model-fallback');
  const sizeSelect = document.getElementById('product-size');
  const defaultColor = '#0B2D63';
  const accentColor = '#08783D';
  const modelUrl = 'https://cdn.jsdelivr.net/gh/PetrovEvgeniy/T-Shirt-Builder@aca569e3e44ae3875fdc52d879801b0e6c4d37d9/client/public/shirt_baked.glb';
  let renderer;
  let scene;
  let camera;
  let controls;
  let clothMaterial;
  let fabricTexture;
  let fabricCanvas;
  let fabricContext;
  let garmentRoot;
  let garmentBounds;
  let shirtMesh;
  let decalTarget;
  let textureLoader;
  let designTexture;
  let decalMesh;
  let designName = '';
  let designAspectRatio = 1;
  let designPlacement = 'chest';
  let designScale = 100;
  let designLoadVersion = 0;
  let activeColor = defaultColor;
  let activePattern = 'solid';
  let renderFrame = 0;

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function updatePageContent() {
    setText('product-title', product.title);
    setText('product-price', 'Consultar');
    setText('product-availability', 'Disponibilidad por confirmar');
    setText('product-category', product.category);
    setText('editor-product-name', product.title);
    setText('breadcrumb-category', product.category);
    setText('breadcrumb-product', product.title);
    setText('product-description', product.description);

    const categoryLink = document.getElementById('breadcrumb-category');
    categoryLink.href = product.categoryHref;
    document.title = `${product.title} | Tu Marca Personal`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${product.title}: explora una vista 3D de referencia y consulta precio, tallas y disponibilidad por WhatsApp.`);
    if (!requestedProduct) {
      const breadcrumb = document.querySelector('.product-breadcrumb');
      breadcrumb.setAttribute('aria-label', 'Migas de pan. Producto no reconocido; mostrando una opción de referencia.');
    }
  }

  function paintRelatedProducts() {
    const container = document.getElementById('related-products');
    const items = relatedItems.filter((item) => item.slug !== product.slug).slice(0, 3);
    container.innerHTML = items.map((item) => `
      <a class="related-card" href="producto.html?producto=${encodeURIComponent(item.slug)}">
        <img src="${item.image}" alt="${item.alt}" width="78" height="78" loading="lazy" decoding="async">
        <span>
          <span class="related-category">${item.category}</span>
          <span class="related-name">${item.title}</span>
          <span class="related-price">Precio por consultar</span>
        </span>
        <span class="related-arrow" aria-hidden="true">↗</span>
      </a>`).join('');
  }

  function makeWhatsAppUrl() {
    const selectedSize = sizeSelect.value;
    const selectedSizeText = selectedSize ? ` y quiero consultar la talla ${selectedSize}` : ' y quiero consultar tallas disponibles';
    const colorName = document.querySelector('.color-swatch.is-selected')?.getAttribute('aria-label')?.replace(/^Vista en /, '') || 'azul marino';
    const patternName = document.querySelector('.pattern-button.is-selected')?.textContent.trim().toLowerCase() || 'liso';
    const designNote = designName ? ' También probé un diseño propio en el vestidor; lo adjuntaré manualmente en el chat.' : '';
    const message = `Hola, me interesa consultar ${product.title}${selectedSizeText}. ¿Me comparten precio, disponibilidad, materiales, medidas y opciones de envío? En el vestidor 3D probé una vista ${colorName} con patrón ${patternName}; entiendo que es una referencia visual y quiero confirmar qué opciones están disponibles.${designNote}`;
    return `https://api.whatsapp.com/send/?phone=5215611265205&text=${encodeURIComponent(message)}`;
  }

  function updateWhatsAppLinks() {
    const href = makeWhatsAppUrl();
    document.getElementById('desktop-whatsapp').href = href;
    document.getElementById('mobile-whatsapp').href = href;
  }

  function render() {
    if (!renderer || !scene || !camera || renderFrame) return;
    renderFrame = window.requestAnimationFrame(() => {
      renderFrame = 0;
      renderer.render(scene, camera);
    });
  }

  function drawFabric() {
    if (!fabricContext || !fabricTexture) return;
    const size = 512;
    fabricContext.clearRect(0, 0, size, size);
    fabricContext.fillStyle = activeColor;
    fabricContext.fillRect(0, 0, size, size);
    fabricContext.fillStyle = accentColor;
    fabricContext.strokeStyle = accentColor;

    if (activePattern === 'stripes') {
      for (let x = 0; x < size; x += 118) fabricContext.fillRect(x + 30, 0, 24, size);
    } else if (activePattern === 'blocks') {
      for (let y = 0; y < size; y += 128) {
        for (let x = (y / 128) % 2 ? 0 : 64; x < size; x += 128) fabricContext.fillRect(x, y, 64, 64);
      }
    }
    fabricTexture.needsUpdate = true;
    render();
  }

  function addSceneObject(mesh) {
    scene.add(mesh);
    return mesh;
  }

  function addSleeve(start, end, radius, material) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    if (!length) return;
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.9, radius, length, 18, 1), material);
    sleeve.position.copy(start).add(end).multiplyScalar(0.5);
    sleeve.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    addSceneObject(sleeve);
  }

  function buildHoodieApproximation() {
    if (!garmentBounds) return;
    const size = garmentBounds.getSize(new THREE.Vector3());
    const center = garmentBounds.getCenter(new THREE.Vector3());
    const back = garmentBounds.min.z - Math.max(size.z * 0.09, 0.009);
    const shoulderY = garmentBounds.min.y + size.y * 0.74;
    const cuffY = garmentBounds.min.y + size.y * 0.2;
    const radius = size.x * 0.061;

    [-1, 1].forEach((side) => {
      const shoulder = new THREE.Vector3(center.x + side * size.x * 0.31, shoulderY, center.z);
      const wrist = new THREE.Vector3(center.x + side * size.x * 0.52, cuffY, center.z);
      const cuff = new THREE.Vector3(wrist.x, cuffY + size.y * 0.035, center.z);
      addSleeve(shoulder, cuff, radius, clothMaterial);
      addSleeve(cuff, wrist, radius * 1.04, clothMaterial);
    });

    const hoodShape = new THREE.Shape();
    const halfWidth = size.x * 0.16;
    hoodShape.moveTo(-halfWidth, 0);
    hoodShape.bezierCurveTo(-halfWidth * 1.2, size.y * 0.12, -halfWidth * 0.68, size.y * 0.2, 0, size.y * 0.2);
    hoodShape.bezierCurveTo(halfWidth * 0.68, size.y * 0.2, halfWidth * 1.2, size.y * 0.12, halfWidth, 0);
    hoodShape.quadraticCurveTo(0, -size.y * 0.05, -halfWidth, 0);
    const hood = addSceneObject(new THREE.Mesh(new THREE.ShapeGeometry(hoodShape, 24), clothMaterial));
    hood.position.set(center.x, garmentBounds.min.y + size.y * 0.88, back);
    hood.rotation.y = Math.PI;
    hood.material.side = THREE.DoubleSide;

  }

  function buildPonchoApproximation() {
    if (!garmentBounds) return;
    const boundsSize = garmentBounds.getSize(new THREE.Vector3());
    const center = garmentBounds.getCenter(new THREE.Vector3());
    const width = boundsSize.x * 0.8;
    const height = boundsSize.y * 0.75;
    const panel = new THREE.Shape();
    panel.moveTo(-width * 0.43, height * 0.36);
    panel.lineTo(-width * 0.17, height * 0.5);
    panel.quadraticCurveTo(0, height * 0.54, width * 0.17, height * 0.5);
    panel.lineTo(width * 0.43, height * 0.36);
    panel.lineTo(width * 0.58, -height * 0.5);
    panel.lineTo(-width * 0.58, -height * 0.5);
    panel.closePath();
    const neck = new THREE.Path();
    neck.absellipse(0, height * 0.4, width * 0.08, height * 0.045, 0, Math.PI * 2, true, 0);
    panel.holes.push(neck);
    const depth = Math.max(boundsSize.z * 1.45, 0.055);
    const geometry = new THREE.ExtrudeGeometry(panel, {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.006,
      bevelThickness: 0.008
    });
    const piece = addSceneObject(new THREE.Mesh(geometry, clothMaterial));
    piece.position.set(center.x, center.y - height * 0.03, garmentBounds.min.z - depth * 0.45);
    return piece;
  }

  function clearDecal(disposeTexture = false) {
    if (decalMesh) {
      scene?.remove(decalMesh);
      decalMesh.geometry?.dispose();
      decalMesh.material?.dispose();
      decalMesh = null;
    }
    if (disposeTexture && designTexture) {
      designTexture.dispose();
      designTexture = null;
    }
  }

  function placeDesign() {
    if (!designTexture || !decalTarget || !DecalGeometry || !THREE) return;
    if (decalMesh) {
      scene.remove(decalMesh);
      decalMesh.geometry.dispose();
      decalMesh.material.dispose();
      decalMesh = null;
    }

    decalTarget.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(decalTarget);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const sleeve = designPlacement === 'sleeve';
    const widthLimit = size.x * (sleeve ? 0.14 : 0.25) * (designScale / 100);
    const heightLimit = size.y * (sleeve ? 0.2 : 0.24) * (designScale / 100);
    let decalWidth = widthLimit;
    let decalHeight = decalWidth / Math.max(designAspectRatio, 0.15);
    if (decalHeight > heightLimit) {
      decalHeight = heightLimit;
      decalWidth = decalHeight * Math.max(designAspectRatio, 0.15);
    }
    const depth = Math.max(size.z * 0.8, 0.035);
    const y = designPlacement === 'back' ? center.y : center.y + size.y * (sleeve ? 0.12 : 0.13);
    const x = sleeve ? center.x - size.x * 0.34 : center.x;
    const isBack = designPlacement === 'back';
    const z = isBack ? bounds.min.z - depth * 0.08 : bounds.max.z + depth * 0.08;
    const position = new THREE.Vector3(x, y, z);
    const orientation = new THREE.Euler(0, isBack ? Math.PI : 0, 0);
    const decalSize = new THREE.Vector3(decalWidth, decalHeight, depth);

    try {
      const geometry = new DecalGeometry(decalTarget, position, orientation, decalSize);
      const material = new THREE.MeshBasicMaterial({
        map: designTexture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        side: THREE.DoubleSide
      });
      decalMesh = new THREE.Mesh(geometry, material);
      decalMesh.renderOrder = 3;
      scene.add(decalMesh);
      render();
    } catch (error) {
      console.warn('No se pudo colocar el diseño en la vista 3D.', error);
      const designStatus = document.getElementById('design-status');
      if (designStatus) designStatus.textContent = 'No se pudo colocar esta imagen en el modelo. Prueba con otro archivo.';
    }
  }

  function setDesignControlsEnabled(enabled, hasDesign = false) {
    document.querySelectorAll('[data-placement], #design-scale').forEach((control) => {
      control.disabled = !enabled || !hasDesign;
    });
    const removeButton = document.getElementById('remove-design');
    if (removeButton) removeButton.disabled = !enabled || !hasDesign;
    const upload = document.getElementById('design-upload');
    if (upload) upload.disabled = !enabled;
    document.querySelector('.design-upload')?.classList.toggle('is-disabled', !enabled);
  }

  function removeDesign() {
    designLoadVersion += 1;
    clearDecal(true);
    designName = '';
    const fileInput = document.getElementById('design-upload');
    if (fileInput) fileInput.value = '';
    const name = document.getElementById('design-file-name');
    if (name) {
      name.textContent = '';
      name.hidden = true;
    }
    const designStatus = document.getElementById('design-status');
    if (designStatus) designStatus.textContent = 'El archivo se usa solo en esta vista y no se sube al sitio.';
    setDesignControlsEnabled(Boolean(decalTarget));
    updateWhatsAppLinks();
    render();
  }

  async function loadDesign(file) {
    const designStatus = document.getElementById('design-status');
    if (!file) return;
    const version = ++designLoadVersion;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      if (designStatus) designStatus.textContent = 'Elige un archivo PNG, JPG o WebP.';
      document.getElementById('design-upload').value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (designStatus) designStatus.textContent = 'El archivo supera el límite de 5 MB.';
      document.getElementById('design-upload').value = '';
      return;
    }
    if (!textureLoader || !decalTarget) {
      if (designStatus) designStatus.textContent = 'Espera a que termine de cargar el vestidor 3D.';
      return;
    }

    if (designStatus) designStatus.textContent = 'Preparando imagen en esta vista…';
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
        reader.readAsDataURL(file);
      });
      const image = await textureLoader.loadAsync(dataUrl);
      if (version !== designLoadVersion) {
        image.dispose();
        return;
      }
      clearDecal(true);
      designTexture = image;
      designTexture.colorSpace = THREE.SRGBColorSpace;
      designTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      designAspectRatio = (image.image?.width || 1) / (image.image?.height || 1);
      designName = file.name;
      const name = document.getElementById('design-file-name');
      if (name) {
        name.textContent = file.name;
        name.hidden = false;
      }
      setDesignControlsEnabled(true, true);
      if (designStatus) designStatus.textContent = 'Vista referencial. Si pides por WhatsApp, adjunta el archivo manualmente.';
      placeDesign();
      updateWhatsAppLinks();
    } catch (error) {
      if (version === designLoadVersion) {
        if (designStatus) designStatus.textContent = 'No se pudo abrir la imagen. Prueba con otro archivo.';
        document.getElementById('design-upload').value = '';
      }
      console.warn('No se pudo cargar la imagen del diseño.', error);
    }
  }

  function setView(name) {
    if (!camera || !controls) return;
    const distance = 1.45;
    const positions = {
      front: [0, -0.015, distance],
      'three-quarter': [distance * 0.68, -0.015, distance * 0.68],
      side: [distance, -0.015, 0],
      back: [0, -0.015, -distance]
    };
    camera.position.set(...(positions[name] || positions.front));
    controls.target.set(0, -0.045, 0);
    controls.update();
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.view === name));
    });
    render();
  }

  function handleModelFailure() {
    stage.setAttribute('aria-busy', 'false');
    status.textContent = 'El modelo 3D no pudo cargarse. Mostramos una ilustración de referencia.';
    status.classList.remove('is-hidden');
    canvas.hidden = true;
    fallback.hidden = false;
    setDesignControlsEnabled(false);
    document.querySelector('.mockup-workspace')?.classList.add('is-model-unavailable');
    document.querySelectorAll('.stage-view-controls button, .color-swatch, .pattern-button, #design-upload, [data-placement], #design-scale, #remove-design, #reset-3d, #download-preview').forEach((button) => {
      button.disabled = true;
    });
  }

  async function init3D() {
    try {
      const moduleBase = 'https://cdn.jsdelivr.net/npm/three@0.186.1';
      const modules = await Promise.all([
        import(`${moduleBase}/build/three.module.js`),
        import(`${moduleBase}/examples/jsm/loaders/GLTFLoader.js`),
        import(`${moduleBase}/examples/jsm/controls/OrbitControls.js`),
        import(`${moduleBase}/examples/jsm/geometries/DecalGeometry.js`)
      ]);
      [THREE, { GLTFLoader }, { OrbitControls }, { DecalGeometry }] = modules;
      const width = Math.max(stage.clientWidth, 300);
      const height = Math.max(stage.clientHeight, 360);
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
      camera.position.set(0, -0.015, 1.45);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8290a0, 2.1));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
      keyLight.position.set(1.4, 1.7, 2.1);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xcbd9eb, 1.05);
      fillLight.position.set(-1.3, 0.5, -1.2);
      scene.add(fillLight);
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = false;
      controls.enablePan = false;
      controls.minDistance = 0.85;
      controls.maxDistance = 2.15;
      controls.minPolarAngle = 0.28;
      controls.maxPolarAngle = Math.PI - 0.28;
      controls.target.set(0, -0.045, 0);
      controls.addEventListener('change', render);

      fabricCanvas = document.createElement('canvas');
      fabricCanvas.width = 512;
      fabricCanvas.height = 512;
      fabricContext = fabricCanvas.getContext('2d');
      fabricTexture = new THREE.CanvasTexture(fabricCanvas);
      textureLoader = new THREE.TextureLoader();
      fabricTexture.colorSpace = THREE.SRGBColorSpace;
      fabricTexture.wrapS = THREE.RepeatWrapping;
      fabricTexture.wrapT = THREE.RepeatWrapping;
      clothMaterial = new THREE.MeshStandardMaterial({ map: fabricTexture, roughness: 0.82, metalness: 0, side: THREE.DoubleSide });

      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      garmentRoot = gltf.scene;
      shirtMesh = garmentRoot.getObjectByName('T_Shirt_male');
      if (!shirtMesh) {
        garmentRoot.traverse((object) => {
          if (!shirtMesh && object.isMesh) shirtMesh = object;
        });
      }
      if (!shirtMesh) throw new Error('No se encontró la malla base de prenda.');
      shirtMesh.material = clothMaterial;
      shirtMesh.castShadow = true;
      shirtMesh.receiveShadow = true;
      scene.add(garmentRoot);
      garmentRoot.updateMatrixWorld(true);
      garmentBounds = new THREE.Box3().setFromObject(garmentRoot);

      if (product.model === 'hoodie') buildHoodieApproximation();
      if (product.model === 'poncho') {
        shirtMesh.visible = false;
        decalTarget = buildPonchoApproximation();
      } else decalTarget = shirtMesh;
      drawFabric();
      setDesignControlsEnabled(true);
      if (designTexture) placeDesign();

      const resizeObserver = new ResizeObserver(() => {
        const nextWidth = Math.max(stage.clientWidth, 300);
        const nextHeight = Math.max(stage.clientHeight, 360);
        renderer.setSize(nextWidth, nextHeight, false);
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        render();
      });
      resizeObserver.observe(stage);
      canvas.addEventListener('keydown', (event) => {
        if (!controls) return;
        const step = Math.PI / 10;
        if (event.key === 'ArrowLeft') controls.rotateLeft(step);
        else if (event.key === 'ArrowRight') controls.rotateLeft(-step);
        else return;
        event.preventDefault();
        controls.update();
      });
      stage.setAttribute('aria-busy', 'false');
      status.classList.add('is-hidden');
      document.getElementById('download-preview').disabled = false;
      document.getElementById('reset-3d').disabled = false;
      setView('front');
      render();
    } catch (error) {
      console.error('No se pudo inicializar el visor de prenda 3D.', error);
      handleModelFailure();
    }
  }

  function connectControls() {
    document.querySelectorAll('.color-swatch').forEach((button) => {
      button.addEventListener('click', () => {
        activeColor = button.dataset.color || defaultColor;
        document.querySelectorAll('.color-swatch').forEach((item) => {
          const selected = item === button;
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        drawFabric();
        updateWhatsAppLinks();
      });
    });

    document.querySelectorAll('.pattern-button').forEach((button) => {
      button.addEventListener('click', () => {
        activePattern = button.dataset.pattern || 'solid';
        document.querySelectorAll('.pattern-button').forEach((item) => {
          const selected = item === button;
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        drawFabric();
        updateWhatsAppLinks();
      });
    });

    document.querySelectorAll('.stage-view-controls button').forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.view));
    });

    const tabs = [...document.querySelectorAll('[data-editor-tab]')];
    function activateTab(tab, moveFocus = false) {
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      document.querySelectorAll('[data-editor-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.editorPanel !== tab.dataset.editorTab;
      });
      if (moveFocus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      });
    });

    document.querySelectorAll('.background-swatch[data-background]').forEach((button) => {
      button.addEventListener('click', () => {
        const background = button.dataset.background || 'soft';
        stage.dataset.background = background;
        document.querySelectorAll('.background-swatch[data-background]').forEach((item) => {
          const selected = item === button;
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
      });
    });

    document.getElementById('design-upload').addEventListener('change', (event) => loadDesign(event.target.files?.[0]));
    document.querySelectorAll('[data-placement]').forEach((button) => {
      button.addEventListener('click', () => {
        designPlacement = button.dataset.placement || 'chest';
        document.querySelectorAll('[data-placement]').forEach((item) => {
          const selected = item === button;
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        placeDesign();
      });
    });
    document.getElementById('design-scale').addEventListener('input', (event) => {
      designScale = Number(event.target.value);
      setText('design-scale-value', `${designScale}%`);
      placeDesign();
    });
    document.getElementById('remove-design').addEventListener('click', removeDesign);
    document.getElementById('reset-3d').addEventListener('click', () => {
      document.querySelector('.color-swatch[data-color="#0B2D63"]')?.click();
      document.querySelector('.pattern-button[data-pattern="solid"]')?.click();
      document.querySelector('.background-swatch[data-background="soft"]')?.click();
      designPlacement = 'chest';
      designScale = 100;
      setText('design-scale-value', '100%');
      document.getElementById('design-scale').value = '100';
      document.querySelectorAll('[data-placement]').forEach((item) => {
        const selected = item.dataset.placement === 'chest';
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      if (designTexture) placeDesign();
      setView('front');
    });
    document.getElementById('download-preview').addEventListener('click', () => {
      try {
        renderer.render(scene, camera);
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportContext = exportCanvas.getContext('2d');
        const bg = stage.dataset.background || 'soft';
        const colors = bg === 'dark' ? ['#465160', '#202832'] : bg === 'white' ? ['#ffffff', '#ffffff'] : ['#ffffff', '#edf0f2'];
        const gradient = exportContext.createRadialGradient(exportCanvas.width * 0.5, exportCanvas.height * 0.4, exportCanvas.width * 0.04, exportCanvas.width * 0.5, exportCanvas.height * 0.5, exportCanvas.width * 0.72);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        exportContext.fillStyle = gradient;
        exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        exportContext.drawImage(canvas, 0, 0);
        const link = document.createElement('a');
        link.download = `tmp-${product.slug}-vista-3d.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
        status.textContent = 'Vista 3D descargada como PNG.';
        status.classList.remove('is-hidden');
        window.setTimeout(() => status.classList.add('is-hidden'), 3200);
      } catch (error) {
        console.warn('No se pudo descargar la vista 3D.', error);
        status.textContent = 'No se pudo descargar la vista. Inténtalo otra vez.';
        status.classList.remove('is-hidden');
      }
    });
    sizeSelect.addEventListener('change', updateWhatsAppLinks);
    setDesignControlsEnabled(false);
  }

  updatePageContent();
  paintRelatedProducts();
  connectControls();
  updateWhatsAppLinks();
  init3D();
})();
