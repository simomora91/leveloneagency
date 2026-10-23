import { Routes } from '@angular/router';
import { Home } from './home/home';
import { BlogList } from './blog/blog-list';
import { BlogPost } from './blog/blog-post';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'blog', component: BlogList },
  { path: 'blog/:slug', component: BlogPost },
  { path: '**', component: NotFound },
];
