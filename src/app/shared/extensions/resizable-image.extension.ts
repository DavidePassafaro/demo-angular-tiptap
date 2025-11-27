import { Node, mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { createAngularNodeView } from '../utils/angular-node-view-renderer';
import { ResizableImageComponent } from '../components/resizable-image/resizable-image.component';

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
  minWidth: number;
  maxWidth: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * Add an image with custom width
       */
      setResizableImage: (options: { src: string; alt?: string; width?: number }) => ReturnType;
    };
  }
}

export const ResizableImage = Image.extend<ResizableImageOptions>({
  name: 'resizableImage',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
      minWidth: 100,
      maxWidth: 1000,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: this.options.minWidth,
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width ? parseInt(width) : this.options.minWidth;
        },
        renderHTML: (attributes) => {
          const width = attributes['width'] || this.options.minWidth;
          return {
            width: width,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return createAngularNodeView(ResizableImageComponent);
  },
});
