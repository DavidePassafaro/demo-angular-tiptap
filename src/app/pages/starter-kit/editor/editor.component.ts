import {
  Component,
  OnDestroy,
  ViewEncapsulation,
  ElementRef,
  AfterViewInit,
  viewChild,
  signal,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

@Component({
  selector: 'app-editor',
  standalone: true,
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnDestroy, AfterViewInit {
  private readonly cdr = inject(ChangeDetectorRef);

  editorElement = viewChild.required('editorElement', { read: ElementRef });

  protected editor = signal<Editor | null>(null);

  ngAfterViewInit(): void {
    this.editor.set(
      new Editor({
        element: this.editorElement().nativeElement,
        extensions: [StarterKit],
        content: 'Hello World! 🌍️',
        onSelectionUpdate: () => this.cdr.markForCheck(),
        onUpdate: () => this.cdr.markForCheck(),
      })
    );
  }

  ngOnDestroy(): void {
    this.editor()?.destroy();
  }

  getHtmlContent(): string {
    return this.editor()?.getHTML() || '';
  }

  getTextContent(): string {
    return this.editor()?.getText() || '';
  }
}
