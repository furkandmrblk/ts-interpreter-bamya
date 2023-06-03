export const TokenType = {
  Illegal: 'ILLEGAL',
  Eof: 'EOF',
  Ident: 'IDENT',
  Int: 'INT',
  Assign: '=',
  Plus: '+',
  Minus: '-',
  Bang: '!',
  LParen: '(',
  RParen: ')',
  LSquirly: '{',
  RSquirly: '}',
  Comma: ',',
  Semicolon: ';',
  Let: 'LET',
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
};

export const lookupIdentity = (ident: string): TokenItem => {
  const token: string | undefined = keywords[ident];

  if (token) {
    return token;
  } else return TokenType.Ident;
};
