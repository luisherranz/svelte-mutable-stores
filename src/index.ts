import * as svelte from 'svelte/compiler';
import MagicString from 'magic-string';

import { Node } from 'estree';
import { extract_names } from 'periscopic';
import {
  isAssignmentExpression,
  isIdentifier,
  isMemberExpression,
  LocatedIdentifier,
  LocatedMemberExpression,
} from './types';

/**
 * Check that the given store is valid.
 *
 * @param store The store to check.
 *
 * @returns boolean
 */

const isValidStore = (store: string): boolean =>
  store[0] === '$' && store[1] !== '$';

/**
 * Function that overwrites store ojbect assignments with an immer library function call.
 * This way we convert mutable assignments to immutable ones.
 *
 * @param string A MagicString instance.
 * @param asignee A Assignee object AST. Example: const a ; Left part of assignment.
 * @param valueAssigned A LocatedIdentifier AST. Example: = 1;. Right part of assignment.
 *
 * @returns void
 */

const parseWithImmer = (
  string: MagicString,
  assignee: LocatedMemberExpression,
  valueAssigned: LocatedIdentifier,
  defaultProduceImmerImported: boolean
) => {
  const leftExpression = string.slice(assignee.start, assignee.end);
  const rightExpression = string.slice(valueAssigned.start, valueAssigned.end);
  const completeExpression = `${leftExpression.slice(
    1,
    leftExpression.length
  )} = ${rightExpression}`;
  const varName = leftExpression.slice(1, leftExpression.indexOf('.'));
  const parsedContent = `
    ${varName}.update(
      ${
        defaultProduceImmerImported ? 'produce' : 'svelteMutableStoresProduce'
      }((${varName}) => {
        ${completeExpression}
      })
    )
  `;
  string.overwrite(assignee.start, valueAssigned.end, parsedContent);
};
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
    let defaultProduceImmerImported = false;
    let haveToImportImmer = false;
    if (ast.instance) {
      svelte.walk(ast.instance, {
        leave(node: Node) {
          if (node.type === 'ImportDeclaration') {
            const specifiers = node.specifiers.map((specifier) =>
              specifier.type === 'ImportSpecifier'
                ? specifier.imported.name
                : specifier.local.name
            );
            const library = node.source.value;
            if (library === 'immer') {
              if (specifiers.includes('produce')) {
                defaultProduceImmerImported = true;
              }
            }
          }
          if (isAssignmentExpression(node) && node.operator === '=') {
            const [store] = Array.from(extract_names(node.left));
            if (
              isValidStore(store) &&
              isMemberExpression(node.left) &&
              isIdentifier(node.right)
            ) {
              if (!defaultProduceImmerImported && !haveToImportImmer) {
                haveToImportImmer = true;
              }
              parseWithImmer(
                string,
                node.left,
                node.right,
                defaultProduceImmerImported
              );
            }
          }
        },
      });
    }
    if (haveToImportImmer) {
      string.appendRight(
        content.indexOf('<script>') + '<script>'.length,
        'import { produce as svelteMutableStoresProduce } from "immer";'
      );
    }
    return {
      code: string.toString(),
    };
  },
});
