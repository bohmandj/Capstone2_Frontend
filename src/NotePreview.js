import { useNavigate } from 'react-router-dom';
import TagButtons from './TagButtons';
import {
    Card,
    CardBody,
    CardTitle,
    CardSubtitle,
    CardText,
    CardFooter
} from 'reactstrap';

const NotePreview = ({ formatTimestamp, note }) => {
    const navigate = useNavigate();

    return <Card onClick={() => navigate(`/notes/${note.noteId}`)}>
        <CardBody className='note-preview'>
            <CardTitle tag="h3">
                {note.title}
            </CardTitle>
            <CardSubtitle className='mb-3 text-muted'>
                <small>Last Edited {formatTimestamp(note.editedAt)}</small>
            </CardSubtitle>
            <CardText style={{ whiteSpace: 'pre-wrap' }} className="preview-text">
                {note.noteBody}
            </CardText>
            <CardFooter className='mb-3 text-muted' style={{ borderRadius: "4px" }}>
                <small>Tags:</small> <TagButtons tags={note.tags} />
            </CardFooter>
        </CardBody>
    </Card>
}

export default NotePreview;