# MemoLedger

[https://memoledger.onrender.com/](https://memoledger.onrender.com/)

A note taking app - "Where your life's notes stay organized."

## Description

MemoLedger is a note-taking website specialized for small and easily searchable notes for little bits of information on your life. Each note has a title and note body, and can be tagged with custom and searchable tags to make finding the information you’re looking to reference as quick and easy as possible. 

We've all had times we wish we could remember little details about life. 
- When did we buy that couch, and for how much?
- Who did we use to replace our windows and how many years has it been?
- Which specialist did I see last summer for my surgery?
 
This site was made as an answer for these kinds of questions, and for everyone who sees value in documenting the details in life that otherwise might not have a place.

## Features

**User Authentication** - Secure registration and login. Create, edit, or delete a user profile.

**Note Management** - Create, view, edit, and delete personal notes.

**Note Tagging** - Organize notes using custom tags for categorization and quick search. Create new tags, easly add to or remove them from notes.

**Search Bar** - Find notes quick and easy searching by note title, note text, or tag name. Organize results by newest, oldest, or recently edited.

**Notes by Tag** - Click a tag to call up all notes with that tag applied.

## Technologies Used

**Frontend** - React.js, JavaScript, HTML, CSS, Bootstrap, Reactstrap, Axios, ReactRouterDOM

**Backend** - Express.js, Node.js, jsonwebtoken, bcrypt, jsonschema, RESTful APIs

**Database** - PostgreSQL

## Deployment

- Frontend & Backend 
    - hosted on Render

- Database 
  - hosted on Supabase
  - connection details managed securely via Render environment variables

## Future Enhancements

- Allowing shared access to notes with other users (visibility for private notes, ability to leave comments, or full editing rights)

- Allowing comments by other users

- Link to a note from a different note (like a Contact note of a person’s info linked to a note that references that person)

- Special share link that provides visibility to private note if you have the special link

- The ability to organize notes in folders to structurally organize your notes in a graphically navigable way - folder names would be searchable/filterable

- Add images to notes

- Saving notes to PDF

- File upload to save copies of official documentation for record keeping

- Setting reminder notifications (like reminders to schedule maintenance work, or to shop for replacement 10 years from now, that you’d set up when you document buying a new water heater)

## Setup & Installation

**Prerequisites** 

- Ensure you have Node.js (this was developed on v18.20.5, recommended) and npm (comes with Node.js) or Yarn installed. You can download Node.js from [nodejs.org](https://nodejs.org/en).
- You'll also need Git installed on your machine. Necessary for cloning the project repository from GitHub. Download it from [git-scm.com](https://git-scm.com/)

**Clone the Repository**

- Frontend repo found here: [github.com/bohmandj/Capstone2_Frontend](https://github.com/bohmandj/Capstone2_Frontend)

- Backend repo found here: [github.com/bohmandj/Capstone2_Backend](https://github.com/bohmandj/Capstone2_Backend)
    
    *See README in backend repo for backend setup*
- Tutorial on [cloning a GitHub repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) if you need it.

**Frontend Setup**

- Navigate to frontend directory
- Install dependencies (all listed in package.json)

        Bash
        npm install

- Environment .env Configuration 
    
    Create a file named `.env` in the `frontend/` directory with the following 
  variables:
    
        REACT_APP_API_BASE_URL=http://localhost:3001 
        # OR the URL of your deployed backend API

    *Note: Ensure the port matches your backend's configured port if running locally.*

## Running Tests

- To run the frontend tests
        
        Bash
        cd /path/to/frontend
        npm test

## Running the Application

- To run the frontend
        
        Bash
        cd /path/to/frontend
        npm start

    The frontend application will typically open in your browser at http://localhost:3000
