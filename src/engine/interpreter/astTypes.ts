export interface SourcePosition {
  line: number;
  column: number;
}

export interface SourceLocation {
  start: SourcePosition;
  end: SourcePosition;
}

export interface BaseNode {
  type: string;
  loc?: SourceLocation | null;
}

export interface Program extends BaseNode {
  type: 'Program';
  body: ParsedASTNode[];
}

export interface ExpressionStatement extends BaseNode {
  type: 'ExpressionStatement';
  expression: ParsedASTNode;
}

export interface CallExpression extends BaseNode {
  type: 'CallExpression';
  callee: ParsedASTNode;
  arguments: ParsedASTNode[];
}

export interface Identifier extends BaseNode {
  type: 'Identifier';
  name: string;
}

export interface Literal extends BaseNode {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

export interface BinaryExpression extends BaseNode {
  type: 'BinaryExpression';
  operator: string;
  left: ParsedASTNode;
  right: ParsedASTNode;
}

export interface LogicalExpression extends BaseNode {
  type: 'LogicalExpression';
  operator: string;
  left: ParsedASTNode;
  right: ParsedASTNode;
}

export interface AssignmentExpression extends BaseNode {
  type: 'AssignmentExpression';
  operator: string;
  left: ParsedASTNode;
  right: ParsedASTNode;
}

export interface VariableDeclaration extends BaseNode {
  type: 'VariableDeclaration';
  kind: 'let' | 'const' | 'var';
  declarations: VariableDeclarator[];
}

export interface VariableDeclarator extends BaseNode {
  type: 'VariableDeclarator';
  id: ParsedASTNode;
  init: ParsedASTNode | null;
}

export interface BlockStatement extends BaseNode {
  type: 'BlockStatement';
  body: ParsedASTNode[];
}

export interface IfStatement extends BaseNode {
  type: 'IfStatement';
  test: ParsedASTNode;
  consequent: ParsedASTNode;
  alternate: ParsedASTNode | null;
}

export interface ForStatement extends BaseNode {
  type: 'ForStatement';
  init: ParsedASTNode | null;
  test: ParsedASTNode | null;
  update: ParsedASTNode | null;
  body: ParsedASTNode;
}

export interface FunctionDeclaration extends BaseNode {
  type: 'FunctionDeclaration';
  id: Identifier;
  params: ParsedASTNode[];
  body: BlockStatement;
}

export interface ReturnStatement extends BaseNode {
  type: 'ReturnStatement';
  argument: ParsedASTNode | null;
}

export interface UpdateExpression extends BaseNode {
  type: 'UpdateExpression';
  operator: string;
  argument: ParsedASTNode;
  prefix: boolean;
}

export interface UnaryExpression extends BaseNode {
  type: 'UnaryExpression';
  operator: string;
  argument: ParsedASTNode;
  prefix: boolean;
}

export interface EmptyStatement extends BaseNode {
  type: 'EmptyStatement';
}

export interface MemberExpression extends BaseNode {
  type: 'MemberExpression';
  object: ParsedASTNode;
  property: ParsedASTNode;
  computed: boolean;
}

export type UnknownNode = BaseNode & Record<string, unknown>;

export interface UnsupportedNode extends BaseNode {
  type:
    | 'ArrayExpression'
    | 'ArrowFunctionExpression'
    | 'AwaitExpression'
    | 'ClassDeclaration'
    | 'ClassExpression'
    | 'ConditionalExpression'
    | 'DoWhileStatement'
    | 'ExportAllDeclaration'
    | 'ExportDefaultDeclaration'
    | 'ExportNamedDeclaration'
    | 'FunctionExpression'
    | 'ImportDeclaration'
    | 'NewExpression'
    | 'ObjectExpression'
    | 'SwitchStatement'
    | 'TemplateLiteral'
    | 'ThisExpression'
    | 'ThrowStatement'
    | 'TryStatement'
    | 'WhileStatement'
    | 'WithStatement'
    | 'YieldExpression';
  [key: string]: unknown;
}

export type SupportedASTNode =
  | Program
  | ExpressionStatement
  | CallExpression
  | Identifier
  | Literal
  | BinaryExpression
  | LogicalExpression
  | AssignmentExpression
  | VariableDeclaration
  | VariableDeclarator
  | BlockStatement
  | IfStatement
  | ForStatement
  | FunctionDeclaration
  | ReturnStatement
  | UpdateExpression
  | UnaryExpression
  | EmptyStatement;

export type ParsedASTNode = SupportedASTNode | MemberExpression | UnsupportedNode;

export type ASTNode = ParsedASTNode;

export function isNodeType<TType extends ASTNode['type']>(
  node: ASTNode,
  type: TType,
): node is Extract<ASTNode, { type: TType }> {
  return node.type === type;
}

export function getNodeLine(node: Pick<BaseNode, 'loc'>): number | undefined {
  return node.loc?.start.line;
}
