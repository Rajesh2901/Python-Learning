import { Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {
  constructor(private ngZone: NgZone) {}

  createVisualizer(container: HTMLElement, isHero = false): VisualizerInstance {
    return this.ngZone.runOutsideAngular(() => {
      return new VisualizerInstance(container, isHero);
    });
  }
}

export class VisualizerInstance {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private frameId?: number;
  private objects: THREE.Object3D[] = [];
  
  // Visualizer State
  public activeMode = 'loops';
  public currentStep = 0;
  public maxSteps = 10;
  public isPlaying = false;
  public speed = 50;
  private lastUpdateTime = 0;

  // Helix Loop nodes
  private loopNodes: THREE.Mesh[] = [];
  private pointer?: THREE.Mesh;

  // Tree Recursion nodes
  private treeBranches: { mesh: THREE.Mesh; step: number; color: number }[] = [];

  // Linked List nodes
  private listNodes: THREE.Mesh[] = [];
  private listCursor?: THREE.Mesh;

  private colors = {
    bg: 0x060913,
    node: 0x4B8BBE,
    nodeHighlight: 0x00f3ff,
    pointer: 0xffb703,
    accentGreen: 0x39FF14,
    accentRed: 0xff3366,
    grid: 0x22293f
  };

  private gridHelper?: THREE.GridHelper;

  constructor(private container: HTMLElement, private isHero: boolean) {
    this.initThree();
    this.initScene();
    this.animate(0);
  }

  private initThree() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.colors.bg);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 5, 12);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    if (!this.isHero) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x4b8bbe, 0.4);
    dirLight2.position.set(-5, -5, -5);
    this.scene.add(dirLight2);
  }

  private initScene() {
    if (this.isHero) {
      this.setupHeroScene();
    } else {
      this.setupLoopsScene();
    }
  }

  public setVisualization(type: string) {
    this.isPlaying = false;
    this.activeMode = type;
    this.currentStep = 0;
    this.maxSteps = 8;
    
    if (type === 'loops') this.setupLoopsScene();
    else if (type === 'recursion') this.setupRecursionScene();
    else if (type === 'structures') this.setupStructuresScene();
    else if (type === 'Array') this.setupArrayScene();
    else if (type === 'Linked List') this.setupLinkedListScene();
    else if (type === 'Stack/Queue' || type === 'stack' || type === 'queue') this.setupStackQueueScene();
    else if (type === 'Tree') this.setupTreeScene();
    else if (type === 'Graph') this.setupGraphScene();
    else if (type === 'Heap') this.setupHeapScene();
    else if (type === 'Hash Table') this.setupHashTableScene();
  }

  public setSpeed(val: number) {
    this.speed = val;
  }

  public togglePlay(): boolean {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  public updateColors(isLight: boolean) {
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

  private clearScene() {
    this.objects.forEach(obj => {
      this.scene.remove(obj);
    });
    this.objects = [];
    this.loopNodes = [];
    this.treeBranches = [];
    this.listNodes = [];
    this.pointer = undefined;
    this.listCursor = undefined;
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper = undefined;
    }
  }

  // Hero View
  private setupHeroScene() {
    this.clearScene();
    this.camera.position.set(4, 3, 6);
    this.camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.BoxGeometry(2.5, 0.5, 2.5);
      const mat = new THREE.MeshPhongMaterial({
        color: i === 3 ? this.colors.nodeHighlight : this.colors.node,
        transparent: true,
        opacity: 0.7 + (i * 0.08),
        shininess: 100
      });
      const box = new THREE.Mesh(geo, mat);
      box.position.y = i * 0.7 - 1;
      group.add(box);
      this.objects.push(box);
    }
    this.scene.add(group);
    this.objects.push(group);
  }

  // Loops Helix View
  public setupLoopsScene() {
    this.clearScene();
    this.activeMode = 'loops';
    this.currentStep = 0;
    this.maxSteps = 10;

    this.gridHelper = new THREE.GridHelper(20, 20, this.colors.grid, this.colors.grid);
    this.gridHelper.position.y = -2;
    this.scene.add(this.gridHelper);

    this.camera.position.set(0, 6, 12);
    if (this.controls) this.controls.target.set(0, 0, 0);

    const radius = 3.5;
    for (let i = 0; i < 10; i++) {
      const theta = (i / 10) * Math.PI * 2 * 1.5;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const y = (i * 0.4) - 1.5;

      const geo = new THREE.SphereGeometry(0.35, 32, 32);
      const mat = new THREE.MeshPhongMaterial({ color: this.colors.node, shininess: 80 });
      const node = new THREE.Mesh(geo, mat);
      node.position.set(x, y, z);
      this.scene.add(node);
      this.objects.push(node);
      this.loopNodes.push(node);
    }

    const pointerGeo = new THREE.ConeGeometry(0.25, 0.7, 32);
    const pointerMat = new THREE.MeshPhongMaterial({ color: this.colors.pointer, shininess: 100 });
    this.pointer = new THREE.Mesh(pointerGeo, pointerMat);
    this.pointer.rotation.x = Math.PI;
    this.pointer.position.copy(this.loopNodes[0].position);
    this.pointer.position.y += 0.9;
    this.scene.add(this.pointer);
    this.objects.push(this.pointer);
  }

  // Recursion Tree View
  public setupRecursionScene() {
    this.clearScene();
    this.activeMode = 'recursion';
    this.currentStep = 0;
    this.maxSteps = 5;

    this.camera.position.set(0, 3, 10);
    if (this.controls) this.controls.target.set(0, 2.5, 0);

    this.generateTreeSteps(0, -1.5, 0, 90, 2.5, 5);
    this.treeBranches.forEach(b => b.mesh.visible = false);
  }

  private generateTreeSteps(x: number, y: number, z: number, angle: number, length: number, depth: number) {
    if (depth === 0) return;

    const theta = (angle * Math.PI) / 180;
    const xEnd = x + Math.cos(theta) * length;
    const yEnd = y + Math.sin(theta) * length;
    const zEnd = z + (Math.random() - 0.5) * 0.5;

    const path = new THREE.LineCurve3(new THREE.Vector3(x, y, z), new THREE.Vector3(xEnd, yEnd, zEnd));
    const tubeGeo = new THREE.TubeGeometry(path, 8, 0.08 * depth, 8, false);
    const tubeMat = new THREE.MeshPhongMaterial({ color: this.colors.node, shininess: 50 });
    const branchMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(branchMesh);
    this.objects.push(branchMesh);

    const stepNum = 6 - depth;
    this.treeBranches.push({
      mesh: branchMesh,
      step: stepNum,
      color: depth === 1 ? this.colors.accentGreen : this.colors.node
    });

    this.generateTreeSteps(xEnd, yEnd, zEnd, angle - 25, length * 0.75, depth - 1);
    this.generateTreeSteps(xEnd, yEnd, zEnd, angle + 25, length * 0.75, depth - 1);
  }

  // Structures View
  public setupStructuresScene() {
    this.clearScene();
    this.currentStep = 0;
    this.maxSteps = 5;

    this.gridHelper = new THREE.GridHelper(20, 20, this.colors.grid, this.colors.grid);
    this.gridHelper.position.y = -2;
    this.scene.add(this.gridHelper);

    this.camera.position.set(0, 4, 10);
    if (this.controls) this.controls.target.set(0, 0, 0);

    const numNodes = 5;
    const spacing = 2.2;
    for (let i = 0; i < numNodes; i++) {
      const x = (i - (numNodes - 1) / 2) * spacing;
      const y = 0;
      const z = 0;

      const nodeGeo = new THREE.SphereGeometry(0.4, 32, 32);
      const nodeMat = new THREE.MeshPhongMaterial({ color: this.colors.node, shininess: 90 });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, y, z);
      this.scene.add(node);
      this.objects.push(node);
      this.listNodes.push(node);

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

    const cursorGeo = new THREE.SphereGeometry(0.43, 32, 32);
    const cursorMat = new THREE.MeshBasicMaterial({ color: this.colors.nodeHighlight, wireframe: true });
    this.listCursor = new THREE.Mesh(cursorGeo, cursorMat);
    this.listCursor.position.copy(this.listNodes[0].position);
    this.scene.add(this.listCursor);
    this.objects.push(this.listCursor);
  }

  // 1. Array Scene
  private setupArrayScene() {
    this.clearScene();
    this.maxSteps = 6;
    this.camera.position.set(0, 4, 10);
    if (this.controls) this.controls.target.set(0, 0, 0);

    this.gridHelper = new THREE.GridHelper(20, 20, this.colors.grid, this.colors.grid);
    this.gridHelper.position.y = -2;
    this.scene.add(this.gridHelper);

    const numElements = 6;
    const spacing = 1.4;
    for (let i = 0; i < numElements; i++) {
      const x = (i - (numElements - 1) / 2) * spacing;
      const geo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
      const mat = new THREE.MeshPhongMaterial({ color: this.colors.node, shininess: 80 });
      const box = new THREE.Mesh(geo, mat);
      box.position.set(x, 0, 0);
      this.scene.add(box);
      this.objects.push(box);
      this.listNodes.push(box);
    }
    
    const pointerGeo = new THREE.ConeGeometry(0.2, 0.5, 16);
    const pointerMat = new THREE.MeshPhongMaterial({ color: this.colors.pointer });
    this.pointer = new THREE.Mesh(pointerGeo, pointerMat);
    this.pointer.rotation.x = Math.PI;
    this.pointer.position.copy(this.listNodes[0].position);
    this.pointer.position.y += 1.0;
    this.scene.add(this.pointer);
    this.objects.push(this.pointer);
  }

  private setupLinkedListScene() {
    this.setupStructuresScene();
  }

  // 2. Stack/Queue Scene
  private setupStackQueueScene() {
    this.clearScene();
    this.maxSteps = 5;
    this.camera.position.set(0, 3, 8);
    if (this.controls) this.controls.target.set(0, 1, 0);

    const tubeGeo = new THREE.CylinderGeometry(1.0, 1.0, 4.0, 16, 1, true);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0x8e9bb4, wireframe: true, transparent: true, opacity: 0.3 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.y = 0.5;
    this.scene.add(tube);
    this.objects.push(tube);

    for (let i = 0; i < 5; i++) {
      const geo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 32);
      const mat = new THREE.MeshPhongMaterial({ color: this.colors.node, shininess: 80 });
      const disk = new THREE.Mesh(geo, mat);
      disk.position.set(0, i * 0.65 - 0.7, 0);
      disk.visible = false;
      this.scene.add(disk);
      this.objects.push(disk);
      this.listNodes.push(disk);
    }
  }

  // 3. Binary Tree Scene
  private setupTreeScene() {
    this.clearScene();
    this.maxSteps = 7;
    this.camera.position.set(0, 2, 8);
    if (this.controls) this.controls.target.set(0, 1.5, 0);

    const positions = [
      new THREE.Vector3(0, 3.5, 0),
      new THREE.Vector3(-2.2, 2.2, 0),
      new THREE.Vector3(2.2, 2.2, 0),
      new THREE.Vector3(-3.2, 0.8, 0),
      new THREE.Vector3(-1.2, 0.8, 0),
      new THREE.Vector3(1.2, 0.8, 0),
      new THREE.Vector3(3.2, 0.8, 0)
    ];

    const connections = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    connections.forEach(([parent, child]) => {
      const start = positions[parent];
      const end = positions[child];
      const path = new THREE.LineCurve3(start, end);
      const edgeGeo = new THREE.TubeGeometry(path, 4, 0.04, 8, false);
      const edgeMat = new THREE.MeshPhongMaterial({ color: 0x8e9bb4 });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      this.scene.add(edge);
      this.objects.push(edge);
    });

    positions.forEach((pos) => {
      const geo = new THREE.SphereGeometry(0.35, 32, 32);
      const mat = new THREE.MeshPhongMaterial({ color: this.colors.node, shininess: 90 });
      const node = new THREE.Mesh(geo, mat);
      node.position.copy(pos);
      this.scene.add(node);
      this.objects.push(node);
      this.listNodes.push(node);
    });
  }

  // 4. Graph Scene
  private setupGraphScene() {
    this.clearScene();
    this.maxSteps = 6;
    this.camera.position.set(0, 2, 8);
    if (this.controls) this.controls.target.set(0, 1, 0);

    const positions = [
      new THREE.Vector3(0, 2.5, 0),
      new THREE.Vector3(-2, 1.2, 1),
      new THREE.Vector3(2, 1.2, -1),
      new THREE.Vector3(-1.5, -0.8, 0.5),
      new THREE.Vector3(1.5, -0.8, -0.5),
      new THREE.Vector3(0, -1.8, 0)
    ];

    const connections = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [1, 2], [3, 4]];
    connections.forEach(([startIdx, endIdx]) => {
      const start = positions[startIdx];
      const end = positions[endIdx];
      const path = new THREE.LineCurve3(start, end);
      const edgeGeo = new THREE.TubeGeometry(path, 4, 0.03, 8, false);
      const edgeMat = new THREE.MeshPhongMaterial({ color: 0x5c6984 });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      this.scene.add(edge);
      this.objects.push(edge);
    });

    positions.forEach((pos) => {
      const geo = new THREE.SphereGeometry(0.32, 32, 32);
      const mat = new THREE.MeshPhongMaterial({ color: this.colors.node, shininess: 80 });
      const node = new THREE.Mesh(geo, mat);
      node.position.copy(pos);
      this.scene.add(node);
      this.objects.push(node);
      this.listNodes.push(node);
    });
  }

  private setupHeapScene() {
    this.setupTreeScene();
  }

  // 5. Hash Table Scene
  private setupHashTableScene() {
    this.clearScene();
    this.maxSteps = 5;
    this.camera.position.set(0, 2, 8);
    if (this.controls) this.controls.target.set(0, 0.5, 0);

    const numBuckets = 5;
    for (let i = 0; i < numBuckets; i++) {
      const y = i * 0.9 - 1.5;
      const geo = new THREE.BoxGeometry(1.6, 0.5, 0.8);
      const mat = new THREE.MeshPhongMaterial({ color: this.colors.node, shininess: 80 });
      const bucket = new THREE.Mesh(geo, mat);
      bucket.position.set(-2, y, 0);
      this.scene.add(bucket);
      this.objects.push(bucket);
      this.listNodes.push(bucket);

      const kvGeo = new THREE.SphereGeometry(0.25, 32, 32);
      const kvMat = new THREE.MeshPhongMaterial({ color: this.colors.accentGreen });
      const kvNode = new THREE.Mesh(kvGeo, kvMat);
      kvNode.position.set(1.5, y, 0);
      kvNode.visible = false;
      this.scene.add(kvNode);
      this.objects.push(kvNode);

      const start = new THREE.Vector3(-1.0, y, 0);
      const end = new THREE.Vector3(1.2, y, 0);
      const path = new THREE.LineCurve3(start, end);
      const edgeGeo = new THREE.TubeGeometry(path, 4, 0.02, 8, false);
      const edgeMat = new THREE.MeshPhongMaterial({ color: 0x8e9bb4 });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.visible = false;
      this.scene.add(edge);
      this.objects.push(edge);
    }
  }

  // Traversal Hooks
  public step() {
    this.currentStep = (this.currentStep + 1) % this.maxSteps;
    this.updateVisualizationFrame();
    return { step: this.currentStep, vars: this.getHUDVars() };
  }

  public reset() {
    this.isPlaying = false;
    this.currentStep = 0;
    this.initScene();
    return { step: this.currentStep, vars: this.getHUDVars() };
  }

  private updateVisualizationFrame() {
    if (this.activeMode === 'loops') {
      const targetNode = this.loopNodes[this.currentStep];
      if (this.pointer) {
        this.pointer.position.copy(targetNode.position);
        this.pointer.position.y += 0.9;
      }
      this.loopNodes.forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial;
        if (idx <= this.currentStep) {
          mat.color.setHex(this.colors.nodeHighlight);
        } else {
          mat.color.setHex(this.colors.node);
        }
      });
    } else if (this.activeMode === 'recursion') {
      this.treeBranches.forEach(b => {
        if (b.step <= this.currentStep) {
          b.mesh.visible = true;
          (b.mesh.material as THREE.MeshPhongMaterial).color.setHex(b.color);
        } else {
          b.mesh.visible = false;
        }
      });
    } else if (this.activeMode === 'structures' || this.activeMode === 'Linked List') {
      const targetNode = this.listNodes[this.currentStep];
      if (this.listCursor) this.listCursor.position.copy(targetNode.position);
      this.listNodes.forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial;
        if (idx === this.currentStep) {
          mat.color.setHex(this.colors.nodeHighlight);
        } else {
          mat.color.setHex(this.colors.node);
        }
      });
    } else if (this.activeMode === 'Array') {
      const targetNode = this.listNodes[this.currentStep];
      if (this.pointer) {
        this.pointer.position.copy(targetNode.position);
        this.pointer.position.y += 1.0;
      }
      this.listNodes.forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial;
        if (idx <= this.currentStep) {
          mat.color.setHex(this.colors.nodeHighlight);
        } else {
          mat.color.setHex(this.colors.node);
        }
      });
    } else if (this.activeMode === 'Stack/Queue' || this.activeMode === 'stack' || this.activeMode === 'queue') {
      this.listNodes.forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial;
        if (idx <= this.currentStep) {
          node.visible = true;
          if (idx === this.currentStep) {
            mat.color.setHex(this.colors.nodeHighlight);
          } else {
            mat.color.setHex(this.colors.node);
          }
        } else {
          node.visible = false;
        }
      });
    } else if (this.activeMode === 'Tree' || this.activeMode === 'Heap') {
      this.listNodes.forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial;
        if (idx === this.currentStep) {
          mat.color.setHex(this.colors.nodeHighlight);
        } else if (idx < this.currentStep) {
          mat.color.setHex(this.colors.accentGreen);
        } else {
          mat.color.setHex(this.colors.node);
        }
      });
    } else if (this.activeMode === 'Graph') {
      this.listNodes.forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial;
        if (idx === this.currentStep) {
          mat.color.setHex(this.colors.nodeHighlight);
        } else if (idx < this.currentStep) {
          mat.color.setHex(this.colors.accentGreen);
        } else {
          mat.color.setHex(this.colors.node);
        }
      });
    } else if (this.activeMode === 'Hash Table') {
      this.listNodes.forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial;
        const kvNode = this.objects[5 + idx];
        const pointer = this.objects[10 + idx];
        
        if (idx === this.currentStep) {
          mat.color.setHex(this.colors.nodeHighlight);
          if (kvNode) kvNode.visible = true;
          if (pointer) pointer.visible = true;
        } else {
          mat.color.setHex(this.colors.node);
        }
      });
    }
  }

  private getHUDVars(): string {
    if (this.activeMode === 'loops') {
      return `i = ${this.currentStep}, sum = ${((this.currentStep * (this.currentStep + 1)) / 2)}`;
    } else if (this.activeMode === 'recursion') {
      return `factorial(${5 - this.currentStep}) - Frame depth: ${this.currentStep}`;
    } else if (this.activeMode === 'Array') {
      return `arr[${this.currentStep}] = ${this.currentStep * 5 + 10} - Memory offset: ${this.currentStep * 4} bytes`;
    } else if (this.activeMode === 'Linked List') {
      const memoryAddresses = ["0x7FFE", "0x8B1C", "0x91F0", "0xA3B4", "0xBF22"];
      return `curr = ${memoryAddresses[this.currentStep % memoryAddresses.length]}, val = ${this.currentStep * 10}`;
    } else if (this.activeMode === 'stack') {
      return `Stack size = ${this.currentStep + 1}, Top value = ${this.currentStep * 10 + 10}`;
    } else if (this.activeMode === 'queue') {
      return `Queue size = ${this.currentStep + 1}, Front value = 10, Rear value = ${this.currentStep * 10 + 10}`;
    } else if (this.activeMode === 'Tree') {
      const nodeNames = ["Root", "Left", "Right", "Left-Left", "Left-Right", "Right-Left", "Right-Right"];
      return `dfs_traverse() -> visited: ${nodeNames[this.currentStep % nodeNames.length]}`;
    } else if (this.activeMode === 'Graph') {
      return `bfs_traverse() -> active_node = Node_${this.currentStep}, visited = {0..${this.currentStep}}`;
    } else if (this.activeMode === 'Heap') {
      return `min_heapify() -> active_index = ${this.currentStep}, min_val = ${this.currentStep * 2}`;
    } else if (this.activeMode === 'Hash Table') {
      return `hash_map("key_${this.currentStep}") -> index = ${this.currentStep % 5}, value = ${this.currentStep * 100}`;
    } else {
      const memoryAddresses = ["0x7FFE", "0x8B1C", "0x91F0", "0xA3B4", "0xBF22"];
      return `curr_node = ${memoryAddresses[this.currentStep % memoryAddresses.length]}, val = ${this.currentStep * 10}`;
    }
  }

  public resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = (timestamp: number) => {
    this.frameId = requestAnimationFrame(this.animate);

    if (this.isPlaying) {
      const delay = (101 - this.speed) * 15;
      if (timestamp - this.lastUpdateTime > delay) {
        this.step();
        this.lastUpdateTime = timestamp;
      }
    }

    if (this.isHero && this.objects[0]) {
      this.objects[0].rotation.y += 0.01;
    }

    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
    }
    this.clearScene();
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
