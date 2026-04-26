const mongoose = require('mongoose');
const Book = require('./models/Book');
const dotenv = require('dotenv');

dotenv.config();

const curatedBooks = [
    // SCIENCE
    { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", category: "Science", description: "A landmark volume in science writing by one of the great minds of our time.", totalCopies: 5 },
    { title: "The Selfish Gene", author: "Richard Dawkins", isbn: "9780198788607", category: "Science", description: "A brilliant reformulation of the theory of natural selection.", totalCopies: 4 },
    { title: "Cosmos", author: "Carl Sagan", isbn: "9780345539434", category: "Science", description: "The story of fifteen billion years of cosmic evolution.", totalCopies: 6 },
    { title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", isbn: "9780393609394", category: "Science", description: "The essential universe, condensed and simplified.", totalCopies: 8 },
    { title: "The Elegant Universe", author: "Brian Greene", isbn: "9780393058581", category: "Science", description: "Superstrings, hidden dimensions, and the quest for the ultimate theory.", totalCopies: 3 },
    { title: "Silent Spring", author: "Rachel Carson", isbn: "9780618249060", category: "Science", description: "The book that launched the modern environmental movement.", totalCopies: 4 },

    // TECHNOLOGY
    { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", category: "Technology", description: "A handbook of agile software craftsmanship.", totalCopies: 10 },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas", isbn: "9780135957059", category: "Technology", description: "Your journey to mastery in software development.", totalCopies: 7 },
    { title: "The Innovators", author: "Walter Isaacson", isbn: "9781476708690", category: "Technology", description: "How a group of hackers, geniuses, and geeks created the digital revolution.", totalCopies: 5 },
    { title: "Zero to One", author: "Peter Thiel", isbn: "9780804139298", category: "Technology", description: "Notes on startups, or how to build the future.", totalCopies: 12 },
    { title: "The Age of Spiritual Machines", author: "Ray Kurzweil", isbn: "9780140282023", category: "Technology", description: "When computers exceed human intelligence.", totalCopies: 4 },
    { title: "Deep Learning", author: "Ian Goodfellow", isbn: "9780262035613", category: "Technology", description: "The definitive text on the foundations of AI.", totalCopies: 3 },

    // HISTORY
    { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", isbn: "9780062316097", category: "History", description: "Exploring the history of our species.", totalCopies: 15 },
    { title: "Guns, Germs, and Steel", author: "Jared Diamond", isbn: "9780393317558", category: "History", description: "The fates of human societies.", totalCopies: 6 },
    { title: "The Silk Roads", author: "Peter Frankopan", isbn: "9781101912379", category: "History", description: "A new history of the world.", totalCopies: 5 },
    { title: "1776", author: "David McCullough", isbn: "9780743226721", category: "History", description: "The story of the American Revolution.", totalCopies: 4 },
    { title: "The Guns of August", author: "Barbara W. Tuchman", isbn: "9780345476098", category: "History", description: "The outbreak of World War I.", totalCopies: 3 },

    // FICTION
    { title: "1984", author: "George Orwell", isbn: "9780451524935", category: "Fiction", description: "A dystopian masterpiece about totalitarianism.", totalCopies: 20 },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", category: "Fiction", description: "The classic American novel of the Jazz Age.", totalCopies: 10 },
    { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", category: "Fiction", description: "A powerful story of racial injustice.", totalCopies: 12 },
    { title: "The Alchemist", author: "Paulo Coelho", isbn: "9780062315007", category: "Fiction", description: "A magical story about following your dreams.", totalCopies: 25 },
    { title: "Brave New World", author: "Aldous Huxley", isbn: "9780060850524", category: "Fiction", description: "A chilling vision of a consumerist future.", totalCopies: 8 },

    // FANTASY
    { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780547928227", category: "Fantasy", description: "The prelude to the Lord of the Rings.", totalCopies: 15 },
    { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", isbn: "9780590353403", category: "Fantasy", description: "The boy who lived.", totalCopies: 30 },
    { title: "A Game of Thrones", author: "George R.R. Martin", isbn: "9780553103540", category: "Fantasy", description: "Winter is coming.", totalCopies: 10 },
    { title: "The Name of the Wind", author: "Patrick Rothfuss", isbn: "9780756404079", category: "Fantasy", description: "The tale of Kvothe.", totalCopies: 7 },
    { title: "American Gods", author: "Neil Gaiman", isbn: "9780380973651", category: "Fantasy", description: "Ancient gods in modern America.", totalCopies: 6 },

    // NON-FICTION
    { title: "The Tipping Point", author: "Malcolm Gladwell", isbn: "9780316346627", category: "Non-Fiction", description: "How little things can make a big difference.", totalCopies: 10 },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "9780374275631", category: "Non-Fiction", description: "Understanding how we think.", totalCopies: 8 },
    { title: "The 48 Laws of Power", author: "Robert Greene", isbn: "9780140280197", category: "Non-Fiction", description: "Amoral, cunning, ruthless, and instructive.", totalCopies: 5 },
    { title: "Educated", author: "Tara Westover", isbn: "9780399590504", category: "Non-Fiction", description: "A memoir of survival and education.", totalCopies: 9 },
    { title: "The Power of Habit", author: "Charles Duhigg", isbn: "9781400069286", category: "Non-Fiction", description: "Why we do what we do in life and business.", totalCopies: 7 },

    // PSYCHOLOGY
    { title: "Man's Search for Meaning", author: "Viktor E. Frankl", isbn: "9780807014295", category: "Psychology", description: "Finding meaning in the midst of suffering.", totalCopies: 12 },
    { title: "The Interpretation of Dreams", author: "Sigmund Freud", isbn: "9781853264849", category: "Psychology", description: "The foundation of psychoanalysis.", totalCopies: 4 },
    { title: "Flow", author: "Mihaly Csikszentmihalyi", isbn: "9780061339202", category: "Psychology", description: "The psychology of optimal experience.", totalCopies: 6 },
    { title: "Emotional Intelligence", author: "Daniel Goleman", isbn: "9780553375060", category: "Psychology", description: "Why it can matter more than IQ.", totalCopies: 10 },
    { title: "Influence: The Psychology of Persuasion", author: "Robert B. Cialdini", isbn: "9780061241895", category: "Psychology", description: "How to say yes and how to defend against it.", totalCopies: 8 }
];

const seedCurated = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Ingesting Curated Collection...');

        let count = 0;
        for (const book of curatedBooks) {
            try {
                await Book.create({
                    ...book,
                    availableCopies: book.totalCopies,
                    thumbnail: `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` // Dynamic cover source
                });
                count++;
            } catch (err) {
                // Skip duplicates
            }
        }

        console.log(`✅ Success! Added ${count} world-class books to your library.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

seedCurated();
