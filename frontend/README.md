# MediWise - Generic Medicine Finder

A web application that helps users find affordable generic alternatives to branded medicines.

## Features

- Search for branded medicines
- View detailed salt composition
- Find generic alternatives with pricing
- Compare prices across different manufacturers

## Prerequisites

Before running this project, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd Cody_boyz/frontend
```

2. Install the dependencies:
```bash
npm install
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is already in use).

## Building for Production

To create a production build:

```bash
npm run build
```

This will create a `dist` folder with the production-ready files.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── data/           # Mock data and constants
│   ├── App.jsx         # Main application component
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML entry point
├── package.json        # Project dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.cjs # Tailwind CSS configuration
└── postcss.config.cjs  # PostCSS configuration
```

## Technologies Used

- React.js
- Tailwind CSS
- Vite
- PostCSS

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Sample Data

The application currently includes sample data for the following medicines:
- Augmentin 625
- Crocin Advance
- Allegra 120
