import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PropertyImageCarousel from './PropertyImageCarousel.jsx';

describe('PropertyImageCarousel', () => {
  it('renders and navigates photos with prev/next', () => {
    const photos = ['a.jpg','b.jpg','c.jpg'];
    const { getByText, getByAltText } = render(<PropertyImageCarousel photosRaw={JSON.stringify(photos)} />);

    expect(getByAltText('Photo 1')).toBeTruthy();
    expect(getByText('1 / 3')).toBeTruthy();

    fireEvent.click(getByText('›'));
    expect(getByText('2 / 3')).toBeTruthy();

    fireEvent.click(getByText('‹'));
    expect(getByText('1 / 3')).toBeTruthy();
  });
});
