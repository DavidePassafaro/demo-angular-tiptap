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
  output,
  model,
} from '@angular/core';
import { Editor, AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Spaghetto } from '../../../shared/extensions/spaghetto';

@Component({
  selector: 'app-comment-editor',
  standalone: true,
  templateUrl: './comment-editor.component.html',
  styleUrl: './comment-editor.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentEditorComponent implements OnDestroy, AfterViewInit {
  private readonly cdr = inject(ChangeDetectorRef);

  // Inputs
  readonly readOnly = input<boolean>(false);
  readonly placeholder = input<string>('Scrivi un commento...');
  readonly maxLength = input<number | null>(null);
  readonly showToolbar = input<boolean>(true);
  readonly customExtensions = input<AnyExtension[]>([]);
  
  // Two-way binding per il contenuto
  readonly content = model<string>('');

  // Outputs
  readonly onSubmit = output<string>();
  readonly onCancel = output<void>();
  readonly onContentChange = output<string>();

  editorElement = viewChild.required('editorElement', { read: ElementRef });

  protected editor = signal<Editor | null>(null);

  constructor() {
    // Effetto per aggiornare il contenuto dell'editor quando cambia l'input
    effect(() => {
      const currentContent = this.content();
      const editorContent = this.editor()?.getHTML() || '';
      if (currentContent !== editorContent) {
        this.editor()?.commands.setContent(currentContent);
      }
    });

    // Effetto per gestire readonly
    effect(() => {
      this.editor()?.setEditable(!this.readOnly());
    });
  }

  ngAfterViewInit(): void {
    const extensions = [
      StarterKit.configure({
        // Disabilita alcune funzionalità non necessarie per i commenti
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        bulletList: {
          HTMLAttributes: {
            class: 'comment-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'comment-list',
          },
        },
      }),
      Placeholder.configure({
        placeholder: this.placeholder(),
      }),
      Spaghetto,
      ...this.customExtensions(),
    ];

    this.editor.set(
      new Editor({
        element: this.editorElement().nativeElement,
        extensions,
        content: this.content(),
        editable: !this.readOnly(),
        onSelectionUpdate: () => this.cdr.markForCheck(),
        onUpdate: ({ editor }) => {
          const htmlContent = editor.getHTML();
          this.content.set(htmlContent);
          this.onContentChange.emit(htmlContent);
          this.cdr.markForCheck();
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.editor()?.destroy();
  }

  // Metodi per gestire i commenti
  submitComment(): void {
    const content = this.getTextContent().trim();
    if (content) {
      this.onSubmit.emit(this.getHtmlContent());
    }
  }

  cancelComment(): void {
    this.clearContent();
    this.onCancel.emit();
  }

  clearContent(): void {
    this.editor()?.commands.setContent('');
    this.content.set('');
  }

  getHtmlContent(): string {
    return this.editor()?.getHTML() || '';
  }

  getTextContent(): string {
    return this.editor()?.getText() || '';
  }

  getCharacterCount(): number {
    return this.getTextContent().length;
  }

  isMaxLengthExceeded(): boolean {
    const maxLength = this.maxLength();
    return maxLength !== null && this.getCharacterCount() > maxLength;
  }

  canSubmit(): boolean {
    const content = this.getTextContent().trim();
    return content.length > 0 && !this.isMaxLengthExceeded() && !this.readOnly();
  }

  // Metodi per la formattazione del testo
  toggleBold(): void {
    this.editor()?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor()?.chain().focus().toggleItalic().run();
  }

  toggleStrike(): void {
    this.editor()?.chain().focus().toggleStrike().run();
  }

  toggleBulletList(): void {
    this.editor()?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor()?.chain().focus().toggleOrderedList().run();
  }

  addLineBreak(): void {
    this.editor()?.chain().focus().setHardBreak().run();
  }

  // Metodi di utilità per lo stato dell'editor
  isActive(name: string): boolean {
    return this.editor()?.isActive(name) ?? false;
  }

  canExecute(command: string): boolean {
    switch (command) {
      case 'bold':
        return this.editor()?.can().chain().focus().toggleBold().run() ?? false;
      case 'italic':
        return this.editor()?.can().chain().focus().toggleItalic().run() ?? false;
      case 'strike':
        return this.editor()?.can().chain().focus().toggleStrike().run() ?? false;
      case 'bulletList':
        return this.editor()?.can().chain().focus().toggleBulletList().run() ?? false;
      case 'orderedList':
        return this.editor()?.can().chain().focus().toggleOrderedList().run() ?? false;
      default:
        return false;
    }
  }
}