import React, { useContext } from 'react';
import { useNavigate } from "react-router-dom";
import MemoLedgerContext from './MemoLedgerContext';
import {
    Button,
    Card,
    CardBody,
    CardSubtitle,
    CardText,
    CardTitle
} from 'reactstrap';

const Home = () => {
    const { currentUser } = useContext(MemoLedgerContext);
    const navigate = useNavigate();

    return (
        <div className='page-content my-auto col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6 mx-auto'>
            <div className='container text-center'>
                <Card>
                    <CardBody>
                        <CardTitle tag="h1">
                            MemoLedger
                        </CardTitle>
                        <CardSubtitle tag="h6" className='my-3'>
                            Where your life's notes stay organized.
                        </CardSubtitle>
                        {currentUser ? (
                            <CardText tag="h3">
                                Welcome back, {currentUser.username}!
                            </CardText>
                        ) : (
                            <>
                                <Button
                                    className='btn fw-bold me-3 col-5 col-md-4 col-xxl-3 my-4'
                                    onClick={() => navigate('/login')}
                                >Log in</Button>
                                <Button
                                    className='btn fw-bold col-5 col-md-4 col-xxl-3 my-4'
                                    onClick={() => navigate('/signup')}
                                >Sign up</Button>
                            </>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div >
    )
}

export default Home;