# freeCodeCamp TOC Generator

### Author
Francis Ihejirika - Initial work - [GitHub Profile - @francisihe](https://github.com/francisihe)

### Overview

A simple tool that automatically generates a table of contents for your freeCodeCamp articles from a simple preview link. This project consists of a Node.js/Express backend API that uses Puppeteer for web scraping, and a React frontend built with TypeScript and Tailwind CSS.

![freeCodeCamp TOC Generator](client/public/freeCodeCamp-logo.png)

## Features

- 🚀 Extract table of contents from freeCodeCamp preview articles
- 📝 Generate both Markdown and formatted preview outputs
- 🎨 Simple, clean, modern UI
- 📊 Real-time API status monitoring
- 📋 One-click copying of generated content
- 🔄 Auto-updating preview as you edit

## Tech Stack

### Backend (API)
- Node.js + Express
- TypeScript
- Puppeteer for web scraping
- CORS for security
- Docker support
- Zod for request validation

### Frontend (Client)
- React 18
- TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI primitives
- Lucide React for icons

## Project Structure
```
.
├── api/                  # Backend API
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── types/           # TypeScript type definitions
├── client/              # Frontend application
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # React components
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Google Chrome (for Puppeteer)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/freeCodeCamp-TOC-generator.git
cd freeCodeCamp-TOC-generator
``` 

2. Install API dependencies:
```
cd api
npm install
```

3. Install client dependencies:
```
cd ../client
npm install
```

### Development
1. Start the API server:
```
cd api
npm run dev
```

2. Start the client development server:
```
cd client
npm run dev
```

### Environment Variables (Optional)
```
PORT=3000
MAX_PAGES=5
PAGE_TIMEOUT=40000
QUEUE_TIMEOUT=60000
PAGE_IDLE_TIMEOUT=30000
```

### API Endpoints
- **POST /api/v1/extract-toc:** Extract table of contents from a freeCodeCamp preview URL
- GET /api/v1/status: Get current API and browser status
- GET /health: Check API health status

### Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: git checkout -b feature/your-feature-name
3. Make your changes
4. Run tests and linting
5. Commit your changes: git commit -m 'Add some feature'
6. Push to the branch: git push origin feature/your-feature-name
7. Submit a pull request

### License
This project is licensed under the ISC License - see the LICENSE file for details.

### Acknowledgments
Built for the freeCodeCamp community
Uses various open-source libraries and tools

### Support
For support, please open an issue in the GitHub repository or contact the maintainers.

Built with ❤️ for the freeCodeCamp community

