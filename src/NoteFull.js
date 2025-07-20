
import TagButtons from './TagButtons';
import {
    Button,
    CardTitle,
    CardSubtitle,
    CardText,
    CardFooter
} from 'reactstrap';

const NoteFull = ({ formatTimestamp, note, setShowNoteForm, deleteNote }) => {
    /* Page to display a full note with all data */

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