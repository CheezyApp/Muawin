const Ticket = require('../models/Ticket');

// Create a new ticket
const createTicket = async (req, res) => {
  try {
    const { subject, description, createdBy } = req.body;

    // Generate a unique 5-digit ticket ID
    const ticketId = Math.floor(10000 + Math.random() * 90000).toString();

    // Create a new ticket
    const newTicket = new Ticket({
      ticketId,
      subject,
      description,
      createdBy,
    });

    await newTicket.save(); // Save the ticket in MongoDB
    res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
  } catch (error) {
    // console.error('Error creating ticket:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find(); // Retrieve all tickets
    res.status(200).json(tickets);
  } catch (error) {
    // console.error('Error fetching tickets:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Get a ticket by its ID
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    // console.error('Error fetching ticket:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Update ticket status
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await Ticket.findOneAndUpdate(
      { ticketId: req.params.ticketId },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({ message: 'Ticket status updated', ticket });
  } catch (error) {
    // console.error('Error updating ticket status:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a ticket
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndDelete({ ticketId: req.params.ticketId });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    // console.error('Error deleting ticket:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  deleteTicket,
}; 