import { createToken } from '../../token/token';
import { Identifier, LetStatement, Program } from '../ast';

test('Abstract Syntax Tree', () => {
  const program = new Program([
    new LetStatement(
      createToken('Let', 'let'),
      new Identifier(createToken('Ident', 'arg'), 'arg'),
      new Identifier(createToken('Ident', 'fooBazBar'), 'fooBazBar')
    ),
  ]);

  expect(program.String()).toBe('let arg = fooBazBar;');
});
