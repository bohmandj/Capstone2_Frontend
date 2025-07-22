import React, { useContext } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import MemoLedgerContext from './MemoLedgerContext';
import {
    Card,
    CardBody,
    CardTitle
} from 'reactstrap';
import NoteList from './NotesList';

const TagNotes = () => {
    const { currentUser } = useContext(MemoLedgerContext);
    const { tagName } = useParams();
    const navigate = useNavigate();

    if (!currentUser) navigate('/');

    return (
        <div className='page-content my-auto col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6 mx-auto'>
            <div className='container text-center'>
                <Card className='my-4 card-secondary'>
                    <CardBody className='card-secondary'>
                        <CardTitle tag="h2">
                            Notes Tagged with: "{tagName}"
                        </CardTitle>
                        <NoteList limit={false} tagName={tagName} />
                    </CardBody>
                </Card>
            </div>
        </div >
    )
}

export default TagNotes;