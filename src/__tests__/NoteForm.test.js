import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import NoteForm from '../NoteForm';
import MemoLedgerApi from '../api';
import MemoLedgerContext from '../MemoLedgerContext';

// Mock react-router-dom's useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock MemoLedgerApi
jest.mock('../api', () => ({
    updateNote: jest.fn(),
    addTagsToNote: jest.fn(),
    removeTagsFromNote: jest.fn(),
    deleteNote: jest.fn(),
}));

// Mock TagInput component
jest.mock('../TagInput', () => {
    const React = require('react');

    return ({ tags, setTags, label }) => {
        const [inputValue, setInputValue] = React.useState('');
        const handleAddTag = () => {
            if (inputValue.trim() && !tags.includes(inputValue.trim())) {
                setTags([...tags, inputValue.trim()]);
                setInputValue('');
            }
        };

        return (
            <div data-testid="tag-input-mock">
                <label htmlFor="tagInputMock">{label}</label>
                <input
                    id="tagInputMock"
                    data-testid="tag-add-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                    onClick={handleAddTag}
                    data-testid="add-tag-button"
                >
                    Add Tag
                </button>
                <div data-testid="current-tags-display">
                    {tags.map(tag => (
                        <span key={tag} data-testid={`tag-${tag}`}>{tag}</span>
                    ))}
                </div>
            </div>
        );
    };
});


const mockSetIsLoading = jest.fn();
const mockSetNote = jest.fn();
const mockDeleteNote = jest.fn();
const mockSetShowNoteForm = jest.fn();

const renderNoteFormComponent = ({
    note,
    setNote = mockSetNote,
    setShowNoteForm = mockSetShowNoteForm,
    deleteNote = mockDeleteNote,
    isNewNote = false,
    currentUser = { username: 'testuser' },
    setIsLoading = mockSetIsLoading,
}) => {
    // Reset mocks for each render
    mockNavigate.mockClear();
    mockSetIsLoading.mockClear();
    mockSetNote.mockClear();
    mockDeleteNote.mockClear();
    mockSetShowNoteForm.mockClear();
    MemoLedgerApi.updateNote.mockClear();
    MemoLedgerApi.addTagsToNote.mockClear();
    MemoLedgerApi.removeTagsFromNote.mockClear();
    MemoLedgerApi.deleteNote.mockClear();

    return render(
        <BrowserRouter>
            <MemoLedgerContext.Provider value={{ currentUser, setIsLoading }}>
                <NoteForm
                    note={note}
                    setNote={setNote}
                    setShowNoteForm={setShowNoteForm}
                    deleteNote={deleteNote}
                    isNewNote={isNewNote}
                />
            </MemoLedgerContext.Provider>
        </BrowserRouter>
    );
};

describe('NoteForm.js', () => {
    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
    });

    // --- RENDER TESTS ---
    test('renders "New Note" form correctly when isNewNote is true', () => {
        // Provide a noteId for new notes so deleteNote can be called in handleCancel if needed
        renderNoteFormComponent({ isNewNote: true, note: { noteId: 99, title: '', noteBody: '', tags: [] } });
        expect(screen.getByText('New Note')).toBeInTheDocument();
        expect(screen.getByLabelText('Title:')).toBeInTheDocument();
        expect(screen.getByLabelText('Note Body:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByTestId('tag-input-mock')).toBeInTheDocument();
    });

    test('renders "Edit Note" form with existing note data', () => {
        const initialNote = {
            noteId: 1,
            title: 'Existing Title',
            noteBody: 'Existing Body',
            tags: ['tagA', 'tagB']
        };
        renderNoteFormComponent({ isNewNote: false, note: initialNote });
        expect(screen.getByText('Edit Note')).toBeInTheDocument();
        expect(screen.getByLabelText('Title:')).toHaveValue('Existing Title');
        expect(screen.getByLabelText('Note Body:')).toHaveValue('Existing Body');
        expect(screen.getByTestId('tag-input-mock')).toBeInTheDocument();
        expect(screen.getByTestId('current-tags-display')).toHaveTextContent('tagAtagB');
    });

    // --- FORM DATA HANDLING TESTS ---
    test('updates formData when title input changes', () => {
        renderNoteFormComponent({ isNewNote: true, note: { noteId: 99, title: '', noteBody: '', tags: [] } });
        const titleInput = screen.getByLabelText('Title:');
        fireEvent.change(titleInput, { target: { name: 'title', value: 'New Title' } });
        expect(titleInput).toHaveValue('New Title');
    });

    test('updates formData when noteBody input changes', () => {
        renderNoteFormComponent({ isNewNote: true, note: { noteId: 99, title: '', noteBody: '', tags: [] } });
        const noteBodyInput = screen.getByLabelText('Note Body:');
        fireEvent.change(noteBodyInput, { target: { name: 'noteBody', value: 'New Body Content' } });
        expect(noteBodyInput).toHaveValue('New Body Content');
    });

    // --- VALIDATION TESTS ---

    test('prevents submission if title is empty', async () => {
        renderNoteFormComponent({ isNewNote: true, note: { noteId: 99, title: '', noteBody: '', tags: [] } });
        const titleInput = screen.getByLabelText('Title:');
        fireEvent.change(titleInput, { target: { name: 'title', value: '' } });

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // Expect API calls not to have been made
        expect(MemoLedgerApi.updateNote).not.toHaveBeenCalled();
        expect(MemoLedgerApi.addTagsToNote).not.toHaveBeenCalled();
        expect(MemoLedgerApi.removeTagsFromNote).not.toHaveBeenCalled();
        expect(mockSetNote).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();

        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    });

    // --- CRUD OPERATION TESTS ---

    test('calls MemoLedgerApi.updateNote with correct data on submit', async () => {
        const initialNote = {
            noteId: 1,
            title: 'Original Title',
            noteBody: 'Original Body',
            tags: ['existingTag']
        };
        // Mock the return value of updateNote. The original code requires this for `returnedNote.title` etc.
        MemoLedgerApi.updateNote.mockResolvedValueOnce({
            id: initialNote.noteId,
            title: 'Updated Title',
            noteBody: 'Updated Body',
            editedAt: "2025-07-22T10:00:00Z"
        });
        // Ensure other API calls that might be made are mocked as well
        MemoLedgerApi.addTagsToNote.mockResolvedValueOnce([]);
        MemoLedgerApi.removeTagsFromNote.mockResolvedValueOnce([]);


        renderNoteFormComponent({ isNewNote: false, note: initialNote });

        const titleInput = screen.getByLabelText('Title:');
        fireEvent.change(titleInput, { target: { name: 'title', value: 'Updated Title' } });

        const noteBodyInput = screen.getByLabelText('Note Body:');
        fireEvent.change(noteBodyInput, { target: { name: 'noteBody', value: 'Updated Body' } });

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(MemoLedgerApi.updateNote).toHaveBeenCalled();
        expect(MemoLedgerApi.updateNote).toHaveBeenCalledWith(
            initialNote.noteId,
            'Updated Title',
            'Updated Body'
        );
        expect(mockSetIsLoading).toHaveBeenCalled();
        expect(mockSetIsLoading.mock.calls.length).toBeGreaterThan(0);
    });

    test('updates note state and navigates after successful submission', async () => {
        const initialNote = {
            noteId: 1,
            title: 'Old Title',
            noteBody: 'Old Body',
            tags: []
        };
        const returnedNoteFromApi = {
            id: initialNote.noteId,
            title: 'New Title',
            noteBody: 'New Body',
            editedAt: "2025-07-22T10:00:00Z"
        };
        MemoLedgerApi.updateNote.mockResolvedValueOnce(returnedNoteFromApi);
        MemoLedgerApi.addTagsToNote.mockResolvedValueOnce([]);
        MemoLedgerApi.removeTagsFromNote.mockResolvedValueOnce([]);

        renderNoteFormComponent({ isNewNote: false, note: initialNote });

        const titleInput = screen.getByLabelText('Title:');
        fireEvent.change(titleInput, { target: { name: 'title', value: 'New Title' } });
        const noteBodyInput = screen.getByLabelText('Note Body:');
        fireEvent.change(noteBodyInput, { target: { name: 'noteBody', value: 'New Body' } });

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockSetNote).toHaveBeenCalled();
        expect(mockSetNote.mock.calls.length).toBeGreaterThan(0);
        expect(mockSetNote).toHaveBeenCalledWith({
            ...initialNote, // Spread initial note to ensure noteId, etc. are retained
            title: returnedNoteFromApi.title,
            noteBody: returnedNoteFromApi.noteBody,
            editedAt: returnedNoteFromApi.editedAt
        });
        expect(mockNavigate).toHaveBeenCalled();
        expect(mockNavigate.mock.calls.length).toBeGreaterThan(0);
        expect(mockNavigate).toHaveBeenCalledWith(`/notes/${initialNote.noteId}`);
    });


    test('calls MemoLedgerApi.addTagsToNote and removeTagsFromNote correctly on submit', async () => {
        const initialNote = {
            noteId: 1,
            title: 'Test Note',
            noteBody: 'Test Body',
            tags: ['tagA', 'tagB']
        };

        // Use mockImplementation to ensure `MemoLedgerApi.updateNote` always returns a valid object.
        MemoLedgerApi.updateNote.mockImplementation(async (noteId, title, noteBody) => {
            return {
                id: noteId,
                title: title,
                noteBody: noteBody,
                editedAt: "2025-07-22T10:00:00Z", // Mock a fixed editedAt timestamp
            };
        });

        // Ensure these mocks are also robust, though they should only be called once if logic is correct
        MemoLedgerApi.addTagsToNote.mockResolvedValue([]);
        MemoLedgerApi.removeTagsFromNote.mockResolvedValue([]);

        renderNoteFormComponent({
            isNewNote: false,
            note: initialNote,
        });

        const tagInput = screen.getByTestId('tag-add-input');
        const addTagButton = screen.getByTestId('add-tag-button');

        // Add 'tagC'
        fireEvent.change(tagInput, { target: { value: 'tagC' } });
        fireEvent.click(addTagButton);
        // Add 'tagD'
        fireEvent.change(tagInput, { target: { value: 'tagD' } });
        fireEvent.click(addTagButton);

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /submit/i });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(MemoLedgerApi.updateNote).toHaveBeenCalled();
        expect(MemoLedgerApi.updateNote).toHaveBeenCalledWith(
            initialNote.noteId,
            initialNote.title,
            initialNote.noteBody
        );

        expect(MemoLedgerApi.addTagsToNote).toHaveBeenCalled();
        expect(MemoLedgerApi.addTagsToNote).toHaveBeenCalledWith(initialNote.noteId, ['tagC', 'tagD']);

        expect(MemoLedgerApi.removeTagsFromNote).not.toHaveBeenCalled();

        expect(mockSetNote).toHaveBeenCalled();
        expect(mockSetNote.mock.calls.length).toBeGreaterThan(0);

        expect(mockSetNote).toHaveBeenLastCalledWith(expect.any(Function));

        const intermediateNoteState = {
            ...initialNote,
            title: initialNote.title,
            noteBody: initialNote.noteBody,
            editedAt: "2025-07-22T10:00:00Z"
        };

        const lastSetNoteCall = mockSetNote.mock.calls[mockSetNote.mock.calls.length - 1][0];

        expect(typeof lastSetNoteCall).toBe('function');

        const finalNoteState = lastSetNoteCall(intermediateNoteState);

        expect(finalNoteState.tags).toEqual(expect.arrayContaining(['tagA', 'tagB', 'tagC', 'tagD']));
        expect(finalNoteState.tags.length).toBe(4);

        expect(mockSetIsLoading).toHaveBeenCalled();
        expect(mockSetIsLoading.mock.calls.length).toBeGreaterThan(0);
    });

    // --- CANCEL/DELETE TESTS ---
    test('resets form data and hides form when "Cancel" is clicked in edit mode', async () => {
        const initialNote = {
            noteId: 1,
            title: 'Original Title',
            noteBody: 'Original Body',
            tags: []
        };
        renderNoteFormComponent({
            isNewNote: false,
            note: initialNote,
        });

        const titleInput = screen.getByLabelText('Title:');
        fireEvent.change(titleInput, { target: { name: 'title', value: 'Changed Title' } });
        expect(titleInput).toHaveValue('Changed Title');

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await act(async () => {
            fireEvent.click(cancelButton);
        });

        expect(mockDeleteNote).not.toHaveBeenCalled();
        expect(mockSetShowNoteForm).toHaveBeenCalled();
        expect(mockSetShowNoteForm.mock.calls.length).toBeGreaterThan(0);
        expect(mockSetShowNoteForm).toHaveBeenCalledWith(false);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockSetNote).not.toHaveBeenCalled();
        expect(titleInput).toHaveValue(initialNote.title);
    });

    test('calls deleteNote and hides form when "Cancel" is clicked in new note mode', async () => {
        const newNoteId = 99;
        const newNote = { noteId: newNoteId, title: '', noteBody: '', tags: [] };

        renderNoteFormComponent({
            isNewNote: true,
            note: newNote,
        });

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await act(async () => {
            fireEvent.click(cancelButton);
        });

        expect(mockDeleteNote).toHaveBeenCalled();
        expect(mockDeleteNote.mock.calls.length).toBeGreaterThan(0);
        expect(mockDeleteNote).toHaveBeenCalledWith(newNoteId);

        expect(mockSetShowNoteForm).not.toHaveBeenCalled();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockSetNote).not.toHaveBeenCalled();
    });

    // --- SNAPSHOT TESTS ---
    test('matches snapshot for new note form', () => {
        const { asFragment } = renderNoteFormComponent({
            isNewNote: true,
            note: { noteId: 99, title: '', noteBody: '', tags: [] }
        });
        expect(asFragment()).toMatchSnapshot();
    });

    test('matches snapshot for edit note form', () => {
        const initialNote = {
            noteId: 1,
            title: 'Existing Title',
            noteBody: 'Existing Body',
            tags: ['tagA', 'tagB']
        };
        const { asFragment } = renderNoteFormComponent({ isNewNote: false, note: initialNote });
        expect(asFragment()).toMatchSnapshot();
    });
});