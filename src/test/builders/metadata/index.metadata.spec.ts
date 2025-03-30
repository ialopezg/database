import { IndexMetadata } from '../../../builders/metadata/index.metadata';
import { PropertyMetadata } from '../../../builders/metadata';

describe('IndexMetadata', () => {
  it('should extend PropertyMetadata', () => {
    const index = new IndexMetadata();

    expect(index).toBeInstanceOf(PropertyMetadata);
  });

  it('should allow setting and getting name', () => {
    const index = new IndexMetadata();
    index.name = 'idx_user_email';
    expect(index.name).toBe('idx_user_email');
  });
});
