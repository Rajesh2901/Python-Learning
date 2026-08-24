import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CodeRunRequest {
  code: string;
}

export interface CodeRunResponse {
  stdout: string;
  stderr: string;
  error?: string;
}

export interface UserProgress {
  id?: number;
  topic_id: string;
  completed: boolean;
  updated_at?: string;
}

export interface CustomTask {
  id?: number;
  title: string;
  priority: string;
  done: boolean;
  created_at?: string;
}

export interface InterviewQuestion {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  frequency_index: number;
  company_tags: string;
  problem_statement: string;
  starter_code: string;
  solution_code: string;
}

export interface UserPerformanceLog {
  id?: number;
  question_id: number;
  status: string;
  execution_time_ms: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  runCode(code: string): Observable<CodeRunResponse> {
    return this.http.post<CodeRunResponse>(`${this.baseUrl}/run`, { code });
  }

  getProgress(): Observable<UserProgress[]> {
    return this.http.get<UserProgress[]>(`${this.baseUrl}/progress`);
  }

  saveProgress(topicId: string, completed: boolean): Observable<UserProgress> {
    return this.http.post<UserProgress>(`${this.baseUrl}/progress`, {
      topic_id: topicId,
      completed: completed
    });
  }

  getTasks(priority?: string): Observable<CustomTask[]> {
    const url = priority ? `${this.baseUrl}/tasks?priority=${priority}` : `${this.baseUrl}/tasks`;
    return this.http.get<CustomTask[]>(url);
  }

  createTask(title: string, priority: string): Observable<CustomTask> {
    return this.http.post<CustomTask>(`${this.baseUrl}/tasks`, {
      title,
      priority,
      done: false
    });
  }

  updateTask(taskId: number, task: CustomTask): Observable<CustomTask> {
    return this.http.put<CustomTask>(`${this.baseUrl}/tasks/${taskId}`, task);
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/tasks/${taskId}`);
  }

  // Interview Prep endpoints
  getQuestions(category?: string, difficulty?: string, company?: string): Observable<InterviewQuestion[]> {
    let params: string[] = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
    if (company) params.push(`company=${encodeURIComponent(company)}`);
    
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<InterviewQuestion[]>(`${this.baseUrl}/questions${queryString}`);
  }

  getQuestionById(id: number): Observable<InterviewQuestion> {
    return this.http.get<InterviewQuestion>(`${this.baseUrl}/questions/${id}`);
  }

  logPerformance(questionId: number, status: string, executionTimeMs: number): Observable<UserPerformanceLog> {
    return this.http.post<UserPerformanceLog>(`${this.baseUrl}/performance`, {
      question_id: questionId,
      status: status,
      execution_time_ms: executionTimeMs
    });
  }

  getPerformanceHistory(): Observable<UserPerformanceLog[]> {
    return this.http.get<UserPerformanceLog[]>(`${this.baseUrl}/performance/history`);
  }

  getRecommendations(): Observable<InterviewQuestion[]> {
    return this.http.get<InterviewQuestion[]>(`${this.baseUrl}/recommendations`);
  }
}
