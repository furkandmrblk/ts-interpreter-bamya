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
};

type TokenItem<T extends Record<string, any> = typeof TokenType> = T[keyof T];

export type Token = {
  type: TokenItem;
  literal: string;
};

export const createToken = (type: TokenItem, literal: string): Token => {
  return {
    type,
    literal,
  };
};

const keywords: Record<string, string> = {
  fn: 'FUNCTION',
  let: 'LET',
  true: 'TRUE',
  false: 'FALSE',
  if: 'IF',
  else: 'ELSE',
  return: 'RETURN',
};

export const lookupIdentity = (ident: string): TokenItem => {
  const token: string | undefined = keywords[ident];

  if (token) {
    return token;
  } else return TokenType.Ident;
};
