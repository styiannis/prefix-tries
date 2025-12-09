export const WORDS_1 = Object.freeze([
  'test',
  'testing',
  'gone',
  'bed',
  'bear',
  'get',
  'apple',
  'go',
]);

export const WORDS_2 = Object.freeze([
  'romane',
  'romanus',
  'romulus',
  'rom',
  'rubens',
  'ruber',
  'rubicon',
  'rubicundus',
]);

export const ALL_WORDS = Object.freeze([...WORDS_1, ...WORDS_2]);

export const ALL_WORDS_VALUES: [string, string][] = ALL_WORDS.map((w) => [
  w,
  `{${w}}`,
]);
