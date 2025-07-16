import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import MemoLedgerApi from "./api";
import NavBar from './NavBar';
import MemoLedgerContext from "./MemoLedgerContext";
import Loading from './Loading';
import MemoLedgerRoutes from "./MemoLedgerRoutes";

const MemoLedger = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(false);
    const [currentUser, setCurrentUser] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    await applyToken(storedToken);
                } catch (err) {
                    console.error("Error loading user:", err);
                    setCurrentUser(false);
                    setToken(false);
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    const getUser = async (username) => {
        const user = await MemoLedgerApi.getUser(username);
        setCurrentUser(user);
    }

    const applyToken = async (tokenStr) => {
        MemoLedgerApi.token = tokenStr;
        const { username } = jwtDecode(tokenStr);
        await getUser(username);
        setToken(tokenStr);
    }

    const login = async (loginFormData) => {
        setIsLoading(true);
        const {
            username,
            password
        } = loginFormData;
        const returnedToken = await MemoLedgerApi.loginUser(username, password);
        localStorage.setItem("token", returnedToken);
        await applyToken(returnedToken);
        setIsLoading(false);
        navigate('/');
    }

    const logout = () => {
        localStorage.removeItem("token");
        setToken(false);
        setCurrentUser(false);
        navigate('/');
    }

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="MemoLedger">
            <MemoLedgerContext.Provider value={{ currentUser, login, logout }}>
                <NavBar />
                <MemoLedgerRoutes />
            </MemoLedgerContext.Provider>
        </div>
    )
}

export default MemoLedger;