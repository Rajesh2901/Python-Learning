import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThreeService, VisualizerInstance } from '../services/three.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('heroCanvas', { static: true }) canvasContainer!: ElementRef;
  private visualizer?: VisualizerInstance;

  constructor(private threeService: ThreeService) {}

  ngOnInit() {
    this.visualizer = this.threeService.createVisualizer(
      this.canvasContainer.nativeElement,
      true
    );
  }

  ngOnDestroy() {
    if (this.visualizer) {
      this.visualizer.destroy();
    }
  }
}
