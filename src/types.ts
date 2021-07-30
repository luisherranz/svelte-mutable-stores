import { AssignmentExpression, Node, MemberExpression, BaseNode } from 'estree';

export interface LocatedMemberExpression extends MemberExpression {
  start: number;
  end: number;
}

export interface LocatedNode extends BaseNode {
  start?: number;
  end?: number;
}

/**
 * Typeguard to assert if a node is a Member Expression and add start and end attributes.
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
export const isAssignmentExpression = (
  node: Node
): node is AssignmentExpression => node.type === 'AssignmentExpression';
