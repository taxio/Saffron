import * as api from '../lib/api';

test('convert object to GET query', () => {
  expect(api.convertGetQueries({ hoge: 'a', foo: 123 })).toBe('hoge=a&foo=123');
});

test('throw on incorrect input', () => {
  expect(() => {
    api.convertGetQueries({ hoge: 'a', foo: { bar: 12, piyo: 'bb' } });
  }).toThrow();
});
