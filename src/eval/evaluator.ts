import {
  AstNode,
  ExpressionStatement,
  IntegerLiteral,
  Boolean as AstBoolean,
  Program,
  Statement,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  BlockStatement,
  ReturnStatement,
} from '../ast/ast';
import {
  Integer,
  Boolean,
  Null,
  Object,
  ObjectTypes,
  ReturnValue,
  Error,
} from '../object/object';

type EvalTypes = Integer | Boolean | Object | Error;

export const references = {
  NULL: new Null(),
  TRUE: new Boolean(true),
  FALSE: new Boolean(false),
} as const;

export const Eval = (node: AstNode): EvalTypes | null => {
  if (node instanceof Program) {
    return evalProgram(node);
  }

  if (node instanceof BlockStatement) {
    evaluateBlockStatement(node);
  }

  if (node instanceof ExpressionStatement) {
    return Eval(node.expression);
  }

  if (node instanceof ReturnStatement) {
    const val = Eval(node.returnValue);
    if (val) return new ReturnValue(val);
  }

  if (node instanceof IntegerLiteral) {
    return new Integer(node.value);
  }

  if (node instanceof AstBoolean) {
    return nativeBoolToBooleanObject(node.value);
  }

  if (node instanceof PrefixExpression) {
    const right = Eval(node.right);
    if (right) return evaluatePrefixExpression(node.operator, right);
  }

  if (node instanceof InfixExpression) {
    const left = Eval(node.left);
    const right = Eval(node.right);

    if (left && right) {
      return evaluateInfixExpression(node.operator, left, right);
    }
  }

  if (node instanceof IfExpression) {
    return evaluateIfExpression(node);
  }

  return null;
};

const evalProgram = (program: Program): EvalTypes | null => {
  let result: EvalTypes | null = null;

  for (const statement of program.statements) {
    result = Eval(statement);

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

const evaluateBlockStatement = (block: BlockStatement): Object | null => {
  let result: Object | null = null;

  for (const statement of block.statements) {
    const result = Eval(statement);

    if (result !== null) {
      const type = result.type();

      if (
        type === ObjectTypes.RETURN_VALUE_OBJ ||
        type === ObjectTypes.ERROR_OBJ
      )
        return result;
    }
  }

  return result;
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

const evaluateIfExpression = (ie: IfExpression): Object | null => {
  const condition = Eval(ie.condition);

  if (condition && isTruthy(condition)) {
    return Eval(ie.consequence);
  } else if (ie.alternative !== null) {
    return Eval(ie.alternative);
  } else return references.NULL;
};

const newError = (message: string): Error => {
  return new Error(message);
};
