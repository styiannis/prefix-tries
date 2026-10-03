function show(value: any) {
  try {
    return String(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function validateArray(value: any, name: string) {
  if (!Array.isArray(value)) {
    throw new TypeError(
      `The "${name}" value must be an array. Current value: "${show(value)}".`
    );
  }
}

export function validateBoolean(value: any, name: string) {
  if ('boolean' !== typeof value) {
    throw new TypeError(
      `The "${name}" value must be a boolean. Current value: "${show(value)}".`
    );
  }
}

export function validateFunction(value: any, name: string) {
  if ('function' !== typeof value) {
    throw new TypeError(
      `The "${name}" value must be a function. Current value: "${show(value)}".`
    );
  }
}

export function validateNonEmptyString(value: any, name: string) {
  if ('string' !== typeof value) {
    throw new TypeError(
      `The "${name}" value must be a string. Current value: "${show(value)}".`
    );
  }

  if (0 === value.length) {
    throw new TypeError(`The "${name}" value should not be empty.`);
  }
}
