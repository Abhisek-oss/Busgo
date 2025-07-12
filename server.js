const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory data (replace with DB in prod)
let buses = [
  {
    id: 'bus1',
    name: 'Express Line',
    seats: 40,
    bookedSeats: []
  },
  {
    id: 'bus2',
    name: 'City Rider',
    seats: 30,
    bookedSeats: []
  }
];

// Get all buses
app.get('/buses', (req, res) => {
  res.json(buses);
});

// Get bus details
app.get('/buses/:id', (req, res) => {
  const bus = buses.find(b => b.id === req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json(bus);
});

// Book seats on a bus
app.post('/book', (req, res) => {
  const { busId, seats } = req.body;
  if (!busId || !Array.isArray(seats)) {
    return res.status(400).json({ error: 'busId and seats array are required' });
  }

  const bus = buses.find(b => b.id === busId);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  // Check if requested seats are available
  const unavailableSeats = seats.filter(seat => bus.bookedSeats.includes(seat));
  if (unavailableSeats.length > 0) {
    return res.status(400).json({ error: 'Some seats are already booked', seats: unavailableSeats });
  }

  // Book seats
  bus.bookedSeats.push(...seats);

  // Generate booking ID
  const bookingId = uuidv4();

  res.json({ message: 'Booking successful', bookingId, busId, seats });
});

// Admin route to reset bookings
app.post('/admin/reset', (req, res) => {
  buses.forEach(bus => {
    bus.bookedSeats = [];
  });
  res.json({ message: 'All bookings reset' });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
