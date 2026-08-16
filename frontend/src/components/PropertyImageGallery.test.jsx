import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PropertyImageGallery from './PropertyImageGallery.jsx';

describe('PropertyImageGallery', () => {
  it('shows thumbnails and opens lightbox which closes on Escape', () => {
    const photos = ['p1.jpg','p2.jpg','p3.jpg'];
    const { getByAltText, getByRole, queryByRole, getAllByRole } = render(<PropertyImageGallery photosRaw={JSON.stringify(photos)} />);

    const main = getByAltText('Main photo 1');
    expect(main).toBeTruthy();

    const thumbs = getAllByRole('button');
    // click second thumb
    fireEvent.click(thumbs[1]);
    expect(getByAltText('Main photo 2')).toBeTruthy();

    // open lightbox
    fireEvent.click(getByAltText('Main photo 2'));
    expect(getByRole('dialog')).toBeTruthy();

    // press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(queryByRole('dialog')).toBeNull();
  });
});
