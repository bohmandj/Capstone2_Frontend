import React, { useContext } from 'react';
import { useNavigate } from "react-router-dom";
import MemoLedgerContext from './MemoLedgerContext';
import {
    Button,
    Card,
    CardBody,
    CardSubtitle,
    CardTitle
} from 'reactstrap';
import NoteList from './NotesList';
import TagsList from './TagsList';

const Home = () => {
    const { currentUser } = useContext(MemoLedgerContext);
    const navigate = useNavigate();

    return (
        <div className='page-content my-auto col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6 mx-auto'>
            <div className='container text-center'>
                {!currentUser && <>
                    <Card>
                        <CardBody>
                            <CardTitle tag="h1 mx-auto">MemoLedger </CardTitle>
                            <CardSubtitle tag="h6" className='my-3'>
                                Where your life's notes stay organized.
                            </CardSubtitle>
                            <Button
                                className='btn fw-bold me-3 col-5 col-md-4 col-xxl-3 my-4'
                                onClick={() => navigate('/login')}
                            >Log in</Button>
                            <Button
                                className='btn fw-bold col-5 col-md-4 col-xxl-3 my-4'
                                onClick={() => navigate('/signup')}
                            >Sign up</Button>
                        </CardBody>
                    </Card>
                </>}
                {currentUser && <>
                    <Card className='my-4 card-secondary'>
                        <CardBody className='card-secondary'>
                            <CardTitle tag="h2">
                                {currentUser.username}'s Notes
                            </CardTitle>
                            <NoteList />
                        </CardBody>
                    </Card>
                    <Card className='my-4 card-secondary'>
                        <CardBody className='card-secondary'>
                            <CardTitle tag="h2">
                                {currentUser.username}'s Tags
                            </CardTitle>
                            <TagsList />
                        </CardBody>
                    </Card>
                </>}


            </div>
        </div >
    )
}

export default Home;