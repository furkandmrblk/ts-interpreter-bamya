import { String } from '../object';

test('String-Hash-Key', () => {
  const hello1 = new String('Hello World');
  const hello2 = new String('Hello World');

  const diff1 = new String('My name is johnny');
  const diff2 = new String('My name is johnny');

  if (hello1.hashKey().value != hello2.hashKey().value)
    throw new Error(`strings with same content have different hash keys.`);

  if (diff1.hashKey().value != diff2.hashKey().value)
    throw new Error(`strings with same content have different hash keys.`);

  if (hello1.hashKey().value == diff1.hashKey().value)
    throw new Error(`strings with different content have same hash keys.`);
});
