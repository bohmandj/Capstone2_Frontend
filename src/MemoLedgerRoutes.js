import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import LoginForm from './LoginForm';
import Home from './Home';
import SignupForm from './SignupForm';
import Profile from './Profile';
import NoteFull from './NoteFull';

const MemoLedgerRoutes = () => {
    return (
        <Routes>
            <Route path="/notes/:noteId" element={<NoteFull />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default MemoLedgerRoutes;