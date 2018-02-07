
import { RouterModule, Route } from '@angular/router';
import { HomePage } from './Pages/Home/Home.page';
import { HueLightsPage } from './Pages/Lights/Lights.page';

const Routes: Array<Route> = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePage,
    data: { Title: 'Home' }
  },
  {
    path: 'lights',
    pathMatch: 'prefix',
    component: HueLightsPage,
    data: { Title: 'Lights' }
  }
];

export let AppRouting = RouterModule.forRoot(Routes, { useHash: false });