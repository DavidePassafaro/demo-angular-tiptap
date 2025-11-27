import { Component } from '@angular/core';
import { EditorComponent } from './editor/editor.component';

@Component({
  selector: 'app-angular-integration',
  standalone: true,
  imports: [EditorComponent],
  template: `
    <div class="page-container">
      <h2>Angular Integration</h2>
      
      <app-editor></app-editor>
    </div>
  `,
})
export class AngularIntegrationComponent {}
