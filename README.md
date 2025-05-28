# MediWise - Generic Medicine Finder

A tool that helps users find generic, authentic medication alternatives that are just as effective but less expensive. It features both manual search and prescription image scanning capabilities.

## Prerequisites

Before running this application, make sure you have the following installed:

- [Python](https://www.python.org/downloads/) (Version 3.8 or higher)
- [Node.js](https://nodejs.org/) (Version 14 or higher)
- npm (comes with Node.js)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Cody_boyz
```

### 2. Backend Setup

First, set up the Python backend:

```bash
cd database
pip install -r requirements.txt
python setup_db.py
```

This will:

- Install required Python packages
- Create the SQLite database
- Import medicine data

### 3. Frontend Setup

Open a new terminal and set up the React frontend:

```bash
cd frontend
npm install
```

## Running the Application

You need to run both the backend and frontend servers.

### 1. Start the Backend Server

In the database directory:

```bash
cd database
python -m uvicorn api:app --reload
```

The backend will run on http://localhost:8000

### 2. Start the Frontend Server

In a new terminal, in the frontend directory:

```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:5173

## Using the Application

1. Open http://localhost:5173 in your browser
2. You can:
   - Search for medicines by name using the search bar
   - Upload a prescription image to find generic alternatives for multiple medicines

## Features

- Search for branded medicines
- Find generic alternatives
- View medicine compositions
- Upload and scan prescriptions
- Match scores for generic alternatives
- Links to purchase generic medicines

## API Documentation

Once the backend is running, you can access the API documentation at:

- http://localhost:8000/docs

## Troubleshooting

1. If you get CORS errors:

   - Make sure both servers are running
   - Check that you're using the correct ports

2. If the database isn't working:

   - Delete medicines.db
   - Run `python setup_db.py` again

3. If the frontend shows no styles:
   - Run `npm install` again
   - Check that tailwind.config.js exists

## File Structure

```
Cody_boyz/
├── database/               # Backend
│   ├── api.py             # FastAPI server
│   ├── medicine_db.py     # Database operations
│   ├── setup_db.py        # Database setup
│   └── requirements.txt   # Python dependencies
│
└── frontend/              # Frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── App.jsx        # Main application
    │   └── main.jsx      # Entry point
    ├── package.json       # Node.js dependencies
    └── index.html        # HTML template
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
