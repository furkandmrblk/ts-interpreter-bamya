import { BlockStatement, Identifier } from '../ast/ast';
import { Environment } from './environment/environment';

type ObjectType = string;

export enum ObjectTypes {
  RETURN_VALUE_OBJ = 'RETURN_VALUE',
  FUNCTION_OBJ = 'FUNCTION',
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  STRING_OBJ = 'STRING',
  ERROR_OBJ = 'ERROR',
  NULL_OBJ = 'NULL',
}

export type Object = {
  type(): ObjectType;
  inspect(): string;
};

type ObjectWithValue<T> = {
  value: T;
} & Object;

export class Integer implements ObjectWithValue<number> {
  public value: number;

  constructor(value: number) {
    this.value = value;
  }

  public inspect(): string {
    return this.value.toString();
  }

  public type(): ObjectTypes {
    return ObjectTypes.INTEGER_OBJ;
  }
}

export class String implements ObjectWithValue<string> {
  public value: string;

  constructor(value: string) {
    this.value = value;
  }

  public inspect(): string {
    return this.value;
  }

  public type(): ObjectTypes {
    return ObjectTypes.STRING_OBJ;
  }
}

export class Boolean implements ObjectWithValue<boolean> {
  public value: boolean;

  constructor(bool: boolean) {
    this.value = bool;
  }

  public inspect(): string {
    return this.value.toString();
  }

  public type(): ObjectTypes {
    return ObjectTypes.BOOLEAN_OBJ;
  }
}

export class Null implements Object {
  public inspect(): string {
    return 'null';
  }

  public type(): ObjectTypes {
    return ObjectTypes.NULL_OBJ;
  }
}

export class ReturnValue implements ObjectWithValue<Object> {
  public value: Object;

  constructor(value: Object) {
    this.value = value;
  }

  public type(): ObjectType {
    return ObjectTypes.RETURN_VALUE_OBJ;
  }

  public inspect(): string {
    return this.value.inspect();
  }
}

export class Error implements Object {
  public message: string;

  constructor(message: string) {
    this.message = message;
  }

  public type(): string {
    return ObjectTypes.ERROR_OBJ;
  }

  public inspect(): string {
    return 'ERROR: ' + this.message;
  }
}

type FunctionType = {
  parameters: Identifier[];
  body: BlockStatement;
  env: Environment;
};

export class Function implements Object, FunctionType {
  public parameters: Identifier[];
  public body: BlockStatement;
  public env: Environment;

  constructor(params: Identifier[], body: BlockStatement, env: Environment) {
    this.parameters = params;
    this.body = body;
    this.env = env;
  }

  public type() {
    return ObjectTypes.FUNCTION_OBJ;
  }

  public inspect(): string {
    let str: string = '';
    const params: string[] = [];

    for (const p of this.parameters) {
      params.push(p.String());
    }

    str += 'fn';
    str += '(';
    str += params.join(', ');
    str += ') {\n';
    str += this.body.String();
    str += '\n}';

    return str;
  }
}
