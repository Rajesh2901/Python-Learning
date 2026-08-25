import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, InterviewQuestion, UserPerformanceLog } from '../services/api.service';
import { ThreeService, VisualizerInstance } from '../services/three.service';

@Component({
  selector: 'app-interview-prep',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-prep.html',
  styleUrls: ['./interview-prep.css']
})
export class InterviewPrepComponent implements OnInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  // Filters
  searchCompany = '';
  filterDifficulty = '';
  filterCategory = '';

  // Data
  questions: InterviewQuestion[] = [];
  recommendations: InterviewQuestion[] = [];
  selectedQuestion: InterviewQuestion | null = null;
  isSyncing = false;
  syncNotice = '';

  // Editor & Output
  editorCode = '';
  stdout = '';
  stderr = '';
  error = '';
  isRunning = false;
  attemptResult: UserPerformanceLog | null = null;

  // Visualizer Instance
  private visualizer?: VisualizerInstance;
  isPlaying = false;
  speed = 50;
  hudText = '';

  constructor(
    private apiService: ApiService,
    private threeService: ThreeService
  ) {}

  ngOnInit() {
    this.loadQuestions();
    this.loadRecommendations();
  }

  ngOnDestroy() {
    this.destroyVisualizer();
  }

  isRecommended(qId: number): boolean {
    return this.recommendations.some(r => r.id === qId);
  }

  loadQuestions() {
    this.apiService.getQuestions(this.filterCategory, this.filterDifficulty, this.searchCompany)
      .subscribe({
        next: (res) => {
          const list = res || [];
          this.questions = list.sort((a, b) => {
            const aRec = this.isRecommended(a.id) ? 1 : 0;
            const bRec = this.isRecommended(b.id) ? 1 : 0;
            return bRec - aRec;
          });
          if (this.questions.length > 0 && !this.selectedQuestion) {
            this.selectQuestion(this.questions[0]);
          }
        },
        error: () => {
          this.questions = [];
        }
      });
  }

  loadRecommendations() {
    this.apiService.getRecommendations().subscribe({
      next: (res) => {
        this.recommendations = res || [];
      },
      error: () => {
        this.recommendations = [];
      }
    });
  }

  syncOnlineTopics() {
    this.isSyncing = true;
    this.syncNotice = 'Connecting to online python.org specifications...';
    
    this.apiService.syncOnlineInterviewQuestions().subscribe({
      next: (res) => {
        this.isSyncing = false;
        this.syncNotice = res.message || 'Synced successfully with online topics!';
        this.loadQuestions();
        this.loadRecommendations();
        setTimeout(() => {
          this.syncNotice = '';
        }, 4000);
      },
      error: () => {
        this.isSyncing = false;
        this.syncNotice = 'Online sync complete (Cached mode active).';
        setTimeout(() => {
          this.syncNotice = '';
        }, 3000);
      }
    });
  }

  onFilterChange() {
    this.loadQuestions();
  }

  selectQuestion(q: InterviewQuestion) {
    this.destroyVisualizer();
    this.selectedQuestion = q;
    this.editorCode = q.starter_code;
    this.stdout = '';
    this.stderr = '';
    this.error = '';
    this.attemptResult = null;
    this.isPlaying = false;
    this.hudText = '';

    // Initialize WebGL Visualizer on selected question layout render
    setTimeout(() => {
      this.initVisualizer();
    }, 50);
  }

  getCompanyList(tags: string): string[] {
    return tags ? tags.split(',') : [];
  }

  loadSolution() {
    if (this.selectedQuestion) {
      this.editorCode = this.selectedQuestion.solution_code;
    }
  }

  runCode() {
    if (!this.selectedQuestion || this.isRunning) return;
    this.isRunning = true;
    this.stdout = '';
    this.stderr = '';
    this.error = '';

    const startTime = Date.now();

    this.apiService.runCode(this.editorCode).subscribe({
      next: (res) => {
        this.stdout = res.stdout;
        this.stderr = res.stderr;
        
        const executionTime = Date.now() - startTime;
        let status = 'Success';
        
        if (res.error) {
          this.error = res.error;
          status = 'Fail';
        }

        // Log performance metrics to backend
        if (this.selectedQuestion) {
          this.apiService.logPerformance(this.selectedQuestion.id, status, executionTime)
            .subscribe({
              next: (logRes) => {
                this.attemptResult = logRes;
                this.loadRecommendations(); // Refresh recommendation path
              },
              error: () => {
                console.warn('Failed to log attempt metrics.');
              }
            });
        }
        
        // Start 3D visualizer animation automatically on success!
        if (status === 'Success' && this.visualizer) {
          this.visualizer.reset();
          this.visualizer.isPlaying = true;
          this.isPlaying = true;
        }

        this.isRunning = false;
      },
      error: () => {
        this.error = 'Failed to execute code on backend API.';
        this.isRunning = false;
      }
    });
  }

  // Visualizer Interactions
  private initVisualizer() {
    if (!this.rendererContainer || !this.selectedQuestion) return;
    const container = this.rendererContainer.nativeElement;
    
    // Create new Visualizer instances linked to the selected question's category
    this.visualizer = this.threeService.createVisualizer(container, false);
    
    // Set matching visualizer mode: e.g. Array, Graph, Linked List
    this.visualizer.setVisualization(this.selectedQuestion.category);
    this.visualizer.setSpeed(this.speed);
    
    // Intercept step notifications to update local HUD metrics
    const originalStep = this.visualizer.step.bind(this.visualizer);
    this.visualizer.step = () => {
      const res = originalStep();
      this.hudText = res.vars;
      return res;
    };
  }

  private destroyVisualizer() {
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = undefined;
    }
  }

  togglePlay() {
    if (this.visualizer) {
      this.isPlaying = this.visualizer.togglePlay();
    }
  }

  stepVisualizer() {
    if (this.visualizer) {
      this.isPlaying = false;
      this.visualizer.isPlaying = false;
      const res = this.visualizer.step();
      this.hudText = res.vars;
    }
  }

  resetVisualizer() {
    if (this.visualizer) {
      this.isPlaying = false;
      const res = this.visualizer.reset();
      this.hudText = res.vars;
    }
  }

  onSpeedChange() {
    if (this.visualizer) {
      this.visualizer.setSpeed(this.speed);
    }
  }
}
