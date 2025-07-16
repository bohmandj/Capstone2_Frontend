import React, { useContext, useState } from "react";
import MemoLedgerContext from "./MemoLedgerContext";
import { NavLink } from "react-router-dom";
import {
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Collapse,
    Nav,
    NavItem
} from "reactstrap";

const NavBar = () => {

    const { currentUser, logout } = useContext(MemoLedgerContext);
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <Navbar
            expand="md"
            fixed="top"
            className="navbar-custom"
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
                                <NavLink to="/search" className="nav-link">Search</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to="/profile" className="nav-link">Profile</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to="/logout" className="nav-link" onClick={logout}>Log out</NavLink>
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