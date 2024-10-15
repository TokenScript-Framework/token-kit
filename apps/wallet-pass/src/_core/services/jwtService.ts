import {JwtFilterRule} from '../type';

const methodsLimited = ['get', 'post', 'put', 'delete'];

export function applyRules(
  url: string,
  method: string,
  rules: JwtFilterRule[]
): boolean {
  if (!rules?.length) {
    return false;
  }

  const normalizedMethod = method.toLowerCase();
  if (!methodsLimited.includes(normalizedMethod)) {
    return false;
  }

  return rules.some(rule => {
    if (!rule.pattern.test(url)) {
      return false;
    }

    if (!rule.httpMethod) {
      return true;
    }

    if (Array.isArray(rule.httpMethod)) {
      return rule.httpMethod.some(m => m === normalizedMethod);
    } else {
      return rule.httpMethod === normalizedMethod;
    }
  });
}
