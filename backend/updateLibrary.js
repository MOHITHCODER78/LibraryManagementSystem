const axios = require('axios');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const dotenv = require('dotenv');

dotenv.config();

const newIsbns = [
    { isbn: "9780132350884", category: "Technology" },
    { isbn: "9780735619678", category: "Technology" },
    { isbn: "9780262046305", category: "Technology" },
    { isbn: "9780262510875", category: "Technology" },
    { isbn: "9780201633610", category: "Technology" },
    { isbn: "9780201485677", category: "Technology" },
    { isbn: "9780321573513", category: "Technology" },
    { isbn: "9780201835953", category: "Technology" },
    { isbn: "9780201657883", category: "Technology" },
    { isbn: "9781736049112", category: "Technology" },
    { isbn: "9781491950357", category: "Technology" },
    { isbn: "9780134494166", category: "Technology" },
    { isbn: "9780321125217", category: "Technology" },
    { isbn: "9781492082798", category: "Technology" },
    { isbn: "9781449373320", category: "Technology" },
    { isbn: "9781680502398", category: "Technology" },
    { isbn: "9780321601919", category: "Technology" },
    { isbn: "9781492032649", category: "Technology" },
    { isbn: "9780387310732", category: "Technology" },
    { isbn: "9780262035613", category: "Technology" },
    { isbn: "9781491957660", category: "Technology" },
    { isbn: "9781492041139", category: "Technology" },
    { isbn: "9780134610993", category: "Technology" },
    { isbn: "9781999579500", category: "Technology" },
    { isbn: "9780073523323", category: "Technology" },
    { isbn: "9783950307825", category: "Technology" },
    { isbn: "9781680502534", category: "Technology" },
    { isbn: "9781491954461", category: "Technology" },
    { isbn: "9781491904244", category: "Technology" },
    { isbn: "9781593279509", category: "Technology" },
    { isbn: "9780596517748", category: "Technology" },
    { isbn: "9781492051725", category: "Technology" },
    { isbn: "9780991344628", category: "Technology" },
    { isbn: "9781118063330", category: "Technology" },
    { isbn: "9780133591620", category: "Technology" },
    { isbn: "9780133594140", category: "Technology" },
    { isbn: "9781118026472", category: "Technology" },
    { isbn: "9781593271442", category: "Technology" },
    { isbn: "9780470068526", category: "Technology" },
    { isbn: "9780985673520", category: "Technology" },
    { isbn: "9780984782857", category: "Technology" },
    { isbn: "9781479274833", category: "Technology" },
    { isbn: "9781942788294", category: "Technology" },
    { isbn: "9781491935671", category: "Technology" },
    { isbn: "9781521822807", category: "Technology" },
    { isbn: "9781484226032", category: "Technology" },
    { isbn: "9781617292231", category: "Technology" },
    { isbn: "9780124077263", category: "Technology" },
    { isbn: "9781133187790", category: "Technology" }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const updateLibrary = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Starting Library Update...');

        // 1. Remove the requested books
        console.log('Removing "The Pragmatic Programmer" and "The Great Gatsby"...');
        await Book.deleteMany({
            $or: [
                { title: /The Pragmatic Programmer/i },
                { title: /The Great Gatsby/i }
            ]
        });
        console.log('✅ Removal complete.');

        // 2. Ingest New Tech Books
        let total = 0;
        for (const item of newIsbns) {
            try {
                let bookData = null;
                // Try Google Books
                try {
                    const gRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${item.isbn}`);
                    if (gRes.data.items && gRes.data.items.length > 0) {
                        const info = gRes.data.items[0].volumeInfo;
                        bookData = {
                            title: info.title,
                            author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                            isbn: item.isbn,
                            category: item.category,
                            description: info.description || '',
                            thumbnail: info.imageLinks?.thumbnail || `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg`,
                            totalCopies: 5,
                            availableCopies: 5,
                            googleBookId: gRes.data.items[0].id
                        };
                    }
                } catch (err) {}

                // Try Open Library Fallback
                if (!bookData) {
                    try {
                        const olRes = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${item.isbn}&format=json&jscmd=data`);
                        const data = olRes.data[`ISBN:${item.isbn}`];
                        if (data) {
                            bookData = {
                                title: data.title,
                                author: data.authors ? data.authors.map(a => a.name).join(', ') : 'Unknown',
                                isbn: item.isbn,
                                category: item.category,
                                description: data.notes || 'A professional Computer Science resource.',
                                thumbnail: data.cover?.medium || `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg`,
                                totalCopies: 5,
                                availableCopies: 5
                            };
                        }
                    } catch (err) {}
                }

                if (bookData) {
                    await Book.findOneAndUpdate({ isbn: item.isbn }, bookData, { upsert: true });
                    console.log(`✅ Added: ${bookData.title}`);
                    total++;
                } else {
                    console.log(`⚠️ Skipped: ${item.isbn} (No data found)`);
                }

                await sleep(2000); // Respectful delay
            } catch (err) {
                console.error(`Error for ${item.isbn}:`, err.message);
            }
        }

        console.log(`\n🎉 Update Complete! Added ${total} new tech books.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Fatal Error:', err.message);
        process.exit(1);
    }
};

updateLibrary();
