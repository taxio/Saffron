import * as util from '../util';

describe('convertGetQueries', () => {
  it('correct', () => {
    expect(util.convertGetQueries({ hoge: 'a', foo: 123 })).toBe('hoge=a&foo=123');
  });
  it('throw on incorrect input', () => {
    expect(() => {
      util.convertGetQueries({ hoge: 'a', foo: { bar: 12, piyo: 'bb' } });
    }).toThrow();
  });
});

describe('convertCamelToSnake', () => {
  it('correct', () => {
    expect(util.convertCamelToSnake('hogeFooBar')).toBe('hoge_foo_bar');

    // Lower Camel Caseのみを想定しているので仕様通り
    expect(util.convertCamelToSnake('HogeFooBar')).toBe('_hoge_foo_bar');
  });
  it('1 word', () => {
    expect(util.convertCamelToSnake('hoge')).toBe('hoge');
    expect(util.convertCamelToSnake('hogefoo')).toBe('hogefoo');
  });
});
