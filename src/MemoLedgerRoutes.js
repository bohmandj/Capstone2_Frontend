import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import LoginForm from './LoginForm';
import Home from './Home';
import SignupForm from './SignupForm';

const MemoLedgerRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default MemoLedgerRoutes;