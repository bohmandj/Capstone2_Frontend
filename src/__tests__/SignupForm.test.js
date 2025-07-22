import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupForm from '../SignupForm';
import MemoLedgerContext from '../MemoLedgerContext';

// Mock the MemoLedgerContext values that SignupForm uses
const mockRegister = jest.fn();
const mockSetIsLoading = jest.fn();
const mockSetCurrentUser = jest.fn();

const mockContextValueLoggedIn = {
    currentUser: { username: 'testuser' }, // Simulate logged-in user
    register: mockRegister,
    setIsLoading: mockSetIsLoading,
    setCurrentUser: mockSetCurrentUser,
};

const mockContextValueLoggedOut = {
    currentUser: null, // Simulate logged-out user
    register: mockRegister,
    setIsLoading: mockSetIsLoading,
    setCurrentUser: mockSetCurrentUser,
};

// Helper function to render SignupForm within the context and router
const renderSignupForm = (contextValue, initialEntries = ['/signup']) => {
    return render(
        <MemoLedgerContext.Provider value={contextValue}>
            <MemoryRouter initialEntries={initialEntries}>
                <SignupForm />
            </MemoryRouter>
        </MemoLedgerContext.Provider>
    );
};

describe('SignupForm', () => {
    // Clear mocks before each test and mock window.alert
    beforeEach(() => {
        mockRegister.mockClear();
        mockSetIsLoading.mockClear();
        mockSetCurrentUser.mockClear();
        jest.spyOn(window, 'alert').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Smoke Test (Logged Out)
    test('renders without crashing when logged out', () => {
        renderSignupForm(mockContextValueLoggedOut);
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    // Smoke Test (Logged In - should redirect)
    test('renders without crashing when logged in and redirects', () => {
        const { asFragment } = renderSignupForm(mockContextValueLoggedIn);
        expect(asFragment()).toMatchSnapshot();
    });

    // Initial Render (Logged Out State)
    test('displays correct initial elements when logged out', () => {
        renderSignupForm(mockContextValueLoggedOut);

        // Check for title
        expect(screen.getByRole('heading', { name: /sign up/i, level: 3 })).toBeInTheDocument();

        // Check for input fields with empty values
        expect(screen.getByLabelText(/username/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');

        // Check for submit button
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    // Successful Registration
    test('calls register function with correct data on successful submission', async () => {
        renderSignupForm(mockContextValueLoggedOut);

        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        // Simulate user input
        fireEvent.change(usernameInput, { target: { name: 'username', value: 'newuser' } });
        fireEvent.change(emailInput, { target: { name: 'email', value: 'new@email.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'newpassword123' } });

        // Simulate form submission
        fireEvent.click(submitButton);

        // Assert that register was called with the correct form data
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledTimes(1);
            expect(mockRegister).toHaveBeenCalledWith({
                username: 'newuser',
                email: 'new@email.com',
                password: 'newpassword123',
            });
        });
    });

    // Incomplete Form Submission (Missing Username)
    test('shows alert and does NOT call register if username is missing', async () => {
        renderSignupForm(mockContextValueLoggedOut);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@email.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        expect(window.alert).toHaveBeenCalledTimes(1);
        expect(window.alert).toHaveBeenCalledWith("All fields must be filled in order to sign up.");
        expect(mockRegister).not.toHaveBeenCalled();
    });

    // Incomplete Form Submission (Missing Email)
    test('shows alert and does NOT call register if email is missing', async () => {
        renderSignupForm(mockContextValueLoggedOut);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(usernameInput, { target: { name: 'username', value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        expect(window.alert).toHaveBeenCalledTimes(1);
        expect(window.alert).toHaveBeenCalledWith("All fields must be filled in order to sign up.");
        expect(mockRegister).not.toHaveBeenCalled();
    });

    // Incomplete Form Submission (Missing Password)
    test('shows alert and does NOT call register if password is missing', async () => {
        renderSignupForm(mockContextValueLoggedOut);

        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(usernameInput, { target: { name: 'username', value: 'testuser' } });
        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@email.com' } });
        fireEvent.click(submitButton);

        expect(window.alert).toHaveBeenCalledTimes(1);
        expect(window.alert).toHaveBeenCalledWith("All fields must be filled in order to sign up.");
        expect(mockRegister).not.toHaveBeenCalled();
    });

    // Snapshot Test
    test('matches snapshot when logged out', () => {
        const { asFragment } = renderSignupForm(mockContextValueLoggedOut);
        expect(asFragment()).toMatchSnapshot();
    });
});