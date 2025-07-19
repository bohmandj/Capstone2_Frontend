import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";

const TagButtons = ({ tags = [] }) => {
    const navigate = useNavigate();

    return (
        <>
            {tags.map((tag) => (
                <span key={tag}>
                    <Button
                        size="sm"
                        color="primary"
                        className="px-2 py-0 ms-0 me-2 my-2 d-inline align-baseline"
                        onClick={() => navigate(`/tags/${encodeURIComponent(tag)}`)}
                    >
                        {tag}
                    </Button>
                </span>
            ))}
        </>
    );
};

export default TagButtons;