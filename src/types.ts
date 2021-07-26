import {
  AssignmentExpression,
  Node,
  MemberExpression,
  Identifier,
} from 'estree';

export interface LocatedMemberExpression extends MemberExpression {
  start: number;
  end: number;
}

export interface LocatedIdentifier extends Identifier {
  start: number;
  end: number;
}

/**
 * Typeguard to assert if a node is an assignment.
 *
 * @example x = y
 *
 * @param node - The asserted node.
 * @returns Whether is an assignment or not.
 */
export const isMemberExpression = (
  node: Node
): node is LocatedMemberExpression => node.type === 'MemberExpression';

/**
 * Typeguard to assert if a node is an assignment.
 *
 * @example x = y
 *
 * @param node - The asserted node.
 * @returns Whether is an assignment or not.
 */
export const isIdentifier = (node: Node): node is LocatedIdentifier =>
  node.type === 'Identifier';

/**
 * Typeguard to assert if a node is an assignment.
 *
 * @example x = y
 *
 * @param node - The asserted node.
 * @returns Whether is an assignment or not.
 */
export const isAssignmentExpression = (
  node: Node
): node is AssignmentExpression => node.type === 'AssignmentExpression';
