import * as acorn from 'acorn';
import {
  getNodeLine,
  type AssignmentExpression,
  type BlockStatement,
  type BinaryExpression,
  type CallExpression,
  type ForStatement,
  type Identifier,
  type IfStatement,
  type LogicalExpression,
  type Program,
  type SupportedASTNode,
  type UnaryExpression,
  type UpdateExpression,
} from './astTypes';
import { SandboxError, validateAST } from './sandbox';

export interface PlayerFriendlyError {
  message: string;
  line?: number;
}

export type ExecutionResult = { success: true } | { success: false; error: PlayerFriendlyError };

export interface ExecutionStep {
  type: 'call';
  fnName: string;
  line?: number;
}

type PlayerCallable = (...args: unknown[]) => unknown;

interface EnvironmentFrame {
  readonly values: Record<string, unknown>;
  readonly parent: EnvironmentFrame | null;
}

interface UserFunction {
  readonly kind: 'user-function';
  readonly params: readonly Identifier[];
  readonly body: BlockStatement;
  readonly closure: EnvironmentFrame;
}

interface ExecuteOptions {
  readonly emitSteps: boolean;
}

type PreparedExecution =
  | { success: true; program: Program; env: EnvironmentFrame }
  | { success: false; error: PlayerFriendlyError };

type LookupResult = { found: true; value: unknown } | { found: false };

const MAX_LOOP_ITERATIONS = 10_000;

export function execute(code: string, scope: Record<string, unknown>): ExecutionResult {
  const prepared = prepareExecution(code, scope);
  if (!prepared.success) {
    return { success: false, error: prepared.error };
  }

  try {
    const runner = executeStatements(getValidatedProgramBody(prepared.program), prepared.env, {
      emitSteps: false,
    });
    drainGenerator(runner);
    return { success: true };
  } catch (error) {
    return executionErrorResult(error);
  }
}

export function* executeStep(
  code: string,
  scope: Record<string, unknown>,
): Generator<ExecutionStep, ExecutionResult, void> {
  const prepared = prepareExecution(code, scope);
  if (!prepared.success) {
    return { success: false, error: prepared.error };
  }

  try {
    yield* executeStatements(getValidatedProgramBody(prepared.program), prepared.env, {
      emitSteps: true,
    });
    return { success: true };
  } catch (error) {
    return executionErrorResult(error);
  }
}

export function formatErrorForDisplay(error: PlayerFriendlyError): string {
  if (error.line !== undefined) {
    return `Line ${error.line.toString()}: ${error.message}`;
  }

  return error.message;
}

class RuntimeError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
  ) {
    super(message);
    this.name = 'RuntimeError';
  }
}

class ReturnSignal {
  constructor(public readonly value: unknown) {}
}

function prepareExecution(code: string, scope: Record<string, unknown>): PreparedExecution {
  let parsedAst: acorn.Node;

  try {
    parsedAst = acorn.parse(code, {
      ecmaVersion: 2020,
      locations: true,
      sourceType: 'module',
    });
  } catch (error) {
    return { success: false, error: parseFriendlyError(error) };
  }

  const program = parsedAst as unknown as Program;

  try {
    validateAST(program, getCallableScopeNames(scope));
  } catch (error) {
    if (error instanceof SandboxError) {
      return { success: false, error: createPlayerError(error.message, error.line) };
    }

    return {
      success: false,
      error: createPlayerError('Something went wrong. Try checking your code for typos.'),
    };
  }

  return {
    success: true,
    program,
    env: createRootEnvironment(scope),
  };
}

function getCallableScopeNames(scope: Record<string, unknown>): string[] {
  return Object.entries(scope)
    .filter((entry): entry is [string, PlayerCallable] => typeof entry[1] === 'function')
    .map(([name]) => name);
}

function* executeStatements(
  body: readonly SupportedASTNode[],
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  for (const statement of body) {
    const result = yield* executeNode(statement, env, options);
    if (result instanceof ReturnSignal) {
      return result;
    }
  }

  return undefined;
}

function* executeNode(
  node: SupportedASTNode,
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  switch (node.type) {
    case 'Program':
      return yield* executeStatements(getValidatedProgramBody(node), env, options);
    case 'ExpressionStatement':
      return yield* executeNode(node.expression as SupportedASTNode, env, options);
    case 'CallExpression':
      return yield* executeCallExpression(node, env, options);
    case 'Identifier':
      return readIdentifier(node, env);
    case 'Literal':
      return node.value;
    case 'BinaryExpression':
      return yield* executeBinaryExpression(node, env, options);
    case 'LogicalExpression':
      return yield* executeLogicalExpression(node, env, options);
    case 'AssignmentExpression':
      return yield* executeAssignmentExpression(node, env, options);
    case 'VariableDeclaration':
      for (const declaration of node.declarations) {
        const value =
          declaration.init !== null
            ? yield* executeNode(declaration.init as SupportedASTNode, env, options)
            : undefined;

        if (declaration.id.type === 'Identifier') {
          defineValue(env, declaration.id.name, value);
        }
      }
      return undefined;
    case 'VariableDeclarator':
      return undefined;
    case 'BlockStatement': {
      const blockResult = yield* executeStatements(
        node.body as readonly SupportedASTNode[],
        createChildEnvironment(env),
        options,
      );
      return blockResult;
    }
    case 'IfStatement':
      return yield* executeIfStatement(node, env, options);
    case 'ForStatement':
      return yield* executeForStatement(node, env, options);
    case 'FunctionDeclaration':
      defineValue(env, node.id.name, {
        kind: 'user-function',
        params: node.params as readonly Identifier[],
        body: node.body,
        closure: env,
      } satisfies UserFunction);
      return undefined;
    case 'ReturnStatement':
      return new ReturnSignal(
        node.argument !== null
          ? yield* executeNode(node.argument as SupportedASTNode, env, options)
          : undefined,
      );
    case 'UpdateExpression':
      return executeUpdateExpression(node, env);
    case 'UnaryExpression':
      return yield* executeUnaryExpression(node, env, options);
    case 'EmptyStatement':
      return undefined;
    default: {
      const unsupportedNode = node as { type: string };
      throw new RuntimeError(`Unsupported syntax: ${unsupportedNode.type}`);
    }
  }
}

function* executeCallExpression(
  node: CallExpression,
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  const calleeName = getCalleeName(node);
  const callee = yield* executeNode(node.callee as SupportedASTNode, env, options);
  const args: unknown[] = [];

  for (const argument of node.arguments) {
    args.push(yield* executeNode(argument as SupportedASTNode, env, options));
  }

  return yield* callValue(callee, args, getNodeLine(node), calleeName, options);
}

function* callValue(
  value: unknown,
  args: readonly unknown[],
  line: number | undefined,
  name: string,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  if (isUserFunction(value)) {
    const functionEnv = createChildEnvironment(value.closure);
    value.params.forEach((param, index) => {
      defineValue(functionEnv, param.name, args[index]);
    });

    const result = yield* executeStatements(
      value.body.body as readonly SupportedASTNode[],
      functionEnv,
      options,
    );

    if (result instanceof ReturnSignal) {
      return result.value;
    }

    return undefined;
  }

  if (!isPlayerCallable(value)) {
    throw new RuntimeError(
      `'${name}' is not one of the available functions for this level. Check the function list!`,
      line,
    );
  }

  let result: unknown;
  try {
    result = value(...args);
  } catch {
    throw new RuntimeError('Something went wrong. Try checking your function arguments.', line);
  }

  if (options.emitSteps) {
    yield createExecutionStep(name, line);
  }

  return result;
}

function* executeBinaryExpression(
  node: BinaryExpression,
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  const left = yield* executeNode(node.left as SupportedASTNode, env, options);
  const right = yield* executeNode(node.right as SupportedASTNode, env, options);
  return evaluateBinary(node.operator, left, right, getNodeLine(node));
}

function* executeLogicalExpression(
  node: LogicalExpression,
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  const left = yield* executeNode(node.left as SupportedASTNode, env, options);

  if (node.operator === '&&') {
    return toBoolean(left)
      ? yield* executeNode(node.right as SupportedASTNode, env, options)
      : left;
  }

  if (node.operator === '||') {
    return toBoolean(left)
      ? left
      : yield* executeNode(node.right as SupportedASTNode, env, options);
  }

  throw new RuntimeError(`Unsupported operator: ${node.operator}`, getNodeLine(node));
}

function* executeAssignmentExpression(
  node: AssignmentExpression,
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  if (node.left.type !== 'Identifier') {
    throw new RuntimeError(
      'Only variables you created with let can be changed.',
      getNodeLine(node),
    );
  }

  const currentValue = readIdentifier(node.left, env);
  const nextValue = yield* executeNode(node.right as SupportedASTNode, env, options);
  const assignedValue = evaluateAssignment(
    node.operator,
    currentValue,
    nextValue,
    getNodeLine(node),
  );

  if (!assignValue(env, node.left.name, assignedValue)) {
    throw new RuntimeError(`'${node.left.name}' has not been created yet.`, getNodeLine(node.left));
  }

  return assignedValue;
}

function* executeIfStatement(
  node: IfStatement,
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  const condition = yield* executeNode(node.test as SupportedASTNode, env, options);

  if (toBoolean(condition)) {
    return yield* executeNode(node.consequent as SupportedASTNode, env, options);
  }

  if (node.alternate !== null) {
    return yield* executeNode(node.alternate as SupportedASTNode, env, options);
  }

  return undefined;
}

function* executeForStatement(
  node: ForStatement,
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  const loopEnv = createChildEnvironment(env);

  if (node.init !== null) {
    yield* executeNode(node.init as SupportedASTNode, loopEnv, options);
  }

  let iterations = 0;

  while (
    node.test === null ||
    toBoolean(yield* executeNode(node.test as SupportedASTNode, loopEnv, options))
  ) {
    iterations += 1;
    if (iterations > MAX_LOOP_ITERATIONS) {
      throw new RuntimeError('Your code ran in circles too many times. Check your loop condition.');
    }

    const bodyResult = yield* executeNode(node.body as SupportedASTNode, loopEnv, options);
    if (bodyResult instanceof ReturnSignal) {
      return bodyResult;
    }

    if (node.update !== null) {
      yield* executeNode(node.update as SupportedASTNode, loopEnv, options);
    }
  }

  return undefined;
}

function executeUpdateExpression(node: UpdateExpression, env: EnvironmentFrame): number {
  if (node.argument.type !== 'Identifier') {
    throw new RuntimeError(
      'Only variables you created with let can be changed.',
      getNodeLine(node),
    );
  }

  const currentValue = readIdentifier(node.argument, env);
  const currentNumber = requireNumber(currentValue, getNodeLine(node));
  const nextValue = node.operator === '++' ? currentNumber + 1 : currentNumber - 1;

  if (!assignValue(env, node.argument.name, nextValue)) {
    throw new RuntimeError(
      `'${node.argument.name}' has not been created yet.`,
      getNodeLine(node.argument),
    );
  }

  return node.prefix ? nextValue : currentNumber;
}

function* executeUnaryExpression(
  node: UnaryExpression,
  env: EnvironmentFrame,
  options: ExecuteOptions,
): Generator<ExecutionStep, unknown, void> {
  const value = yield* executeNode(node.argument as SupportedASTNode, env, options);

  switch (node.operator) {
    case '!':
      return !toBoolean(value);
    case '-':
      return -requireNumber(value, getNodeLine(node));
    case '+':
      return requireNumber(value, getNodeLine(node));
    default:
      throw new RuntimeError(`Unsupported operator: ${node.operator}`, getNodeLine(node));
  }
}

function evaluateBinary(
  operator: string,
  left: unknown,
  right: unknown,
  line: number | undefined,
): unknown {
  switch (operator) {
    case '+':
      return requireNumber(left, line) + requireNumber(right, line);
    case '-':
      return requireNumber(left, line) - requireNumber(right, line);
    case '*':
      return requireNumber(left, line) * requireNumber(right, line);
    case '/':
      return requireNumber(left, line) / requireNumber(right, line);
    case '%':
      return requireNumber(left, line) % requireNumber(right, line);
    case '<':
      return requireNumber(left, line) < requireNumber(right, line);
    case '>':
      return requireNumber(left, line) > requireNumber(right, line);
    case '<=':
      return requireNumber(left, line) <= requireNumber(right, line);
    case '>=':
      return requireNumber(left, line) >= requireNumber(right, line);
    case '===':
      return left === right;
    case '!==':
      return left !== right;
    default:
      throw new RuntimeError(`Unsupported operator: ${operator}`, line);
  }
}

function evaluateAssignment(
  operator: string,
  currentValue: unknown,
  nextValue: unknown,
  line: number | undefined,
): unknown {
  switch (operator) {
    case '=':
      return nextValue;
    case '+=':
      return requireNumber(currentValue, line) + requireNumber(nextValue, line);
    case '-=':
      return requireNumber(currentValue, line) - requireNumber(nextValue, line);
    case '*=':
      return requireNumber(currentValue, line) * requireNumber(nextValue, line);
    case '/=':
      return requireNumber(currentValue, line) / requireNumber(nextValue, line);
    case '%=':
      return requireNumber(currentValue, line) % requireNumber(nextValue, line);
    default:
      throw new RuntimeError(`Unsupported assignment: ${operator}`, line);
  }
}

function readIdentifier(node: Identifier, env: EnvironmentFrame): unknown {
  const result = lookupValue(env, node.name);

  if (result.found) {
    return result.value;
  }

  throw new RuntimeError(
    `'${node.name}' has not been created yet. Did you forget to declare it with 'let'?`,
    getNodeLine(node),
  );
}

function lookupValue(env: EnvironmentFrame, name: string): LookupResult {
  if (Object.hasOwn(env.values, name)) {
    return { found: true, value: env.values[name] };
  }

  if (env.parent !== null) {
    return lookupValue(env.parent, name);
  }

  return { found: false };
}

function defineValue(env: EnvironmentFrame, name: string, value: unknown): void {
  env.values[name] = value;
}

function assignValue(env: EnvironmentFrame, name: string, value: unknown): boolean {
  if (Object.hasOwn(env.values, name)) {
    env.values[name] = value;
    return true;
  }

  if (env.parent !== null) {
    return assignValue(env.parent, name, value);
  }

  return false;
}

function createRootEnvironment(scope: Record<string, unknown>): EnvironmentFrame {
  const values = createValues();

  for (const [name, value] of Object.entries(scope)) {
    values[name] = value;
  }

  return { values, parent: null };
}

function createChildEnvironment(parent: EnvironmentFrame): EnvironmentFrame {
  return { values: createValues(), parent };
}

function createValues(): Record<string, unknown> {
  // A null prototype prevents player identifiers from resolving through Object.prototype.
  return Object.create(null) as Record<string, unknown>;
}

function getValidatedProgramBody(program: Program): readonly SupportedASTNode[] {
  return program.body as readonly SupportedASTNode[];
}

function isUserFunction(value: unknown): value is UserFunction {
  return (
    typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'user-function'
  );
}

function isPlayerCallable(value: unknown): value is PlayerCallable {
  return typeof value === 'function';
}

function getCalleeName(node: CallExpression): string {
  return node.callee.type === 'Identifier' ? node.callee.name : '(unknown)';
}

function requireNumber(value: unknown, line: number | undefined): number {
  if (typeof value === 'number') {
    return value;
  }

  throw new RuntimeError('Use numbers with this operator.', line);
}

function toBoolean(value: unknown): boolean {
  return Boolean(value);
}

function drainGenerator(generator: Generator<ExecutionStep, unknown, void>): void {
  let next = generator.next();

  while (next.done !== true) {
    next = generator.next();
  }
}

function executionErrorResult(error: unknown): ExecutionResult {
  if (error instanceof RuntimeError) {
    return { success: false, error: createPlayerError(error.message, error.line) };
  }

  return {
    success: false,
    error: createPlayerError('Something went wrong. Try checking your code for typos.'),
  };
}

function parseFriendlyError(error: unknown): PlayerFriendlyError {
  const line = extractErrorLine(error);
  return createPlayerError(
    `Syntax error on line ${line?.toString() ?? '?'}: check for missing brackets or typos.`,
    line,
  );
}

function extractErrorLine(error: unknown): number | undefined {
  if (isRecord(error)) {
    const loc = error.loc;
    if (isRecord(loc) && typeof loc.line === 'number') {
      return loc.line;
    }

    const message = error.message;
    if (typeof message === 'string') {
      return extractLineFromMessage(message);
    }
  }

  return undefined;
}

function extractLineFromMessage(message: string): number | undefined {
  const lineMatch = /\((\d+):\d+\)/.exec(message);
  if (lineMatch === null) {
    return undefined;
  }

  const lineText = lineMatch[1];
  if (lineText === undefined) {
    return undefined;
  }

  return Number.parseInt(lineText, 10);
}

function createPlayerError(message: string, line?: number): PlayerFriendlyError {
  if (line === undefined) {
    return { message };
  }

  return { message, line };
}

function createExecutionStep(fnName: string, line: number | undefined): ExecutionStep {
  if (line === undefined) {
    return { type: 'call', fnName };
  }

  return { type: 'call', fnName, line };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
