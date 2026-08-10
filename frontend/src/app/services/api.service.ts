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
}
