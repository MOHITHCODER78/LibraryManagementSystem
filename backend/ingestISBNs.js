const axios = require('axios');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const dotenv = require('dotenv');

dotenv.config();

const isbnList = [
    // Science
    { isbn: "9780553380163", category: "Science" },
    { isbn: "9780199291151", category: "Science" },
    { isbn: "9780393338102", category: "Science" },
    { isbn: "9780345539434", category: "Science" },
    { isbn: "9781476733500", category: "Science" },
    { isbn: "9780393609394", category: "Science" },
    { isbn: "9781400052189", category: "Science" },
    { isbn: "9781509827695", category: "Science" },
    // History
    { isbn: "9780062316097", category: "History" },
    { isbn: "9780393317558", category: "History" },
    { isbn: "9781101912379", category: "History" },
    { isbn: "9780062397348", category: "History" },
    { isbn: "9781476728759", category: "History" },
    { isbn: "9780330505543", category: "History" },
    { isbn: "9780553296983", category: "History" },
    // Fiction
    { isbn: "9780061120084", category: "Fiction" },
    { isbn: "9780451524935", category: "Fiction" },
    { isbn: "9780743273565", category: "Fiction" },
    { isbn: "9780590353427", category: "Fiction" },
    { isbn: "9780547928227", category: "Fiction" },
    { isbn: "9780316769488", category: "Fiction" },
    { isbn: "9781503290563", category: "Fiction" },
    // Non-Fiction
    { isbn: "9780735211292", category: "Non-Fiction" },
    { isbn: "9780812981605", category: "Non-Fiction" },
    { isbn: "9780374533557", category: "Non-Fiction" },
    { isbn: "9780316017930", category: "Non-Fiction" },
    { isbn: "9780743269513", category: "Non-Fiction" },
    { isbn: "9781612680194", category: "Non-Fiction" },
    { isbn: "9781455586691", category: "Non-Fiction" },
    // Biography
    { isbn: "9781451648539", category: "Biography" },
    { isbn: "9780062301239", category: "Biography" },
    { isbn: "9788173711466", category: "Biography" },
    { isbn: "9788172343118", category: "Biography" },
    { isbn: "9780316548182", category: "Biography" },
    { isbn: "9781524763138", category: "Biography" },
    { isbn: "9781501135910", category: "Biography" }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ingestBooks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Starting ISBN ingestion...');

        let total = 0;
        for (const item of isbnList) {
            try {
                let bookData = null;
                try {
                    const res = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${item.isbn}`);
                    if (res.data.items && res.data.items.length > 0) {
                        const info = res.data.items[0].volumeInfo;
                        bookData = {
                            title: info.title,
                            author: info.authors ? info.authors.join(', ') : 'Unknown',
                            isbn: item.isbn,
                            category: item.category,
                            description: info.description || '',
                            thumbnail: info.imageLinks?.thumbnail || `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg`,
                            totalCopies: 5,
                            availableCopies: 5,
                            googleBookId: res.data.items[0].id
                        };
                    }
                } catch (gErr) {
                    console.log(`Google failed for ${item.isbn}, trying Open Library...`);
                }

                // Fallback to Open Library
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
                                description: data.notes || 'No description available.',
                                thumbnail: data.cover?.medium || `https://covers.openlibrary.org/b/isbn/${item.isbn}-M.jpg`,
                                totalCopies: 5,
                                availableCopies: 5
                            };
                        }
                    } catch (olErr) {
                        console.error(`Open Library also failed for ${item.isbn}`);
                    }
                }

                if (bookData) {
                    await Book.findOneAndUpdate(
                        { isbn: item.isbn },
                        bookData,
                        { upsert: true, new: true }
                    );
                    console.log(`✅ Success: Added "${bookData.title}"`);
                    total++;
                } else {
                    console.log(`⚠️ No data found for ISBN: ${item.isbn}`);
                }
                
                // Increase delay to avoid rate limits
                await sleep(2500);

            } catch (err) {
                console.error(`❌ Error for ${item.isbn}:`, err.message);
            }
        }

        console.log(`\n🎉 Ingestion Complete! Added/Updated ${total} books.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Fatal Error:', err.message);
        process.exit(1);
    }
};

ingestBooks();
