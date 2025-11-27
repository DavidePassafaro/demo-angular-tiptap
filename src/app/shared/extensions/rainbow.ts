import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    rainbow: {
      toggleRainbow: () => ReturnType;
    };
  }
}

export const Rainbow = Mark.create({
  name: 'rainbow',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-rainbow]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-rainbow': '',
        class: 'rainbow-text',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleRainbow:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-r': () => this.editor.commands.toggleRainbow(),
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: [this.name],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes['style']) {
                return {};
              }
              return {
                style: attributes['style'],
              };
            },
          },
        },
      },
    ];
  },
});