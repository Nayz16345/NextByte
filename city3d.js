/* ============================================
   NextByte Solutions — 3D City (Three.js)
   ============================================ */

const CityScene = (() => {
  let scene, camera, renderer, cityGroup, particleSystem;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let clock;
  let isInitialized = false;

  function init() {
    const canvas = document.getElementById('city-canvas');
    if (!canvas || !window.THREE) return;

    clock = new THREE.Clock();

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.018);

    // Camera — slightly isometric perspective
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    camera.position.set(28, 22, 28);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;

    // Lighting
    setupLights();

    // City
    cityGroup = new THREE.Group();
    generateCity();
    scene.add(cityGroup);

    // Ground grid
    createGroundGrid();

    // Particles
    createParticles();

    // Events
    window.addEventListener('resize', onResize);
    document.addEventListener('mousemove', onMouseMove);

    isInitialized = true;
    animate();
  }

  function setupLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambient);

    // Main directional
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(20, 35, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    scene.add(dirLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x8888aa, 0.3);
    rimLight.position.set(-15, 10, -20);
    scene.add(rimLight);

    // Green accent point lights
    const greenLight1 = new THREE.PointLight(0x00D26A, 0.8, 40);
    greenLight1.position.set(-5, 3, -5);
    scene.add(greenLight1);

    const greenLight2 = new THREE.PointLight(0x00D26A, 0.5, 35);
    greenLight2.position.set(8, 2, 6);
    scene.add(greenLight2);
  }

  function generateCity() {
    const gridSize = 9;
    const blockSize = 2;
    const gap = 0.4;
    const half = gridSize / 2;

    // Materials cache — grayscale tones only
    const materials = [];
    for (let i = 0; i < 8; i++) {
      const val = 0.1 + i * 0.04;
      materials.push(new THREE.MeshStandardMaterial({
        color: new THREE.Color(val, val, val),
        roughness: 0.85,
        metalness: 0.15,
      }));
    }

    // Edge material for wireframe accent
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00D26A,
      transparent: true,
      opacity: 0.07,
    });

    const edgeMatBright = new THREE.LineBasicMaterial({
      color: 0x00D26A,
      transparent: true,
      opacity: 0.15,
    });

    for (let x = -half; x < half; x++) {
      for (let z = -half; z < half; z++) {
        // Roads: skip center-ish rows/cols
        if (Math.abs(x) === 0 || Math.abs(z) === 0) continue;
        if (Math.abs(x) === Math.floor(half / 2) && Math.random() < 0.6) continue;
        if (Math.abs(z) === Math.floor(half / 2) && Math.random() < 0.6) continue;

        // Random gap for variety
        if (Math.random() < 0.25) continue;

        // Distance from center affects max height
        const dist = Math.sqrt(x * x + z * z);
        const centerFactor = 1 - (dist / (gridSize * 0.65));
        const maxHeight = Math.max(1.5, centerFactor * 12);

        const height = 0.8 + Math.random() * maxHeight;
        const width = blockSize - gap - Math.random() * 0.3;
        const depth = blockSize - gap - Math.random() * 0.3;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = materials[Math.floor(Math.random() * materials.length)];

        const building = new THREE.Mesh(geometry, material);
        building.position.set(
          x * (blockSize + gap * 0.5),
          height / 2,
          z * (blockSize + gap * 0.5)
        );
        building.castShadow = true;
        building.receiveShadow = true;

        // Store original height for animation
        building.userData.originalY = height / 2;
        building.userData.animOffset = Math.random() * Math.PI * 2;

        cityGroup.add(building);

        // Green wireframe on some buildings
        if (Math.random() < 0.3) {
          const edges = new THREE.EdgesGeometry(geometry);
          const lineMat = height > 5 ? edgeMatBright : edgeMat;
          const wireframe = new THREE.LineSegments(edges, lineMat);
          wireframe.position.copy(building.position);
          cityGroup.add(wireframe);
        }

        // Small windows (emissive dots on tall buildings)
        if (height > 4 && Math.random() < 0.5) {
          const windowGeo = new THREE.BoxGeometry(0.08, 0.08, width + 0.02);
          const windowMat = new THREE.MeshBasicMaterial({
            color: 0x00D26A,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.4,
          });

          const windowCount = Math.floor(height / 1.5);
          for (let w = 0; w < windowCount; w++) {
            if (Math.random() < 0.4) continue;
            const win = new THREE.Mesh(windowGeo, windowMat);
            win.position.set(
              building.position.x,
              1 + w * 1.2,
              building.position.z
            );
            cityGroup.add(win);
          }
        }
      }
    }

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 1,
      metalness: 0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    cityGroup.add(ground);
  }

  function createGroundGrid() {
    // Green-tinted grid
    const gridHelper = new THREE.GridHelper(50, 50, 0x00D26A, 0x00D26A);
    gridHelper.material.opacity = 0.04;
    gridHelper.material.transparent = true;
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // Inner brighter grid
    const gridHelper2 = new THREE.GridHelper(20, 20, 0x00D26A, 0x00D26A);
    gridHelper2.material.opacity = 0.08;
    gridHelper2.material.transparent = true;
    gridHelper2.position.y = 0.03;
    scene.add(gridHelper2);
  }

  function createParticles() {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 25 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0x00D26A,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function animate() {
    if (!isInitialized) return;
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth mouse follow
    targetMouseX += (mouseX - targetMouseX) * 0.03;
    targetMouseY += (mouseY - targetMouseY) * 0.03;

    // Slow auto-rotation
    cityGroup.rotation.y += 0.0008;

    // Subtle breathing
    cityGroup.position.y = Math.sin(elapsed * 0.4) * 0.25;

    // Mouse parallax on camera
    camera.position.x = 28 + targetMouseX * 3;
    camera.position.z = 28 + targetMouseY * 3;
    camera.lookAt(0, 0, 0);

    // Animate particles
    if (particleSystem) {
      const pos = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(elapsed * 0.5 + i * 0.1) * 0.003;
        // Gentle horizontal drift
        pos[i] += Math.cos(elapsed * 0.3 + i * 0.05) * 0.001;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y += 0.0002;
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    if (!renderer) return;
    const canvas = renderer.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  return { init };
})();
