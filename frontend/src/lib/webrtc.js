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
      console.log('📹 Remote track received:', event.track.kind, 'readyState:', event.track.readyState, 'enabled:', event.track.enabled);
      
      if (!this.remoteStream) {
        this.remoteStream = event.streams[0];
        console.log('🎵 Remote stream set with', this.remoteStream.getTracks().length, 'tracks');
        
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
      
      // Log all tracks in the stream
      if (this.remoteStream) {
        console.log('🎵 All remote tracks:', this.remoteStream.getTracks().map(t => `${t.kind}: enabled=${t.enabled}, muted=${t.muted}, readyState=${t.readyState}`));
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
        },
        video: isVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false,
      };
      
      console.log('🎤 Requesting media with constraints:', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Media stream obtained');
      
      // Ensure tracks are enabled by default
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
        console.log('🎤 Audio track enabled:', track.label, 'Settings:', track.getSettings());
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
        const sender = this.peerConnection.addTrack(track, this.localStream);
        senders.push(sender);
        console.log(`✅ Added ${track.kind} track to peer connection, enabled: ${track.enabled}`);
        
        // Log sender parameters for debugging
        if (track.kind === 'audio') {
          console.log('🎤 Audio sender parameters:', sender.getParameters());
        }
      });
      
      // Verify senders
      console.log('📡 Total senders added:', senders.length);
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
  }

  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
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
