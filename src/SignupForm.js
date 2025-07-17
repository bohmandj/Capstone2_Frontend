import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import MemoLedgerContext from './MemoLedgerContext';
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    Form,
    Input,
    Label
} from "reactstrap";

const SignupForm = () => {
    /* Sign up form to take user info for site registration */

    const { currentUser, register } = useContext(MemoLedgerContext);

    const inputs = [
        "username",
        "email",
        "password",
    ]

    const INITIAL_STATE = inputs.reduce((obj, input) => {
        obj[input] = "";
        return obj;
    }, {});

    const [formData, setFormData] = useState(INITIAL_STATE);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const responses = Object.values(formData);
        const isFormComplete = responses.every((response, i) => {
            return response.trim() !== "";
        });
        if (isFormComplete) {
            register(formData);
        } else {
            alert("All fields must be filled in order to sign up.");
        };
    };

    if (currentUser) {
        return <Navigate to={'/'} />
    };

    return (
        <div className='page-content form-container container col-11 col-md-6 col-lg-5 col-xl-4 mx-auto my-auto'>
            <Card>
                <CardBody>
                    <CardTitle tag="h3">
                        Sign Up
                    </CardTitle>
                    <Form onSubmit={handleSubmit}>
                        {inputs.map(input => (
                            <div className='mb-3' key={input}>
                                <Label
                                    className='text-capitalize font-weight-bold'
                                    htmlFor={input}
                                >{input}</Label>
                                <Input
                                    id={input}
                                    type="text"
                                    name={input}
                                    value={formData[input] || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                        <Button name="submit" className='w-100'>Submit</Button>
                    </Form>
                </CardBody>
            </Card>
        </div>
    )
}

export default SignupForm;