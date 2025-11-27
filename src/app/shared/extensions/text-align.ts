import { Extension } from '@tiptap/core'

const TextAlign = Extension.create({
  addGlobalAttributes() {
    return [
      {
        // Extend the following extensions
        types: ['heading', 'paragraph'],
        // … with those attributes
        attributes: {
          textAlign: {
            default: 'left',
            renderHTML: (attributes) => ({
              style: `text-align: ${attributes['textAlign']}`,
            }),
            parseHTML: (element) => element.style.textAlign || 'left',
          },
        },
      },
    ]
  },
})