import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Filter, Book as BookIcon, Loader2, BookOpen, Sparkles, User, Tag, CheckCircle2, XCircle, X, ChevronRight } from 'lucide-react';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    const [isReserving, setIsReserving] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedBook, setSelectedBook] = useState(null);
    const [aiSummary, setAiSummary] = useState('');

    const categories = ['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Biography', 'Business', 'Philosophy'];

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async () => {
        if (!selectedBook) return;
        setIsSummarizing(true);
        try {
            const res = await api.post(`/ai/summarize/${selectedBook._id}`);
            setAiSummary(res.data.summary);
        } catch (err) {
            alert('Failed to generate summary');
        } finally {
            setIsSummarizing(false);
        }
    };

    const [requestedDays, setRequestedDays] = useState(3);

    const handleReserve = async (bookId) => {
        setIsReserving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/transactions/request', { bookId, requestedDays });
            setMessage({ type: 'success', text: `Reservation request sent! You requested to borrow for ${requestedDays} days.` });
            fetchBooks();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error making request' });
        } finally {
            setIsReserving(false);
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             book.author.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesCategory = false;
        if (category === 'All') matchesCategory = true;
        else if (category === 'E-Books') matchesCategory = !!book.pdfUrl;
        else matchesCategory = book.category === category;

        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading university library...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Collection</h2>
                    <p className="text-slate-500 mt-1 font-medium">Discover over {books.length} academic resources and digital e-books.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => setCategory(category === 'E-Books' ? 'All' : 'E-Books')}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                            category === 'E-Books' 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        E-Books Only
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search titles, authors..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all w-64"
                        />
                    </div>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredBooks.map((book) => (
                    <div 
                        key={book._id} 
                        onClick={() => {
                            setSelectedBook(book);
                            setAiSummary('');
                        }}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer flex flex-col"
                    >
                        <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                            {book.thumbnail ? (
                                <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <BookIcon className="w-16 h-16" />
                                </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 uppercase tracking-wider shadow-sm">
                                    {book.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">{book.title}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                                <User className="w-3 h-3" />
                                {book.author}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    {book.availableCopies > 0 ? (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">Available</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-tight">Out of Stock</span>
                                        </>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{book.availableCopies} Copies Left</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Details Modal */}
            {selectedBook && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-full md:w-2/5 bg-slate-100 relative">
                            {selectedBook.thumbnail ? (
                                <img src={selectedBook.thumbnail} alt={selectedBook.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <BookIcon className="w-32 h-32" />
                                </div>
                            )}
                            <button 
                                onClick={() => setSelectedBook(null)}
                                className="absolute top-6 left-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-900 hover:bg-white transition-all md:hidden"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto">
                            <div className="hidden md:flex justify-end mb-4">
                                <button onClick={() => setSelectedBook(null)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
                                        {selectedBook.category}
                                    </span>
                                    <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">{selectedBook.title}</h2>
                                    <p className="text-lg text-slate-500 font-medium">{selectedBook.author}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ISBN Number</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedBook.isbn || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedBook.availableCopies} of {selectedBook.totalCopies} copies</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-2">Book Description</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {selectedBook.description || "No description available for this university resource."}
                                    </p>
                                </div>

                                {message.text && (
                                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        {message.text}
                                    </div>
                                )}

                                <div className="pt-6 flex flex-wrap gap-4">
                                    {selectedBook.pdfUrl && (
                                        <button 
                                            onClick={() => window.open(selectedBook.pdfUrl, '_blank')}
                                            className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 min-w-[140px]"
                                        >
                                            <BookOpen className="w-5 h-5" />
                                            Read Online
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleSummarize}
                                        disabled={isSummarizing}
                                        className="flex-1 py-4 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-2 min-w-[140px]"
                                    >
                                        {isSummarizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        AI Summary
                                    </button>
                                    {selectedBook.availableCopies > 0 && (
                                        <div className="flex-1 min-w-[140px] relative">
                                            <select 
                                                value={requestedDays}
                                                onChange={(e) => setRequestedDays(Number(e.target.value))}
                                                className="w-full py-4 px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                            >
                                                <option value={3}>Borrow for 3 Days</option>
                                                <option value={5}>Borrow for 5 Days</option>
                                                <option value={7}>Borrow for 7 Days</option>
                                            </select>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => handleReserve(selectedBook._id)}
                                        disabled={selectedBook.availableCopies === 0 || isReserving}
                                        className={`flex-[2] py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 min-w-[200px] ${
                                            selectedBook.availableCopies > 0 
                                            ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5' 
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isReserving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                        {selectedBook.availableCopies > 0 ? 'Request to Borrow' : 'Not Available'}
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                {aiSummary && (
                                    <div className="mt-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles className="w-4 h-4 text-indigo-500" />
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Deep Analysis Summary</span>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed italic">
                                            {aiSummary}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;
