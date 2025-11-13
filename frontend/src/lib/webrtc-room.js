export class RoomAudioManager {
  constructor(roomId, userId, socket) {
    this.roomId = roomId;
    this.userId = userId;
    this.socket = socket;
    this.peers = new Map(); // userId -> RTCPeerConnection
    this.localStream = null;
    this.isMuted = false;
    this.onConnectionQualityChange = null;
  }

  async initialize() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
        video: false,
      });
      
      this.setupVoiceDetection();
      return true;
    } catch (error) {
      console.error("Failed to get microphone:", error);
      return false;
    }
  }

  setupVoiceDetection() {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    
    const source = audioContext.createMediaStreamSource(this.localStream);
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let isSpeaking = false;
    
    const detect = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const speaking = average > 30 && !this.isMuted;
      
      if (speaking !== isSpeaking) {
        isSpeaking = speaking;
        this.socket.emit("room:speaking", { roomId: this.roomId, isSpeaking: speaking });
      }
      
      requestAnimationFrame(detect);
    };
    
    detect();
  }

  async connectToPeer(targetUserId) {
    if (this.peers.has(targetUserId)) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });

    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream);
    });

    pc.ontrack = (event) => {
      this.playRemoteAudio(targetUserId, event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('room:webrtc:ice-candidate', {
          roomId: this.roomId,
          targetUserId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.monitorConnectionQuality(targetUserId, pc);
      }
    };

    this.peers.set(targetUserId, pc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    this.socket.emit('room:webrtc:offer', {
      roomId: this.roomId,
      targetUserId,
      offer
    });
  }

  async handleOffer(fromUserId, offer) {
    if (this.peers.has(fromUserId)) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });

    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream);
    });

    pc.ontrack = (event) => {
      this.playRemoteAudio(fromUserId, event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('room:webrtc:ice-candidate', {
          roomId: this.roomId,
          targetUserId: fromUserId,
          candidate: event.candidate
        });
      }
    };

    this.peers.set(fromUserId, pc);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    this.socket.emit('room:webrtc:answer', {
      roomId: this.roomId,
      targetUserId: fromUserId,
      answer
    });
  }

  async handleAnswer(fromUserId, answer) {
    const pc = this.peers.get(fromUserId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(fromUserId, candidate) {
    const pc = this.peers.get(fromUserId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  playRemoteAudio(userId, stream) {
    let audio = document.getElementById(`audio-${userId}`);
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = `audio-${userId}`;
      audio.autoplay = true;
      document.body.appendChild(audio);
    }
    audio.srcObject = stream;
  }

  toggleMute() {
    if (this.localStream) {
      this.isMuted = !this.isMuted;
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
    return this.isMuted;
  }

  disconnectPeer(userId) {
    const pc = this.peers.get(userId);
    if (pc) {
      pc.close();
      this.peers.delete(userId);
    }
    
    const audio = document.getElementById(`audio-${userId}`);
    if (audio) {
      audio.remove();
    }
  }

  async monitorConnectionQuality(userId, pc) {
    const checkQuality = async () => {
      if (!this.peers.has(userId)) return;
      
      try {
        const stats = await pc.getStats();
        let packetsLost = 0;
        let packetsReceived = 0;
        
        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.kind === 'audio') {
            packetsLost = report.packetsLost || 0;
            packetsReceived = report.packetsReceived || 0;
          }
        });
        
        const lossRate = packetsReceived > 0 ? packetsLost / packetsReceived : 0;
        let quality = 'excellent';
        
        if (lossRate > 0.05) quality = 'poor';
        else if (lossRate > 0.02) quality = 'fair';
        else if (lossRate > 0.01) quality = 'good';
        
        if (this.onConnectionQualityChange) {
          this.onConnectionQualityChange(userId, quality);
        }
        
        setTimeout(checkQuality, 3000);
      } catch (error) {
        console.error('Quality check error:', error);
      }
    };
    
    checkQuality();
  }

  cleanup() {
    this.peers.forEach((pc, userId) => {
      pc.close();
      const audio = document.getElementById(`audio-${userId}`);
      if (audio) audio.remove();
    });
    this.peers.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }
}
