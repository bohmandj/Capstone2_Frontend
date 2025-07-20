import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemoLedgerApi from "./api";
import MemoLedgerContext from './MemoLedgerContext';
import NoteForm from "./NoteForm";
import TagButtons from './TagButtons';
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    CardSubtitle,
    CardText,
    CardFooter
} from 'reactstrap';

const NoteFull = () => {
    /* Page to display note data & access btn to open edit form */

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
        if (window.confirm("Are you sure you want to delete your note?\nThis action can not be undone.")) {
            setIsLoading(true);
            const res = await MemoLedgerApi.deleteNote(noteId);
            if (!res.deleted) {
                alert("Error occurred during note deletion. Please try again.")
            }
            setIsLoading(false);
            navigate('/');
        }
    }

    const showNoteData = <>
        <CardTitle tag="h3">
            {note.title}
        </CardTitle>
        <CardSubtitle className='mb-3 text-muted'>
            <small>Last Edited {formatTimestamp(note.editedAt)}</small>
        </CardSubtitle>
        <CardText style={{ whiteSpace: 'pre-wrap' }}>
            {note.noteBody}
        </CardText>
        <CardFooter className='mb-3 text-muted' style={{ borderRadius: "4px" }}>
            <small>Tags:</small> <TagButtons tags={note.tags} />
        </CardFooter>
        <div className="d-flex justify-content-between gap-2 mt-3">
            <Button className="flex-fill me-1" onClick={() => setShowNoteForm(true)}>
                Edit Note
            </Button>
            <Button className="flex-fill ms-1" color="danger" onClick={() => deleteNote(note.noteId)}>
                Delete Note
            </Button>
        </div>
    </>

    return (
        <div className='page-content container col-11 col-md-9 mx-auto my-auto'>
            <Card>
                <CardBody>
                    {showNoteForm
                        ? <NoteForm
                            setShowNoteForm={setShowNoteForm}
                            note={note}
                            setNote={setNote}
                            isNewNote={isNewNote}
                            deleteNote={deleteNote}
                        />
                        : showNoteData
                    }
                </CardBody>
            </Card>
        </div>
    )
}

export default NoteFull;