import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemoLedgerApi from "./api";
import MemoLedgerContext from './MemoLedgerContext';
import NotePreview from './NotePreview';
import NoteFull from './NoteFull';
import NoteForm from "./NoteForm";
import {
    Card,
    CardBody,
} from 'reactstrap';

const Note = ({ showNotePreview = false }) => {
    /** Page to hold note related functionality & choose to display
     * between a note-preview, a full-note, or a form to edit a note. */

    const { currentUser, setIsLoading } = useContext(MemoLedgerContext);
    const { noteId } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState({})
    const [isNewNote, setIsNewNote] = useState(false);
    const [showNoteForm, setShowNoteForm] = useState(false);

    useEffect(() => {
        if (!currentUser) navigate('/');

        const getNote = async (noteId) => {
            const noteRes = await MemoLedgerApi.getNote(noteId);
            const isNew = noteRes.title === "Untitled" && !noteRes.noteBody;

            setIsNewNote(isNew);
            setNote(noteRes);
            setShowNoteForm(isNew);
        }
        getNote(noteId);
    }, [noteId]);

    const formatTimestamp = (isoString, useAmPm = true) => {
        const date = new Date(isoString);

        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: useAmPm
        });
    }

    const deleteNote = async (noteId) => {
        if (isNewNote
            ? window.confirm("Leaving without saving will delete your new note. Are you sure you want to leave?")
            : window.confirm("Are you sure you want to delete your note?\nThis action can not be undone.")
        ) {
            setIsLoading(true);
            const res = await MemoLedgerApi.deleteNote(noteId);
            if (!res.deleted) {
                alert("Error occurred during note deletion. Please try again.")
            }
            setIsLoading(false);
            navigate('/');
        }
    }

    return (
        <div className='page-content container col-11 col-md-9 mx-auto my-auto'>
            <Card>
                {showNotePreview &&
                    <NotePreview
                        formatTimestamp={formatTimestamp}
                        note={note}
                    />
                }
                {!showNotePreview && <CardBody>
                    {showNoteForm
                        ? <NoteForm
                            setShowNoteForm={setShowNoteForm}
                            note={note}
                            setNote={setNote}
                            isNewNote={isNewNote}
                            deleteNote={deleteNote}
                        />
                        : <NoteFull
                            formatTimestamp={formatTimestamp}
                            note={note}
                            setShowNoteForm={setShowNoteForm}
                            deleteNote={deleteNote}
                        />
                    }
                </CardBody>
                }
            </Card>
        </div>
    )
}

export default Note;