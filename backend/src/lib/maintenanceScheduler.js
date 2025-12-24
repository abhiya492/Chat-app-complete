import cron from 'node-cron';
import dataArchiver from '../lib/dataArchiver.js';
import cache from '../lib/cache.js';

class MaintenanceScheduler {
  constructor() {
    this.jobs = new Map();
  }

  // Start all maintenance jobs
  start() {
    console.log('🔧 Starting maintenance scheduler...');

    // Daily cleanup at 2 AM
    this.jobs.set('daily-cleanup', cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Running daily cleanup...');
      try {
        await dataArchiver.cleanupDeletedMessages();
        await dataArchiver.cleanupExpiredStories();
        console.log('✅ Daily cleanup completed');
      } catch (error) {
        console.error('❌ Daily cleanup failed:', error);
      }
    }, { scheduled: false }));

    // Weekly archiving on Sundays at 3 AM
    this.jobs.set('weekly-archive', cron.schedule('0 3 * * 0', async () => {
      console.log('📦 Running weekly archiving...');
      try {
        await dataArchiver.archiveOldMessages();
        await dataArchiver.archiveOldCalls();
        console.log('✅ Weekly archiving completed');
      } catch (error) {
        console.error('❌ Weekly archiving failed:', error);
      }
    }, { scheduled: false }));

    // Monthly full maintenance on 1st at 4 AM
    this.jobs.set('monthly-maintenance', cron.schedule('0 4 1 * *', async () => {
      console.log('🔧 Running monthly maintenance...');
      try {
        await dataArchiver.runMaintenance();
        console.log('✅ Monthly maintenance completed');
      } catch (error) {
        console.error('❌ Monthly maintenance failed:', error);
      }
    }, { scheduled: false }));

    // Cache cleanup every 6 hours
    this.jobs.set('cache-cleanup', cron.schedule('0 */6 * * *', async () => {
      console.log('🗑️ Running cache cleanup...');
      try {
        // Clear expired cache entries
        await cache.deletePattern('*:expired:*');
        console.log('✅ Cache cleanup completed');
      } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
      }
    }, { scheduled: false }));

    // Health check every hour
    this.jobs.set('health-check', cron.schedule('0 * * * *', async () => {
      try {
        const isRedisHealthy = await cache.ping();
        if (!isRedisHealthy) {
          console.warn('⚠️ Redis health check failed');
        }
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, { scheduled: false }));

    // Start all jobs
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`✅ Started ${name} job`);
    });

    console.log('🚀 All maintenance jobs started');
  }

  // Stop all jobs
  stop() {
    console.log('🛑 Stopping maintenance scheduler...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Stopped ${name} job`);
    });
    this.jobs.clear();
    console.log('✅ All maintenance jobs stopped');
  }

  // Get job status
  getStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }

  // Run specific maintenance task manually
  async runTask(taskName) {
    console.log(`🔧 Running ${taskName} manually...`);
    
    try {
      switch (taskName) {
        case 'cleanup':
          await dataArchiver.cleanupDeletedMessages();
          await dataArchiver.cleanupExpiredStories();
          break;
        case 'archive':
          await dataArchiver.archiveOldMessages();
          await dataArchiver.archiveOldCalls();
          break;
        case 'full-maintenance':
          await dataArchiver.runMaintenance();
          break;
        case 'cache-cleanup':
          await cache.deletePattern('*:expired:*');
          break;
        default:
          throw new Error(`Unknown task: ${taskName}`);
      }
      
      console.log(`✅ ${taskName} completed successfully`);
      return { success: true, message: `${taskName} completed` };
    } catch (error) {
      console.error(`❌ ${taskName} failed:`, error);
      return { success: false, error: error.message };
    }
  }
}

export default new MaintenanceScheduler();