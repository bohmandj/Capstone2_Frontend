import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MemoLedgerApi from "./api";
import MemoLedgerContext from './MemoLedgerContext';
import NotePreview from './NotePreview';
import Loading from './Loading';


const NoteList = ({ limit = 10, tagName = false }) => {
    /* Component to display a list of note previews for 
    * some or all of a user's notes */

    const { currentUser, notes, setNotes } = useContext(MemoLedgerContext);

    const [notesListLoading, setNotesListLoading] = useState(true);

    useEffect(() => {
        const getNotes = async () => {
            setNotesListLoading(true);
            try {
                const notesRes = tagName
                    ? await MemoLedgerApi.searchNotes(tagName, false, true, false)
                    : await MemoLedgerApi.searchNotes();
                if (limit) {
                    const limitedNotes = notesRes.slice(0, limit);
                    setNotes(limitedNotes);
                } else {
                    setNotes(notesRes);
                }
            } catch (err) {
                console.error("Error fetching notes:", err);
            } finally {
                setNotesListLoading(false);
            }
        };

        getNotes();
    }, []);

    if (notesListLoading) return <Loading />;
    if (!currentUser) return <Navigate to={'/'} />;

    return <>
        {notes.map(note => (
            <NotePreview note={note} key={note.noteId} />
        ))}
    </>;
}

export default NoteList;