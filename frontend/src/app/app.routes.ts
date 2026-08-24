import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { TopicsComponent } from './topics/topics';
import { SandboxComponent } from './sandbox/sandbox';
import { InterviewPrepComponent } from './interview-prep/interview-prep';
import { DocsViewComponent } from './docs-view/docs-view';
import { CodeReviewComponent } from './code-review/code-review';
import { AboutComponent } from './about/about';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'topics', component: TopicsComponent },
  { path: 'sandbox', component: SandboxComponent },
  { path: 'prep', component: InterviewPrepComponent },
  { path: 'docs', component: DocsViewComponent },
  { path: 'review', component: CodeReviewComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: 'home' }
];
