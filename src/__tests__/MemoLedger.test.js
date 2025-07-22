import React from 'react';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MemoLedger from '../MemoLedger';
import MemoLedgerApi from '../api';
import MemoLedgerContext from '../MemoLedgerContext';

// --- Mocking External Modules ---
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(),
}));
jest.mock('../api', () => ({
    __esModule: true,
    default: {
        loginUser: jest.fn(),
        registerUser: jest.fn(),
        getUser: jest.fn(),
        createNote: jest.fn(),
        token: null, // Initial token state for the API client
    },
}));
jest.mock('../Loading', () => {
    return () => null;
});
jest.mock('../NavBar', () => {
    return () => <nav data-testid="nav-bar">Mock Nav Bar</nav>;
});
jest.mock('../MemoLedgerRoutes', () => {
    return () => <div data-testid="routes-component">Mock Routes</div>;
});

// Mock localStorage to control its behavior in tests
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// THIS IS THE CRITICAL MOCK FOR CAPTURING CONTEXT VALUES
// We completely mock the MemoLedgerContext module to control its Provider.
let capturedContextValue = {}; // This variable will store the 'value' prop passed to the Provider

jest.mock('../MemoLedgerContext', () => {
    const ActualReact = jest.requireActual('react');
    const actualContext = ActualReact.createContext();

    return {
        __esModule: true,
        default: {
            ...actualContext,
            Provider: ({ children, value }) => {
                capturedContextValue = value;
                return <actualContext.Provider value={value}>{children}</actualContext.Provider>;
            },
        },
    };
});


describe('MemoLedger - Safe Extended Tests', () => {
    let resolveGetUserPromise;
    let rejectGetUserPromise;

    beforeEach(() => {
        jest.useFakeTimers();
        localStorageMock.clear();
        jwtDecode.mockClear();
        MemoLedgerApi.getUser.mockClear();
        MemoLedgerApi.token = null;

        capturedContextValue = {};

        MemoLedgerApi.getUser.mockImplementation(() => new Promise((resolve, reject) => {
            resolveGetUserPromise = resolve;
            rejectGetUserPromise = reject;
        }));
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        cleanup();
    });

    const renderMemoLedgerAndResolveLoading = async (initialToken = null, userDataToResolve = false, shouldTokenLoadFail = false) => {
        localStorageMock.getItem.mockReturnValue(initialToken);

        if (initialToken && shouldTokenLoadFail) {
            jwtDecode.mockImplementation(() => {
                throw new Error('Invalid token');
            });
        } else if (initialToken) {
            jwtDecode.mockReturnValue({ username: userDataToResolve.username || 'testuser' });
        }

        render(
            <BrowserRouter>
                <MemoLedger />
            </BrowserRouter>
        );

        await act(async () => {
            jest.runAllTimers();
        });

        if (initialToken && !shouldTokenLoadFail) {
            if (MemoLedgerApi.getUser.mock.calls.length > 0 && resolveGetUserPromise) {
                await act(async () => {
                    resolveGetUserPromise(userDataToResolve);
                    jest.runAllTimers();
                });
            }
        } else {
            await act(async () => {
                jest.runAllTimers();
            });
        }

        await waitFor(() => expect(capturedContextValue.isLoading).toBe(false));

        return { contextValue: capturedContextValue };
    };

    test('MemoLedger component renders without crashing', () => {
        render(
            <BrowserRouter>
                <MemoLedger />
            </BrowserRouter>
        );
        expect(true).toBe(true);
    });

    test('NavBar and MemoLedgerRoutes are rendered after initial load', async () => {
        await renderMemoLedgerAndResolveLoading(null, false, false);
        expect(screen.getByTestId('nav-bar')).toBeInTheDocument();
        expect(screen.getByTestId('routes-component')).toBeInTheDocument();
    });

    <hr />

    test('MemoLedgerContext provides correct initial values (functions/state) when no token', async () => {
        const { contextValue } = await renderMemoLedgerAndResolveLoading(null, false, false);

        expect(contextValue).toBeDefined();
        // Check for functions
        expect(typeof contextValue.setIsLoading).toBe('function');
        expect(typeof contextValue.setCurrentUser).toBe('function');
        expect(typeof contextValue.login).toBe('function');
        expect(typeof contextValue.logout).toBe('function');
        expect(typeof contextValue.register).toBe('function');
        expect(typeof contextValue.createNewNote).toBe('function');
        expect(typeof contextValue.setNotes).toBe('function');

        // Check for initial state values (no token, no user)
        expect(contextValue.isLoading).toBe(false);
        expect(contextValue.currentUser).toBe(false);
        expect(contextValue.token).toBeUndefined();
        expect(Array.isArray(contextValue.notes)).toBe(true);
        expect(contextValue.notes).toEqual([]);
    });

    test('MemoLedgerContext provides correct values when user loaded from valid token', async () => {
        const testToken = 'valid_mock_jwt_token';
        const testUserData = { userId: 1, username: 'testuser', email: 'test@test.com' };

        const { contextValue } = await renderMemoLedgerAndResolveLoading(testToken, testUserData, false);

        expect(contextValue.isLoading).toBe(false);
        expect(contextValue.currentUser).toEqual(testUserData);
        expect(contextValue.token).toBeUndefined();

        // You can still verify that the API client's token was set internally:
        expect(MemoLedgerApi.token).toBe(testToken);
    });

    test('MemoLedgerContext sets isLoading to false after initial load sequence', async () => {
        const { contextValue } = await renderMemoLedgerAndResolveLoading(null, false, false);
        expect(contextValue.isLoading).toBe(false);

        const testToken = 'another_valid_token';
        const testUserData = { username: 'user2' };
        const { contextValue: contextValueWithUser } = await renderMemoLedgerAndResolveLoading(testToken, testUserData, false);
        expect(contextValueWithUser.isLoading).toBe(false);
    });
});