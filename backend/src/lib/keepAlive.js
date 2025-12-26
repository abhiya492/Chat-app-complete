// Keep-alive service to prevent cold starts
import cron from 'node-cron';

const RENDER_URL = 'https://chat-app-complete.onrender.com';

// Ping server every 14 minutes to prevent sleep
const keepAlive = () => {
    if (process.env.NODE_ENV === 'production') {
        cron.schedule('*/14 * * * *', async () => {
            try {
                const response = await fetch(`${RENDER_URL}/health`);
                console.log(`Keep-alive ping: ${response.status}`);
            } catch (error) {
                console.log('Keep-alive ping failed:', error.message);
            }
        });
        console.log('🔄 Keep-alive service started');
    }
};

export default keepAlive;