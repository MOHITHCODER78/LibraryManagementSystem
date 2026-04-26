const axios = require('axios');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const dotenv = require('dotenv');

dotenv.config();

const philosophyIsbns = [
    { isbn: "9780140449334", title: "Meditations" },
    { isbn: "9780140449235", title: "Beyond Good and Evil" },
    { isbn: "9780140455113", title: "The Republic" },
    { isbn: "9780140449495", title: "Nicomachean Ethics" },
    { isbn: "9780140447477", title: "Critique of Pure Reason" },
    { isbn: "9780140441185", title: "Thus Spoke Zarathustra" },
    { isbn: "9781599869773", title: "The Art of War" },
    { isbn: "9780140449150", title: "The Prince" },
    { isbn: "9780807014271", title: "Man's Search for Meaning" },
    { isbn: "9780192854216", title: "The Problems of Philosophy" },
    { isbn: "9780671867805", title: "Being and Nothingness" },
    { isbn: "9780679733737", title: "The Myth of Sisyphus" }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const addPhilosophyBooks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Starting Philosophy ingestion...');

        let total = 0;
        for (const item of philosophyIsbns) {
            try {
                let bookData = null;
                
                // Try Google Books First
                try {
                    const gRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${item.isbn}`);
                    if (gRes.data.items && gRes.data.items.length > 0) {
                        const info = gRes.data.items[0].volumeInfo;
                        bookData = {
                            title: info.title || item.title,
                            author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                            isbn: item.isbn,
                            category: "Philosophy",
                            description: info.description || '',
                            thumbnail: info.imageLinks?.thumbnail || `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg`,
                            totalCopies: 5,
                            availableCopies: 5,
                            googleBookId: gRes.data.items[0].id
                        };
                    }
                } catch (gErr) {
                    console.log(`Google failed for ${item.isbn}, trying Open Library...`);
                }

                // Try Open Library Fallback
                if (!bookData) {
                    try {
                        const olRes = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${item.isbn}&format=json&jscmd=data`);
                        const data = olRes.data[`ISBN:${item.isbn}`];
                        if (data) {
                            bookData = {
                                title: data.title || item.title,
                                author: data.authors ? data.authors.map(a => a.name).join(', ') : 'Unknown Author',
                                isbn: item.isbn,
                                category: "Philosophy",
                                description: data.notes || 'A classic philosophical text.',
                                thumbnail: data.cover?.medium || `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg`,
                                totalCopies: 5,
                                availableCopies: 5
                            };
                        } else {
                            // If both fail but we have the title and ISBN, we can manually create a skeleton record
                            bookData = {
                                title: item.title,
                                author: 'Various / Unknown',
                                isbn: item.isbn,
                                category: "Philosophy",
                                description: 'A classic philosophical text.',
                                thumbnail: `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg`,
                                totalCopies: 5,
                                availableCopies: 5
                            };
                        }
                    } catch (err) {
                        console.log(`Open Library failed for ${item.isbn}, using basic data...`);
                        bookData = {
                            title: item.title,
                            author: 'Various / Unknown',
                            isbn: item.isbn,
                            category: "Philosophy",
                            description: 'A classic philosophical text.',
                            thumbnail: `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg`,
                            totalCopies: 5,
                            availableCopies: 5
                        };
                    }
                }

                if (bookData) {
                    await Book.findOneAndUpdate({ isbn: item.isbn }, bookData, { upsert: true });
                    console.log(`✅ Added: ${bookData.title}`);
                    total++;
                }

                await sleep(2000); // 2 second delay to avoid rate limit bans
            } catch (err) {
                console.error(`Error processing ${item.isbn}:`, err.message);
            }
        }

        console.log(`\n🎉 Ingestion Complete! Added ${total} Philosophy books.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Fatal Error:', err.message);
        process.exit(1);
    }
};

addPhilosophyBooks();
