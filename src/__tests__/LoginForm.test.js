import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom'; // Import MemoryRouter for isolated routing
import LoginForm from '../LoginForm';
import MemoLedgerContext from '../MemoLedgerContext';

// Mock the MemoLedgerContext values that LoginForm uses
const mockLogin = jest.fn();
const mockSetIsLoading = jest.fn(); // Mock setIsLoading as it's used by login indirectly
const mockSetCurrentUser = jest.fn(); // Mock setCurrentUser if needed by other components using the context

const mockContextValueLoggedIn = {
    currentUser: { username: 'testuser' }, // Simulate logged-in user
    login: mockLogin,
    setIsLoading: mockSetIsLoading,
    setCurrentUser: mockSetCurrentUser,
};

const mockContextValueLoggedOut = {
    currentUser: null, // Simulate logged-out user
    login: mockLogin,
    setIsLoading: mockSetIsLoading,
    setCurrentUser: mockSetCurrentUser,
};

// Helper function to render LoginForm within the context and router
const renderLoginForm = (contextValue, initialEntries = ['/login']) => {
    return render(
        <MemoLedgerContext.Provider value={contextValue}>
            <MemoryRouter initialEntries={initialEntries}>
                <LoginForm />
            </MemoryRouter>
        </MemoLedgerContext.Provider>
    );
};

describe('LoginForm', () => {
    // Clear mocks before each test to ensure isolation
    beforeEach(() => {
        mockLogin.mockClear();
        mockSetIsLoading.mockClear();
        mockSetCurrentUser.mockClear();
        jest.spyOn(window, 'alert').mockImplementation(() => { }); // Mock window.alert
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore window.alert
    });

    // Smoke Test
    // Renders without crashing when logged out
    test('renders without crashing when logged out', () => {
        renderLoginForm(mockContextValueLoggedOut);
        expect(screen.getByText('Log In')).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    // Renders without crashing when logged in (should redirect)
    test('renders without crashing when logged in and redirects', () => {
        const { asFragment } = renderLoginForm(mockContextValueLoggedIn);
        expect(asFragment()).toMatchSnapshot();
    });

    // Initial Render (Logged Out State)
    test('displays correct initial elements when logged out', () => {
        renderLoginForm(mockContextValueLoggedOut);

        // Check for title
        expect(screen.getByRole('heading', { name: /log in/i, level: 3 })).toBeInTheDocument();

        // Check for input fields
        expect(screen.getByLabelText(/username/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');

        // Check for submit button
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    // Successful Login
    test('calls login function with correct data on successful submission', async () => {
        renderLoginForm(mockContextValueLoggedOut);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        // Simulate user input
        fireEvent.change(usernameInput, { target: { name: 'username', value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });

        // Simulate form submission
        fireEvent.click(submitButton);

        // Assert that login was called with the correct form data
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledTimes(1);
            expect(mockLogin).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'password123',
            });
        });
    });

    // Incomplete Form Submission (Missing Username)
    test('shows alert and does NOT call login if username is missing', async () => {
        renderLoginForm(mockContextValueLoggedOut);

        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        // Assert that an alert was shown
        expect(window.alert).toHaveBeenCalledTimes(1);
        expect(window.alert).toHaveBeenCalledWith("Valid username & password must both be provided to log in.");

        // Assert that login was NOT called
        expect(mockLogin).not.toHaveBeenCalled();
    });

    // Incomplete Form Submission (Missing Password)
    test('shows alert and does NOT call login if password is missing', async () => {
        renderLoginForm(mockContextValueLoggedOut);

        const usernameInput = screen.getByLabelText(/username/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(usernameInput, { target: { name: 'username', value: 'testuser' } });
        fireEvent.click(submitButton);

        // Assert that an alert was shown
        expect(window.alert).toHaveBeenCalledTimes(1);
        expect(window.alert).toHaveBeenCalledWith("Valid username & password must both be provided to log in.");

        // Assert that login was NOT called
        expect(mockLogin).not.toHaveBeenCalled();
    });

    // Snapshot Test
    test('matches snapshot when logged out', () => {
        const { asFragment } = renderLoginForm(mockContextValueLoggedOut);
        expect(asFragment()).toMatchSnapshot();
    });
});