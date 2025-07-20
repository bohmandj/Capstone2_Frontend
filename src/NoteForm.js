import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MemoLedgerContext from './MemoLedgerContext';
import MemoLedgerApi from './api';
import {
    Button,
    CardTitle,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from "reactstrap";

const NoteForm = ({ note, setNote, setShowNoteForm, newNote = false }) => {
    /* Note form to update Note data */

    const { currentUser, setIsLoading } = useContext(MemoLedgerContext);
    const navigate = useNavigate();

    const inputs = [
        "title",
        "noteBody"
    ]
    const INPUTS_INITIAL_STATE = inputs.reduce((obj, input) => {
        obj[input] = note[input] || "";
        return obj;
    }, {});

    const [formData, setFormData] = useState(INPUTS_INITIAL_STATE);
    const [titleExists, setTitleExists] = useState(true);

    if (!currentUser) {
        return <Navigate to={'/'} />
    }

    const updateNote = async (noteFormData) => {
        setIsLoading(true);
        const {
            title,
            noteBody
        } = noteFormData;
        const returnedNote = await MemoLedgerApi.updateNote(note.noteId, title, noteBody);
        setNote({
            ...note,
            title: returnedNote.title,
            noteBody: returnedNote.noteBody,
            editedAt: returnedNote.editedAt
        });
        setIsLoading(false);
        navigate(`/notes/${note.noteId}`);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: value
        };
        setFormData(updatedFormData);
        if (name === "title" && (!String(formData.title).trim())) setTitleExists(false);
        if (name === "title" && !titleExists && (String(formData.title).trim())) setTitleExists(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!String(formData.title).trim())) {
            setTitleExists(false);
            return undefined;
        }

        updateNote(formData);
    };

    const handleCancel = () => {
        setFormData(INPUTS_INITIAL_STATE);
        setTitleExists(true);
        setShowNoteForm(false);
    }

    return (<>
        <CardTitle tag="h3">
            {newNote ? "New Note" : "Edit Note"}
        </CardTitle>
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label
                    className='font-weight-bold'
                    htmlFor='title'
                >Title:</Label>
                <Input
                    type="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    invalid={!titleExists}
                />
                {!titleExists && (
                    <FormFeedback>Note must include a title.</FormFeedback>
                )}
            </FormGroup>

            <FormGroup>
                <Label
                    className='font-weight-bold'
                    htmlFor='noteBody'
                >Note Body:</Label>
                <Input
                    type="textarea"
                    name="noteBody"
                    value={formData.noteBody}
                    onChange={handleChange}
                    className='h-auto'
                />
            </FormGroup>

            <Button name="submit" className='w-100' color='success'>Submit</Button>
            <Button className='w-100 mt-2' onClick={() => handleCancel()}>Cancel</Button>
        </Form>
    </>
    )
}

export default NoteForm;