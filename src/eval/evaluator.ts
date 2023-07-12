import {
  AstNode,
  ExpressionStatement,
  IntegerLiteral,
  Boolean as AstBoolean,
  Program,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  BlockStatement,
  ReturnStatement,
  LetStatement,
  Identifier,
  FunctionLiteral,
  CallExpression,
  Expression,
  StringLiteral,
} from '../ast/ast';
import {
  Environment,
  newEnclosedEnvironment,
} from '../object/environment/environment';
import {
  Integer,
  Boolean,
  Null,
  Object,
  ObjectTypes,
  ReturnValue,
  Error,
  Function,
  String,
} from '../object/object';

type EvalTypes = Integer | Boolean | Object | Error;

export const references = {
  NULL: new Null(),
  TRUE: new Boolean(true),
  FALSE: new Boolean(false),
} as const;

export const Eval = (node: AstNode, env: Environment): EvalTypes | null => {
  if (node instanceof Program) {
    return evalProgram(node, env);
  }

  if (node instanceof BlockStatement) {
    return evaluateBlockStatement(node, env);
  }

  if (node instanceof ExpressionStatement) {
    return Eval(node.expression, env);
  }

  if (node instanceof ReturnStatement) {
    const val = Eval(node.returnValue, env);

    if (isError(val)) return val;

    if (val) return new ReturnValue(val);
  }

  if (node instanceof LetStatement) {
    const val = Eval(node.value, env);

    if (isError(val)) return val;

    env.set(node.name.value, val);
  }

  if (node instanceof IntegerLiteral) {
    return new Integer(node.value);
  }

  if (node instanceof StringLiteral) {
    return new String(node.value);
  }

  if (node instanceof AstBoolean) {
    return nativeBoolToBooleanObject(node.value);
  }

  if (node instanceof PrefixExpression) {
    const right = Eval(node.right, env);

    if (isError(right)) return right;

    if (right) return evaluatePrefixExpression(node.operator, right);
  }

  if (node instanceof InfixExpression) {
    const left = Eval(node.left, env);
    const right = Eval(node.right, env);

    if (isError(left)) return left;
    if (isError(right)) return right;

    if (left && right) {
      return evaluateInfixExpression(node.operator, left, right);
    }
  }

  if (node instanceof IfExpression) {
    return evaluateIfExpression(node, env);
  }

  if (node instanceof Identifier) {
    return evaluateIdentifier(node, env);
  }

  if (node instanceof FunctionLiteral) {
    return new Function(node.parameters, node.body, env);
  }

  if (node instanceof CallExpression) {
    const fn = Eval(node.fn, env);

    if (isError(fn)) return fn;

    const args = evaluateExpressions(node.arguments, env);

    if (args.length === 1 && isError(args[0])) return args[0];

    if (fn) return applyFunction(fn, args);
  }

  return null;
};

const evalProgram = (program: Program, env: Environment): EvalTypes | null => {
  let result: EvalTypes | null = null;

  for (const statement of program.statements) {
    result = Eval(statement, env);

    if (result !== null) {
      const type = result.type();

      switch (type) {
        case ObjectTypes.RETURN_VALUE_OBJ:
          return (result as ReturnValue).value;
        case ObjectTypes.ERROR_OBJ:
          return result;
      }
    }
  }

  return result;
};

const evaluateBlockStatement = (
  block: BlockStatement,
  env: Environment
): Object | null => {
  let result: Object | null = null;

  for (const statement of block.statements) {
    result = Eval(statement, env);

    if (result !== null) {
      const type = result.type();

      if (
        type === ObjectTypes.RETURN_VALUE_OBJ ||
        type === ObjectTypes.ERROR_OBJ
      ) {
        return result;
      }
    }
  }

  return result;
};

const evaluateIdentifier = (node: Identifier, env: Environment): Object => {
  const val = env.get(node.value);

  if (!val) return newError(`identifier not found: ${node.value}`);

  return val;
};

const nativeBoolToBooleanObject = (input: boolean): Boolean => {
  if (input) {
    return references.TRUE;
  } else return references.FALSE;
};

const evaluateBangOperatorExpression = (right: Object): Object => {
  switch (right) {
    case references.TRUE:
      return references.FALSE;
    case references.FALSE:
      return references.TRUE;
    case references.NULL:
      return references.TRUE;
    default:
      return references.FALSE;
  }
};

const evaluateMinusPrefixOperatorExpression = (right: Object): Object => {
  if (right.type() !== ObjectTypes.INTEGER_OBJ)
    return newError(`unknown operator: -${right.type()}`);

  const value = (right as Integer).value;

  return new Integer(-value);
};

const evaluatePrefixExpression = (operator: string, right: Object): Object => {
  switch (operator) {
    case '!':
      return evaluateBangOperatorExpression(right);
    case '-':
      return evaluateMinusPrefixOperatorExpression(right);
    default:
      return newError(`unknown operator: ${operator}${right.type()}`);
  }
};

const evaluateIntegerInfixExpression = (
  operator: string,
  left: Object,
  right: Object
): Object => {
  const leftValue = (left as Integer).value;
  const rightValue = (right as Integer).value;

  switch (operator) {
    case '+':
      return new Integer(leftValue + rightValue);
    case '-':
      return new Integer(leftValue - rightValue);
    case '*':
      return new Integer(leftValue * rightValue);
    case '/':
      return new Integer(leftValue / rightValue);
    case '<':
      return nativeBoolToBooleanObject(leftValue < rightValue);
    case '>':
      return nativeBoolToBooleanObject(leftValue > rightValue);
    case '==':
      return nativeBoolToBooleanObject(leftValue == rightValue);
    case '!=':
      return nativeBoolToBooleanObject(leftValue != rightValue);
    default:
      return newError(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`
      );
  }
};

const evaluateInfixExpression = (
  operator: string,
  left: Object,
  right: Object
): Object => {
  if (left.type() !== right.type())
    return newError(
      `type mismatch: ${left.type()} ${operator} ${right.type()}`
    );

  if (
    left.type() == ObjectTypes.INTEGER_OBJ &&
    right.type() == ObjectTypes.INTEGER_OBJ
  ) {
    return evaluateIntegerInfixExpression(operator, left, right);
  }

  if (operator === '==') {
    return nativeBoolToBooleanObject(left == right);
  }

  if (operator == '!=') {
    return nativeBoolToBooleanObject(left != right);
  }

  return newError(
    `unknown operator: ${left.type()} ${operator} ${right.type()}`
  );
};

const isTruthy = (obj: Object): boolean => {
  switch (obj) {
    case references.NULL:
      return false;
    case references.TRUE:
      return true;
    case references.FALSE:
      return false;
    default:
      return true;
  }
};

const evaluateIfExpression = (
  ie: IfExpression,
  env: Environment
): Object | null => {
  const condition = Eval(ie.condition, env);

  if (isError(condition)) {
    return condition;
  }

  if (condition && isTruthy(condition)) {
    return Eval(ie.consequence, env);
  } else if (ie.alternative !== null) {
    return Eval(ie.alternative, env);
  } else return references.NULL;
};

const evaluateExpressions = (
  exps: Expression[],
  env: Environment
): Object[] => {
  const result: Object[] = [];

  for (const e of exps) {
    const evaluated = Eval(e, env);

    if (isError(evaluated)) {
      if (evaluated) {
        return [evaluated];
      } else return [];
    }

    if (evaluated) result.push(evaluated);
  }

  return result;
};

const applyFunction = (fn: Object, args: Object[]): Object | null => {
  if (!(fn instanceof Function))
    throw new Error(`not a function: ${fn.type()}.`);

  const extendedEnv = extendFunctionEnvironment(fn, args);
  const evaluated = Eval(fn.body, extendedEnv);

  return unwrapReturnValue(evaluated);
};

const extendFunctionEnvironment = (
  fn: Function,
  args: Object[]
): Environment => {
  const env = newEnclosedEnvironment(fn.env);

  for (let i = 0; i < fn.parameters.length; i++) {
    const param = fn.parameters[i];

    env.set(param.value, args[i]);
  }

  return env;
};

const unwrapReturnValue = (obj: Object | null): Object | null => {
  if (obj instanceof ReturnValue) {
    return obj.value;
  } else if (obj) return obj;

  return null;
};

const newError = (message: string): Error => {
  return new Error(message);
};

const isError = (obj: Object | null): boolean => {
  if (obj !== null) {
    return obj.type() === ObjectTypes.ERROR_OBJ;
  } else return false;
};
