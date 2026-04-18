import {
  getNodeLine,
  type AssignmentExpression,
  type ASTNode,
  type BinaryExpression,
  type BlockStatement,
  type CallExpression,
  type ForStatement,
  type FunctionDeclaration,
  type Identifier,
  type IfStatement,
  type LogicalExpression,
  type MemberExpression,
  type Program,
  type ReturnStatement,
  type UnaryExpression,
  type UpdateExpression,
  type VariableDeclaration,
  type VariableDeclarator,
} from './astTypes';

export class SandboxError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
  ) {
    super(message);
    this.name = 'SandboxError';
  }
}

const FORBIDDEN_GLOBALS = new Set([
  'window',
  'document',
  'localStorage',
  'sessionStorage',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'eval',
  'Function',
  '__proto__',
  'constructor',
  'prototype',
  'globalThis',
  'self',
  'navigator',
  'location',
  'history',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'alert',
  'confirm',
  'prompt',
  'require',
  'module',
  'exports',
  'process',
]);

const ALLOWED_BINARY_OPERATORS = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '<',
  '>',
  '<=',
  '>=',
  '===',
  '!==',
]);

const ALLOWED_LOGICAL_OPERATORS = new Set(['&&', '||']);
const ALLOWED_ASSIGNMENT_OPERATORS = new Set(['=', '+=', '-=', '*=', '/=', '%=']);
const ALLOWED_UPDATE_OPERATORS = new Set(['++', '--']);
const ALLOWED_UNARY_OPERATORS = new Set(['!', '-', '+']);

interface WalkContext {
  readonly allowedAPIs: ReadonlySet<string>;
  readonly localVars: Set<string>;
  readonly inFunction: boolean;
}

export function validateAST(ast: ASTNode, allowedIdentifiers: readonly string[]): void {
  walkNode(ast, {
    allowedAPIs: new Set(allowedIdentifiers),
    localVars: new Set<string>(),
    inFunction: false,
  });
}

function walkNode(node: ASTNode, context: WalkContext): void {
  switch (node.type) {
    case 'Program':
      walkProgram(node, context);
      break;
    case 'ExpressionStatement':
      walkNode(node.expression, context);
      break;
    case 'CallExpression':
      walkCallExpression(node, context);
      break;
    case 'Identifier':
      validateIdentifier(node, context, 'value');
      break;
    case 'Literal':
    case 'EmptyStatement':
      break;
    case 'BinaryExpression':
      walkBinaryExpression(node, context);
      break;
    case 'LogicalExpression':
      walkLogicalExpression(node, context);
      break;
    case 'AssignmentExpression':
      walkAssignmentExpression(node, context);
      break;
    case 'VariableDeclaration':
      walkVariableDeclaration(node, context);
      break;
    case 'VariableDeclarator':
      walkVariableDeclarator(node, context);
      break;
    case 'BlockStatement':
      walkBlockStatement(node, context);
      break;
    case 'IfStatement':
      walkIfStatement(node, context);
      break;
    case 'ForStatement':
      walkForStatement(node, context);
      break;
    case 'FunctionDeclaration':
      walkFunctionDeclaration(node, context);
      break;
    case 'ReturnStatement':
      walkReturnStatement(node, context);
      break;
    case 'UpdateExpression':
      walkUpdateExpression(node, context);
      break;
    case 'UnaryExpression':
      walkUnaryExpression(node, context);
      break;
    case 'MemberExpression':
      rejectMemberExpression(node);
      break;
    case 'ArrayExpression':
    case 'ArrowFunctionExpression':
    case 'AwaitExpression':
    case 'ClassDeclaration':
    case 'ClassExpression':
    case 'ConditionalExpression':
    case 'DoWhileStatement':
    case 'FunctionExpression':
    case 'NewExpression':
    case 'ObjectExpression':
    case 'SwitchStatement':
    case 'TemplateLiteral':
    case 'ThisExpression':
    case 'ThrowStatement':
    case 'TryStatement':
    case 'WhileStatement':
    case 'WithStatement':
    case 'YieldExpression':
      throw new SandboxError(
        `CodeQuest does not support this kind of code yet: ${node.type}.`,
        getNodeLine(node),
      );
    case 'ImportDeclaration':
    case 'ExportNamedDeclaration':
    case 'ExportDefaultDeclaration':
    case 'ExportAllDeclaration':
      throw new SandboxError(
        'Imports and exports are not available in CodeQuest.',
        getNodeLine(node),
      );
    default: {
      const unexpectedNode = node as unknown as { readonly type: string };
      throw new SandboxError(
        `CodeQuest does not support this kind of code yet: ${unexpectedNode.type}.`,
      );
    }
  }
}

function walkProgram(node: Program, context: WalkContext): void {
  for (const statement of node.body) {
    walkNode(statement, context);
  }
}

function walkCallExpression(node: CallExpression, context: WalkContext): void {
  if (node.callee.type !== 'Identifier') {
    walkNode(node.callee, context);
    throw new SandboxError(
      'Only simple function calls are available in CodeQuest.',
      getNodeLine(node),
    );
  }

  validateIdentifier(node.callee, context, 'call');

  for (const argument of node.arguments) {
    walkNode(argument, context);
  }
}

function walkBinaryExpression(node: BinaryExpression, context: WalkContext): void {
  if (!ALLOWED_BINARY_OPERATORS.has(node.operator)) {
    throw new SandboxError(
      `The '${node.operator}' operator is not available here.`,
      getNodeLine(node),
    );
  }

  walkNode(node.left, context);
  walkNode(node.right, context);
}

function walkLogicalExpression(node: LogicalExpression, context: WalkContext): void {
  if (!ALLOWED_LOGICAL_OPERATORS.has(node.operator)) {
    throw new SandboxError(
      `The '${node.operator}' operator is not available here.`,
      getNodeLine(node),
    );
  }

  walkNode(node.left, context);
  walkNode(node.right, context);
}

function walkAssignmentExpression(node: AssignmentExpression, context: WalkContext): void {
  if (!ALLOWED_ASSIGNMENT_OPERATORS.has(node.operator)) {
    throw new SandboxError(
      `The '${node.operator}' assignment is not available here.`,
      getNodeLine(node),
    );
  }

  if (node.left.type !== 'Identifier') {
    throw new SandboxError(
      'Only variables you created with let can be changed.',
      getNodeLine(node),
    );
  }

  validateAssignableIdentifier(node.left, context);
  walkNode(node.right, context);
}

function walkVariableDeclaration(node: VariableDeclaration, context: WalkContext): void {
  if (node.kind !== 'let') {
    throw new SandboxError(
      `Use 'let' instead of '${node.kind}' to create variables in CodeQuest.`,
      getNodeLine(node),
    );
  }

  for (const declaration of node.declarations) {
    walkNode(declaration, context);
  }
}

function walkVariableDeclarator(node: VariableDeclarator, context: WalkContext): void {
  if (node.id.type !== 'Identifier') {
    throw new SandboxError(
      'Create variables with a simple name, like let color = "red".',
      getNodeLine(node),
    );
  }

  validateNewLocalName(node.id, context);
  context.localVars.add(node.id.name);

  if (node.init !== null) {
    walkNode(node.init, context);
  }
}

function walkBlockStatement(node: BlockStatement, context: WalkContext): void {
  const childContext = createChildContext(context, context.inFunction);

  for (const statement of node.body) {
    walkNode(statement, childContext);
  }
}

function walkIfStatement(node: IfStatement, context: WalkContext): void {
  walkNode(node.test, context);
  walkNode(node.consequent, context);

  if (node.alternate !== null) {
    walkNode(node.alternate, context);
  }
}

function walkForStatement(node: ForStatement, context: WalkContext): void {
  const loopContext = createChildContext(context, context.inFunction);

  if (node.init !== null) {
    walkNode(node.init, loopContext);
  }

  if (node.test !== null) {
    walkNode(node.test, loopContext);
  }

  if (node.update !== null) {
    walkNode(node.update, loopContext);
  }

  walkNode(node.body, loopContext);
}

function walkFunctionDeclaration(node: FunctionDeclaration, context: WalkContext): void {
  validateNewLocalName(node.id, context);
  context.localVars.add(node.id.name);

  const functionContext = createChildContext(context, true);
  functionContext.localVars.add(node.id.name);

  for (const parameter of node.params) {
    if (parameter.type !== 'Identifier') {
      throw new SandboxError('Function parameters need simple names.', getNodeLine(parameter));
    }

    validateNewLocalName(parameter, functionContext);
    functionContext.localVars.add(parameter.name);
  }

  walkNode(node.body, functionContext);
}

function walkReturnStatement(node: ReturnStatement, context: WalkContext): void {
  if (!context.inFunction) {
    throw new SandboxError('Use return inside a function.', getNodeLine(node));
  }

  if (node.argument !== null) {
    walkNode(node.argument, context);
  }
}

function walkUpdateExpression(node: UpdateExpression, context: WalkContext): void {
  if (!ALLOWED_UPDATE_OPERATORS.has(node.operator)) {
    throw new SandboxError(
      `The '${node.operator}' update is not available here.`,
      getNodeLine(node),
    );
  }

  if (node.argument.type !== 'Identifier') {
    throw new SandboxError(
      'Only variables you created with let can be changed.',
      getNodeLine(node),
    );
  }

  validateAssignableIdentifier(node.argument, context);
}

function walkUnaryExpression(node: UnaryExpression, context: WalkContext): void {
  if (!ALLOWED_UNARY_OPERATORS.has(node.operator)) {
    throw new SandboxError(
      `The '${node.operator}' operator is not available here.`,
      getNodeLine(node),
    );
  }

  walkNode(node.argument, context);
}

function rejectMemberExpression(node: MemberExpression): never {
  if (node.object.type === 'Identifier') {
    const objectName = node.object.name;
    if (!FORBIDDEN_GLOBALS.has(objectName)) {
      throw new SandboxError('Dot access is not available in CodeQuest.', getNodeLine(node));
    }

    throw new SandboxError(
      `It looks like you tried to use '${objectName}'. That is not available in this lesson.`,
      getNodeLine(node),
    );
  }

  throw new SandboxError('Dot access is not available in CodeQuest.', getNodeLine(node));
}

function validateIdentifier(node: Identifier, context: WalkContext, usage: 'call' | 'value'): void {
  if (FORBIDDEN_GLOBALS.has(node.name)) {
    throw new SandboxError(
      `It looks like you tried to use '${node.name}'. That is not available in this lesson.`,
      getNodeLine(node),
    );
  }

  if (context.allowedAPIs.has(node.name) || context.localVars.has(node.name)) {
    return;
  }

  if (usage === 'call') {
    throw new SandboxError(
      `'${node.name}' is not one of the available functions for this level. Check the function list!`,
      getNodeLine(node),
    );
  }

  throw new SandboxError(
    `'${node.name}' has not been created yet. Did you forget to declare it with 'let'?`,
    getNodeLine(node),
  );
}

function validateAssignableIdentifier(node: Identifier, context: WalkContext): void {
  if (!context.localVars.has(node.name)) {
    throw new SandboxError(
      'Only variables you created with let can be changed.',
      getNodeLine(node),
    );
  }
}

function validateNewLocalName(node: Identifier, context: WalkContext): void {
  if (FORBIDDEN_GLOBALS.has(node.name) || context.allowedAPIs.has(node.name)) {
    throw new SandboxError(`Choose a different name instead of '${node.name}'.`, getNodeLine(node));
  }
}

function createChildContext(context: WalkContext, inFunction: boolean): WalkContext {
  return {
    allowedAPIs: context.allowedAPIs,
    localVars: new Set(context.localVars),
    inFunction,
  };
}
