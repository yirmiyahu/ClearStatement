/**
 * TODO: Remove this file when constructable stylesheet objects support is supported.
 */

interface CSSStyleSheet {
  replaceSync(text: string): void;
}

interface ShadowRoot {
  adoptedStyleSheets: CSSStyleSheet[];
}
