import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MemoLedgerContext from './MemoLedgerContext';
import MemoLedgerApi from './api';
import {
    Button,
    CardTitle,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from "reactstrap";

const ProfileForm = ({ setShowProfileForm }) => {
    /* Profile form to update user data */

    const { currentUser, setCurrentUser, setIsLoading } = useContext(MemoLedgerContext);
    const navigate = useNavigate();

    const ERRORS_INITIAL_STATE = {
        invalidEmail: false,
        shortPassword: false,
        unmatchedPassword: false,
    }
    const [errors, setErrors] = useState(ERRORS_INITIAL_STATE);
    const [touched, setTouched] = useState({
        email: false,
        password: false,
        confirmPassword: false,
    });

    const inputs = [
        "email",
        "password",
        "confirmPassword"
    ]
    const INPUTS_INITIAL_STATE = inputs.reduce((obj, input) => {
        obj[input] = currentUser[input] || "";
        return obj;
    }, {});

    const [formData, setFormData] = useState(INPUTS_INITIAL_STATE);

    if (!currentUser) {
        return <Navigate to={'/'} />
    }

    const updateUser = async (profileFormData) => {
        setIsLoading(true);
        const {
            password,
            email
        } = profileFormData;
        const returnedUser = await MemoLedgerApi.updateUser(currentUser.username, password, email);
        setCurrentUser({
            ...currentUser,
            email: returnedUser.email
        });
        setIsLoading(false);
        navigate('/');
    }

    const validateEmail = (email) => {
        return email.includes('@');
    };
    const validatePasswordMatch = (pwd, confirmPwd) => {
        return pwd === confirmPwd;
    };
    const validatePasswordLength = (pwd) => {
        return pwd.length >= 8;
    }

    const validateField = (name, value, formValues = formData) => {
        switch (name) {
            case 'email':
                return { invalidEmail: !validateEmail(value) };
            case 'password':
                return {
                    shortPassword: !validatePasswordLength(value),
                    unmatchedPassword: !validatePasswordMatch(value, formValues.confirmPassword),
                };
            case 'confirmPassword':
                return {
                    unmatchedPassword: !validatePasswordMatch(formValues.password, value),
                };
            default:
                return {};
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: value
        };
        setFormData(updatedFormData);

        if (touched[name]) {
            const fieldErrors = validateField(name, value, updatedFormData);
            setErrors(prev => ({ ...prev, ...fieldErrors }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((t) => ({ ...t, [name]: true }));

        const fieldErrors = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, ...fieldErrors }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validateAll = () => {
            return {
                invalidEmail: !validateEmail(formData.email),
                shortPassword: !validatePasswordLength(formData.password),
                unmatchedPassword: !validatePasswordMatch(formData.password, formData.confirmPassword),
            };
        };

        const newErrors = validateAll();
        setErrors(newErrors);
        setTouched({
            email: true,
            password: true,
            confirmPassword: true,
        });

        const isValid = Object.values(newErrors).every(error => error === false);

        if (isValid) {
            updateUser(formData);
        }
    };

    const handleCancel = () => {
        setFormData(INPUTS_INITIAL_STATE);
        setErrors(ERRORS_INITIAL_STATE);
        setShowProfileForm(false);
    }

    return (<>
        <CardTitle tag="h3">
            Edit Profile
        </CardTitle>
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label
                    className='font-weight-bold'
                    htmlFor='username'
                >Username:</Label>
                <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder={currentUser.username}
                    disabled
                    readOnly
                />
            </FormGroup>

            <FormGroup>
                <Label
                    className='font-weight-bold'
                    htmlFor='email'
                >Email:</Label>
                <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={errors.invalidEmail && touched.email}
                />
                {errors.invalidEmail && touched.email && (
                    <FormFeedback>Invalid Email</FormFeedback>
                )}
            </FormGroup>

            <FormGroup>
                <Label
                    className='font-weight-bold'
                    htmlFor='password'
                >New Password:</Label>
                <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={errors.shortPassword && touched.password}
                />
                {errors.shortPassword && touched.password
                    && <FormFeedback>
                        Password must be at least 8 characters
                    </FormFeedback>
                }
            </FormGroup>

            <FormGroup>
                <Label
                    className='font-weight-bold'
                    htmlFor='confirmPassword'
                >Confirm New Password:</Label>
                <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={errors.unmatchedPassword
                        && (touched.password || touched.confirmPassword)
                    }
                />
                {errors.unmatchedPassword
                    && (touched.password || touched.confirmPassword)
                    && <FormFeedback>
                        Passwords must match
                    </FormFeedback>
                }
            </FormGroup>

            <Button name="submit" className='w-100' color='success'>Submit</Button>
            <Button className='w-100 mt-2' onClick={() => handleCancel()}>Cancel</Button>
        </Form>
    </>
    )
}

export default ProfileForm;