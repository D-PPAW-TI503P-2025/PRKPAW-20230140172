// routes/books.js

const express = require('express');
const router = express.Router();

// Menggunakan array sebagai penyimpanan data sementara (sesuai instruksi tugas)
let books = [
  {id: 1, title: 'Book 1', author: 'Author 1'},
  {id: 2, title: 'Book 2', author: 'Author 2'}
];

// READ all books (GET /api/books)
router.get('/', (req, res) => {
  res.json(books);
});

// READ a single book by ID (GET /api/books/:id)
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  // Jika buku tidak ditemukan, kirim status 404
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// CREATE a new book (POST /api/books)
router.post('/', (req, res) => {
  // Implementasi validasi input sederhana
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  const book = {
    id: books.length + 1,
    title,
    author
  };
  books.push(book);
  res.status(201).json(book);
});

// UPDATE a book by ID (PUT /api/books/:id) -> TAMBAHAN UNTUK TUGAS
router.put('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  // Implementasi validasi input
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  book.title = title;
  book.author = author;
  res.json(book);
});

// DELETE a book by ID (DELETE /api/books/:id) -> TAMBAHAN UNTUK TUGAS
router.delete('/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) return res.status(404).json({ message: 'Book not found' });

  // Hapus buku dari array menggunakan splice
  books.splice(bookIndex, 1);
  // Kirim response no content untuk menandakan berhasil tanpa mengembalikan data
  res.status(204).send();
});

module.exports = router;