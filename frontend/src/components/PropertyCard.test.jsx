import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PropertyCard from './PropertyCard.jsx';

describe('PropertyCard', () => {
  it('wraps card in a link to property detail', () => {
    const prop = { L_ListingID: '123', L_Address: '1 Main St', L_Photos: JSON.stringify(['a.jpg']) };
    const { container } = render(
      <MemoryRouter>
        <PropertyCard property={prop} />
      </MemoryRouter>
    );

    const a = container.querySelector('a');
    expect(a.getAttribute('href')).toBe('/property/123');
  });
});
