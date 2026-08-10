import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { TopicsComponent } from './topics/topics';
import { SandboxComponent } from './sandbox/sandbox';
import { AboutComponent } from './about/about';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'topics', component: TopicsComponent },
  { path: 'sandbox', component: SandboxComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: 'home' }
];
