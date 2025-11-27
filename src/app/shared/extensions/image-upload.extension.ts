import { Node, mergeAttributes } from '@tiptap/core';
import { createAngularNodeView } from '../utils/angular-node-view-renderer';
import { ImageUploadNodeComponent } from '../components/image-upload-node/image-upload-node.component';

export interface ImageUploadOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      /**
       * Add an image upload placeholder
       */
      setImageUpload: () => ReturnType;
    };
  }
}

export const ImageUpload = Node.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: false,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-upload"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-upload' })];
  },

  addCommands() {
    return {
      setImageUpload:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: null,
            },
          });
        },
    };
  },

  addNodeView() {
    return createAngularNodeView(ImageUploadNodeComponent);
  },
});
