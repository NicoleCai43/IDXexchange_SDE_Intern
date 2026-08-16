import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PropertyDetailPage from './PropertyDetailPage.jsx';

describe('PropertyDetailPage', () => {
  it('fetches property and openhouses and displays address', async () => {
    const fakeProperty = { L_Address: '1 Main St', L_SystemPrice: 500000, L_Photos: JSON.stringify(['p.jpg']) };
    const fakeOH = [{ id: 1, OpenHouseDate: '2026-01-01', all_data: JSON.stringify({ OpenHouseRemarks: 'Note' }) }];

    global.fetch = vi.fn((url) => {
      if (url.endsWith('/openhouses')) return Promise.resolve({ ok: true, json: () => Promise.resolve(fakeOH) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(fakeProperty) });
    });

    const { getByText } = render(
      <MemoryRouter initialEntries={["/property/123"]}>
        <Routes>
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(getByText('1 Main St')).toBeTruthy());
    expect(global.fetch).toHaveBeenCalled();
  });
});
