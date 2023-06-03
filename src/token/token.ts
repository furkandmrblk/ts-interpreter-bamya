export const TokenType = {
  Illegal: 'ILLEGAL',
  Eof: 'EOF',

  Ident: 'IDENT',

  Int: 'INT',

  Assign: '=',
  Bang: '!',
  Plus: '+',
  Minus: '-',
  Asterisk: '*',
  Slash: '/',
  GreaterThan: '>',
  LessThan: '<',

  Equal: '==',
  NotEqual: '!=',

  LParen: '(',
  RParen: ')',
  LSquirly: '{',
  RSquirly: '}',
  Comma: ',',
  Semicolon: ';',

  Let: 'LET',
  Function: 'FUNCTION',
  True: 'TRUE',
  False: 'FALSE',
  If: 'IF',
  Else: 'ELSE',
  Return: 'RETURN',
} as const;

export type TokenItem<T extends Record<string, any> = typeof TokenType> =
  keyof T;

type TokenKeys = keyof typeof TokenType;
type TokenLiteralType = TokenKeys extends `${infer A}`
  ? A extends TokenItem
    ? (typeof TokenType)[A]
    : never
  : never;

export type Token = {
  type: TokenLiteralType;
  literal: string;
};

export const createToken = (type: TokenItem, literal: string): Token => {
  return {
    type: TokenType[type],
    literal,
  };
};

const Keywords: Record<string, TokenItem> = {
  fn: 'Function',
  let: 'Let',
  true: 'True',
  false: 'False',
  if: 'If',
  else: 'Else',
  return: 'Return',
};

export const lookupIdentity = (ident: string): TokenItem => {
  const keyword: TokenItem | undefined = Keywords[ident];

  if (keyword) {
    return keyword;
  } else return 'Ident';
};
