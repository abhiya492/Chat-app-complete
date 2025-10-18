// MongoDB initialization script
db = db.getSiblingDB('chat_db');

// Create collections
db.createCollection('users');
db.createCollection('messages');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.messages.createIndex({ "createdAt": 1 });
db.messages.createIndex({ "senderId": 1, "receiverId": 1 });

print('Database initialized successfully!');