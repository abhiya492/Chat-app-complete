const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
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
        socket.emit("call:ice-candidate", {
          candidate: event.candidate,
          to: userId,
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log('📹 Remote track received:', event.track.kind);
      this.remoteStream = event.streams[0];
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    return this.peerConnection;
  }

  async getLocalStream(isVideo = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });
      
      // Ensure tracks are enabled by default
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
        console.log('🎤 Audio track enabled');
      });
      
      if (isVideo) {
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = true;
          console.log('📹 Video track enabled');
        });
      }
      
      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }

  addLocalStreamToPeer() {
    if (this.localStream && this.peerConnection) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log('📤 Offer created');
    return offer;
  }

  async createAnswer() {
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    console.log('📤 Answer created');
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
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
  }
}
