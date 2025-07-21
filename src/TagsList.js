import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MemoLedgerApi from "./api";
import MemoLedgerContext from './MemoLedgerContext';
import Loading from './Loading';
import TagButtons from './TagButtons';
import {
    Card,
    CardBody
} from 'reactstrap';


const TagsList = () => {
    /* Component to display a list of tags */

    const { currentUser } = useContext(MemoLedgerContext);

    const [tags, setTags] = useState(true);
    const [tagsListLoading, setTagsListLoading] = useState(true);
    const limit = 25;
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const getTags = async () => {
            setTagsListLoading(true);
            try {
                const tagsRes = await MemoLedgerApi.getTagsByUser(
                    currentUser.username,
                    limit,
                    offset
                );
                setTags(tagsRes);
            } catch (err) {
                console.error("Error fetching tags:", err);
            } finally {
                setTagsListLoading(false);
            }
        };

        getTags();
    }, []);

    if (tagsListLoading) return <Loading />;
    if (!currentUser) return <Navigate to={'/'} />;

    return <Card className='tags-list'>
        <CardBody className='tags-list'>
            <TagButtons tags={tags} size="lg" />
        </CardBody>
    </Card>
}

export default TagsList;