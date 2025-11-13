import SharedExperience from "../models/sharedExperience.model.js";

export const createSharedExperience = async (req, res) => {
  try {
    const { type, chatId, data } = req.body;
    const hostId = req.user._id;

    const experience = new SharedExperience({
      type,
      chatId,
      hostId,
      participants: [hostId],
      data
    });

    await experience.save();
    await experience.populate('hostId', 'username fullName profilePic');

    res.status(201).json(experience);
  } catch (error) {
    console.log("Error in createSharedExperience: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const joinSharedExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const experience = await SharedExperience.findByIdAndUpdate(
      id,
      { 
        $addToSet: { participants: userId },
        lastActivity: new Date()
      },
      { new: true }
    ).populate('participants', 'username fullName profilePic');

    if (!experience) {
      return res.status(404).json({ error: "Shared experience not found" });
    }

    res.status(200).json(experience);
  } catch (error) {
    console.log("Error in joinSharedExperience: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveSharedExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const experience = await SharedExperience.findByIdAndUpdate(
      id,
      { 
        $pull: { participants: userId },
        lastActivity: new Date()
      },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({ error: "Shared experience not found" });
    }

    // End experience if no participants left
    if (experience.participants.length === 0) {
      experience.isActive = false;
      await experience.save();
    }

    res.status(200).json(experience);
  } catch (error) {
    console.log("Error in leaveSharedExperience: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSharedExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.user._id;

    const experience = await SharedExperience.findById(id);
    
    if (!experience) {
      return res.status(404).json({ error: "Shared experience not found" });
    }

    // Only host or participants can update
    if (!experience.participants.includes(userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    experience.data = { ...experience.data, ...data };
    experience.lastActivity = new Date();
    await experience.save();

    res.status(200).json(experience);
  } catch (error) {
    console.log("Error in updateSharedExperience: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getActiveExperiences = async (req, res) => {
  try {
    const { chatId } = req.params;

    const experiences = await SharedExperience.find({
      chatId,
      isActive: true
    }).populate('hostId participants', 'username fullName profilePic');

    res.status(200).json(experiences);
  } catch (error) {
    console.log("Error in getActiveExperiences: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};