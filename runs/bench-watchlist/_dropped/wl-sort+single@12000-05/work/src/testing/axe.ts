import axe from 'axe-core';

/**
 * Runs axe-core against a rendered component and fails with a readable list of violations.
 *
 * Disabled rules:
 * - color-contrast: jsdom has no layout engine, so contrast can't be computed (tokens in styles.scss are AA-checked by hand)
 * - region / landmark-one-main / page-has-heading-one: page-level rules that don't apply when testing a component in isolation
 */
export async function expectNoA11yViolations(el: Element, pageLevel = false) {
  const results = await axe.run(el, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: pageLevel },
      'landmark-one-main': { enabled: pageLevel },
      'page-has-heading-one': { enabled: pageLevel },
    },
  });

  const violations = results.violations.map(
    v => `${v.id}: ${v.help}\n  ${v.nodes.map(n => n.target.join(' ')).join('\n  ')}`,
  );
  expect(violations).toEqual([]);
}
