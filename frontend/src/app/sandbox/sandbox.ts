import { Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreeService, VisualizerInstance } from '../services/three.service';

@Component({
  selector: 'app-sandbox',
  imports: [CommonModule, FormsModule],
  templateUrl: './sandbox.html',
  styleUrl: './sandbox.css'
})
export class SandboxComponent implements OnInit, OnDestroy {
  @ViewChild('sandboxCanvas', { static: true }) canvasContainer!: ElementRef;
  
  public visualizer?: VisualizerInstance;
  public activeMode = 'loops';
  public currentStep = 1;
  public hudVars = 'i = 0, sum = 0';
  public playbackSpeed = 50;
  public isPlaying = false;

  constructor(private threeService: ThreeService) {}

  ngOnInit() {
    this.visualizer = this.threeService.createVisualizer(
      this.canvasContainer.nativeElement,
      false
    );
    this.activeMode = this.visualizer.activeMode;
    this.updateHUD();

    // Listen to global theme change events
    window.addEventListener('themeChanged', this.onThemeChanged);
  }

  ngOnDestroy() {
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    window.removeEventListener('themeChanged', this.onThemeChanged);
  }

  private onThemeChanged = (event: any) => {
    if (this.visualizer) {
      this.visualizer.updateColors(event.detail.isLight);
    }
  };

  @HostListener('window:resize')
  onResize() {
    if (this.visualizer) {
      this.visualizer.resize();
    }
  }

  setVisualization(type: string) {
    this.activeMode = type;
    this.isPlaying = false;
    if (this.visualizer) {
      this.visualizer.setVisualization(type);
      this.updateHUD();
    }
  }

  onSpeedChange() {
    if (this.visualizer) {
      this.visualizer.setSpeed(this.playbackSpeed);
    }
  }

  togglePlay() {
    if (this.visualizer) {
      this.isPlaying = this.visualizer.togglePlay();
    }
  }

  step() {
    if (this.visualizer) {
      const state = this.visualizer.step();
      this.currentStep = state.step + 1;
      this.hudVars = state.vars;
    }
  }

  reset() {
    this.isPlaying = false;
    if (this.visualizer) {
      const state = this.visualizer.reset();
      this.currentStep = state.step + 1;
      this.hudVars = state.vars;
    }
  }

  private updateHUD() {
    if (this.visualizer) {
      this.currentStep = this.visualizer.currentStep + 1;
      this.hudVars = this.visualizer.activeMode === 'loops' ? 
        'i = 0, sum = 0' : (this.visualizer.activeMode === 'recursion' ? 
        'factorial(5) - Frame depth: 0' : 'curr_node = 0x7FFE, val = 0');
    }
  }
}
