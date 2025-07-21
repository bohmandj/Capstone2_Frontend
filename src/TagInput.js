import React, { useState, useRef } from 'react';
import { FormGroup, Input, Button, Label, FormFeedback, CardFooter } from 'reactstrap';
import TagButtons from './TagButtons';

const TagInput = ({ tags, setTags, label = "Add Tag", showTagList = true }) => {
    const [tagInput, setTagInput] = useState("");
    const [isTagValid, setIsTagValid] = useState(true);
    const tagInputRef = useRef();

    const isValidTag = (tag) => /^[a-zA-Z0-9-_]{1,40}$/.test(tag.trim());

    const handleAddTag = () => {
        const trimmed = tagInput.trim();

        if (!isValidTag(trimmed)) {
            setIsTagValid(false);
            return;
        }

        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }

        setTagInput("");
        setIsTagValid(true);
        tagInputRef.current?.focus();
    };

    const handleTagInputChange = (e) => {
        const val = e.target.value;
        setTagInput(val);
        setIsTagValid(val.trim() === "" || isValidTag(val));
    };

    const validateTagOnBlur = () => {
        setIsTagValid(tagInput.trim() === "" || isValidTag(tagInput));
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isValidTag(tagInput.trim())) {
                handleAddTag();
            }
        }
    };

    return (
        <FormGroup>
            {showTagList && (
                <CardFooter className='mb-3 text-muted' style={{ borderRadius: "4px" }}>
                    <small>Tags: </small>
                    <TagButtons
                        tags={tags}
                        editable={true}
                        size="md"
                        onDelete={(tagToRemove) =>
                            setTags(tags.filter((t) => t !== tagToRemove))
                        }
                    />
                </CardFooter>
            )}
            <Label className='font-weight-bold' htmlFor='tagInput'>{label}:</Label>
            <div className="d-flex gap-2 align-items-start">
                <div className="flex-grow-1">
                    <Input
                        innerRef={tagInputRef}
                        type="text"
                        id="tagInput"
                        value={tagInput}
                        invalid={!isTagValid}
                        onChange={handleTagInputChange}
                        onBlur={validateTagOnBlur}
                        onKeyDown={handleTagInputKeyDown}
                    />
                    {!isTagValid && (
                        <FormFeedback className="d-block">
                            Tags must be 1-40 characters and contain only letters, numbers, hyphens, or underscores.
                        </FormFeedback>
                    )}
                </div>
                <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!isValidTag(tagInput.trim())}
                >
                    Add
                </Button>
            </div>
        </FormGroup>
    );
};

export default TagInput;
