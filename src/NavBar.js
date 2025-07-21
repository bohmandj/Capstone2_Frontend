import React, { useContext, useState, useEffect, useRef } from "react";
import MemoLedgerContext from "./MemoLedgerContext";
import { NavLink, Link } from "react-router-dom";
import {
    Collapse,
    Nav,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    NavItem,
} from "reactstrap";

const NavBar = () => {

    const { currentUser, logout, createNewNote } = useContext(MemoLedgerContext);
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef();

    const toggle = () => setIsOpen(!isOpen);

    // Close nav link dropdown (for narrow screens) when open & on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <Navbar
            expand="md"
            fixed="top"
            className="navbar-custom"
            ref={navRef}
        >
            <NavbarBrand tag={NavLink} to="/">
                MemoLedger
            </NavbarBrand>
            <NavbarToggler
                onClick={toggle}
                className={isOpen ? "navbar-toggler active" : "navbar-toggler"}
            >
                <span className="navbar-toggler-icon" />
            </NavbarToggler>
            <Collapse isOpen={isOpen} navbar>
                <Nav className="ms-auto" navbar>
                    {currentUser ? (
                        <>
                            <NavItem>
                                <NavLink to="/search" className="nav-link">
                                    Search
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    tag={Link}
                                    className="nav-link no-active"
                                    to="/new-note-action"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        createNewNote();
                                    }}>
                                    New Note
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to="/profile" className="nav-link">
                                    Profile
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to="/logout" className="nav-link" onClick={logout}>
                                    Log out
                                </NavLink>
                            </NavItem>
                        </>
                    ) : (
                        <>
                            <NavItem>
                                <NavLink to="/login" className="nav-link">Log in</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to="/signup" className="nav-link">Sign up</NavLink>
                            </NavItem>
                        </>
                    )}
                </Nav>
            </Collapse>
        </Navbar>
    );
}

export default NavBar;