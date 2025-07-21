import { useNavigate } from 'react-router-dom';
import { formatTimestamp } from './utils/helpers'
import TagButtons from './TagButtons';
import {
    Card,
    CardBody,
    CardTitle,
    CardSubtitle,
    CardText,
    CardFooter
} from 'reactstrap';

const NotePreview = ({ note }) => {
    const navigate = useNavigate();

    return <Card className='note-preview' onClick={() => navigate(`/notes/${note.noteId}`)}>
        <CardBody className='note-preview'>
            <CardTitle tag="h4">
                {note.title}
            </CardTitle>
            <CardSubtitle className='mb-3 text-muted'>
                <small>Last Edited {formatTimestamp(note.editedAt)}</small>
            </CardSubtitle>
            <CardText style={{ whiteSpace: 'pre-wrap' }} className="preview-text">
                {note.noteBody}
            </CardText>
            {note.tags.length > 0 &&
                <CardFooter className='mb-3 text-muted' style={{ borderRadius: "4px" }}>
                    <small>Tags:</small> <TagButtons tags={note.tags} />
                </CardFooter>
            }

        </CardBody>
    </Card>
}

export default NotePreview;