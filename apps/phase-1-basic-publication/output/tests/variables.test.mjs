import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as vars from '../src/app/core/variables.ts';
import { referencedVariableNames, undefinedVariableNames } from '../src/app/core/variables.ts';

test('reference-syntax: {{name}} between doubled braces, first-seen order, de-duplicated', () => {
  const c = 'Uses {{alpha}} then {{beta}} then {{alpha}} again.';
  assert.deepEqual(referencedVariableNames(c), ['alpha', 'beta']);
});

test('reference-syntax is case-sensitive', () => {
  const defined = [{ name: 'Alpha', value: 'x' }];
  assert.deepEqual(undefinedVariableNames('has {{alpha}}', defined), ['alpha']);
  assert.deepEqual(undefinedVariableNames('has {{Alpha}}', defined), []);
});

test('undefinedVariableNames lists every referenced name not in the Variables list', () => {
  const defined = [{ name: 'known', value: 'v' }];
  assert.deepEqual(undefinedVariableNames('{{known}} and {{missing}} and {{gone}}', defined), ['missing', 'gone']);
});

test('mustNever "substitute live": the module exposes NO substitute/render/resolve function', () => {
  const names = Object.keys(vars);
  for (const n of names) {
    assert.ok(
      !/subst|render|resolve|interpolat|expand/i.test(n),
      `variables.ts must not export a live-substitution helper, found: ${n}`
    );
  }
  assert.deepEqual(
    names.sort(),
    ['VARIABLE_REFERENCE_RE', 'referencedVariableNames', 'undefinedVariableNames']
  );
});
