import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, CodeReviewSimulation } from '../services/api.service';

@Component({
  selector: 'app-code-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-review.html',
  styleUrls: ['./code-review.css']
})
export class CodeReviewComponent implements OnInit {
  simulations: CodeReviewSimulation[] = [];
  selectedSim: CodeReviewSimulation | null = null;
  codeLines: string[] = [];
  selectedLineIndex: number | null = null;
  completedReviews: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSimulations();
    this.loadCompletedReviews();
  }

  loadSimulations() {
    this.apiService.getCodeReviews().subscribe({
      next: (res) => {
        this.simulations = res || [];
      },
      error: () => {
        this.simulations = [];
      }
    });
  }

  loadCompletedReviews() {
    this.apiService.getProgress().subscribe({
      next: (res) => {
        this.completedReviews = (res || [])
          .filter(p => p.completed)
          .map(p => p.topic_id);
      },
      error: () => {
        this.completedReviews = [];
      }
    });
  }

  selectSimulation(sim: CodeReviewSimulation) {
    this.selectedSim = sim;
    this.selectedLineIndex = null;
    this.codeLines = sim.code_with_bugs.split('\n');
  }

  selectLine(index: number) {
    this.selectedLineIndex = index;
  }

  approveCorrection() {
    if (!this.selectedSim) return;
    const progressKey = 'review_' + this.selectedSim.id;
    this.apiService.saveProgress(progressKey, true).subscribe({
      next: () => {
        this.loadCompletedReviews(); // Update the Approved badge UI
      },
      error: () => {
        console.warn('Failed to save code review progress.');
      }
    });
  }

  isReviewed(id: number): boolean {
    return this.completedReviews.includes('review_' + id);
  }
}
