import { describe, expect, it } from 'vitest';
import { applyTemplateParams } from '../../../../src/plugins/iletisim-merkezi/server/services/utils/template';

describe('applyTemplateParams', () => {
  it('replaces a single placeholder', () => {
    expect(applyTemplateParams('Hello {{params.firstName}}', { firstName: 'Ada' })).toBe('Hello Ada');
  });

  it('leaves unknown keys unreplaced without error', () => {
    expect(applyTemplateParams('{{params.x}}', { y: 'Ada' })).toBe('{{params.x}}');
  });

  it('returns the string unchanged when params is empty', () => {
    expect(applyTemplateParams('Hello', {})).toBe('Hello');
  });

  it('replaces all occurrences of the same key', () => {
    expect(applyTemplateParams('{{params.name}} and {{params.name}}', { name: 'Ada' })).toBe('Ada and Ada');
  });

  it('replaces multiple different keys', () => {
    expect(
      applyTemplateParams('{{params.a}} + {{params.b}}', { a: 'X', b: 'Y' })
    ).toBe('X + Y');
  });
});
