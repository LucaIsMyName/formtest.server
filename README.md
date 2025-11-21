# FormTest Server

A desktop application for automated testing of donation forms using Electron, Vite, TypeScript, and Playwright.

## Features

- **Form Management**: Add and manage multiple donation form URLs
- **Payment Method Testing**: Test various payment methods (PayPal, SEPA, Credit Card, EPS)
- **Automated Testing**: Run comprehensive form tests with Playwright
- **Test Results**: View detailed test results with screenshots and logs
- **Database Storage**: Local SQLite database for all configurations and results

## Tech Stack

- **Electron**: Desktop application framework
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **React**: UI framework with React Router
- **Tailwind CSS**: Utility-first CSS framework
- **Playwright**: Browser automation for testing
- **SQLite**: Local database storage

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package application
npm run dist
```

### Project Structure

```
src/
├── main/           # Electron main process
├── preload/        # Preload scripts
├── renderer/       # React frontend
├── common/         # Shared types and utilities
└── tests/          # Playwright test runners
```

## Usage

1. **Add Forms**: Configure donation form URLs in the Forms section
2. **Setup Payment Methods**: Add payment credentials (encrypted storage)
3. **Configure Settings**: Set default amounts, intervals, and test parameters
4. **Run Tests**: Execute automated tests across all forms and payment methods
5. **View Results**: Analyze test results with detailed logs and screenshots

## Security

- Payment credentials are encrypted before database storage
- Follows GDPR and PCI DSS compliance guidelines
- Uses test payment data only (no real transactions)

## License

MIT
