import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EditorComponent } from './editor/editor.component';

@Component({
  selector: 'app-starter-kit',
  standalone: true,
  imports: [EditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
    	<h2>Starter Kit</h2>
    	<app-editor #editorComponent></app-editor>

    	<div class="content-boxes">
    		<div class="content-box">
    			<h3>HTML Content</h3>
    			<pre class="content-display">{{ editorComponent.getHtmlContent() }}</pre>
    		</div>

    		<div class="content-box">
    			<h3>Text Content</h3>
    			<pre class="content-display">{{ editorComponent.getTextContent() }}</pre>
    		</div>
    	</div>
    </div>`,
  styleUrl: './starter-kit.component.scss',
})
export class StarterKitComponent {}
