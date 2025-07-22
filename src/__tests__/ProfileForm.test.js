import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileForm from '../ProfileForm';
import MemoLedgerContext from '../MemoLedgerContext';
import MemoLedgerApi from '../api';

// Mock API calls
jest.mock('../api');

// Mock context values
const mockCurrentUser = {
    username: 'testuser',
    email: 'test@user.com'
};

const mockSetCurrentUser = jest.fn();
const mockSetIsLoading = jest.fn();
const mockSetShowProfileForm = jest.fn();

const mockContextValueLoggedIn = {
    currentUser: mockCurrentUser,
    setCurrentUser: mockSetCurrentUser,
    setIsLoading: mockSetIsLoading,
};

const mockContextValueLoggedOut = {
    currentUser: null,
    setCurrentUser: mockSetCurrentUser,
    setIsLoading: mockSetIsLoading,
};

// Helper function to render ProfileForm within context and router
const renderProfileForm = (contextValue, props = {}, initialEntries = ['/profile']) => {
    return render(
        <MemoLedgerContext.Provider value={contextValue}>
            <MemoryRouter initialEntries={initialEntries}>
                <ProfileForm {...props} />
            </MemoryRouter>
        </MemoLedgerContext.Provider>
    );
};

describe('ProfileForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing when logged in', () => {
        renderProfileForm(mockContextValueLoggedIn, { setShowProfileForm: mockSetShowProfileForm });
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    test('displays correct initial elements when logged in', () => {
        renderProfileForm(mockContextValueLoggedIn, { setShowProfileForm: mockSetShowProfileForm });

        // Username should be disabled and show current username in placeholder
        const usernameInput = screen.getByLabelText(/username:/i);
        expect(usernameInput).toBeInTheDocument();
        expect(usernameInput).toHaveAttribute('placeholder', mockCurrentUser.username);
        expect(usernameInput).toBeDisabled();

        // Email should show current email
        const emailInput = screen.getByLabelText(/email:/i);
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveValue(mockCurrentUser.email);

        // Password fields should be empty and of type password
        const newPasswordInput = screen.getByLabelText('New Password:');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password:');

        expect(newPasswordInput).toHaveAttribute('type', 'password');
        expect(newPasswordInput).toHaveValue('');
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveValue('');

        // Buttons
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('calls updateUser and updates context on successful submission', async () => {
        MemoLedgerApi.updateUser.mockResolvedValue({ username: 'testuser', email: 'new@email.com' });

        renderProfileForm(mockContextValueLoggedIn, { setShowProfileForm: mockSetShowProfileForm });

        const emailInput = screen.getByDisplayValue(mockCurrentUser.email);
        const passwordInput = screen.getByLabelText('New Password:');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password:');
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(emailInput, { target: { value: 'new@email.com' } });
        fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetIsLoading).toHaveBeenCalledWith(true);
            expect(MemoLedgerApi.updateUser).toHaveBeenCalledWith(
                mockCurrentUser.username,
                'newpassword',
                'new@email.com'
            );
            expect(mockSetCurrentUser).toHaveBeenCalledWith({
                ...mockCurrentUser,
                email: 'new@email.com'
            });
            expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        });
    });

    test('shows error and prevents submission for invalid email', async () => {
        renderProfileForm(mockContextValueLoggedIn, { setShowProfileForm: mockSetShowProfileForm });

        const emailInput = screen.getByLabelText(/email:/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);

        expect(await screen.findByText('Invalid Email')).toBeInTheDocument();

        fireEvent.click(submitButton);

        expect(MemoLedgerApi.updateUser).not.toHaveBeenCalled();
    });

    test('shows error and prevents submission for short password', async () => {
        renderProfileForm(mockContextValueLoggedIn, { setShowProfileForm: mockSetShowProfileForm });

        const passwordInput = screen.getByLabelText('New Password:');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password:');
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.blur(passwordInput);
        fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
        fireEvent.blur(confirmPasswordInput);

        expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();

        fireEvent.click(submitButton);

        expect(MemoLedgerApi.updateUser).not.toHaveBeenCalled();
    });

    test('shows error and prevents submission for mismatched passwords', async () => {
        renderProfileForm(mockContextValueLoggedIn, { setShowProfileForm: mockSetShowProfileForm });

        const passwordInput = screen.getByLabelText('New Password:');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password:');
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(passwordInput, { target: { value: 'longenough' } });
        fireEvent.blur(passwordInput);
        fireEvent.change(confirmPasswordInput, { target: { value: 'nomatch' } });
        fireEvent.blur(confirmPasswordInput);

        expect(await screen.findByText('Passwords must match')).toBeInTheDocument();

        fireEvent.click(submitButton);

        expect(MemoLedgerApi.updateUser).not.toHaveBeenCalled();
    });

    test('resets form and calls setShowProfileForm(false) on cancel', async () => {
        renderProfileForm(mockContextValueLoggedIn, { setShowProfileForm: mockSetShowProfileForm });

        const emailInput = screen.getByDisplayValue(mockCurrentUser.email);
        const passwordInput = screen.getByLabelText('New Password:');
        const cancelButton = screen.getByRole('button', { name: /cancel/i });

        // Change some data
        fireEvent.change(emailInput, { target: { value: 'changed@email.com' } });
        fireEvent.change(passwordInput, { target: { value: 'somenewpassword' } });

        // Click cancel
        fireEvent.click(cancelButton);

        // Expect form data to revert to initial state
        await waitFor(() => {
            expect(emailInput).toHaveValue(mockCurrentUser.email);
            expect(passwordInput).toHaveValue('');
            expect(mockSetShowProfileForm).toHaveBeenCalledWith(false);
        });

        // Ensure updateUser was NOT called
        expect(MemoLedgerApi.updateUser).not.toHaveBeenCalled();
    });

    test('matches snapshot when logged in', () => {
        const { asFragment } = renderProfileForm(mockContextValueLoggedIn, { setShowProfileForm: mockSetShowProfileForm });
        expect(asFragment()).toMatchSnapshot();
    });
});