# NxtBot - AI Library Management System

NxtBot is a full-stack library management system built with a MERN stack and powered by Google Gemini 2.5 Flash. It was built to solve the real problem of managing a large digital library without a team of people. The system handles everything from user registration and book borrowing, to overdue fine calculation and payment collection. On top of that, an AI chatbot sits at the center of the experience, helping users discover books, get summaries, and receive personalized reading recommendations that go beyond what is just in the catalog.

This was built entirely from scratch over multiple sessions, including the design, the database, the AI logic, and the payment flow.


## What the app actually does

When a student opens the app, they land on a collection of over 300 books spanning Science, History, Fiction, Technology, Philosophy, Psychology, Biography, and more. They can search, filter by category, flip to E-Books only, open any book to read a detailed description, and request to borrow it. When requesting, they choose how long they want the book, anywhere from 3 to 7 days.

Once a request is made, the admin gets it on their dashboard and can approve or reject it. When the admin approves, the system sets the exact due date based on what the student asked for. If the student returns the book late, the system automatically calculates a fine per day. That fine shows up on the student's dashboard, and they can pay it directly through Razorpay without leaving the app.

The AI side of things is where it gets interesting. The chatbot, called NxtBot, uses Gemini 2.5 Flash and knows about the library's catalog. Ask it what the best philosophy book in stock is, and it will tell you, including why it thinks so. It will also tell you what the best philosophy books are outside the library, pulling from its general knowledge. Ask for a summary of any book and it will generate one, pulling from the uploaded PDF if there is one, or from its own knowledge of that book if there is not.


## Tech stack

The backend is Node.js with Express. The database is MongoDB Atlas. Authentication uses JWT tokens stored in localStorage. The frontend is React with Vite and uses Tailwind CSS for styling. AI features are powered by Google Gemini 2.5 Flash via direct REST API calls. Payments go through Razorpay in test mode.


## Project structure

The project is split into two folders, backend and frontend, at the root level.


### Backend

server.js is the entry point. It connects to MongoDB, sets up CORS, registers all the route files, and starts the server on port 5000.

The config folder contains db.js which handles the Mongoose connection to MongoDB Atlas.

The controllers folder is where all the business logic lives.

- authController.js handles user registration and login. Passwords are hashed with bcryptjs and a JWT is returned on login.
- bookController.js handles fetching all books, fetching a single book, and the global search which calls the Google Books API first and the Open Library API as a fallback if Google returns a rate limit error.
- transactionController.js is the most complex one. It handles book requests, approvals, rejections, returns, and fine calculation. When a student requests a book they send a requestedDays field with it. When the admin approves it, the due date is set to exactly that many days from the current moment. When the book is returned, the system compares the return time to the due date and calculates the fine per day. There is also logic that computes the fine dynamically on each request so the student always sees their current balance in real time, even before the book is physically returned.
- aiController.js powers the chatbot and the summarization feature. When a user sends a message to NxtBot, the controller fetches relevant books from the database based on keywords in the message, builds a context object with the user's role, borrowed books, and found matches, and sends everything to Gemini. The prompt instructs Gemini to evaluate which books in the library are best, explain why, and also recommend highly-rated books from outside the library. The summarization function takes a book ID, extracts text from the PDF if one is uploaded, and sends it to Gemini. If the book has no PDF and no description, it falls back to asking Gemini to summarize based purely on the title and author.
- paymentController.js handles the Razorpay flow. It creates an order, stores a payment record, and verifies the signature after payment is completed.

The models folder has five Mongoose schemas.

- User.js stores name, email, hashed password, and role which is either student or admin.
- Book.js stores title, author, category, ISBN, description, thumbnail URL, PDF URL, total copies, and available copies.
- Transaction.js stores the relationship between a user and a book, the status of the transaction, the requested days, issue date, due date, return date, and the fine amount.
- Payment.js stores the Razorpay order ID, payment ID, amount, and status.
- There is also an unstructured admin model for script use.

The routes folder maps HTTP endpoints to controller functions. All routes except auth are protected by the JWT middleware in the middleware folder.

The scripts folder contains makeAdmin.js, a one-time script you run from the terminal to promote any registered user to admin by their email address.

The ingestion scripts at the root of the backend are what were used to build the catalog. ingestISBNs.js takes a list of ISBN numbers and fetches metadata for each one from Google Books or Open Library. massSeed.js was used for the initial bulk import. addPhilosophy.js added the philosophy section. These are not needed for running the app, they were development tools.


### Frontend

The frontend is a single-page React application using React Router for navigation. The main layout is in App.jsx which defines routes and wraps everything in an authentication context.

The context folder has AuthContext.jsx which stores the logged-in user in state and provides it globally. It reads the JWT from localStorage on load so the session persists across page refreshes.

The services folder has api.js which is the Axios instance used across the entire frontend. The base URL is pulled from an environment variable called VITE_API_URL, which defaults to localhost in development and points to the live Render backend in production. The Axios interceptor automatically attaches the JWT from localStorage to every outgoing request.

The components folder has the ChatBot component which is the floating AI assistant. It sits in the bottom right corner of every page and opens into a chat window. It maintains local message history and sends each new message to the backend AI chat endpoint.

The pages folder has the main views.

- Login.jsx and Register.jsx handle authentication forms.
- Books.jsx is the main collection page. It shows all books in a card grid with search and category filters. Clicking a book opens a details modal with the description, a borrow duration selector, an AI summary button, and a read online button for E-books. The filter also has an E-Books only toggle that hides everything without a PDF attached.
- StudentDashboard.jsx shows the student their active loans, pending requests, and any outstanding fines. Fines are computed client-side in real time using the due date from the API response. If a fine is owed, a Pay Now button appears which triggers the Razorpay checkout popup.
- AdminDashboard.jsx shows high-level stats including total books, active loans, total students, and total fines collected.
- AdminTransactions.jsx shows the full transaction ledger. Admins can approve pending requests, reject them, or mark a book as returned. When a book is returned from here the fine is calculated and saved to the database.
- AdminBooks.jsx lets admins add new books manually or by ISBN lookup, upload PDFs to attach to existing books, edit book details, and delete books.


## Environment variables

The backend reads these from a .env file.

MONGO_URI is the full MongoDB Atlas connection string including the database name and credentials.

JWT_SECRET is any long random string used to sign and verify tokens.

GEMINI_API_KEY is the API key from Google AI Studio. The app uses the Gemini 2.5 Flash model via the v1beta endpoint.

RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are from your Razorpay dashboard under API Keys.

FRONTEND_URL is the full URL of the deployed Vercel frontend. It is used to whitelist CORS requests so the production frontend can talk to the backend.

NODE_ENV should be set to production when deployed.

The frontend only needs one environment variable, VITE_API_URL, which should be the full URL of the Render backend followed by /api.


## Running it locally

Clone the repository and open two terminals, one for the backend and one for the frontend.

In the backend terminal, navigate to the backend folder, run npm install, make sure your .env file is filled in, then run npm run dev.

In the frontend terminal, navigate to the frontend folder, run npm install, create a .env.local file with VITE_API_URL set to http://localhost:5000/api, then run npm run dev.

The app will be at localhost:5173.

To create your first admin account, register a normal account through the app, then run the following command from inside the backend folder replacing the email with the one you used.

node scripts/makeAdmin.js your@email.com


## Deploying to production

Deploy the backend to Render as a Web Service with the root directory set to backend and the start command as npm start. Add all the environment variables listed above in the Render dashboard.

Deploy the frontend to Vercel by importing the repository, setting the root directory to frontend, and adding VITE_API_URL pointing to your Render URL.

After both are deployed, go back to Render and update the FRONTEND_URL variable to match your Vercel URL. This step is important because without it the browser will block all API calls due to CORS policy.

Note that uploaded PDFs stored in the backend uploads folder will not persist on Render across deployments because Render uses an ephemeral file system. The rest of the app works fine in production. Migrating uploads to a cloud storage service like Cloudinary would fix this permanently.


## Known limitations

The fine system is currently configured in test mode where days are treated as minutes so it is easy to see fines accumulate without waiting real time. Before launching publicly, the multiplier in the issueBook and returnBook functions in transactionController.js needs to be changed from minutes back to days by replacing the 60 * 1000 millisecond calculation with 24 * 60 * 60 * 1000.

The AI chatbot does not have memory between messages. Each message is processed independently. This means long conversations lose context, though for a library chatbot this is usually fine.


## Author

Built by Mohith Naidu as a full-stack portfolio project demonstrating real-world system design, AI integration, and payment processing.
