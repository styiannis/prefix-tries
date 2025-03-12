export function validateBoolean(value: any, name: string) {
  if ('boolean' !== typeof value) {
    throw new TypeError(
      `The "${name}" value must be a boolean. Current value: "${value}"`
    );
  }
}

export function validateFunction(value: any, name: string) {
  if ('function' !== typeof value) {
    throw new TypeError(
      `The "${name}" value must be a function. Current value: "${value}"`
    );
  }
}

export function validateNonEmptyString(value: any, name: string) {
  if ('string' !== typeof value) {
    throw new TypeError(
      `The "${name}" value must be a string. Current value: "${value}"`
    );
  }

  if (0 === value.length) {
    throw new TypeError(`The "${name}" value should not be empty.`);
  }
}
