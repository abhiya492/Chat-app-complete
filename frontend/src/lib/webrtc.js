const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
    this.pendingCandidates = [];
  }

  async initializePeerConnection(socket, userId) {
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 ICE candidate generated');
        socket.emit("call:ice-candidate", {
          candidate: event.candidate,
          to: userId,
        });
      } else {
        console.log('✅ ICE gathering complete');
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log('📹 Remote track received:', event.track.kind, 'readyState:', event.track.readyState, 'enabled:', event.track.enabled, 'muted:', event.track.muted);
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        console.log('🎵 Remote stream created');
      }
      
      // Add track to remote stream
      this.remoteStream.addTrack(event.track);
      console.log(`✅ Added ${event.track.kind} track to remote stream`);
      
      // Ensure track is enabled
      event.track.enabled = true;
      
      // Trigger callback immediately for each track
      if (this.onRemoteStreamCallback) {
        console.log('🔔 Triggering remote stream callback');
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔌 Connection state:', this.peerConnection.connectionState);
      if (this.peerConnection.connectionState === 'failed') {
        console.error('❌ Connection failed!');
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection.iceConnectionState);
      if (this.peerConnection.iceConnectionState === 'failed') {
        console.error('❌ ICE connection failed!');
      }
    };

    return this.peerConnection;
  }

  async getLocalStream(isVideo = true) {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        },
        video: isVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false,
      };
      
      console.log('🎤 Requesting media with constraints:', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Media stream obtained with', this.localStream.getTracks().length, 'tracks');
      
      // Ensure tracks are enabled and verify settings
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
        const settings = track.getSettings();
        console.log('🎤 Audio track:', track.label);
        console.log('  - Enabled:', track.enabled);
        console.log('  - Muted:', track.muted);
        console.log('  - ReadyState:', track.readyState);
        console.log('  - Settings:', settings);
        
        // Test audio level
        track.onmute = () => console.warn('⚠️ Audio track muted!');
        track.onunmute = () => console.log('✅ Audio track unmuted');
        track.onended = () => console.warn('⚠️ Audio track ended!');
      });
      
      if (isVideo) {
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = true;
          console.log('📹 Video track enabled:', track.label);
        });
      }
      
      return this.localStream;
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
      throw error;
    }
  }

  addLocalStreamToPeer() {
    if (this.localStream && this.peerConnection) {
      const senders = [];
      this.localStream.getTracks().forEach((track) => {
        // Ensure track is enabled before adding
        track.enabled = true;
        
        const sender = this.peerConnection.addTrack(track, this.localStream);
        senders.push(sender);
        console.log(`✅ Added ${track.kind} track to peer connection`);
        console.log(`  - Track enabled: ${track.enabled}`);
        console.log(`  - Track muted: ${track.muted}`);
        console.log(`  - Track readyState: ${track.readyState}`);
        
        // Log and verify sender parameters
        if (track.kind === 'audio') {
          const params = sender.getParameters();
          console.log('🎤 Audio sender parameters:', params);
          console.log('  - Encodings:', params.encodings);
          
          // Ensure audio is not degraded
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = 128000; // 128 kbps
            params.encodings[0].priority = 'high';
            sender.setParameters(params).then(() => {
              console.log('✅ Audio parameters updated for better quality');
            }).catch(err => {
              console.warn('⚠️ Could not update audio parameters:', err);
            });
          }
        }
      });
      
      // Verify all senders
      console.log('📡 Total senders added:', senders.length);
      console.log('📡 Peer connection senders:', this.peerConnection.getSenders().length);
      
      // Verify transceivers
      const transceivers = this.peerConnection.getTransceivers();
      console.log('🔄 Transceivers:', transceivers.length);
      transceivers.forEach(t => {
        console.log(`  - ${t.sender.track?.kind}: direction=${t.direction}, currentDirection=${t.currentDirection}`);
      });
      
      return senders;
    }
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log('📤 Offer created:', offer.sdp.includes('m=audio'), 'audio,', offer.sdp.includes('m=video'), 'video');
    return offer;
  }

  async createAnswer() {
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    console.log('📤 Answer created:', answer.sdp.includes('m=audio'), 'audio,', answer.sdp.includes('m=video'), 'video');
    return answer;
  }

  async setRemoteDescription(description) {
    console.log('📥 Setting remote description:', description.type);
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(description)
    );
    
    // Add any buffered ICE candidates
    if (this.pendingCandidates.length > 0) {
      console.log('📥 Adding', this.pendingCandidates.length, 'buffered ICE candidates');
      for (const candidate of this.pendingCandidates) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      this.pendingCandidates = [];
    }
  }

  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection && this.peerConnection.remoteDescription) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ ICE candidate added');
      } else {
        console.log('💾 Buffering ICE candidate until remote description is set');
        this.pendingCandidates.push(candidate);
      }
    } catch (error) {
      console.error("❌ Error adding ICE candidate:", error);
    }
  }

  toggleAudio(muted) {
    if (!this.localStream) {
      console.warn('No local stream available for audio toggle');
      return;
    }
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn('No audio tracks found');
      return;
    }
    audioTracks.forEach((track) => {
      track.enabled = !muted;
      console.log(`🎤 Audio ${muted ? 'muted' : 'unmuted'}`);
    });
  }

  toggleVideo(videoOff) {
    if (!this.localStream) {
      console.warn('No local stream available for video toggle');
      return;
    }
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.warn('No video tracks found');
      return;
    }
    videoTracks.forEach((track) => {
      track.enabled = !videoOff;
      console.log(`📹 Video ${videoOff ? 'off' : 'on'}`);
    });
  }

  setOnRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  cleanup() {
    console.log('🧹 Cleaning up WebRTC resources...');
    
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        console.log(`🛑 Stopping ${track.kind} track`);
        track.stop();
      });
      this.localStream = null;
    }
    
    if (this.peerConnection) {
      console.log('🔌 Closing peer connection');
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
    console.log('✅ Cleanup complete');
  }
}
