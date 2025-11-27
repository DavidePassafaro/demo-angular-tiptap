import { Routes } from '@angular/router';
import { StarterKitComponent } from './pages/starter-kit/starter-kit.component';
import { CustomExtensionsComponent } from './pages/custom-extensions/custom-extensions.component';
import { AngularIntegrationComponent } from './pages/angular-integration/angular-integration.component';

export const routes: Routes = [
  { path: '', redirectTo: 'starter-kit', pathMatch: 'full' },
  { path: 'starter-kit', component: StarterKitComponent },
  { path: 'custom-extensions', component: CustomExtensionsComponent },
  { path: 'angular-integration', component: AngularIntegrationComponent },
];
