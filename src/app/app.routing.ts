
import { RouterModule, Route } from '@angular/router';
import { HomePage } from './Pages/Home/Home.page';
import { HueLightsPage } from './Pages/Lights/Lights.page';
import { BridgeLoginPage } from './Pages/Login/Login.page';
import { BridgeGuard } from './Services/BridgeGuard.service';

const Routes: Array<Route> = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePage,
    data: { Title: 'Home' },
    canActivate: [BridgeGuard]
  },
  {
    path: 'lights',
    pathMatch: 'prefix',
    component: HueLightsPage,
    data: { Title: 'Lights' },
    canActivate: [BridgeGuard]
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: BridgeLoginPage,
    data: { Title: 'Login' }
  }
];

export let AppRouting = RouterModule.forRoot(Routes, { useHash: false });