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
  input,
  effect,
} from '@angular/core';
import { Editor, AnyExtension } from '@tiptap/core';
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

  readonly showButtons = input<boolean>(true);
  readonly content = input<string>('');
  readonly customExtensions = input<AnyExtension[]>([]);

  editorElement = viewChild.required('editorElement', { read: ElementRef });

  protected editor = signal<Editor | null>(null);

  constructor() {
    effect(() => {
      this.editor()?.commands.setContent(this.content());
    });
  }

  ngAfterViewInit(): void {
    this.editor.set(
      new Editor({
        element: this.editorElement().nativeElement,
        extensions: [StarterKit, ...this.customExtensions()],
        content: this.content(),
        onSelectionUpdate: () => this.cdr.markForCheck(),
        onUpdate: () => this.cdr.markForCheck(),
      })
    );
  }

  ngOnDestroy(): void {
    this.editor()?.destroy();
  }

  setContent(): void {
    this.editor()?.commands.setContent('');
  }

  getHtmlContent(): string {
    return this.editor()?.getHTML() || '';
  }
}
