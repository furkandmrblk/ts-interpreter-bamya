import { Token, TokenType } from '../../token/token';
import { Lexer } from '../lexer';

test('test getNextToken()', function () {
  const input = `=+(){},;`;

  const tokens = [
    TokenType.Assign,
    TokenType.Plus,
    TokenType.LParen,
    TokenType.RParen,
    TokenType.LSquirly,
    TokenType.RSquirly,
    TokenType.Comma,
    TokenType.Semicolon,
  ];

  const lexer = new Lexer(input);

  for (const token of tokens) {
    expect(lexer.getNextToken().type).toBe(token);
  }
});

test('test getNextToken() 2.0', function () {
  const input = `let five = 5;
  let ten = 10;`;

  const tokens: Token[] = [
    { type: TokenType.Let, literal: 'let' },
    { type: TokenType.Ident, literal: 'five' },
    { type: TokenType.Assign, literal: '=' },
    { type: TokenType.Int, literal: '5' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.Let, literal: 'let' },
    { type: TokenType.Ident, literal: 'ten' },
    { type: TokenType.Assign, literal: '=' },
    { type: TokenType.Int, literal: '10' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.Eof, literal: 'eof' },
  ];

  const lexer = new Lexer(input);

  for (const token of tokens) {
    const x = lexer.getNextToken();

    expect(x).toEqual(token);
  }
});

test('test getNextToken() 2.0', function () {
  const input = `
  let five = 5;
	let ten = 10;
	
	let add = fn(x, y) {
	  x + y;
	};
  
  let result = add(five, ten);
  
  !-/*5;
	5 < 10 > 5;
	
	if (5 < 10) {
		return true;
	} else {
		return false;
	}
  
  10 == 10;
	10 != 9;
  
  "foobar"
  "foo bar"

  [1, 2];
  {"foo": "bar"}
  `;

  const tokens: Token[] = [
    { type: TokenType.Let, literal: 'let' },
    { type: TokenType.Ident, literal: 'five' },
    { type: TokenType.Assign, literal: '=' },
    { type: TokenType.Int, literal: '5' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.Let, literal: 'let' },
    { type: TokenType.Ident, literal: 'ten' },
    { type: TokenType.Assign, literal: '=' },
    { type: TokenType.Int, literal: '10' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.Let, literal: 'let' },
    { type: TokenType.Ident, literal: 'add' },
    { type: TokenType.Assign, literal: '=' },
    { type: TokenType.Function, literal: 'fn' },
    { type: TokenType.LParen, literal: '(' },
    { type: TokenType.Ident, literal: 'x' },
    { type: TokenType.Comma, literal: ',' },
    { type: TokenType.Ident, literal: 'y' },
    { type: TokenType.RParen, literal: ')' },
    { type: TokenType.LSquirly, literal: '{' },
    { type: TokenType.Ident, literal: 'x' },
    { type: TokenType.Plus, literal: '+' },
    { type: TokenType.Ident, literal: 'y' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.RSquirly, literal: '}' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.Let, literal: 'let' },
    { type: TokenType.Ident, literal: 'result' },
    { type: TokenType.Assign, literal: '=' },
    { type: TokenType.Ident, literal: 'add' },
    { type: TokenType.LParen, literal: '(' },
    { type: TokenType.Ident, literal: 'five' },
    { type: TokenType.Comma, literal: ',' },
    { type: TokenType.Ident, literal: 'ten' },
    { type: TokenType.RParen, literal: ')' },
    { type: TokenType.Semicolon, literal: ';' },

    { type: TokenType.Bang, literal: '!' },
    { type: TokenType.Minus, literal: '-' },
    { type: TokenType.Slash, literal: '/' },
    { type: TokenType.Asterisk, literal: '*' },
    { type: TokenType.Int, literal: '5' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.Int, literal: '5' },
    { type: TokenType.LessThan, literal: '<' },
    { type: TokenType.Int, literal: '10' },
    { type: TokenType.GreaterThan, literal: '>' },
    { type: TokenType.Int, literal: '5' },
    { type: TokenType.Semicolon, literal: ';' },

    { type: TokenType.If, literal: 'if' },
    { type: TokenType.LParen, literal: '(' },
    { type: TokenType.Int, literal: '5' },
    { type: TokenType.LessThan, literal: '<' },
    { type: TokenType.Int, literal: '10' },
    { type: TokenType.RParen, literal: ')' },
    { type: TokenType.LSquirly, literal: '{' },
    { type: TokenType.Return, literal: 'return' },
    { type: TokenType.True, literal: 'true' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.RSquirly, literal: '}' },
    { type: TokenType.Else, literal: 'else' },
    { type: TokenType.LSquirly, literal: '{' },
    { type: TokenType.Return, literal: 'return' },
    { type: TokenType.False, literal: 'false' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.RSquirly, literal: '}' },

    { type: TokenType.Int, literal: '10' },
    { type: TokenType.Equal, literal: '==' },
    { type: TokenType.Int, literal: '10' },
    { type: TokenType.Semicolon, literal: ';' },

    { type: TokenType.Int, literal: '10' },
    { type: TokenType.NotEqual, literal: '!=' },
    { type: TokenType.Int, literal: '9' },
    { type: TokenType.Semicolon, literal: ';' },

    {
      type: TokenType.String,
      literal: 'foobar',
    },
    {
      type: TokenType.String,
      literal: 'foo bar',
    },

    { type: TokenType.LBracket, literal: '[' },
    { type: TokenType.Int, literal: '1' },
    { type: TokenType.Comma, literal: ',' },
    { type: TokenType.Int, literal: '2' },
    { type: TokenType.RBracket, literal: ']' },
    { type: TokenType.Semicolon, literal: ';' },

    { type: TokenType.LSquirly, literal: '{' },
    { type: TokenType.String, literal: 'foo' },
    { type: TokenType.Colon, literal: ':' },
    { type: TokenType.String, literal: 'bar' },
    { type: TokenType.RSquirly, literal: '}' },
  ];

  const lexer = new Lexer(input);

  for (const token of tokens) {
    const x = lexer.getNextToken();

    expect(x).toEqual(token);
  }
});
