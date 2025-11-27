import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';

export interface SlashCommandItem {
  title: string;
  description?: string;
  command: ({ editor, range }: any) => void;
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: true,
        items: ({ query }: { query: string }): SlashCommandItem[] => {
          const items: SlashCommandItem[] = [
            {
              title: 'Heading 1',
              description: 'Large section heading',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
              },
            },
            {
              title: 'Heading 2',
              description: 'Medium section heading',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
              },
            },
            {
              title: 'Heading 3',
              description: 'Small section heading',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
              },
            },
            {
              title: 'Bullet List',
              description: 'Create a bullet list',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
              },
            },
            {
              title: 'Numbered List',
              description: 'Create a numbered list',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
              },
            },
            {
              title: 'Code Block',
              description: 'Create a code block',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
              },
            },
            {
              title: 'Quote',
              description: 'Create a blockquote',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
              },
            },
            {
              title: 'Table',
              description: 'Insert a table',
              command: ({ editor, range }) => {
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
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setImageUpload().run();
              },
            },
            {
              title: 'Divider',
              description: 'Insert a horizontal line',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run();
              },
            },
          ];

          return items.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          );
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
