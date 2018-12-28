import * as api from './api';

describe('convertGetQueries', () => {
  it('correct', () => {
    expect(api.convertGetQueries({ hoge: 'a', foo: 123 })).toBe('hoge=a&foo=123');
  });
  it('throw on incorrect input', () => {
    expect(() => {
      api.convertGetQueries({ hoge: 'a', foo: { bar: 12, piyo: 'bb' } });
    }).toThrow();
  });
});
