import { BlockStatement, Identifier } from '../ast/ast';
import { Environment } from './environment/environment';
import hash from 'fnv1a';

type ObjectType = string;

export enum ObjectTypes {
  RETURN_VALUE_OBJ = 'RETURN_VALUE',
  FUNCTION_OBJ = 'FUNCTION',
  INTEGER_OBJ = 'INTEGER',
  BUILTIN_OBJ = 'BUILTIN',
  BOOLEAN_OBJ = 'BOOLEAN',
  STRING_OBJ = 'STRING',
  ARRAY_OBJ = 'ARRAY',
  ERROR_OBJ = 'ERROR',
  HASH_OBJ = 'HASH',
  NULL_OBJ = 'NULL',
}

export type Object = {
  type(): ObjectType;
  inspect(): string;
};

type ObjectWithValue<
  T,
  hasHashKey extends boolean = false
> = hasHashKey extends true
  ? {
      value: T;
      hashKey(): HashKey;
    } & Object
  : {
      value: T;
    } & Object;

type HashPairType = {
  key: Object;
  value: Object;
};

export class HashPair implements HashPairType {
  constructor(public key: Object, public value: Object) {
    this.key = key;
    this.value = value;
  }
}

type HashType = {
  pairs: Map<string, HashPair>;
} & Object;

export class Hash implements HashType {
  constructor(public pairs: Map<string, HashPair>) {
    this.pairs = pairs;
  }

  public type(): string {
    return ObjectTypes.HASH_OBJ;
  }

  public inspect(): string {
    let str: string = '';

    const pairs: string[] = [];

    for (const [_, value] of this.pairs) {
      pairs.push(value.key.inspect() + ':' + value.value.inspect());
    }

    str += '{';
    str += pairs.join(', ');
    str += '}';

    return str;
  }
}

type HashKeyType = {
  type: ObjectType;
  value: number;
};

export class HashKey implements HashKeyType {
  public type!: ObjectType;
  public value!: number;

  constructor(type: ObjectType, value: number) {
    this.type = type;
    this.value = value;
  }
}

export class Integer implements ObjectWithValue<number, true> {
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

  public hashKey(): HashKey {
    return new HashKey(this.type(), this.value);
  }
}

export class String implements ObjectWithValue<string, true> {
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

  public hashKey(): HashKey {
    const hashValue = hash(this.value);
    return new HashKey(this.type(), hashValue);
  }
}

export class Boolean implements ObjectWithValue<boolean, true> {
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

  public hashKey(): HashKey {
    let value: number | undefined = undefined;

    if (this.value) {
      value = 1;
    } else value = 0;

    return new HashKey(this.type(), value);
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

export type BuiltinFunctionType = {
  fn: (...args: Object[]) => Object;
} & Object;

export class BuiltIn implements BuiltinFunctionType {
  fn!: BuiltinFunctionType['fn'];

  constructor(fn: BuiltinFunctionType['fn']) {
    this.fn = fn;
  }

  public type(): string {
    return ObjectTypes.BUILTIN_OBJ;
  }

  public inspect(): string {
    return 'builtin function';
  }
}

type ArrayType = {
  elements: Object[];
} & Object;

export class Array implements ArrayType {
  public elements!: Object[];

  constructor(elems: Object[]) {
    this.elements = elems;
  }

  public type(): string {
    return ObjectTypes.ARRAY_OBJ;
  }

  public inspect(): string {
    let str: string = '';

    const elements: string[] = [];

    for (const e of this.elements) {
      elements.push(e.inspect());
    }

    str += '[';
    str += elements.join(', ');
    str += ']';

    return str;
  }
}
