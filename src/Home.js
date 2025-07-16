import React, { useContext } from 'react';
import { useNavigate } from "react-router-dom";
import MemoLedgerContext from './MemoLedgerContext';

const Home = () => {
    const { currentUser } = useContext(MemoLedgerContext);
    const navigate = useNavigate();

    return (
        <div className='homepage my-auto'>
            <div className='container text-center'>
                <h1>MemoLedger!</h1>
                <p>Where your life's notes stay organized.</p>
                {currentUser ? (
                    <h2>Welcome back, {currentUser.username}!</h2>
                ) : (
                    <div>
                        <button
                            className='btn btn-primary fw-bold me-3 col-2'
                            onClick={() => navigate('/login')}
                        >Log in</button>
                        <button
                            className='btn btn-primary fw-bold col-2'
                            onClick={() => navigate('/signup')}
                        >Sign up</button>
                    </div>
                )
                }
            </div>
        </div >
    )
}

export default Home;