import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class
 * 
 * Static class tying together methods used to get/send to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't 
 * be any API-aware stuff elsewhere in the frontend.
 * 
 */

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
     */

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

    //////////////////// Note Routes ////////////////////

    /** Get note data from noteId.
     * Returns {userId, title, noteBody, createdAt, editedAt, tags}
     *          where tags is [tagName,...]
     */

    static async getNote(noteId) {
        let res = await this.request(
            `notes/${noteId}`
        );
        return res.note;
    }

    /** Update an existing note, 
     * Returns {userId, title, noteBody, createdAt, editedAt, tags}
     *          where tags is [tagName,...]
     */

    static async updateNote(noteId, title, noteBody) {
        let res = await this.request(
            `notes/${noteId}`,
            { title, noteBody },
            "patch"
        );
        return res.note;
    }
}

export default MemoLedgerApi;