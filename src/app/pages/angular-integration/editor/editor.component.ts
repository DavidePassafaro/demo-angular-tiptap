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
  EnvironmentInjector,
  ApplicationRef,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Mention from '@tiptap/extension-mention';
import { InteractiveTableRow } from '../../../shared/extensions/interactive-table-row';
import { ImageUpload } from '../../../shared/extensions/image-upload.extension';
import { ResizableImage } from '../../../shared/extensions/resizable-image.extension';
import { SlashCommands } from '../../../shared/extensions/slash-commands.extension';
import { createSlashCommandsSuggestion } from '../../../shared/utils/slash-commands-suggestion';
import { createMentionsSuggestion } from '../../../shared/utils/mentions-suggestion';

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
  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  editorElement = viewChild.required('editorElement', { read: ElementRef });

  protected editor = signal<Editor | null>(null);

  ngAfterViewInit(): void {
    this.editor.set(
      new Editor({
        element: this.editorElement().nativeElement,
        extensions: [
          StarterKit,
          Table.configure({ resizable: true }),
          TableRow,
          TableHeader,
          TableCell,
          ResizableImage.configure({
            minWidth: 100,
            maxWidth: 1000,
          }),
          ImageUpload,
          Mention.configure({
            HTMLAttributes: {
              class: 'mention',
            },
            suggestion: createMentionsSuggestion(this.injector, this.appRef),
          }),
          SlashCommands.configure({
            suggestion: createSlashCommandsSuggestion(this.injector, this.appRef),
          }),
          // (new InteractiveTableRow(this.editorElement().nativeElement)).build(),
        ],
        content: 'Hello World! 🌍️',
        onSelectionUpdate: () => this.cdr.markForCheck(),
        onUpdate: () => this.cdr.markForCheck(),
        injector: this.injector,
        appRef: this.appRef,
      } as any)
    );
  }

  ngOnDestroy(): void {
    this.editor()?.destroy();
  }
}
