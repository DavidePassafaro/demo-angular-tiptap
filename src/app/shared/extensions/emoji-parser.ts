import { Extension, extensions, InputRule, Node } from '@tiptap/core';

const emojisMap = {
  '😀': [':D'],
  '😆': ['xD', 'XD'],
  '😅': ['^^'],
  '😉': [';)'],
  '🙂': [':)'],
  '😗': [':3'],
  '😐': [':|'],
  '😑': ['-_-'],
  '😕': [':\\', ':/'],
  '😟': [':('],
  '😮': [':O'],
  '😖': [':S'],
  '😭': [';_;', 'T_T', 'QQ'],
  '😜': [':P', ';P'],
  '😣': ['D:'],
  '😏': ['>:)'],
  '😡': ['D:<', '>:('],
  '❤️': ['<3'],
  '😢': [":'(", ":'-("],
  '😎': ['B)', 'B-)'],
  '🤔': [':thinking:', 'hmm'],
  '🤮': [':x', ':X'],
  '😴': ['-.-', 'zzz'],
  '💕': ['<33'],
  '🎉': [':party:', ':yay:'],
};

// Escapes special characters properly
function escapeRegex(value: string) {
  return value.replace(/([()|.+*?^$[\]\\])/g, '\\$1');
}

export const EmojiParser = Extension.create({
  name: 'emoji',

  addInputRules() {
    return Object.entries(emojisMap).map(
      ([key, value]) =>
        new InputRule({
          find: new RegExp(`(?<=^|\\s)(${value.map(escapeRegex).join('|')})$`),
          handler({ state, range: { from, to } }) {
            const after = state.doc.textBetween(to, to + 1, '\0', '\0');
            const before = state.doc.textBetween(to - 1, to, '\0', '\0');

            // Check if the next character is a word character
            if (/\w/.test(after)) {
              return;
            }

            const skipPreviousChar = before === ' ';
            state.tr.insertText(`${key}`, from + (skipPreviousChar ? 1 : 0), to);
          },
        })
    );
  },
});
