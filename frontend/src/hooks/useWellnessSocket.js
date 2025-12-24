import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useWellnessStore } from '../store/useWellnessStore';

export const useWellnessSocket = () => {
  const { socket } = useAuthStore();
  const { setBreakReminder, getMindfulnessPrompt } = useWellnessStore();

  useEffect(() => {
    if (!socket) return;

    // Listen for friend wellness updates
    socket.on('wellness:friend-mood', (data) => {
      console.log(`Friend ${data.userId} updated mood to ${data.mood}`);
    });

    socket.on('wellness:friend-break', (data) => {
      console.log(`Friend ${data.userId} took a break!`);
    });

    // Auto-trigger mindfulness prompts during high activity
    const mindfulnessInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 minutes
        getMindfulnessPrompt();
      }
    }, 300000);

    // Break reminder every 30 minutes
    const breakInterval = setInterval(() => {
      setBreakReminder(true);
    }, 1800000); // 30 minutes

    return () => {
      socket.off('wellness:friend-mood');
      socket.off('wellness:friend-break');
      clearInterval(mindfulnessInterval);
      clearInterval(breakInterval);
    };
  }, [socket, setBreakReminder, getMindfulnessPrompt]);
};