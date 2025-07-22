// src/__tests__/NotesList.test.js
import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, mockNavigate } from 'react-router-dom';
import NotesList from '../NotesList';
import MemoLedgerContext from '../MemoLedgerContext';
import MemoLedgerApi from '../api';

// --- Mocks for Dependencies ---

// Mock MemoLedgerApi
jest.mock('../api');

// Mock child components to isolate NotesList.js
jest.mock('../NotePreview', () => {
    const { useNavigate } = jest.requireActual('react-router-dom');

    return ({ note }) => {
        const navigate = useNavigate();
        return (
            <div data-testid={`NotePreview-${note.noteId}`} onClick={() => navigate(`/notes/${note.noteId}`)}>
                <h3>{note.title}</h3>
                <p>{note.noteBody}</p>
            </div>
        );
    };
});

// Mock Loading component to simplify tests
jest.mock('../Loading', () => {
    return () => <div data-testid="loading-spinner">Loading...</div>;
});

// Mock useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    const mockNavigateFn = jest.fn(); // This is the actual jest.fn() instance created by the mock
    return {
        ...actual,
        useNavigate: () => mockNavigateFn,
        useParams: jest.fn(() => ({})),
        // Export it so we can access it externally and manage its reference
        mockNavigate: mockNavigateFn,
    };
});


// --- Mock Data ---
const mockCurrentUser = { username: 'testuser' };
const mockNotesData = [
    { noteId: '1', title: 'Note One', noteBody: 'Body for note one.', editedAt: '2023-01-01T12:00:00.000Z', tags: ['tagA'] },
    { noteId: '2', title: 'Note Two', noteBody: 'Body for note two.', editedAt: '2023-01-02T12:00:00.000Z', tags: ['tagB'] },
    { noteId: '3', title: 'Note Three', noteBody: 'Body for note three.', editedAt: '2023-01-03T12:00:00.000Z', tags: ['tagA', 'tagC'] },
    { noteId: '4', title: 'Note Four', noteBody: 'Body for note four.', editedAt: '2023-01-04T12:00:00.000Z', tags: ['tagD'] },
    { noteId: '5', title: 'Note Five', noteBody: 'Body for note five.', editedAt: '2023-01-05T12:00:00.000Z', tags: ['tagE'] },
];

// --- Reactive Mock Context Provider ---
const MockContextProvider = ({ children, initialNotes = [], initialCurrentUser = null, initialIsLoading = false }) => {
    const [notes, setNotes] = useState(initialNotes);
    const [isLoading, setIsLoading] = useState(initialIsLoading);

    return (
        <MemoLedgerContext.Provider value={{
            currentUser: initialCurrentUser,
            notes,
            setNotes,
            isLoading,
            setIsLoading
        }}>
            {children}
        </MemoLedgerContext.Provider>
    );
};

// Helper function to render NotesList within context and router
const renderNotesListComponent = (props = {}, initialEntries = ['/notes'], contextOverrides = {}) => {
    const defaultContext = {
        initialCurrentUser: mockCurrentUser,
        initialNotes: [],
        initialIsLoading: false,
    };
    const finalContextOverrides = { ...defaultContext, ...contextOverrides };

    return render(
        <MockContextProvider {...finalContextOverrides}>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/notes" element={<NotesList {...props} />} />
                    <Route path="/notes/:noteId" element={<div data-testid="note-detail-page">Note Detail Page</div>} />
                    <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
                </Routes>
            </MemoryRouter>
        </MockContextProvider>
    );
};

// --- Test Suite for NotesList.js ---
describe('NotesList.js', () => {
    beforeEach(() => {
        jest.resetModules();
        const { mockNavigate: freshMockNavigate } = require('react-router-dom');
        freshMockNavigate.mockClear();
        Object.assign(mockNavigate, freshMockNavigate);

        // Set up other mocks after modules are reset and react-router-dom mock is refreshed
        MemoLedgerApi.searchNotes.mockResolvedValue(mockNotesData);

        // Enable fake timers for the entire test suite
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Restore real timers after each test
        jest.useRealTimers();
    });

    // --- Basic Rendering and Data Fetching ---

    test('renders without crashing when logged in', async () => {
        renderNotesListComponent();

        await waitFor(() => {
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
            expect(screen.getByText('Note One')).toBeInTheDocument();
        });
        expect(MemoLedgerApi.searchNotes).toHaveBeenCalledTimes(1);
    });

    test('fetches and displays notes for a user', async () => {
        renderNotesListComponent();

        await waitFor(() => {
            expect(MemoLedgerApi.searchNotes).toHaveBeenCalledTimes(1);
            expect(MemoLedgerApi.searchNotes).toHaveBeenCalledWith();
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Note One')).toBeInTheDocument();
        expect(screen.getByText('Note Two')).toBeInTheDocument();
        expect(screen.getByText('Note Three')).toBeInTheDocument();
        expect(screen.getByText('Note Four')).toBeInTheDocument();
        expect(screen.getByText('Note Five')).toBeInTheDocument();
    });

    test('displays empty state when no notes exist', async () => {
        MemoLedgerApi.searchNotes.mockResolvedValue([]);

        renderNotesListComponent();

        await waitFor(() => {
            expect(MemoLedgerApi.searchNotes).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Note One')).not.toBeInTheDocument();
        expect(screen.queryByText('Note Two')).not.toBeInTheDocument();
    });

    test('handles loading state', async () => {
        let resolveApiCall;
        MemoLedgerApi.searchNotes.mockReturnValue(
            new Promise((resolve) => {
                resolveApiCall = resolve;
            })
        );

        renderNotesListComponent();

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

        resolveApiCall(mockNotesData);
        await waitFor(() => {
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
            expect(screen.getByText('Note One')).toBeInTheDocument();
        });
    });

    // --- Testing with limit prop ---
    test('fetches and displays limited number of notes when limit prop is provided', async () => {
        renderNotesListComponent(
            { limit: 2 }
        );

        await waitFor(() => {
            expect(MemoLedgerApi.searchNotes).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Note One')).toBeInTheDocument();
        expect(screen.getByText('Note Two')).toBeInTheDocument();
        expect(screen.queryByText('Note Three')).not.toBeInTheDocument();
        expect(screen.queryByText('Note Four')).not.toBeInTheDocument();
        expect(screen.queryByText('Note Five')).not.toBeInTheDocument();
    });

    // --- Testing with tagName prop ---
    test('fetches notes filtered by tagName when tagName prop is provided', async () => {
        MemoLedgerApi.searchNotes.mockImplementation((tagName, _, __, ___) => {
            if (tagName === 'tagA') {
                return Promise.resolve(mockNotesData.filter(note => note.tags.includes('tagA')));
            }
            return Promise.resolve(mockNotesData);
        });

        renderNotesListComponent(
            { tagName: 'tagA' }
        );

        await waitFor(() => {
            expect(MemoLedgerApi.searchNotes).toHaveBeenCalledTimes(1);
            expect(MemoLedgerApi.searchNotes).toHaveBeenCalledWith('tagA', false, true, false);
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Note One')).toBeInTheDocument();
        expect(screen.getByText('Note Three')).toBeInTheDocument();
        expect(screen.queryByText('Note Two')).not.toBeInTheDocument();
        expect(screen.queryByText('Note Four')).not.toBeInTheDocument();
        expect(screen.queryByText('Note Five')).not.toBeInTheDocument();
    });

    // --- Error Handling ---
    test('displays error message on API failure', async () => {
        const errorMessage = 'Failed to fetch notes.';
        MemoLedgerApi.searchNotes.mockRejectedValueOnce(new Error(errorMessage));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        renderNotesListComponent();

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching notes:", expect.any(Error));
        });

        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        expect(screen.queryByText('Note One')).not.toBeInTheDocument();

        consoleErrorSpy.mockRestore();
    });

    // --- Snapshot Tests ---
    test('matches snapshot when displaying a list of notes', async () => {
        const { asFragment } = renderNotesListComponent();

        await waitFor(() => {
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
            expect(screen.getByText('Note One')).toBeInTheDocument();
        });

        expect(asFragment()).toMatchSnapshot();
    });

    test('matches snapshot when displaying empty notes state', async () => {
        MemoLedgerApi.searchNotes.mockResolvedValue([]);

        const { asFragment } = renderNotesListComponent();

        await waitFor(() => {
            expect(MemoLedgerApi.searchNotes).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        });

        expect(asFragment()).toMatchSnapshot();
    });
});