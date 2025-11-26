# Port Alfred Holiday Pass - README

## 1. Project Overview

This is the frontend for the **Port Alfred Holiday Pass (PAHP)**, a single-page application designed to offer tourists a digital pass for exclusive deals at local businesses. The app is built with React, TypeScript, and Tailwind CSS, and uses Vite as its build tool.

The current version is a feature-complete prototype that includes a **fully simulated backend** for pass validation, allowing for a comprehensive demonstration of the user flow without requiring a live server or database.

## 2. Core Features

- **Digital "Live" Pass:** A secure, animated digital pass that displays the holder's name, a unique Pass ID, and a live clock to prevent screenshot abuse.
- **Family Sharing (+1):** The primary pass holder can add one additional family member's name to the pass.
- **Secure Shared Activation:** A pass can be activated on a second device using a unique Pass ID and the primary holder's name. This is a one-time operation to prevent unauthorized sharing.
- **Simulated Validation System:** A mock backend built using `localStorage` that securely validates purchases and shared pass activations.
- **Responsive Design:** A mobile-first, fully responsive UI designed for tourists on the go.

## 3. How the Simulated Validation System Works

The core of the application's security and pass management is handled by a simulated server environment located in `src/server/validation.ts`. **This system uses the browser's `localStorage` to act as a mock database.** This was implemented to prototype and test the complete user lifecycle (purchase -> validation -> sharing -> activation) without the overhead of a real backend.

### Key Components:

-   **Mock Database (`localStorage`):** A single key, `pass_validation_database`, in `localStorage` stores an array of all "valid" pass records.
-   **PassRecord Interface:** Each record in the database follows this structure:
    ```typescript
    interface PassRecord {
      passId: string;
      primaryName: string; // The original purchaser's name.
      plusOneActivated: boolean; // Tracks if the single share has been used.
    }
    ```
-   **API Functions:**
    -   `registerNewPass(passId, primaryName)`: Called upon "purchase." It adds a new `PassRecord` to the mock database.
    -   `validateExistingPass(passId, primaryName)`: Called on app load. It checks if the pass stored on the user's device exists in the mock database, ensuring its legitimacy. If not, the local pass is deleted.
    -   `activateSharedPass(passId, primaryName)`: Called when a second user activates a pass. It first verifies that the Pass ID exists and that `plusOneActivated` is `false`. If both are true, it sets `plusOneActivated` to `true` to prevent the pass from being shared again.

> **CRITICAL NOTE:** This system is for demonstration purposes only. A user could clear their `localStorage` to manipulate the validation. The immediate next step for production is to replace this with a real backend.

## 4. Getting Started

The project is built using Vite, a modern frontend build tool.

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
3.  Open the URL provided in your terminal (usually `http://localhost:5173`) in your browser.

## 5. Building for Production (e.g., Netlify)

To create an optimized production build, run:
```bash
npm run build
```
The output files will be in the `dist/` directory. This is the directory that should be deployed. The included `netlify.toml` file configures this automatically for Netlify.

## 6. Future Development & Production Roadmap

The following are critical next steps to move this application from a prototype to a production-ready product.

### Tier 1: Essential for Launch

1.  **Implement a Real Backend:**
    -   Replace `src/server/validation.ts` with a proper serverless backend (e.g., Firebase Functions, Supabase Edge Functions, or AWS Lambda).
    -   **Action:** All function logic from `validation.ts` should be migrated to server-side functions.

2.  **Integrate a Database:**
    -   Replace the `localStorage` mock database with a real database (e.g., Firestore, PostgreSQL, Supabase DB).
    -   **Action:** The backend functions will read from and write to this database to manage `PassRecord`s.

3.  **Integrate a Payment Gateway:**
    -   Add a payment provider (e.g., Stripe, Paystack) to handle the R250 transaction.
    -   **Action:** The `onPurchase` flow in the `PurchaseModal` should trigger the payment flow. The backend `registerNewPass` function should only be called after a successful payment webhook is received from the payment provider.

### Tier 2: High-Value Enhancements

1.  **User Authentication:**
    -   While not strictly necessary for the current flow, simple user accounts (e.g., login with Google or email) could allow users to easily recover or manage their pass across multiple devices without needing the Pass ID.

2.  **Admin Panel / Partner Portal:**
    -   Create a separate web interface for PAHP administrators to:
        -   View sales and activation analytics.
        -   Manually issue or revoke passes.
        -   Manage the list of charities.
    -   Create a portal for business partners to update their deal information dynamically.

3.  **CI/CD Pipeline:**
    -   Set up a continuous integration and deployment pipeline (e.g., using GitHub Actions) to automate testing and deployments.
