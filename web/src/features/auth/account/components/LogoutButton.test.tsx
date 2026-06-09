import { fireEvent, render, screen } from '@testing-library/react';

import LogoutButton from './LogoutButton';
import { useLogout } from '../../session';

jest.mock('../../session', () => ({
  useLogout: jest.fn(),
}));

const mockedUseLogout = useLogout as jest.MockedFunction<typeof useLogout>;

describe('LogoutButton', () => {
  it('calls the logout flow from account settings', () => {
    const logout = jest.fn();
    mockedUseLogout.mockReturnValue(logout);

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
