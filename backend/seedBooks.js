const mongoose = require('mongoose');
const Book = require('./models/Book');
const dotenv = require('dotenv');

dotenv.config();

const books = [
    {
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        category: "Technology",
        totalCopies: 5,
        availableCopies: 5,
        description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg"
    },
    {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt",
        isbn: "9780135957059",
        category: "Technology",
        totalCopies: 3,
        availableCopies: 3,
        description: "The Pragmatic Programmer is one of those rare tech books you'll read, re-read, and read again over the years.",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/I/41as+49f8JL._SX396_BO1,204,203,200_.jpg"
    },
    {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        isbn: "9780062316097",
        category: "History",
        totalCopies: 10,
        availableCopies: 10,
        description: "Destined to become a modern classic in the vein of Guns, Germs, and Steel.",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/I/41yu2qXhXXL._SX324_BO1,204,203,200_.jpg"
    },
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "9780743273565",
        category: "Fiction",
        totalCopies: 8,
        availableCopies: 8,
        description: "The Great Gatsby, F. Scott Fitzgerald's third book, stands as the supreme achievement of his career.",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/I/41N96I5a6DL._SX331_BO1,204,203,200_.jpg"
    },
    {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        isbn: "9780553380163",
        category: "Science",
        totalCopies: 4,
        availableCopies: 4,
        description: "A landmark volume in science writing by one of the great minds of our time.",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/I/51+GySc8ExL._SX325_BO1,204,203,200_.jpg"
    }
];

const seedBooks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');
        
        // Clear existing books to avoid duplicates for this demo
        await Book.deleteMany({});
        
        await Book.insertMany(books);
        console.log(`${books.length} Professional assets ingested successfully!`);
        
        await mongoose.connection.close();
    } catch (err) {
        console.error('Seeding Error:', err.message);
    }
};

seedBooks();
