# 3D Molecular Explorer

A web application for visualizing and exploring 3D molecular structures using SMILES/InChI strings.

## Features

- Render molecules in 3D from SMILES/InChI strings
- Interactive rotation, zooming, and exploration
- Measure bond lengths, angles, and dihedral angles
- Calculate molecular descriptors and properties
- Export options (PDB, SVG, PNG)
- Dark/light theme support
- Gallery of example molecules

## Tech Stack

- **Frontend**: Astro + React (TypeScript) with React Three Fiber
- **Backend**: Python FastAPI with RDKit for molecular processing
- **Deployment**: Vercel (serverless functions)

## Development

1. Install dependencies:
npm install

2. Set up Python environment:
cd api
pip install -r requirements.txt

3. Run development server:
npm run dev

## Deployment

The application is configured for Vercel deployment. Simply push to your repository connected to Vercel, or run: vercel
