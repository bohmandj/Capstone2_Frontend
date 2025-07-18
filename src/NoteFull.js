import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemoLedgerApi from "./api";
import MemoLedgerContext from './MemoLedgerContext';
import NoteForm from "./NoteForm";
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    CardSubtitle,
    CardText,
    CardFooter
} from 'reactstrap';

const Note = ({ deleteNote }) => {
    /* Page to display note data & access btn to open edit form */

    const { currentUser } = useContext(MemoLedgerContext);
    const { noteId } = useParams();

    const [note, setNote] = useState({})
    const [showNoteForm, setShowNoteForm] = useState(false);

    useEffect(() => {
        const getNote = async (noteId) => {
            const note = await MemoLedgerApi.getNote(noteId);
            setNote(note);
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

    const useRenderTagButtons = (tags = []) => {
        const navigate = useNavigate();

        return (tags = []) => tags.map((tag, idx) => (
            <span key={tag}>
                <Button
                    size="sm"
                    color="link"
                    className="p-0 ms-0 me-2 my-2 d-inline align-baseline"
                    onClick={() => navigate(`/tags/${encodeURIComponent(tag)}`)}
                >
                    {tag}
                </Button>
            </span>
        ));
    };

    const deletionWarning = () => {
        if (window.confirm("Are you sure you want to delete your note?\nThis action can not be undone.")) deleteNote(currentUser.username);
    }

    const showNoteData = <>
        <CardTitle tag="h3">
            {note.title}
        </CardTitle>
        <CardSubtitle className='mb-3 text-muted'>
            <small>Last Edited {formatTimestamp(note.editedAt)}</small>
        </CardSubtitle>
        <CardText>
            {note.noteBody}
        </CardText>
        <CardFooter className='mb-3' style={{ borderRadius: "4px" }}>
            {useRenderTagButtons(note.tags)}
        </CardFooter>
        <div className="d-flex justify-content-between gap-2 mt-3">
            <Button className="flex-fill me-1" onClick={() => setShowNoteForm(true)}>
                Edit Note
            </Button>
            <Button className="flex-fill ms-1" color="danger" onClick={() => deletionWarning()}>
                Delete Note
            </Button>
        </div>
    </>

    return (
        <div className='page-content container col-11 col-md-9 mx-auto my-auto'>
            <Card>
                <CardBody>
                    {showNoteForm ? <NoteForm setShowNoteForm={setShowNoteForm} /> : showNoteData}
                </CardBody>
            </Card>
        </div>
    )
}

export default Note;