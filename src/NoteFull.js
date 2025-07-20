import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemoLedgerApi from "./api";
import MemoLedgerContext from './MemoLedgerContext';
import NoteForm from "./NoteForm";
import NotePreview from './NotePreview';
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

const NoteFull = ({ formatTimestamp, note, setShowNoteForm, deleteNote }) => {
    /* Page to display note data & access btn to open edit form */

    return <>
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
}

export default NoteFull;