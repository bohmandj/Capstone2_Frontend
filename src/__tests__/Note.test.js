import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Note from '../Note';
import MemoLedgerContext from '../MemoLedgerContext';
import MemoLedgerApi from '../api';

// Mock MemoLedgerApi
jest.mock('../api');

// Mock child components to isolate Note.js
jest.mock('../NotePreview', () => {
    return ({ note }) => (
        <div data-testid="NotePreview">NotePreview for {note.title}</div>
    );
});
jest.mock('../NoteFull', () => {
    return ({ note, setShowNoteForm, deleteNote }) => (
        <div data-testid="NoteFull">
            NoteFull for {note.title}
            <button onClick={() => setShowNoteForm(true)}>Edit</button>
            <button onClick={() => deleteNote(note.noteId)}>Delete</button>
        </div>
    );
});
jest.mock('../NoteForm', () => {
    return ({ note, setShowNoteForm, deleteNote, isNewNote }) => (
        <div data-testid="NoteForm">
            NoteForm for {note.title} (New: {isNewNote ? 'true' : 'false'})
            <button onClick={() => setShowNoteForm(false)}>Cancel Form</button>
            <button onClick={() => deleteNote(note.noteId)}>Delete Form</button>
        </div>
    );
});

// Mock context values
const mockCurrentUser = { username: 'testuser' };
const mockSetIsLoading = jest.fn();
const mockNavigate = jest.fn(); // Mock useNavigate hook

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // Import and retain default behavior
    useNavigate: () => mockNavigate, // Override useNavigate
    useParams: jest.fn(), // Mock useParams as well, will be set in individual tests
}));


// Helper function to render Note within context and router with a specific noteId
const renderNoteComponent = (noteId, contextValue, showNotePreview = false) => {
    // Set the mock useParams for the current test
    require('react-router-dom').useParams.mockReturnValue({ noteId });

    return render(
        <MemoLedgerContext.Provider value={contextValue}>
            <MemoryRouter initialEntries={[`/notes/${noteId}`]}>
                {/* Use Routes and Route to simulate actual routing within MemoryRouter */}
                <Routes>
                    <Route
                        path="/notes/:noteId"
                        element={<Note showNotePreview={showNotePreview} />}
                    />
                    {/* Add a route for the root to catch redirects */}
                    <Route path="/" element={<div data-testid="home-page">Home Page Content</div>} />
                </Routes>
            </MemoryRouter>
        </MemoLedgerContext.Provider>
    );
};

describe('Note.js', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementation for MemoLedgerApi.getNote
        MemoLedgerApi.getNote.mockResolvedValue({
            noteId: 'test-note-id-1',
            title: 'Test Note',
            noteBody: 'This is a test note body.',
            editedAt: '2023-01-01T12:00:00.000Z',
            tags: ['tag1', 'tag2'],
            username: 'testuser'
        });
        MemoLedgerApi.deleteNote.mockResolvedValue({ deleted: true });
        jest.spyOn(window, 'confirm').mockReturnValue(true); // Mock window.confirm
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore window.confirm
    });

    // --- Smoke Test ---
    test('renders without crashing', async () => {
        renderNoteComponent('test-note-id-1', {
            currentUser: mockCurrentUser,
            setIsLoading: mockSetIsLoading
        });
        // We need to wait for the async data fetch to complete
        await waitFor(() => {
            expect(screen.getByTestId('NoteFull')).toBeInTheDocument();
        });
    });

    // --- Initial Render (Existing Note) ---
    test('fetches note data and displays NoteFull for an existing note', async () => {
        const mockNote = {
            noteId: 'existing-note-id',
            title: 'Existing Note Title',
            noteBody: 'Body of existing note.',
            editedAt: '2023-02-01T10:30:00.000Z',
            tags: ['existing'],
            username: 'testuser'
        };
        MemoLedgerApi.getNote.mockResolvedValue(mockNote);

        renderNoteComponent('existing-note-id', {
            currentUser: mockCurrentUser,
            setIsLoading: mockSetIsLoading
        });

        // Expect getNote to have been called with the correct ID
        await waitFor(() => {
            expect(MemoLedgerApi.getNote).toHaveBeenCalledTimes(1);
            expect(MemoLedgerApi.getNote).toHaveBeenCalledWith('existing-note-id');
        });

        // Expect NoteFull to be rendered with the correct title
        expect(screen.getByTestId('NoteFull')).toBeInTheDocument();
        expect(screen.getByText(`NoteFull for ${mockNote.title}`)).toBeInTheDocument();
        // Ensure NoteForm and NotePreview are NOT rendered
        expect(screen.queryByTestId('NoteForm')).not.toBeInTheDocument();
        expect(screen.queryByTestId('NotePreview')).not.toBeInTheDocument();
    });

    // --- Initial Render (New Note) ---
    test('fetches new note data and displays NoteForm for a new note', async () => {
        const mockNewNote = {
            noteId: 'new-note-id',
            title: 'Untitled', // Simulate a new note
            noteBody: '',      // Simulate a new note
            editedAt: '2023-07-22T00:00:00.000Z',
            tags: [],
            username: 'testuser'
        };
        MemoLedgerApi.getNote.mockResolvedValue(mockNewNote);

        renderNoteComponent('new-note-id', {
            currentUser: mockCurrentUser,
            setIsLoading: mockSetIsLoading
        });

        await waitFor(() => {
            expect(MemoLedgerApi.getNote).toHaveBeenCalledTimes(1);
            expect(MemoLedgerApi.getNote).toHaveBeenCalledWith('new-note-id');
        });

        // Use findByTestId as it will wait for the element to appear
        const noteFormElement = await screen.findByTestId('NoteForm');
        expect(noteFormElement).toBeInTheDocument();
        expect(screen.getByText(`NoteForm for ${mockNewNote.title} (New: true)`)).toBeInTheDocument();
        // Ensure NoteFull and NotePreview are NOT rendered
        expect(screen.queryByTestId('NoteFull')).not.toBeInTheDocument();
        expect(screen.queryByTestId('NotePreview')).not.toBeInTheDocument();
    });

    // --- Redirect when not logged in ---
    test('redirects to home if no current user', async () => {
        // Ensure getNote is called (it always is on mount for Note.js)
        MemoLedgerApi.getNote.mockResolvedValueOnce({
            noteId: 'some-note',
            title: 'Some Note',
            noteBody: 'Body',
            editedAt: '2023-01-01T12:00:00.000Z',
            tags: [],
            username: 'testuser'
        });

        renderNoteComponent('some-note', {
            currentUser: null, // Simulate no logged-in user
            setIsLoading: mockSetIsLoading
        });

        // Wait for the navigation to occur.
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    // --- Snapshot Test ---
    test('matches snapshot when displaying NoteFull', async () => {
        // Render and get the asFragment utility
        const { asFragment } = renderNoteComponent('test-note-id-1', {
            currentUser: mockCurrentUser,
            setIsLoading: mockSetIsLoading
        });
        // Wait for NoteFull to be in the document before taking snapshot
        const noteFullElement = await screen.findByTestId('NoteFull');
        expect(noteFullElement).toHaveTextContent('NoteFull for Test Note');
        expect(asFragment()).toMatchSnapshot();
    });

    test('matches snapshot when displaying NoteForm (new note)', async () => {
        const mockNewNote = {
            noteId: 'new-note-id',
            title: 'Untitled',
            noteBody: '',
            editedAt: '2023-07-22T00:00:00.000Z',
            tags: [],
            username: 'testuser'
        };
        MemoLedgerApi.getNote.mockResolvedValue(mockNewNote);

        // Render and get the asFragment utility
        const { asFragment } = renderNoteComponent('new-note-id', {
            currentUser: mockCurrentUser,
            setIsLoading: mockSetIsLoading
        });
        // Wait for NoteForm to be in the document before taking snapshot
        const noteFormElement = await screen.findByTestId('NoteForm');
        expect(noteFormElement).toHaveTextContent(`NoteForm for ${mockNewNote.title} (New: true)`);
        expect(asFragment()).toMatchSnapshot();
    });
});