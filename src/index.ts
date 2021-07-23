const svelte = require('svelte/compiler');
const MagicString = require( 'magic-string' );
/**
 * Find Identifiers that follow the rules of svelte stores syntax.
 * 
 * @param A Assignee object AST. Example: let a = 1; Object type is Identifier and object name is a.
 * 
 * @returns boolean
 */

const isValidStore = ({ type, name }) => (type === 'Identifier' && name[0] === '$' && name[1] !== '$');


const parseWithImmer = (string, assignee, valueAssigned) => {
  const leftExpression = string.slice(assignee.start, assignee.end);
  const rightExpression = string.slice(valueAssigned.start, valueAssigned.end);
  const completeExpression = `${leftExpression} = ${rightExpression}`;
  const varName = leftExpression.slice(1,leftExpression.indexOf('.'));
  const parsedContent = `
    ${varName}.update(
      produce(($${varName}) => {
        ${completeExpression}
      })
    )
  `;
  string.overwrite(assignee.start, valueAssigned.end, parsedContent);
}
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
    const string = new MagicString(content);
    const ast = svelte.parse(content);
    if (ast.instance) {
        svelte.walk(ast.instance, {
          leave(node) {
            if (node.type === 'AssignmentExpression' && node.operator === '=') {
              const assignee = node.left;
              const valueAssigned = node.right;
              if (assignee.type === 'MemberExpression' && isValidStore(assignee.object)) {
                parseWithImmer(string, assignee, valueAssigned);
              }
              if (assignee.type === 'MemberExpression' && assignee.object.type === 'MemberExpression') {
                if (isValidStore(assignee.object.object)) {
                  // TODO -> Replace the the assigment with a call to immer.
                  parseWithImmer(string, assignee, valueAssigned);
                }
              }
            }
          }
        });
    }
    return {
      code: string.toString(),
    };
  },
});
