(() => {
  let THREE;
  let GLTFLoader;
  let OrbitControls;
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
  let accentMaterial;
  let fabricTexture;
  let fabricCanvas;
  let fabricContext;
  let garmentRoot;
  let garmentBounds;
  let shirtMesh;
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
    const message = `Hola, me interesa consultar ${product.title}${selectedSizeText}. ¿Me comparten precio, disponibilidad, materiales, medidas y opciones de envío? En el vestidor 3D probé una vista ${colorName} con patrón ${patternName}; entiendo que es una referencia visual y quiero confirmar qué opciones están disponibles.`;
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
      addSleeve(cuff, wrist, radius * 1.04, accentMaterial);
    });

    const hoodShape = new THREE.Shape();
    const halfWidth = size.x * 0.16;
    hoodShape.moveTo(-halfWidth, 0);
    hoodShape.bezierCurveTo(-halfWidth * 1.2, size.y * 0.12, -halfWidth * 0.68, size.y * 0.2, 0, size.y * 0.2);
    hoodShape.bezierCurveTo(halfWidth * 0.68, size.y * 0.2, halfWidth * 1.2, size.y * 0.12, halfWidth, 0);
    hoodShape.quadraticCurveTo(0, -size.y * 0.05, -halfWidth, 0);
    const hood = addSceneObject(new THREE.Mesh(new THREE.ShapeGeometry(hoodShape, 24), clothMaterial));
    hood.position.set(center.x, garmentBounds.min.y + size.y * 0.82, back);
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
    document.querySelectorAll('.stage-view-controls button, .color-swatch, .pattern-button').forEach((button) => {
      button.disabled = true;
    });
  }

  async function init3D() {
    try {
      const moduleBase = 'https://cdn.jsdelivr.net/npm/three@0.186.1';
      const modules = await Promise.all([
        import(`${moduleBase}/build/three.module.js`),
        import(`${moduleBase}/examples/jsm/loaders/GLTFLoader.js`),
        import(`${moduleBase}/examples/jsm/controls/OrbitControls.js`)
      ]);
      [THREE, { GLTFLoader }, { OrbitControls }] = modules;
      const width = Math.max(stage.clientWidth, 300);
      const height = Math.max(stage.clientHeight, 360);
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
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
      fabricTexture.colorSpace = THREE.SRGBColorSpace;
      fabricTexture.wrapS = THREE.RepeatWrapping;
      fabricTexture.wrapT = THREE.RepeatWrapping;
      clothMaterial = new THREE.MeshStandardMaterial({ map: fabricTexture, roughness: 0.82, metalness: 0, side: THREE.DoubleSide });
      accentMaterial = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.82, metalness: 0, side: THREE.DoubleSide });

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
        buildPonchoApproximation();
      }
      drawFabric();

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
    sizeSelect.addEventListener('change', updateWhatsAppLinks);
  }

  updatePageContent();
  paintRelatedProducts();
  connectControls();
  updateWhatsAppLinks();
  init3D();
})();
