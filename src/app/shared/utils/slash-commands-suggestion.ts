import { createComponent, ApplicationRef, EnvironmentInjector } from '@angular/core';
import { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SlashCommandListComponent } from '../components/slash-command-list/slash-command-list.component';

export function createSlashCommandsSuggestion(injector: EnvironmentInjector, appRef: ApplicationRef) {
  let component: any;
  let popup: TippyInstance[];

  return {
    items: ({ query }: { query: string }) => {
      const items = [
        {
          title: 'Heading 1',
          description: 'Large section heading',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
          },
        },
        {
          title: 'Heading 2',
          description: 'Medium section heading',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
          },
        },
        {
          title: 'Heading 3',
          description: 'Small section heading',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
          },
        },
        {
          title: 'Bullet List',
          description: 'Create a bullet list',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
          },
        },
        {
          title: 'Numbered List',
          description: 'Create a numbered list',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
          },
        },
        {
          title: 'Code Block',
          description: 'Create a code block',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
          },
        },
        {
          title: 'Quote',
          description: 'Create a blockquote',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
          },
        },
        {
          title: 'Table',
          description: 'Insert a table',
          command: ({ editor, range }: any) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run();
          },
        },
        {
          title: 'Image',
          description: 'Upload an image',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setImageUpload().run();
          },
        },
        {
          title: 'Divider',
          description: 'Insert a horizontal line',
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
          },
        },
      ];

      return items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
    },

    render: () => {
      return {
        onStart: (props: SuggestionProps) => {
          component = createComponent(SlashCommandListComponent, {
            environmentInjector: injector,
          });

          component.instance.items.set(props.items);
          component.instance.command.set(props.command);
          component.instance.editor = props.editor;
          component.instance.range = props.range;

          appRef.attachView(component.hostView);
          component.changeDetectorRef.detectChanges();

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as any,
            appendTo: () => document.body,
            content: component.location.nativeElement,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props: SuggestionProps) {
          component.instance.items.set(props.items);
          component.instance.command.set(props.command);
          component.instance.editor = props.editor;
          component.instance.range = props.range;
          component.changeDetectorRef.detectChanges();

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect as any,
          });
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return component.instance.onKeyDown(props.event);
        },

        onExit() {
          popup[0].destroy();
          appRef.detachView(component.hostView);
          component.destroy();
        },
      };
    },
  };
}
