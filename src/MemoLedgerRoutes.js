import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import LoginForm from './LoginForm';

const MemoLedgerRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginForm />} />
        </Routes>
    )
}

export default MemoLedgerRoutes;