import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MemoLedgerContext from './MemoLedgerContext';
import MemoLedgerApi from './api';
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    ListGroup,
    ListGroupItem
} from "reactstrap";
import ProfileForm from './ProfileForm';

const Profile = () => {
    /* Profile form to update user data */

    const { currentUser, setIsLoading, logout } = useContext(MemoLedgerContext);
    const navigate = useNavigate();

    const [showProfileForm, setShowProfileForm] = useState(false);

    if (!currentUser) {
        return <Navigate to={'/'} />
    }

    const deleteUser = async () => {
        setIsLoading(true);
        const res = await MemoLedgerApi.deleteUser(currentUser.username);
        if (res.deleted) {
            logout();
        } else {
            alert("Error occurred during profile deletion. Please try again.")
        }
        setIsLoading(false);
        navigate('/');
    }

    const deletionWarning = () => {
        if (window.confirm("Are you sure you want to delete your profile?\nThis action can not be undone.")) deleteUser(currentUser.username);
    }

    const showProfileData = <>
        <CardTitle tag="h3">
            Profile Info
        </CardTitle>
        <ListGroup className='my-4'>
            <ListGroupItem>
                Username: {currentUser.username}
            </ListGroupItem>
            <ListGroupItem>
                Email: {currentUser.email}
            </ListGroupItem>
        </ListGroup>
        <Button className='w-100' onClick={() => setShowProfileForm(true)}>Edit Profile</Button>
        <Button className='w-100 mt-2' color="danger" onClick={() => deletionWarning()} >Delete Profile</Button>
    </>

    return (
        <div className='page-content form-container container col-md-6 col-lg-5 col-xl-4 mx-auto my-auto'>
            <Card>
                <CardBody>
                    {showProfileForm ? <ProfileForm setShowProfileForm={setShowProfileForm} /> : showProfileData}
                </CardBody>
            </Card>
        </div>
    )
}

export default Profile;