/**
 * Minimal ESM resolve hook: lets the test suites import the app's source with
 * the same extensionless relative specifiers Angular's bundler uses
 * (e.g. `'../model/models'` -> `../model/models.ts`). Test-only; the app build
 * never uses this.
 */
import { existsSync } from 'node:fs';

export async function resolve(specifier, context, next) {
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !/\.[cm]?[jt]s$/.test(specifier)) {
    for (const ext of ['.ts', '/index.ts']) {
      const candidate = new URL(specifier + ext, context.parentURL);
      if (existsSync(candidate)) {
        return next(specifier + ext, context);
      }
    }
  }
  return next(specifier, context);
}
