import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import LoginForm from './LoginForm';
import Home from './Home';
import SignupForm from './SignupForm';
import Profile from './Profile';
import Note from './Note';
import TagNotes from './TagNotes';
import SearchBar from './SearchBar';

const MemoLedgerRoutes = () => {
    return (
        <Routes>
            <Route path="/notes/:noteId" element={<Note />} />
            <Route path="/tags/:tagName" element={<TagNotes />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<SearchBar />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default MemoLedgerRoutes;