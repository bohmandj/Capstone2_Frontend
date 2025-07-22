import axios from 'axios';
import MemoLedgerApi from '../api';

// Mock the axios library
jest.mock('axios');

// Set a base token for authenticated requests
const TEST_TOKEN = "test_token_for_jest";

describe('MemoLedgerApi', () => {
    // Clear all mocks and reset token before each test
    beforeEach(() => {
        axios.mockClear();
        MemoLedgerApi.token = TEST_TOKEN;
        // Set a default mock implementation for axios that can be overridden
        axios.mockImplementation((config) => {
            // Default success response
            return Promise.resolve({ data: { someData: 'mocked success' } });
        });
    });

    // --- Test the static request method ---
    describe('request', () => {
        test('sends POST request with correct config', async () => {
            axios.mockResolvedValueOnce({ data: { token: TEST_TOKEN } });
            const res = await MemoLedgerApi.request('auth/register', { username: 'newuser', password: 'password' }, 'post');

            expect(axios).toHaveBeenCalledTimes(1);
            expect(axios).toHaveBeenCalledWith({
                url: 'http://localhost:3001/auth/register',
                method: 'post',
                data: { username: 'newuser', password: 'password' },
                params: {}, // POST requests use data, not params
                headers: { Authorization: `Bearer ${TEST_TOKEN}` },
            });
            expect(res).toEqual({ token: TEST_TOKEN });
        });

        test('sends PATCH request with correct config', async () => {
            axios.mockResolvedValueOnce({ data: { user: { email: 'updated@example.com' } } });
            const res = await MemoLedgerApi.request('users/testuser', { email: 'updated@example.com' }, 'patch');

            expect(axios).toHaveBeenCalledTimes(1);
            expect(axios).toHaveBeenCalledWith({
                url: 'http://localhost:3001/users/testuser',
                method: 'patch',
                data: { email: 'updated@example.com' },
                params: {},
                headers: { Authorization: `Bearer ${TEST_TOKEN}` },
            });
            expect(res).toEqual({ user: { email: 'updated@example.com' } });
        });

        test('sends DELETE request with correct config', async () => {
            axios.mockResolvedValueOnce({ data: { deleted: 'testuser' } });
            const res = await MemoLedgerApi.request('users/testuser', {}, 'delete');

            expect(axios).toHaveBeenCalledTimes(1);
            expect(axios).toHaveBeenCalledWith({
                url: 'http://localhost:3001/users/testuser',
                method: 'delete',
                data: {},
                params: {},
                headers: { Authorization: `Bearer ${TEST_TOKEN}` },
            });
            expect(res).toEqual({ deleted: 'testuser' });
        });

        test('handles API errors correctly (single message)', async () => {
            axios.mockRejectedValueOnce({ response: { data: { error: { message: 'Unauthorized' } } } });
            await expect(MemoLedgerApi.request('some/endpoint')).rejects.toEqual(['Unauthorized']);
        });

        test('handles API errors correctly (array of messages)', async () => {
            axios.mockRejectedValueOnce({ response: { data: { error: { message: ['Error 1', 'Error 2'] } } } });
            await expect(MemoLedgerApi.request('another/endpoint')).rejects.toEqual(['Error 1', 'Error 2']);
        });

        test('does not include token if not set', async () => {
            MemoLedgerApi.token = undefined; // Clear the token for this test
            axios.mockResolvedValueOnce({ data: { someData: 'no token' } });
            await MemoLedgerApi.request('public/endpoint');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                headers: { Authorization: `Bearer undefined` }, // This will be sent as the header value
            }));
        });
    });

    // --- Test Individual API Routes ---

    // User Routes
    describe('getUser', () => {
        test('fetches user data by username', async () => {
            const mockUserData = { userId: 1, username: 'testuser', email: 'test@example.com', is_admin: false, notes: [] };
            axios.mockResolvedValueOnce({ data: { user: mockUserData } });

            const user = await MemoLedgerApi.getUser('testuser');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({ url: 'http://localhost:3001/users/testuser' }));
            expect(user).toEqual(mockUserData);
        });
    });

    describe('registerUser', () => {
        test('registers a new user and returns token', async () => {
            axios.mockResolvedValueOnce({ data: { token: 'newly_registered_token' } });

            const token = await MemoLedgerApi.registerUser('newuser', 'password', 'new@example.com');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/auth/register',
                method: 'post',
                data: { username: 'newuser', password: 'password', email: 'new@example.com' }
            }));
            expect(token).toBe('newly_registered_token');
        });
    });

    describe('loginUser', () => {
        test('logs in a user and returns token', async () => {
            axios.mockResolvedValueOnce({ data: { token: 'logged_in_token' } });

            const token = await MemoLedgerApi.loginUser('existinguser', 'password');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/auth/token',
                method: 'post',
                data: { username: 'existinguser', password: 'password' }
            }));
            expect(token).toBe('logged_in_token');
        });
    });

    describe('updateUser', () => {
        test('updates user data', async () => {
            const mockUpdatedUser = { username: 'testuser', email: 'updated@example.com', isAdmin: false };
            axios.mockResolvedValueOnce({ data: { user: mockUpdatedUser } });

            const user = await MemoLedgerApi.updateUser('testuser', 'newpassword', 'updated@example.com');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/users/testuser',
                method: 'patch',
                data: { password: 'newpassword', email: 'updated@example.com' }
            }));
            expect(user).toEqual(mockUpdatedUser);
        });
    });

    describe('deleteUser', () => {
        test('deletes a user', async () => {
            axios.mockResolvedValueOnce({ data: { deleted: 'testuser' } });

            const res = await MemoLedgerApi.deleteUser('testuser');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/users/testuser',
                method: 'delete',
            }));
            expect(res).toEqual({ deleted: 'testuser' });
        });
    });

    describe('getTagsByUser', () => {
        test('fetches tags for a user with no query params', async () => {
            const mockTags = ['tag1', 'tag2'];
            axios.mockResolvedValueOnce({ data: { tags: mockTags } });

            const tags = await MemoLedgerApi.getTagsByUser('testuser');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/users/testuser/tags/' // No query string
            }));
            expect(tags).toEqual(mockTags);
        });

        test('fetches tags for a user with limit and offset', async () => {
            const mockTags = ['tag3', 'tag4'];
            axios.mockResolvedValueOnce({ data: { tags: mockTags } });

            const tags = await MemoLedgerApi.getTagsByUser('testuser', 10, 5);
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/users/testuser/tags/?limit=10&offset=5'
            }));
            expect(tags).toEqual(mockTags);
        });

        test('fetches tags for a user with only limit', async () => {
            const mockTags = ['tag1'];
            axios.mockResolvedValueOnce({ data: { tags: mockTags } });

            const tags = await MemoLedgerApi.getTagsByUser('testuser', 10, undefined);
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/users/testuser/tags/?limit=10'
            }));
            expect(tags).toEqual(mockTags);
        });
    });

    // Note Routes
    describe('createNote', () => {
        test('creates a new note', async () => {
            const mockNewNote = { userId: 1, title: '', noteBody: '', createdAt: 'date', editedAt: 'date', tags: [] };
            axios.mockResolvedValueOnce({ data: { note: mockNewNote } });

            const note = await MemoLedgerApi.createNote(1);
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/',
                method: 'post',
                data: { userId: 1 }
            }));
            expect(note).toEqual(mockNewNote);
        });
    });

    describe('getNote', () => {
        test('fetches a single note by ID', async () => {
            const mockNote = { noteId: 123, title: 'My Note', noteBody: 'Content', tags: [] };
            axios.mockResolvedValueOnce({ data: { note: mockNote } });

            const note = await MemoLedgerApi.getNote(123);
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/123',
                method: 'get'
            }));
            expect(note).toEqual(mockNote);
        });
    });

    describe('updateNote', () => {
        test('updates an existing note', async () => {
            const mockUpdatedNote = { noteId: 123, title: 'Updated Title', noteBody: 'New Body', tags: [] };
            axios.mockResolvedValueOnce({ data: { note: mockUpdatedNote } });

            const note = await MemoLedgerApi.updateNote(123, 'Updated Title', 'New Body');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/123',
                method: 'patch',
                data: { title: 'Updated Title', noteBody: 'New Body' }
            }));
            expect(note).toEqual(mockUpdatedNote);
        });
    });

    describe('deleteNote', () => {
        test('deletes a note', async () => {
            axios.mockResolvedValueOnce({ data: { deleted: 123 } });

            const res = await MemoLedgerApi.deleteNote(123);
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/123',
                method: 'delete',
            }));
            expect(res).toEqual({ deleted: 123 });
        });
    });

    describe('searchNotes', () => {
        test('searches notes with no query parameters', async () => {
            const mockNotes = [{ noteId: 1, title: 'Test', noteBody: 'Content' }];
            axios.mockResolvedValueOnce({ data: { notes: mockNotes } });

            const notes = await MemoLedgerApi.searchNotes();
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/'
            }));
            expect(notes).toEqual(mockNotes);
        });

        test('searches notes with search query', async () => {
            const mockNotes = [{ noteId: 1, title: 'Test', noteBody: 'Content' }];
            axios.mockResolvedValueOnce({ data: { notes: mockNotes } });

            const notes = await MemoLedgerApi.searchNotes('query');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/?q=query'
            }));
            expect(notes).toEqual(mockNotes);
        });

        test('searches notes with all optional parameters', async () => {
            const mockNotes = [{ noteId: 1, title: 'Test', noteBody: 'Content' }];
            axios.mockResolvedValueOnce({ data: { notes: mockNotes } });

            const notes = await MemoLedgerApi.searchNotes('term', true, true, false, 'newest');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/?q=term&sTitle=true&sTags=true&sText=false&order=newest'
            }));
            expect(notes).toEqual(mockNotes);
        });

        test('searches notes with only selected optional parameters', async () => {
            const mockNotes = [{ noteId: 1, title: 'Test', noteBody: 'Content' }];
            axios.mockResolvedValueOnce({ data: { notes: mockNotes } });

            const notes = await MemoLedgerApi.searchNotes(undefined, true, undefined, true, 'oldest');
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/?sTitle=true&sText=true&order=oldest'
            }));
            expect(notes).toEqual(mockNotes);
        });
    });

    describe('addTagsToNote', () => {
        test('adds tags to a note', async () => {
            axios.mockResolvedValueOnce({ data: { added: ['newtag1', 'newtag2'] } });

            const addedTags = await MemoLedgerApi.addTagsToNote(123, ['newtag1', 'newtag2']);
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/123/tags',
                method: 'post',
                data: { tags: ['newtag1', 'newtag2'] }
            }));
            expect(addedTags).toEqual(['newtag1', 'newtag2']);
        });
    });

    describe('removeTagsFromNote', () => {
        test('removes tags from a note', async () => {
            axios.mockResolvedValueOnce({ data: { removed: ['oldtag1'] } });

            const removedTags = await MemoLedgerApi.removeTagsFromNote(123, ['oldtag1']);
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/notes/123/tags',
                method: 'delete',
                data: { tags: ['oldtag1'] }
            }));
            expect(removedTags).toEqual(['oldtag1']);
        });
    });
});