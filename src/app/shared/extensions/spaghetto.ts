import { Node, nodeInputRule } from '@tiptap/core'

export const Spaghetto = Node.create({
  name: 'spaghetto',
  group: 'block',

  parseHTML() {
    return [{ tag: 'hr' }]
  },

  renderHTML() {
    return ['hr']
  },

  addNodeView() {
    return () => {
      const container = document.createElement('img')
      container.style.width = '100%'
      container.src = 'images/spaghetto.svg'
      return { dom: container }
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /~~~/,
        type: this.type
      })
    ]
  }
})
