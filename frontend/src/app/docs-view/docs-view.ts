import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, DocumentationTopic, ChallengeProblem } from '../services/api.service';

@Component({
  selector: 'app-docs-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docs-view.html',
  styleUrls: ['./docs-view.css']
})
export class DocsViewComponent implements OnInit {
  topics: DocumentationTopic[] = [];
  selectedTopic: DocumentationTopic | null = null;
  challenges: ChallengeProblem[] = [];
  activeChallenge: ChallengeProblem | null = null;
  activeChallengeIndex = 0;

  // Workspace controls
  editorCode = '';
  stdout = '';
  stderr = '';
  error = '';
  isRunning = false;
  isFetching = false;
  isSolved = false;

  // Gamification achievements
  unlockedMilestones: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadTopics();
    this.loadCompletedMilestones();
  }

  loadTopics() {
    this.apiService.getDocsTopics().subscribe(res => {
      this.topics = res;
    });
  }

  loadCompletedMilestones() {
    this.apiService.getProgress().subscribe(res => {
      this.unlockedMilestones = res
        .filter(p => p.completed)
        .map(p => p.topic_id);
    });
  }

  selectTopic(topic: DocumentationTopic) {
    this.selectedTopic = topic;
    this.challenges = [];
    this.activeChallenge = null;
    this.activeChallengeIndex = 0;
    this.editorCode = '';
    this.stdout = '';
    this.stderr = '';
    this.error = '';
    this.isSolved = false;

    this.loadChallenges(topic.topic_name);
  }

  loadChallenges(category: string) {
    this.apiService.getChallenges(category).subscribe(res => {
      this.challenges = res;
      if (res.length > 0) {
        this.activeChallengeIndex = 0;
        this.activeChallenge = res[0];
        this.editorCode = res[0].starter_code;
      }
    });
  }

  selectChallenge() {
    if (this.challenges.length > this.activeChallengeIndex) {
      this.activeChallenge = this.challenges[this.activeChallengeIndex];
      this.editorCode = this.activeChallenge.starter_code;
      this.stdout = '';
      this.stderr = '';
      this.error = '';
      this.isSolved = false;
    }
  }

  loadSolution() {
    if (this.activeChallenge) {
      this.editorCode = this.activeChallenge.solution_code;
    }
  }

  refreshTopic() {
    if (!this.selectedTopic || this.isFetching) return;
    this.isFetching = true;
    
    this.apiService.fetchDocsTopic(this.selectedTopic.topic_name).subscribe({
      next: (res) => {
        if (this.selectedTopic) {
          this.selectedTopic.parsed_markdown = res.parsed_markdown;
          this.selectedTopic.last_fetched = res.last_fetched;
        }
        this.isFetching = false;
      },
      error: () => {
        this.isFetching = false;
      }
    });
  }

  runCode() {
    if (!this.activeChallenge || this.isRunning) return;
    this.isRunning = true;
    this.stdout = '';
    this.stderr = '';
    this.error = '';

    this.apiService.runCode(this.editorCode).subscribe({
      next: (res) => {
        this.stdout = res.stdout;
        this.stderr = res.stderr;

        if (res.error) {
          this.error = res.error;
        } else {
          // If code compiles and has no runtime errors, mark as solved
          this.isSolved = true;
          if (this.selectedTopic) {
            this.apiService.saveProgress(this.selectedTopic.topic_name, true).subscribe(() => {
              this.loadCompletedMilestones(); // Update achievement icons
            });
          }
        }
        this.isRunning = false;
      },
      error: () => {
        this.error = 'Failed to execute code on backend API.';
        this.isRunning = false;
      }
    });
  }

  isCompleted(topicName: string): boolean {
    return this.unlockedMilestones.includes(topicName);
  }
}
