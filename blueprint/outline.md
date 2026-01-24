Detailed Plan for Donation Form Testing App

I. Project Setup & Core Technologies

    Electron: The main framework for building the desktop application.

    Vite: For fast development and bundling of the web front-end.

    TypeScript: For type safety and improved code quality.

    Tailwind CSS: For rapid and consistent UI styling.

    Playwright/Cypress: (Crucial Addition!) For end-to-end browser automation and testing. Playwright is generally preferred for its multi-browser support and robust API.

    SQLite (or similar embedded DB): For local data storage within the Electron app (form links, global settings, payment data).

II. Data Models & Database Schema

1. Form Table:

    id (Primary Key, Auto-increment)

    name (String, e.g., "General Donation", "Project X Support")

    url (String, the direct link to the fundraisingbox form)

    hash (String, if fundraisingbox uses this for form identification/security)

    isActive (Boolean, default true - to enable/disable specific forms for testing)

    createdAt (Timestamp)

    updatedAt (Timestamp)

2. PaymentMethod Table:

    id (Primary Key, Auto-increment)

    name (String, e.g., "PayPal", "SEPA Direct Debit", "Credit Card")

    type (String, e.g., "paypal", "sepa", "creditcard" - for internal logic)

    isActive (Boolean, default true - to enable/disable specific payment methods)

    details (JSON/Text - store encrypted payment credentials here, e.g., paypal_email, paypal_password, iban, bic, card_number, expiry_date, cvv, nonce, etc. Encryption is critical here.)

    createdAt (Timestamp)

    updatedAt (Timestamp)

3. GlobalSetting Table (Key-Value Store):

    key (Primary Key, String, e.g., "default_donation_amount", "default_interval")

    value (String/JSON, the corresponding value)

    description (String, for UI explanation)

4. TestRun Table (Logging Results):

    id (Primary Key, Auto-increment)

    formId (Foreign Key to Form.id)

    paymentMethodId (Foreign Key to PaymentMethod.id)

    status (String, e.g., "SUCCESS", "FAILURE", "SKIPPED")

    errorMessage (Text, if failure)

    screenshotPath (String, path to a screenshot of the failure/success page)

    logDetails (Text, more detailed test logs)

    durationMs (Integer, how long the test took)

    runAt (Timestamp)

III. Application Structure (Electron, Vite, TS)

├── public/
├── src/
│   ├── main/                  # Electron main process (Node.js environment)
│   │   ├── index.ts           # Main entry point, window creation, IPC handlers
│   │   ├── database.ts        # SQLite database initialization and ORM layer
│   │   ├── ipcHandlers.ts     # IPC communication logic between main and renderer
│   │   └── preload.ts         # Sandbox preload script
│   ├── renderer/              # Electron renderer process (React/Vue/Svelte + TS, Vite)
│   │   ├── assets/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── pages/             # Main application views
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Forms.tsx
│   │   │   ├── PaymentMethods.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── TestResults.tsx
│   │   ├── services/          # API/DB interaction via IPC
│   │   │   └── api.ts         # IPC wrapper functions
│   │   ├── store/             # State management (Zustand, Pinia, Context API)
│   │   ├── utils/             # Utility functions (validation, encryption)
│   │   ├── App.tsx            # Main React component
│   │   └── main.tsx           # Renderer entry point
│   ├── common/                # Shared types and interfaces
│   │   └── types.ts
│   └── tests/                 # Playwright test runners (can be separate or integrated)
│       └── playwrightRunner.ts # Contains the logic to interact with forms
├── electron.vite.config.ts    # Electron Vite configuration
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vite.config.ts

IV. Key Features & Modules

1. Main Process (src/main/)

    Window Management: Create and manage the main Electron window.

    IPC Communication: Handle messages from the renderer process (e.g., "saveForm", "runTests", "getSettings").

    Database Interaction: Directly interact with the SQLite database for CRUD operations on forms, payment methods, settings, and test results.

    Security:

        Environment Variables: Safely load sensitive configuration.

        Data Encryption: Use Node.js crypto module to encrypt/decrypt sensitive payment details before storing them in the DB. A master password or OS-level credential storage might be considered for the encryption key, or a simplified approach for internal use where the key is securely stored within the app's secure storage.

    Test Runner Orchestration: When runTests is called:

        Retrieve active forms and payment methods from the DB.

        Spawn a child process or directly call the Playwright/Cypress test runner.

        Pass necessary data (form URL, payment details) to the test runner.

        Receive test results, logs, and screenshots from the runner.

        Store results in the TestRun table.

2. Renderer Process (src/renderer/)

    Navigation: React Router (or similar) for navigating between views.

    Form Management (CRUD):

        Add new donation form URLs (with name and hash).

        Edit existing forms.

        Delete forms.

        Toggle active/inactive status.

        Import/Export forms (e.g., via CSV).

    Payment Method Management (CRUD):

        Add new payment methods (PayPal, SEPA, Credit Card).

        Enter and securely store credentials (encrypted).

        Edit/Delete payment methods.

        Toggle active/inactive status.

    Global Settings:

        Input fields for common donation amounts, intervals (one-time, monthly, yearly).

        Any other recurring data for forms.

    Dashboard/Test Execution:

        "Run All Tests" button.

        Option to select specific forms/payment methods for a test run.

        Real-time (or near real-time) feedback during test execution (e.g., "Running test for Form X with PayPal...").

        Progress indicator.

    Test Results View:

        List of past test runs.

        Filter by form, payment method, status (success/failure), date.

        Detail view for each run:

            Form tested, Payment method used.

            Status, Error message.

            View screenshot of the error/success page.

            Detailed logs.

3. Test Runner (src/tests/playwrightRunner.ts - or similar for Cypress)

This is the core automation logic.

    Initialization: Launch a headless (or headful for debugging) browser instance.

    Navigation: Navigate to the given form.url.

    Form Filling Logic:

        Identify fields (name, email, address, donation amount, interval). This will require some knowledge of fundraisingbox's common HTML structure or specific CSS selectors for your forms.

        Use provided mockUser data or generate plausible mock data on the fly.

        Input global settings values (e.g., default donation amount).

    Payment Method Selection & Input:

        Locate payment method selection elements.

        Click to select the specified paymentMethod.type.

        Fill in payment details using the decrypted credentials:

            PayPal: Click PayPal button, complete login in a new tab/popup (Playwright handles new windows well), confirm payment.

            SEPA: Fill IBAN, BIC, Name.

            Credit Card: Fill card number, expiry, CVV, name. This might involve iframe interactions if FundraisingBox uses a payment gateway provider.

    Submission: Click the "Donate" or "Submit" button.

    Verification:

        Check for success messages or redirection to a "thank you" page.

        Check for error messages (e.g., invalid card, failed transaction).

        Take a screenshot at the end of the test or on failure.

        Return structured results (status, message, screenshot path, logs).

V. Missing Pieces / Important Considerations

    CAPTCHA/reCAPTCHA: How does FundraisingBox handle this? Automated tests usually struggle with CAPTCHAs. You might need to configure FundraisingBox to disable it for testing environments or implement a manual bypass/mocking strategy if possible.

    MFA (Multi-Factor Authentication): For PayPal, if MFA is enabled, automated login might fail. A dedicated PayPal test account without MFA, or a way to temporarily disable it, would be ideal.

    Test Data Management: Beyond just payment details, consider generating unique user data for each test run to avoid conflicts or duplicate entries in fundraisingbox. Faker.js can be useful here.

    Error Handling & Reporting: Robust error handling in the test runner and clear reporting in the UI are crucial.

    Parallelization: For many forms/payment methods, running tests in parallel could significantly speed up execution. Playwright supports this.

    Headless vs. Headful: While headless is faster, having the option to run tests in a visible browser window (headful) is invaluable for debugging.

    CI/CD Integration (Future): While an Electron app, the core test logic could potentially be extracted and run in a CI/CD pipeline if needed for daily/weekly automated checks.

    FundraisingBox-Specific Locators: You'll need to identify stable CSS selectors or XPaths for the fields and buttons in your specific FundraisingBox forms. These might vary slightly between forms if they are customized.

    Legal & Security:

        GDPR: Ensure all personal/payment data is handled securely and encrypted.

        PCI DSS: While not directly processing payments, storing credit card details (even encrypted) brings PCI compliance into play. Using test cards (provided by payment gateways) or nonces instead of actual card numbers is highly recommended for testing. Never store real production credit card numbers.