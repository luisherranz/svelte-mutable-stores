const svelte = require('svelte/compiler');
const MagicString = require('magic-string');
/**
 * Search assignments that come from a member expression and start with $ and
 * turn them into update calls using immer.
 *
 * @example $x.y = z --> x.update(produce($x => { $x.y = z; }))
 *
 * @returns A Svelte preprocessor object.
 */
export default () => ({
  markup({ content }) {
    const s = new MagicString(content);
    const trueValuePosition = content.indexOf('true');
    const trueValueLength = 'true'.length;
    s.overwrite( trueValuePosition, trueValuePosition + trueValueLength, 'false');
    return {
      code: s.toString(),
      map: s.generateMap()
    };
  },
});
