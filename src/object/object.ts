type ObjectType = string;

export enum ObjectTypes {
  RETURN_VALUE_OBJ = 'RETURN_VALUE',
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  ERROR_OBJ = 'ERROR',
  NULL_OBJ = 'NULL',
}

export type Object = {
  type(): ObjectType;
  inspect(): string;
};

type IntegerType = {
  value: number;
};

export class Integer implements IntegerType, Object {
  public value: number;

  constructor(value: number) {
    this.value = value;
  }

  public inspect(): string {
    return String(this.value);
  }

  public type(): ObjectTypes {
    return ObjectTypes.INTEGER_OBJ;
  }
}

type BooleanType = {
  value: boolean;
};

export class Boolean implements BooleanType, Object {
  public value: boolean;

  constructor(bool: boolean) {
    this.value = bool;
  }

  public inspect(): string {
    return String(this.value);
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

type ReturnType = {
  value: Object;
};
export class ReturnValue implements Object, ReturnType {
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
