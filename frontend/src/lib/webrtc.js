const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
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
        socket.emit("call:ice-candidate", { candidate: event.candidate, to: userId });
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      this.remoteStream.addTrack(event.track);
      event.track.enabled = true;
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    return this.peerConnection;
  }

  async getLocalStream(isVideo = true) {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2,
      },
      video: isVideo ? {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: "user"
      } : false,
    };
    
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.localStream;
  }

  addLocalStreamToPeer() {
    if (this.localStream && this.peerConnection) {
      this.localStream.getTracks().forEach((track) => {
        const sender = this.peerConnection.addTrack(track, this.localStream);
        
        if (track.kind === 'audio') {
          const params = sender.getParameters();
          if (!params.encodings) params.encodings = [{}];
          params.encodings[0].maxBitrate = 128000;
          params.encodings[0].priority = 'high';
          sender.setParameters(params);
        } else if (track.kind === 'video') {
          const params = sender.getParameters();
          if (!params.encodings) params.encodings = [{}];
          params.encodings[0].maxBitrate = 2500000;
          params.encodings[0].scaleResolutionDownBy = 1;
          sender.setParameters(params);
        }
      });
    }
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    offer.sdp = this.enhanceSDP(offer.sdp);
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer() {
    const answer = await this.peerConnection.createAnswer();
    answer.sdp = this.enhanceSDP(answer.sdp);
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  enhanceSDP(sdp) {
    let enhanced = sdp;
    enhanced = enhanced.replace(/(m=audio.*\r\n)/g, (m) => 
      m + 'a=fmtp:111 minptime=10;useinbandfec=1;maxaveragebitrate=128000\r\n'
    );
    return enhanced;
  }

  async setRemoteDescription(description) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    
    if (this.pendingCandidates.length > 0) {
      for (const candidate of this.pendingCandidates) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      this.pendingCandidates = [];
    }
  }

  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection?.remoteDescription) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        this.pendingCandidates.push(candidate);
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  toggleAudio(muted) {
    this.localStream?.getAudioTracks().forEach(track => track.enabled = !muted);
  }

  toggleVideo(videoOff) {
    this.localStream?.getVideoTracks().forEach(track => track.enabled = !videoOff);
  }

  setOnRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  cleanup() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.peerConnection?.close();
    this.localStream = null;
    this.peerConnection = null;
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
  }
}
