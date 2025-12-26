import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import Contact from '../models/contact.model.js';
import Call from '../models/call.model.js';
import { ArchivedMessage } from '../lib/dataArchiver.js';

class DataExportService {
  constructor() {
    this.exportDir = path.join(process.cwd(), 'exports');
    this.ensureExportDir();
  }

  async ensureExportDir() {
    try {
      await fs.access(this.exportDir);
    } catch {
      await fs.mkdir(this.exportDir, { recursive: true });
    }
  }

  // Export all user data
  async exportUserData(userId, format = 'json') {
    try {
      const exportId = `export_${userId}_${Date.now()}`;
      const exportPath = path.join(this.exportDir, exportId);
      
      await fs.mkdir(exportPath, { recursive: true });

      // Collect all user data
      const userData = await this.collectUserData(userId);
      
      if (format === 'json') {
        return await this.exportAsJSON(userData, exportPath, exportId);
      } else if (format === 'csv') {
        return await this.exportAsCSV(userData, exportPath, exportId);
      } else if (format === 'zip') {
        return await this.exportAsZip(userData, exportPath, exportId);
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // Collect all user data from database
  async collectUserData(userId) {
    const [user, messages, archivedMessages, contacts, calls] = await Promise.all([
      User.findById(userId).select('-password').lean(),
      Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      }).populate('senderId receiverId', 'fullName email').lean(),
      ArchivedMessage.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      }).lean(),
      Contact.find({
        $or: [{ requester: userId }, { recipient: userId }]
      }).populate('requester recipient', 'fullName email').lean(),
      Call.find({
        $or: [{ callerId: userId }, { receiverId: userId }]
      }).populate('callerId receiverId', 'fullName email').lean()
    ]);

    return {
      profile: user,
      messages: messages.map(msg => this.sanitizeMessage(msg, userId)),
      archivedMessages: archivedMessages.map(msg => this.sanitizeArchivedMessage(msg, userId)),
      contacts: contacts.map(contact => this.sanitizeContact(contact, userId)),
      calls: calls.map(call => this.sanitizeCall(call, userId)),
      exportMetadata: {
        exportDate: new Date().toISOString(),
        userId,
        totalMessages: messages.length + archivedMessages.length,
        totalContacts: contacts.length,
        totalCalls: calls.length
      }
    };
  }

  // Export as JSON
  async exportAsJSON(userData, exportPath, exportId) {
    const filePath = path.join(exportPath, 'user_data.json');
    await fs.writeFile(filePath, JSON.stringify(userData, null, 2));
    
    return {
      exportId,
      format: 'json',
      filePath,
      size: (await fs.stat(filePath)).size,
      downloadUrl: `/api/privacy/download/${exportId}/user_data.json`
    };
  }

  // Export as CSV files
  async exportAsCSV(userData, exportPath, exportId) {
    const files = [];
    
    // Profile CSV
    const profileCsv = this.objectToCSV([userData.profile]);
    const profilePath = path.join(exportPath, 'profile.csv');
    await fs.writeFile(profilePath, profileCsv);
    files.push('profile.csv');

    // Messages CSV
    if (userData.messages.length > 0) {
      const messagesCsv = this.objectToCSV(userData.messages);
      const messagesPath = path.join(exportPath, 'messages.csv');
      await fs.writeFile(messagesPath, messagesCsv);
      files.push('messages.csv');
    }

    // Contacts CSV
    if (userData.contacts.length > 0) {
      const contactsCsv = this.objectToCSV(userData.contacts);
      const contactsPath = path.join(exportPath, 'contacts.csv');
      await fs.writeFile(contactsPath, contactsCsv);
      files.push('contacts.csv');
    }

    // Calls CSV
    if (userData.calls.length > 0) {
      const callsCsv = this.objectToCSV(userData.calls);
      const callsPath = path.join(exportPath, 'calls.csv');
      await fs.writeFile(callsPath, callsCsv);
      files.push('calls.csv');
    }

    return {
      exportId,
      format: 'csv',
      files,
      downloadUrl: `/api/privacy/download/${exportId}`
    };
  }

  // Export as ZIP archive
  async exportAsZip(userData, exportPath, exportId) {
    const zipPath = path.join(this.exportDir, `${exportId}.zip`);
    const output = await fs.open(zipPath, 'w');
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output.createWriteStream());

    // Add JSON file
    archive.append(JSON.stringify(userData, null, 2), { name: 'user_data.json' });

    // Add CSV files
    if (userData.messages.length > 0) {
      archive.append(this.objectToCSV(userData.messages), { name: 'messages.csv' });
    }
    if (userData.contacts.length > 0) {
      archive.append(this.objectToCSV(userData.contacts), { name: 'contacts.csv' });
    }
    if (userData.calls.length > 0) {
      archive.append(this.objectToCSV(userData.calls), { name: 'calls.csv' });
    }

    // Add privacy report
    const privacyReport = this.generatePrivacyReport(userData);
    archive.append(privacyReport, { name: 'privacy_report.txt' });

    await archive.finalize();
    await output.close();

    const stats = await fs.stat(zipPath);
    
    return {
      exportId,
      format: 'zip',
      filePath: zipPath,
      size: stats.size,
      downloadUrl: `/api/privacy/download/${exportId}.zip`
    };
  }

  // Generate privacy report
  generatePrivacyReport(userData) {
    const report = `
PRIVACY REPORT
==============

Export Date: ${userData.exportMetadata.exportDate}
User ID: ${userData.exportMetadata.userId}

DATA SUMMARY:
- Total Messages: ${userData.exportMetadata.totalMessages}
- Total Contacts: ${userData.exportMetadata.totalContacts}
- Total Calls: ${userData.exportMetadata.totalCalls}

PRIVACY INFORMATION:
- All personal data has been included in this export
- Encrypted messages remain encrypted for your security
- Contact information includes only users you've interacted with
- Call logs include metadata but no audio recordings
- This export complies with GDPR Article 20 (Right to Data Portability)

DATA RETENTION:
- This export file will be automatically deleted after 7 days
- You can request deletion of your account data at any time
- Archived messages older than 1 year are automatically purged

For questions about your data, contact: privacy@chatapp.com
    `.trim();
    
    return report;
  }

  // Convert object array to CSV
  objectToCSV(objArray) {
    if (!objArray.length) return '';
    
    const headers = Object.keys(objArray[0]);
    const csvContent = [
      headers.join(','),
      ...objArray.map(obj => 
        headers.map(header => {
          const value = obj[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }

  // Sanitize message data for export
  sanitizeMessage(message, userId) {
    return {
      id: message._id,
      text: message.text || '[Media/File]',
      type: message.image ? 'image' : message.video ? 'video' : message.voice ? 'voice' : message.file ? 'file' : 'text',
      sent: message.senderId._id.toString() === userId.toString(),
      otherParty: message.senderId._id.toString() === userId.toString() 
        ? message.receiverId.fullName 
        : message.senderId.fullName,
      timestamp: message.createdAt,
      isEncrypted: message.isEncrypted || false,
      isDeleted: message.isDeleted || false
    };
  }

  // Sanitize archived message data
  sanitizeArchivedMessage(message, userId) {
    return {
      id: message.originalId,
      text: message.text || '[Media/File]',
      type: message.image ? 'image' : message.video ? 'video' : message.voice ? 'voice' : message.file ? 'file' : 'text',
      sent: message.senderId.toString() === userId.toString(),
      timestamp: message.originalCreatedAt,
      archivedAt: message.archivedAt,
      isEncrypted: message.isEncrypted || false
    };
  }

  // Sanitize contact data
  sanitizeContact(contact, userId) {
    const isRequester = contact.requester._id.toString() === userId.toString();
    const otherUser = isRequester ? contact.recipient : contact.requester;
    
    return {
      contactName: otherUser.fullName,
      contactEmail: otherUser.email,
      relationship: isRequester ? 'sent_request' : 'received_request',
      status: contact.status,
      addedDate: contact.createdAt,
      nickname: contact.nickname || '',
      group: contact.group || 'general'
    };
  }

  // Sanitize call data
  sanitizeCall(call, userId) {
    const isInitiator = call.callerId._id.toString() === userId.toString();
    const otherUser = isInitiator ? call.receiverId : call.callerId;
    
    return {
      otherParty: otherUser.fullName,
      type: call.type || 'voice',
      direction: isInitiator ? 'outgoing' : 'incoming',
      status: call.status,
      duration: call.duration || 0,
      timestamp: call.createdAt
    };
  }

  // Clean up old export files
  async cleanupOldExports() {
    try {
      const files = await fs.readdir(this.exportDir);
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.exportDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }

  // Get export file for download
  async getExportFile(exportId, fileName = null) {
    if (fileName) {
      const filePath = path.join(this.exportDir, exportId, fileName);
      return filePath;
    } else {
      const zipPath = path.join(this.exportDir, `${exportId}.zip`);
      return zipPath;
    }
  }
}

export default new DataExportService();