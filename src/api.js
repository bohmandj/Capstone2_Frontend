import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class
 * 
 * Static class tying together methods used to get/send to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't 
 * be any API-aware stuff elsewhere in the frontend.
 * 
 **/

class MemoLedgerApi {
    // the token for interactive with the API will be stored here.
    static token;

    static async request(endpoint, data = {}, method = "get") {
        console.debug("API Call:", endpoint, data, method);

        // pass token in the header
        const url = `${BASE_URL}/${endpoint}`;
        const headers = { Authorization: `Bearer ${MemoLedgerApi.token}` };
        const params = (method === "get")
            ? data
            : {};

        try {
            return (await axios({ url, method, data, params, headers })).data;
        } catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

    // Individual API routes

    //////////////////// User Routes ////////////////////

    /** Get user data from username.
     * Returns { userId, username, email, is_admin, notes }
     *   where notes is [{userId, title, noteBody, createdAt, editedAt, tags}},...]
     *   where tags is [tagName,...]
     **/

    static async getUser(username) {
        let res = await this.request(
            `users/${username}`
        );
        return res.user;
    }

    /** Register a new user, 
     * Returns auth token.
     **/

    static async registerUser(username, password, email) {
        let res = await this.request(
            `auth/register`,
            { username, password, email },
            "post"
        );
        return res.token;
    }

    /** Log in an existing user, 
     * Returns auth token. 
     **/

    static async loginUser(username, password) {
        let res = await this.request(
            `auth/token`,
            { username, password },
            "post"
        );
        return res.token;
    }

    /** Update an existing user, 
     * returns { username, email, isAdmin }
     **/

    static async updateUser(username, password, email) {
        let res = await this.request(
            `users/${username}`,
            { password, email },
            "patch"
        );
        return res.user;
    }

    /** Delete an existing user, 
     * returns { deleted: username }
     **/

    static async deleteUser(username) {
        let res = await this.request(
            `users/${username}`,
            {},
            "delete"
        );
        return res;
    }

    /** Get tags used by user, 
     * Returns { tags: ["tagName", ...]}
     **/

    static async getTagsByUser(username, limit, offset) {
        const queryInputs = [];
        if (limit) queryInputs.push(`limit=${limit}`);
        if (offset) queryInputs.push(`offset=${offset}`);
        const queryStr = queryInputs.length > 0
            ? `?${queryInputs.join("&")}`
            : "";

        let res = await this.request(
            `users/${username}/tags/${queryStr}`
        );
        return res.tags;
    }

    //////////////////// Note Routes ////////////////////

    /** Create a new note and get its data.
     * Returns {userId, title, noteBody, createdAt, editedAt, tags}
     *          where tags is [tagName,...]
     **/

    static async createNote(userId) {
        let res = await this.request(
            `notes/`,
            { userId },
            "post"
        );
        return res.note;
    }

    /** Get note data from noteId.
     * Returns {userId, title, noteBody, createdAt, editedAt, tags}
     *          where tags is [tagName,...]
     **/

    static async getNote(noteId) {
        let res = await this.request(
            `notes/${noteId}`
        );
        return res.note;
    }

    /** Update an existing note, 
     * Returns {userId, title, noteBody, createdAt, editedAt, tags}
     *          where tags is [tagName,...]
     **/

    static async updateNote(noteId, title, noteBody) {
        let res = await this.request(
            `notes/${noteId}`,
            { title, noteBody },
            "patch"
        );
        return res.note;
    }

    /** Delete an existing note, 
     * returns { deleted: noteId }
     **/

    static async deleteNote(noteId) {
        let res = await this.request(
            `notes/${noteId}`,
            {},
            "delete"
        );
        return res;
    }

    /** Search database for notes.
     * 
     * Optional inputs:
     *      "q" - search term string
     *      "sTitle" - bool to include titles in search results
     *      "sTags" - bool to include tagNames in search results
     *      "sText" - bool to include noteBody text in search results
     * 
     * returns {notes: [
     *             { noteId, userId, title, noteBody, 
     *               createdAt, editedAt, tags }, 
     *             ... 
     *         ]}
     **/

    static async searchNotes(q, sTitle, sTags, sText, order) {
        const queryInputs = [];
        if (q) queryInputs.push(`q=${q}`);
        if (sTitle) queryInputs.push(`sTitle=${sTitle}`);
        if (sTags) queryInputs.push(`sTags=${sTags}`);
        if (sText) queryInputs.push(`sTags=${sText}`);
        if (["newest", "oldest", "editTime"].includes(order))
            queryInputs.push(`order=${order}`);
        const queryStr = queryInputs.length > 0
            ? `?${queryInputs.join("&")}`
            : "";

        let res = await this.request(
            `notes/${queryStr}`
        )
        return res.notes;
    }

    /** Add tags to note. 
     * 
     * Returns { added: ["tag1", "tag2"], toNote: noteId }
    */

    static async addTagsToNote(noteId, tags) {
        const res = await this.request(`notes/${noteId}/tags`, { tags }, 'post');
        return res.added;
    }

    /** Remove tags from a note.
     * 
     * Returns { removed: ["tag1", "tag2"], fromNote: noteId }
     */
    static async removeTagsFromNote(noteId, tags) {
        const res = await this.request(
            `notes/${noteId}/tags`,
            { tags },
            "delete"
        );
        return res.removed;
    }
}

export default MemoLedgerApi;