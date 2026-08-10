/**
 * three-visualizer.js
 * Renders interactive GPU-accelerated 3D visualizations inside WebGL canvas.
 * Manages: loops, recursion trees, and linked list node traversal.
 */

class Visualizer {
    constructor(canvasContainerId, isHeroVisual = false) {
        this.container = document.getElementById(canvasContainerId);
        if (!this.container) return;

        this.isHero = isHeroVisual;
        
        // Colors & Theme Config
        this.colors = {
            bg: 0x060913,
            node: 0x4B8BBE,
            nodeHighlight: 0x00f3ff,
            pointer: 0xffb703,
            accentGreen: 0x39FF14,
            accentRed: 0xff3366,
            grid: 0x22293f
        };

        this.initThree();
        this.initScene();
        this.animate();

        // Bind resize
        window.addEventListener('resize', () => this.resize());
    }

    initThree() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.colors.bg);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 5, 12);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Controls
        if (!this.isHero) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight1.position.set(5, 10, 7);
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x4b8bbe, 0.4);
        dirLight2.position.set(-5, -5, -5);
        this.scene.add(dirLight2);
    }

    initScene() {
        this.objects = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.speed = 50; // Delay modifier
        this.lastUpdateTime = 0;

        if (this.isHero) {
            this.setupHeroScene();
        } else {
            this.setupLoopsScene();
        }
    }

    updateColors(isLight) {
        if (isLight) {
            this.colors.bg = 0xf5f7fb;
            this.colors.grid = 0xcbd5e1;
        } else {
            this.colors.bg = 0x060913;
            this.colors.grid = 0x22293f;
        }
        this.scene.background = new THREE.Color(this.colors.bg);
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper = new THREE.GridHelper(20, 20, this.colors.grid, this.colors.grid);
            this.gridHelper.position.y = -2;
            this.scene.add(this.gridHelper);
        }
    }

    clearScene() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        this.objects = [];
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper = null;
        }
    }

    // ==========================================================================
    // HERO VIEW: Simple Rotating Stack
    // ==========================================================================
    setupHeroScene() {
        this.clearScene();
        this.camera.position.set(4, 3, 6);
        this.camera.lookAt(0, 0, 0);

        const group = new THREE.Group();

        // Create boxes stack
        for (let i = 0; i < 4; i++) {
            const geo = new THREE.BoxGeometry(2.5, 0.5, 2.5);
            const mat = new THREE.MeshPhongMaterial({
                color: i === 3 ? this.colors.nodeHighlight : this.colors.node,
                transparent: true,
                opacity: 0.7 + (i * 0.08),
                shininess: 100,
                specular: 0xffffff
            });
            const box = new THREE.Mesh(geo, mat);
            box.position.y = i * 0.7 - 1;
            group.add(box);
        }

        this.scene.add(group);
        this.objects.push(group);
    }

    // ==========================================================================
    // SCENE: Loops Visualizer (Helical Path traversal)
    // ==========================================================================
    setupLoopsScene() {
        this.clearScene();
        this.activeMode = "loops";
        this.currentStep = 0;
        this.maxSteps = 10;
        
        // Add Grid Helper
        this.gridHelper = new THREE.GridHelper(20, 20, this.colors.grid, this.colors.grid);
        this.gridHelper.position.y = -2;
        this.scene.add(this.gridHelper);

        this.camera.position.set(0, 6, 12);
        if (this.controls) this.controls.target.set(0, 0, 0);

        // Generate Helix Points
        this.loopNodes = [];
        const numNodes = 10;
        const radius = 3.5;

        for (let i = 0; i < numNodes; i++) {
            const theta = (i / numNodes) * Math.PI * 2 * 1.5; // Spiral 1.5 times
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            const y = (i * 0.4) - 1.5;

            // Geometry Node Sphere
            const geo = new THREE.SphereGeometry(0.35, 32, 32);
            const mat = new THREE.MeshPhongMaterial({
                color: this.colors.node,
                emissive: 0x071526,
                shininess: 80
            });
            const node = new THREE.Mesh(geo, mat);
            node.position.set(x, y, z);
            this.scene.add(node);
            this.objects.push(node);
            this.loopNodes.push(node);
        }

        // Animated Traversal Pointer (Cone shape)
        const pointerGeo = new THREE.ConeGeometry(0.25, 0.7, 32);
        const pointerMat = new THREE.MeshPhongMaterial({
            color: this.colors.pointer,
            emissive: 0x332200,
            shininess: 100
        });
        this.pointer = new THREE.Mesh(pointerGeo, pointerMat);
        this.pointer.rotation.x = Math.PI; // point downwards
        this.pointer.position.copy(this.loopNodes[0].position);
        this.pointer.position.y += 0.9;
        this.scene.add(this.pointer);
        this.objects.push(this.pointer);

        this.updateHUD("loops");
    }

    // ==========================================================================
    // SCENE: Recursion Visualizer (Branching Tree structure)
    // ==========================================================================
    setupRecursionScene() {
        this.clearScene();
        this.activeMode = "recursion";
        this.currentStep = 0;
        this.maxSteps = 5;

        this.camera.position.set(0, 3, 10);
        if (this.controls) this.controls.target.set(0, 2.5, 0);

        this.treeBranches = [];
        this.generateTreeSteps(0, -1.5, 0, 90, 2.5, 5);

        // Hide all initially
        this.treeBranches.forEach(branch => {
            branch.mesh.visible = false;
        });

        this.updateHUD("recursion");
    }

    generateTreeSteps(x, y, z, angle, length, depth) {
        if (depth === 0) return;

        const theta = (angle * Math.PI) / 180;
        const xEnd = x + Math.cos(theta) * length;
        const yEnd = y + Math.sin(theta) * length;
        const zEnd = z + (Math.random() - 0.5) * 0.5; // Slight depth variation

        // Line representation
        const path = new THREE.LineCurve3(
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(xEnd, yEnd, zEnd)
        );
        const tubeGeo = new THREE.TubeGeometry(path, 8, 0.08 * depth, 8, false);
        const tubeMat = new THREE.MeshPhongMaterial({
            color: this.colors.node,
            shininess: 50
        });
        const branchMesh = new THREE.Mesh(tubeGeo, tubeMat);
        this.scene.add(branchMesh);
        this.objects.push(branchMesh);

        // Track stack depth assignment
        const stepNum = 6 - depth; // Step 1 to 5
        this.treeBranches.push({
            mesh: branchMesh,
            step: stepNum,
            color: depth === 1 ? this.colors.accentGreen : this.colors.node
        });

        // Fork Left and Right
        this.generateTreeSteps(xEnd, yEnd, zEnd, angle - 25, length * 0.75, depth - 1);
        this.generateTreeSteps(xEnd, yEnd, zEnd, angle + 25, length * 0.75, depth - 1);
    }

    // ==========================================================================
    // SCENE: Linked List Visualizer (Heap nodes and pointers)
    // ==========================================================================
    setupStructuresScene() {
        this.clearScene();
        this.activeMode = "structures";
        this.currentStep = 0;
        this.maxSteps = 5;

        // Grid
        this.gridHelper = new THREE.GridHelper(20, 20, this.colors.grid, this.colors.grid);
        this.gridHelper.position.y = -2;
        this.scene.add(this.gridHelper);

        this.camera.position.set(0, 4, 10);
        if (this.controls) this.controls.target.set(0, 0, 0);

        this.listNodes = [];
        const numNodes = 5;
        const spacing = 2.2;

        for (let i = 0; i < numNodes; i++) {
            const x = (i - (numNodes - 1) / 2) * spacing;
            const y = 0;
            const z = 0;

            // Sphere Node
            const nodeGeo = new THREE.SphereGeometry(0.4, 32, 32);
            const nodeMat = new THREE.MeshPhongMaterial({
                color: this.colors.node,
                shininess: 90
            });
            const node = new THREE.Mesh(nodeGeo, nodeMat);
            node.position.set(x, y, z);
            this.scene.add(node);
            this.objects.push(node);
            this.listNodes.push(node);

            // Connective Pointer Cylinder (except last node)
            if (i < numNodes - 1) {
                const startPoint = new THREE.Vector3(x + 0.4, y, z);
                const endPoint = new THREE.Vector3(x + spacing - 0.4, y, z);
                const path = new THREE.LineCurve3(startPoint, endPoint);
                
                const cylinderGeo = new THREE.TubeGeometry(path, 4, 0.05, 8, false);
                const cylinderMat = new THREE.MeshPhongMaterial({ color: 0x8e9bb4 });
                const pointerMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
                
                this.scene.add(pointerMesh);
                this.objects.push(pointerMesh);
            }
        }

        // Pointer highlight node
        const cursorGeo = new THREE.SphereGeometry(0.43, 32, 32);
        const cursorMat = new THREE.MeshBasicMaterial({
            color: this.colors.nodeHighlight,
            wireframe: true
        });
        this.listCursor = new THREE.Mesh(cursorGeo, cursorMat);
        this.listCursor.position.copy(this.listNodes[0].position);
        this.scene.add(this.listCursor);
        this.objects.push(this.listCursor);

        this.updateHUD("structures");
    }

    // ==========================================================================
    // STATE MODES ACTIONS & HANDLERS
    // ==========================================================================
    setVisualization(type) {
        this.isPlaying = false;
        if (type === 'loops') this.setupLoopsScene();
        else if (type === 'recursion') this.setupRecursionScene();
        else if (type === 'structures') this.setupStructuresScene();
    }

    setSpeed(val) {
        this.speed = val;
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        return this.isPlaying;
    }

    reset() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.setVisualization(this.activeMode);
    }

    step() {
        this.currentStep = (this.currentStep + 1) % this.maxSteps;
        this.updateVisualizationFrame();
    }

    updateVisualizationFrame() {
        if (this.activeMode === "loops") {
            // Traverse helices
            const targetNode = this.loopNodes[this.currentStep];
            
            // Instantly move pointer close
            this.pointer.position.copy(targetNode.position);
            this.pointer.position.y += 0.9;

            // Update materials colors
            this.loopNodes.forEach((node, idx) => {
                if (idx <= this.currentStep) {
                    node.material.color.setHex(this.colors.nodeHighlight);
                } else {
                    node.material.color.setHex(this.colors.node);
                }
            });
            this.updateHUD("loops");
        } 
        else if (this.activeMode === "recursion") {
            // Draw tree branches step-by-step
            this.treeBranches.forEach(branch => {
                if (branch.step <= this.currentStep) {
                    branch.mesh.visible = true;
                    branch.mesh.material.color.setHex(branch.color);
                } else {
                    branch.mesh.visible = false;
                }
            });
            this.updateHUD("recursion");
        } 
        else if (this.activeMode === "structures") {
            // Traverse nodes
            const targetNode = this.listNodes[this.currentStep];
            this.listCursor.position.copy(targetNode.position);

            // Re-color
            this.listNodes.forEach((node, idx) => {
                if (idx === this.currentStep) {
                    node.material.color.setHex(this.colors.nodeHighlight);
                } else {
                    node.material.color.setHex(this.colors.node);
                }
            });
            this.updateHUD("structures");
        }
    }

    updateHUD(mode) {
        const stepEl = document.getElementById("state-step");
        const varsEl = document.getElementById("state-vars");
        if (!stepEl || !varsEl) return;

        stepEl.innerText = this.currentStep + 1;

        if (mode === "loops") {
            varsEl.innerHTML = `i = ${this.currentStep}, sum = ${((this.currentStep * (this.currentStep + 1)) / 2)}`;
        } else if (mode === "recursion") {
            varsEl.innerHTML = `factorial(${5 - this.currentStep}) - Frame depth: ${this.currentStep}`;
        } else if (mode === "structures") {
            const memoryAddresses = ["0x7FFE", "0x8B1C", "0x91F0", "0xA3B4", "0xBF22"];
            varsEl.innerHTML = `curr_node = ${memoryAddresses[this.currentStep]}, val = ${this.currentStep * 10}`;
        }
    }

    // ==========================================================================
    // RENDER & RUNTIME LOOPS
    // ==========================================================================
    resize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    animate(timestamp) {
        requestAnimationFrame((t) => this.animate(t));

        // Automatic playback timer check
        if (this.isPlaying && !this.isHero) {
            const delay = (101 - this.speed) * 15; // Speed scale mappings
            if (timestamp - this.lastUpdateTime > delay) {
                this.step();
                this.lastUpdateTime = timestamp;
            }
        }

        // Hero rotate loop
        if (this.isHero && this.objects[0]) {
            this.objects[0].rotation.y += 0.01;
        }

        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Global initialization bound
document.addEventListener("DOMContentLoaded", () => {
    // Hero Stack Animation
    window.heroApp = new Visualizer("hero-three-canvas", true);
    
    // Main Visualizer Sandbox App
    window.visualizerApp = new Visualizer("three-sandbox-canvas", false);
});
