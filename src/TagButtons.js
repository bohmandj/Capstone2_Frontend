import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, CloseButton } from "reactstrap";

const TagButtons = ({
    tags = [],
    size = "sm",
    editable = false,
    onDelete = () => { },
}) => {
    const navigate = useNavigate();

    const handleClick = (tag) => {
        if (editable) return;
        navigate(`/tags/${encodeURIComponent(tag)}`);
    };

    return (
        <>
            {tags.map((tag) => (
                <span
                    key={tag}
                    className={`tag-wrapper d-inline-flex align-items-center me-2 my-2 ${editable ? "editable-tag" : ""}`}
                >
                    <Button
                        size={size}
                        color={editable ? "secondary" : "primary"}
                        className="px-2 py-0 d-inline-flex align-items-center"
                        onClick={() => handleClick(tag)}
                    >
                        {tag}
                        {editable && (
                            <CloseButton
                                className="ms-2 p-1 tag-close-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(tag);
                                }}
                            />
                        )}
                    </Button>
                </span>
            ))}
        </>
    );
};

export default TagButtons;