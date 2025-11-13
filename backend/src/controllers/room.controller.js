import Room from "../models/room.model.js";

export const createRoom = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user._id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newRoom = new Room({
      title,
      description,
      category,
      createdBy: userId,
    });

    await newRoom.save();
    await newRoom.populate('createdBy', 'fullName profilePic');

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error in createRoom:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveRooms = async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { status: 'active' };
    if (category && category !== 'all') {
      filter.category = category;
    }

    const rooms = await Room.find(filter)
      .populate('createdBy', 'fullName profilePic')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getActiveRooms:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate('createdBy', 'fullName profilePic');

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("Error in getRoom:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const endRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    room.status = 'ended';
    room.endedAt = new Date();
    await room.save();

    res.status(200).json({ message: "Room ended successfully" });
  } catch (error) {
    console.error("Error in endRoom:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const rooms = await Room.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getUserRooms:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
