import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Input,
    Form,
    FormGroup,
    Label,
    Button,
    Card,
    CardBody,
    CardTitle
} from 'reactstrap';
import Loading from './Loading';
import MemoLedgerApi from './api';
import MemoLedgerContext from './MemoLedgerContext';
import NotePreview from './NotePreview';

const SearchBar = () => {
    const { currentUser } = useContext(MemoLedgerContext);

    const [query, setQuery] = useState('');
    const [searchTitle, setSearchTitle] = useState(true);
    const [searchTags, setSearchTags] = useState(true);
    const [searchText, setSearchText] = useState(false);
    const [order, setOrder] = useState('editTime');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    if (!currentUser) navigate('/');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const notes = await MemoLedgerApi.searchNotes(
                query,
                searchTitle,
                searchTags,
                searchText,
                order
            );
            setResults(notes);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='page-content my-auto col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6 mx-auto'>
            <div className='container text-center'>
                <Card className='my-4 card-secondary'>
                    <CardBody className='card-secondary'>
                        <Form onSubmit={handleSearch} className='mb-4'>
                            <FormGroup>
                                <Label htmlFor="query">Search Term</Label>
                                <Input
                                    id="query"
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        checked={searchTitle}
                                        onChange={(e) => setSearchTitle(e.target.checked)}
                                    />
                                    Title
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        checked={searchTags}
                                        onChange={(e) => setSearchTags(e.target.checked)}
                                    />
                                    Tags
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        checked={searchText}
                                        onChange={(e) => setSearchText(e.target.checked)}
                                    />
                                    Body Text
                                </Label>
                            </FormGroup>
                            <FormGroup className="mt-3">
                                <Label htmlFor="order">Sort Order</Label>
                                <Input
                                    type="select"
                                    id="order"
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="editTime">Recently Edited</option>
                                </Input>
                            </FormGroup>
                            <Button color="primary" className="mt-2" type="submit">
                                Search
                            </Button>
                        </Form>
                    </CardBody>
                </Card>

                {results
                    && <Card className='my-4 card-secondary'>
                        <CardBody className='card-secondary'>
                            <CardTitle tag="h3">Search Results:</CardTitle>
                            {loading && <Loading />}
                            {results.length === 0 && !loading && <p>No results found.</p>}
                            {results.map(note => (
                                <NotePreview note={note} key={note.noteId} />
                            ))}
                        </CardBody>
                    </Card>
                }
            </div>
        </div>
    );
};

export default SearchBar;
