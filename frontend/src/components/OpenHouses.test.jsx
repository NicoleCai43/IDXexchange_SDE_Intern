import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OpenHouses from './OpenHouses.jsx';

describe('OpenHouses', () => {
  it('parses remarks from all_data JSON and displays them', () => {
    const oh = [{ id: 1, OpenHouseDate: '2026-01-01', OH_StartTime: '10:00', OH_EndTime: '12:00', all_data: JSON.stringify({ OpenHouseRemarks: 'Be nice' }) }];
    const { getByText } = render(<OpenHouses list={oh} />);
    expect(getByText('Open Houses')).toBeTruthy();
    expect(getByText('Be nice')).toBeTruthy();
  });

  it('uses a fallback for malformed open-house dates', () => {
    render(<OpenHouses list={[{ id: "bad", OpenHouseDate: "not-a-date" }]} />);

    expect(screen.getByText("Date unavailable")).toBeInTheDocument();
  });
});
