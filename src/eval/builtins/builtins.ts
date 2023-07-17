import {
  Array,
  BuiltIn,
  Integer,
  Object,
  ObjectTypes,
  String,
} from '../../object/object';
import { newError, references } from '../evaluator';

interface BuiltinMap {
  [key: string]: BuiltIn;
}

export const builtins: BuiltinMap = {
  len: new BuiltIn((...args: Object[]): Object => {
    if (args.length !== 1) {
      return newError(
        `wrong number of arguments. got=${args.length}, wanted=1`
      );
    }

    const arg = args[0];

    switch (arg.type()) {
      case ObjectTypes.ARRAY_OBJ:
        return new Integer(Number((arg as Array).elements.length));
      case ObjectTypes.STRING_OBJ:
        return new Integer(Number((arg as String).value.length));
      default:
        return newError('argument to `len` not supported, got ' + arg.type());
    }
  }),
  first: new BuiltIn((...args: Object[]): Object => {
    if (args.length !== 1)
      return newError(
        `wrong number of arguments. got=${args.length}, wanted=1`
      );

    const arg = args[0];

    if (arg.type() !== ObjectTypes.ARRAY_OBJ)
      return newError('argument to `first` must be ARRAY, got=' + arg.type());

    const arr = arg;

    if (!(arr instanceof Array))
      return newError(`arr is not Array, got=${arr.type()}`);

    if (arr.elements.length > 0) return arr.elements[0];

    return references.NULL;
  }),
  last: new BuiltIn((...args: Object[]): Object => {
    if (args.length !== 1)
      return newError(
        `wrong number of arguments. got=${args.length}, wanted=1`
      );

    const arg = args[0];

    if (arg.type() !== ObjectTypes.ARRAY_OBJ)
      return newError('argument to `last` must be ARRAY, got=' + arg.type());

    const arr = arg;

    if (!(arr instanceof Array))
      return newError(`arr is not Array, got=${arr.type()}`);

    if (arr.elements.length > 0) return arr.elements[arr.elements.length - 1];

    return references.NULL;
  }),
  rest: new BuiltIn((...args: Object[]): Object => {
    if (args.length !== 1)
      return newError(
        `wrong number of arguments. got=${args.length}, wanted=1`
      );

    const arg = args[0];

    if (arg.type() !== ObjectTypes.ARRAY_OBJ)
      return newError('argument to `last` must be ARRAY, got=' + arg.type());

    const arr = arg;

    if (!(arr instanceof Array))
      return newError(`arr is not Array, got=${arr.type()}`);

    if (arr.elements.length > 0) {
      const newElements: Object[] = arr.elements.slice(1, arr.elements.length);
      return new Array(newElements);
    }

    return references.NULL;
  }),
  push: new BuiltIn((...args: Object[]): Object => {
    if (args.length !== 2)
      return newError(
        `wrong number of arguments. got=${args.length}, wanted=2`
      );

    const arg = args[0];

    if (arg.type() !== ObjectTypes.ARRAY_OBJ)
      return newError('argument to `push` must be ARRAY, got=' + arg.type());

    const arr = arg as Array;
    const length = arr.elements.length;

    const newElements: Object[] = [...arr.elements, args[1]];

    return new Array(newElements);
  }),
  log: new BuiltIn((...args: Object[]): Object => {
    for (const arg of args) {
      console.log(arg.inspect());
    }

    return references.NULL;
  }),
};
