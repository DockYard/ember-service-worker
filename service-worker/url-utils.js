/**
 * Create an absolute URL, allowing regex expressions to pass
 *
 * @param {string} url
 * @param {string|object} baseUrl
 * @public
 */
export function createNormalizedUrl(url, baseUrl = self.location) {
  return decodeURI(new URL(encodeURI(url), baseUrl).toString());
}

/**
 * Create an (absolute) URL Regex from a given string
 *
 * @param {string} url
 * @returns {RegExp}
 * @public
 */
export function createUrlRegEx(url) {
  let normalized = createNormalizedUrl(url);
  return new RegExp(`^${normalized}$`);
}

/**
 * Check if given URL matches any pattern
 *
 * @param {string} url
 * @param {array} patterns
 * @returns {boolean}
 * @public
 */
export function urlMatchesAnyPattern(url, patterns) {
  return !!patterns.find((pattern) => pattern.test(decodeURI(url)));
}

export default {
  createAbsoluteDomain,
  createUrlRegEx,
  urlMatchesAnyPattern
}
