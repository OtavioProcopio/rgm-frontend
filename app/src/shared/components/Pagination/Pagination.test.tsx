/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

afterEach(cleanup);

describe('Pagination', () => {
  const defaultProps = {
    page: 0,
    totalPages: 3,
    totalElements: 55,
    onPrev: vi.fn(),
    onNext: vi.fn(),
  };

  it('renders page info and item count', () => {
    const { container } = render(<Pagination {...defaultProps} itemLabel="modelo(s)" />);
    const root = within(container);

    expect(root.getByText(/página 1 de 3/i)).toBeDefined();
    expect(root.getByText(/55 modelo\(s\)/i)).toBeDefined();
  });

  it('disables Anterior on first page', () => {
    const { container } = render(<Pagination {...defaultProps} page={0} />);

    const prevBtn = within(container).getByRole('button', { name: /anterior/i });
    expect(prevBtn.hasAttribute('disabled')).toBe(true);
  });

  it('disables Próxima on last page', () => {
    const { container } = render(<Pagination {...defaultProps} page={2} totalPages={3} />);

    const nextBtn = within(container).getByRole('button', { name: /próxima/i });
    expect(nextBtn.hasAttribute('disabled')).toBe(true);
  });

  it('enables both buttons on middle page', () => {
    const { container } = render(<Pagination {...defaultProps} page={1} />);

    const prevBtn = within(container).getByRole('button', { name: /anterior/i });
    const nextBtn = within(container).getByRole('button', { name: /próxima/i });
    expect(prevBtn.hasAttribute('disabled')).toBe(false);
    expect(nextBtn.hasAttribute('disabled')).toBe(false);
  });

  it('calls onPrev when Anterior is clicked', async () => {
    const onPrev = vi.fn();
    const { container } = render(<Pagination {...defaultProps} page={1} onPrev={onPrev} />);

    await userEvent.click(within(container).getByRole('button', { name: /anterior/i }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNext when Próxima is clicked', async () => {
    const onNext = vi.fn();
    const { container } = render(<Pagination {...defaultProps} page={0} onNext={onNext} />);

    await userEvent.click(within(container).getByRole('button', { name: /próxima/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('shows totalPages as 1 when 0 to avoid "de 0"', () => {
    const { container } = render(
      <Pagination {...defaultProps} page={0} totalPages={0} totalElements={0} />,
    );

    expect(within(container).getByText(/página 1 de 1/i)).toBeDefined();
  });
});
