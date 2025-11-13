import { useState, useEffect } from "react";
import { useRoomStore } from "../store/useRoomStore";
import { Users, Plus, Music, Gamepad2, Code, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'tech', label: 'Tech', icon: Code },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'casual', label: 'Casual', icon: MessageCircle },
];

const Rooms = () => {
  const { rooms, getActiveRooms, isLoading } = useRoomStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getActiveRooms(selectedCategory);
  }, [selectedCategory, getActiveRooms]);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🎙️ Voice Rooms</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary gap-2"
          >
            <Plus size={20} />
            Create Room
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`btn btn-sm gap-2 ${
                selectedCategory === id ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg opacity-60">No active rooms</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary mt-4"
            >
              Create the first room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} navigate={navigate} />
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateRoomModal onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    </div>
  );
};

const RoomCard = ({ room, navigate }) => {
  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : Users;
  };

  const Icon = getCategoryIcon(room.category);

  return (
    <div
      onClick={() => navigate(`/room/${room._id}`)}
      className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="card-title text-lg">{room.title}</h3>
            {room.description && (
              <p className="text-sm opacity-70 mt-1">{room.description}</p>
            )}
          </div>
          <div className="badge badge-primary gap-1">
            <Icon size={12} />
            {room.category}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>0/{room.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="avatar">
            <div className="w-6 h-6 rounded-full">
              <img src={room.createdBy?.profilePic || '/avatar.png'} alt="host" />
            </div>
          </div>
          <span className="text-xs opacity-70">
            Hosted by {room.createdBy?.fullName}
          </span>
        </div>
      </div>
    </div>
  );
};

const CreateRoomModal = ({ onClose }) => {
  const { createRoom } = useRoomStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'casual',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const room = await createRoom(formData);
    if (room) {
      onClose();
      navigate(`/room/${room._id}`);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create Voice Room</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Room Title</span>
            </label>
            <input
              type="text"
              placeholder="Late Night Coding"
              className="input input-bordered"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Description (optional)</span>
            </label>
            <textarea
              placeholder="What's this room about?"
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={500}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.filter(c => c.id !== 'all').map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Room
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default Rooms;
