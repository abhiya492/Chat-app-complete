import { useEffect, useRef, useState } from "react";
import { useRandomChatStore } from "../store/useRandomChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import { Shuffle, SkipForward, X, Send, Mic, MicOff, Video, VideoOff, Globe, Smile, Image as ImageIcon, Volume2, VolumeX, BarChart3, Zap, Copy, Trash2, Pin, MoreVertical, Check, CheckCheck, Clock, Gamepad2, Sparkles, Languages, Settings, Maximize2, Sun, Contrast, Droplet, User, Monitor, MonitorOff, PictureInPicture2, Maximize, Minimize, Star, Award, TrendingUp, AlertTriangle, Shield, Ban, Heart, History, Music, Play, Pause, SkipBack, SkipForward as SkipNext, Lightbulb, Pencil, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RandomChat = () => {
  const {
    isSearching,
    isMatched,
    partner,
    sessionId,
    webrtcService,
    messages,
    localStream,
    remoteStream,
    joinRandomChat,
    skipPartner,
    leaveRandomChat,
    sendMessage,
    setupRandomChatListeners,
    cleanupRandomChatListeners,
  } = useRandomChatStore();
  
  const { socket, authUser } = useAuthStore();
  const { setupCallListeners, cleanupCallListeners } = useCallStore();
  const navigate = useNavigate();
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('any');
  const [interests, setInterests] = useState([]);
  const [chatDuration, setChatDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [liveReaction, setLiveReaction] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [conversationStats, setConversationStats] = useState({ sent: 0, received: 0, reactions: 0 });
  const [showStats, setShowStats] = useState(false);
  const [quickReplies] = useState(['Hey! 👋', 'LOL 😂', 'Nice! 👍', 'Really? 🤔', 'Awesome! 🔥']);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, msgIndex: null });
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [deletedMessages, setDeletedMessages] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [conversationMood, setConversationMood] = useState('neutral');
  const [showGame, setShowGame] = useState(false);
  const [gameBoard, setGameBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const chatContainerRef = useRef(null);
  const [videoFilter, setVideoFilter] = useState('none');
  const [showFilters, setShowFilters] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [videoQuality, setVideoQuality] = useState('hd');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [mirrorVideo, setMirrorVideo] = useState(false);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [beautyMode, setBeautyMode] = useState(false);
  const [fps, setFps] = useState(0);
  const [bitrate, setBitrate] = useState(0);
  const [avatarMode, setAvatarMode] = useState(false);
  const [myAvatar, setMyAvatar] = useState('😊');
  const [strangerAvatar, setStrangerAvatar] = useState('👤');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioWaveform, setAudioWaveform] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [funFact, setFunFact] = useState('');
  const [partnerTypingText, setPartnerTypingText] = useState('');
  const [ageGroup, setAgeGroup] = useState('any');
  const [location, setLocation] = useState('any');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userKarma, setUserKarma] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [partnerRating, setPartnerRating] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [musicVolume, setMusicVolume] = useState(50);
  const [selectedPlaylist, setSelectedPlaylist] = useState('chill');
  const audioRef = useRef(null);
  const [showChallenges, setShowChallenges] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [triviaScore, setTriviaScore] = useState({ me: 0, partner: 0 });
  const [drawingCanvas, setDrawingCanvas] = useState(null);
  const canvasRef = useRef(null);
  const messageInputRef = useRef(null);
  const [challengeInvite, setChallengeInvite] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [waitingForAccept, setWaitingForAccept] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);

  const emojiCategories = {
    smileys: ['😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤗', '🤔', '😏', '😜', '🤪', '😇', '🥳', '🤩'],
    gestures: ['👍', '👎', '👏', '🙌', '👋', '🤝', '✌️', '🤞', '🤟', '🤘', '👌', '💪', '🙏', '✋', '🤚', '👊'],
    hearts: ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '💟', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍'],
    reactions: ['🔥', '✨', '💯', '⚡', '💥', '🌟', '⭐', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '👑', '💎', '🚀'],
    memes: ['😭', '💀', '🤡', '👻', '💩', '🤮', '🥴', '😵', '🤯', '😱', '🙄', '😤', '😠', '🤬', '😈', '👿']
  };
  const [activeEmojiTab, setActiveEmojiTab] = useState('smileys');
  
  const memeTemplates = [
    { url: 'https://i.imgflip.com/30b1gx.jpg', name: 'Drake' },
    { url: 'https://i.imgflip.com/1bij.jpg', name: 'Success Kid' },
    { url: 'https://i.imgflip.com/1g8my4.jpg', name: 'Distracted Boyfriend' },
    { url: 'https://i.imgflip.com/26am.jpg', name: 'Surprised Pikachu' },
    { url: 'https://i.imgflip.com/1ur9b0.jpg', name: 'Stonks' },
    { url: 'https://i.imgflip.com/4t0m5.jpg', name: 'Woman Yelling at Cat' },
    { url: 'https://i.imgflip.com/3lmzyx.jpg', name: 'Bernie Sanders' },
    { url: 'https://i.imgflip.com/1ihzfe.jpg', name: 'Expanding Brain' },
    { url: 'https://i.imgflip.com/5c7lwq.jpg', name: 'Trade Offer' },
    { url: 'https://i.imgflip.com/261o3j.jpg', name: 'Panik Kalm' },
    { url: 'https://i.imgflip.com/2fm6x.jpg', name: 'Disaster Girl' },
    { url: 'https://i.imgflip.com/1otk96.jpg', name: 'Mocking SpongeBob' },
    { url: 'https://i.imgflip.com/2kbn1e.jpg', name: 'Is This a Pigeon' },
    { url: 'https://i.imgflip.com/1c1uej.jpg', name: 'Leonardo DiCaprio' },
    { url: 'https://i.imgflip.com/3oevdk.jpg', name: 'Buff Doge vs Cheems' },
    { url: 'https://i.imgflip.com/4acd7j.jpg', name: 'Coffin Dance' },
    { url: 'https://i.imgflip.com/5gimtn.jpg', name: 'Gigachad' },
    { url: 'https://i.imgflip.com/5o32tt.jpg', name: 'Bing Chilling' },
    { url: 'https://i.imgflip.com/6eewtf.jpg', name: 'Breaking Bad' },
    { url: 'https://i.imgflip.com/7p4k5p.jpg', name: 'Barbie Oppenheimer' },
    { url: 'https://i.imgflip.com/1bh6de.jpg', name: 'Roll Safe' },
    { url: 'https://i.imgflip.com/1yxkcp.jpg', name: 'Monkey Puppet' },
    { url: 'https://i.imgflip.com/2ybua0.jpg', name: 'Surprised Pikachu HD' },
    { url: 'https://i.imgflip.com/3oqj4n.jpg', name: 'Doge' },
    { url: 'https://i.imgflip.com/4hiybr.jpg', name: 'Always Has Been' },
    { url: 'https://i.imgflip.com/5c7lwq.jpg', name: 'Trade Offer' },
    { url: 'https://i.imgflip.com/5kdc6d.jpg', name: 'Sigma Male' },
    { url: 'https://i.imgflip.com/6c8s1j.jpg', name: 'Gru Plan' },
    { url: 'https://i.imgflip.com/1e7ql7.jpg', name: 'Tuxedo Winnie' },
    { url: 'https://i.imgflip.com/2cp1.jpg', name: 'Bad Luck Brian' },
    { url: 'https://i.imgflip.com/1o00in.jpg', name: 'Boardroom Meeting' },
    { url: 'https://i.imgflip.com/1wz3as.jpg', name: 'Spiderman Pointing' },
    { url: 'https://i.imgflip.com/3umnxp.jpg', name: 'Anakin Padme' },
    { url: 'https://i.imgflip.com/4p3fy2.jpg', name: 'Wojak' },
    { url: 'https://i.imgflip.com/5xtog5.jpg', name: 'Squid Game' },
    { url: 'https://i.imgflip.com/6hl9v2.jpg', name: 'Wednesday Addams' },
    { url: 'https://i.imgflip.com/7kqcxo.jpg', name: 'Oppenheimer' },
    { url: 'https://i.imgflip.com/8g0ew4.jpg', name: 'Skibidi Toilet' },
    { url: 'https://i.imgflip.com/8jw6jn.jpg', name: 'Sigma Grindset' },
    { url: 'https://i.imgflip.com/1nck6k.jpg', name: 'Waiting Skeleton' },
    { url: 'https://i.imgflip.com/1h7in3.jpg', name: 'Two Buttons' },
    { url: 'https://i.imgflip.com/1bgw.jpg', name: 'Philosoraptor' },
    { url: 'https://i.imgflip.com/1bhk.jpg', name: 'First World Problems' },
    { url: 'https://i.imgflip.com/5xtog5.jpg', name: 'Pepe' },
    { url: 'https://i.imgflip.com/2d3al6.jpg', name: 'Thanos Snap' },
    { url: 'https://i.imgflip.com/3pnr0n.jpg', name: 'Baby Yoda' },
    { url: 'https://i.imgflip.com/4apmep.jpg', name: 'Coffin Dance Meme' },
    { url: 'https://i.imgflip.com/5c7lwq.jpg', name: 'Trade Offer 2' },
    { url: 'https://i.imgflip.com/6eewtf.jpg', name: 'Better Call Saul' },
  ];
  
  const animatedStickers = [
    'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif', // thumbs up
    'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', // party
    'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif', // heart eyes
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // fire
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', // clapping
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', // laughing
    'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif', // shocked
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif', // crying
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif', // dancing
    'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif', // wink
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', // kiss
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif', // cool
    'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', // love
    'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', // thinking
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif', // excited
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', // sleepy
  ];
  
  const funFacts = [
    '🌍 Over 4 billion people use the internet worldwide!',
    '💬 The first text message was sent in 1992',
    '🎥 Video calls were predicted in 1870s science fiction',
    '😊 Emojis were invented in Japan in 1999',
    '⚡ Light travels at 299,792 km per second',
    '🌟 You are made of stardust from ancient stars',
    '🎵 Music can boost your mood in just 15 seconds',
    '🧠 Your brain generates 70,000 thoughts per day',
    '🌈 No two people see the same rainbow',
    '🎨 The human eye can see 10 million colors',
    '🚀 The internet weighs about 50 grams (electrons)',
    '📱 The first smartphone was released in 1994',
    '🎮 Gaming can improve problem-solving skills',
    '🌙 The moon is moving away from Earth 3.8cm/year',
    '⭐ There are more stars than grains of sand on Earth',
  ];
  
  const trendingGifs = [
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
    'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif',
    'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
    'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    'https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif',
    'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
    'https://media.giphy.com/media/l0MYGb8Y3odnQPJXa/giphy.gif',
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
    'https://media.giphy.com/media/26tPnAAJxXTvpLwJy/giphy.gif',
    'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
    'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif',
    'https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/26tPqTOGf3MMAaJR6/giphy.gif',
    'https://media.giphy.com/media/3o7TKnO6Wve6502iJ2/giphy.gif',
    'https://media.giphy.com/media/26BRwW3ckGjcZmsxO/giphy.gif',
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    'https://media.giphy.com/media/26tPo9rksWnfPo4HS/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
    'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
    'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif',
    'https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif',
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif',
    'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
    'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    'https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif',
    'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
    'https://media.giphy.com/media/l0MYGb8Y3odnQPJXa/giphy.gif',
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
    'https://media.giphy.com/media/26tPnAAJxXTvpLwJy/giphy.gif',
    'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
    'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif',
  ];

  const languages = [
    { code: 'any', name: 'Any Language' },
    { code: 'english', name: 'English' },
    { code: 'hindi', name: 'हिन्दी (Hindi)' },
    { code: 'spanish', name: 'Español' },
    { code: 'french', name: 'Français' },
    { code: 'german', name: 'Deutsch' },
  ];

  const ageGroups = [
    { code: 'any', name: 'Any Age' },
    { code: '13-17', name: '13-17 (Teens)' },
    { code: '18-24', name: '18-24 (Young Adults)' },
    { code: '25-34', name: '25-34 (Adults)' },
    { code: '35-44', name: '35-44 (Mature)' },
    { code: '45+', name: '45+ (Senior)' },
  ];

  const locations = [
    { code: 'any', name: 'Worldwide' },
    { code: 'north-america', name: '🌎 North America' },
    { code: 'south-america', name: '🌎 South America' },
    { code: 'europe', name: '🌍 Europe' },
    { code: 'asia', name: '🌏 Asia' },
    { code: 'africa', name: '🌍 Africa' },
    { code: 'oceania', name: '🌏 Oceania' },
  ];

  const popularInterests = [
    '🎮 Gaming', '🎵 Music', '⚽ Sports', '🎬 Movies', '📚 Reading',
    '🍳 Cooking', '✈️ Travel', '🎨 Art', '💻 Coding', '📸 Photography',
    '🏋️ Fitness', '🎭 Theater', '🎸 Guitar', '⚽ Football', '🏀 Basketball',
    '🎾 Tennis', '🏊 Swimming', '🧘 Yoga', '🎤 Singing', '💃 Dancing'
  ];

  const badges = [
    { id: 'newbie', name: 'Newbie', icon: '🌱', requirement: 'Complete 1 chat', karma: 0 },
    { id: 'friendly', name: 'Friendly', icon: '😊', requirement: 'Get 10 5-star ratings', karma: 50 },
    { id: 'popular', name: 'Popular', icon: '⭐', requirement: 'Complete 50 chats', karma: 100 },
    { id: 'legend', name: 'Legend', icon: '👑', requirement: 'Get 100 5-star ratings', karma: 500 },
    { id: 'veteran', name: 'Veteran', icon: '🏆', requirement: 'Complete 200 chats', karma: 1000 },
    { id: 'ambassador', name: 'Ambassador', icon: '🌟', requirement: 'Maintain 4.5+ avg rating', karma: 2000 },
  ];

  const reportReasons = [
    { id: 'inappropriate', label: '🚫 Inappropriate Content', desc: 'Nudity, sexual content, or explicit material' },
    { id: 'harassment', label: '😡 Harassment', desc: 'Bullying, threats, or abusive behavior' },
    { id: 'spam', label: '📧 Spam', desc: 'Repetitive or unwanted messages' },
    { id: 'hate', label: '💔 Hate Speech', desc: 'Discrimination or hateful content' },
    { id: 'violence', label: '⚠️ Violence', desc: 'Threats or promotion of violence' },
    { id: 'underage', label: '👶 Underage User', desc: 'User appears to be under 13' },
    { id: 'scam', label: '💰 Scam/Fraud', desc: 'Attempting to scam or defraud' },
    { id: 'other', label: '❓ Other', desc: 'Other safety concerns' },
  ];

  const getKarmaLevel = (karma) => {
    if (karma >= 2000) return { level: 'Legendary', color: 'text-yellow-500', icon: '👑' };
    if (karma >= 1000) return { level: 'Master', color: 'text-purple-500', icon: '🏆' };
    if (karma >= 500) return { level: 'Expert', color: 'text-blue-500', icon: '💎' };
    if (karma >= 100) return { level: 'Advanced', color: 'text-green-500', icon: '⭐' };
    if (karma >= 50) return { level: 'Intermediate', color: 'text-cyan-500', icon: '🌟' };
    return { level: 'Beginner', color: 'text-gray-500', icon: '🌱' };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.from === 'stranger') {
        playSound('receive');
        setConversationStats(prev => ({ ...prev, received: prev.received + 1 }));
        
        // Update stranger avatar based on their message
        if (avatarMode && lastMsg.text) {
          const mood = analyzeSentiment(lastMsg.text);
          if (mood === 'positive') setStrangerAvatar('😄');
          else if (mood === 'negative') setStrangerAvatar('😢');
          else setStrangerAvatar('😐');
          setTimeout(() => setStrangerAvatar('👤'), 2000);
        }
      }
    }
  }, [messages, avatarMode]);

  useEffect(() => {
    if (!isMatched) {
      setChatDuration(0);
      return;
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    const timer = setInterval(() => setChatDuration(prev => prev + 1), 1000);
    
    // Monitor quality metrics
    const qualityMonitor = setInterval(() => {
      if (webrtcService?.peerConnection) {
        webrtcService.peerConnection.getStats().then(stats => {
          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
              setFps(report.framesPerSecond || 0);
              setBitrate(Math.round((report.bytesReceived || 0) / 1024));
            }
          });
        });
      }
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(qualityMonitor);
    };
  }, [isMatched, webrtcService]);

  useEffect(() => {
    if (!socket) return;
    
    setupRandomChatListeners(socket);
    setupCallListeners(socket);
    
    return () => {
      cleanupRandomChatListeners(socket);
      cleanupCallListeners(socket);
      leaveRandomChat(socket);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !webrtcService || !partner) return;
    
    console.log('🔧 Setting up WebRTC handlers for partner:', partner._id);
    
    // Handle WebRTC offer (for receiver)
    const handleOffer = async ({ offer, from, callId }) => {
      console.log('📥 Received offer from:', from, 'expected:', partner._id);
      if (from === partner._id) {
        await webrtcService.setRemoteDescription(offer);
        const answer = await webrtcService.createAnswer();
        socket.emit("call:answer", {
          answer,
          to: from,
          callId,
        });
        console.log('✅ Offer received, answer sent');
      }
    };
    
    // Handle WebRTC answer (for caller)
    const handleAnswer = async ({ answer, from }) => {
      console.log('📥 Received answer from:', from, 'expected:', partner._id);
      if (from === partner._id) {
        await webrtcService.setRemoteDescription(answer);
        console.log('✅ Answer received and set');
      }
    };
    
    // Handle ICE candidates
    const handleIceCandidate = ({ candidate, from }) => {
      console.log('🧊 Received ICE candidate from:', from);
      if (from === partner._id) {
        webrtcService.addIceCandidate(candidate);
      }
    };
    
    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);
    
    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);
    };
  }, [socket, webrtcService, partner]);

  useEffect(() => {
    if (localStream && localVideoRef.current && !avatarMode) {
      localVideoRef.current.srcObject = localStream;
      console.log('✅ Local video set:', localStream.getTracks().map(t => t.kind));
    }
  }, [localStream, avatarMode]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current && !avatarMode) {
      console.log('🎬 Attaching remote stream to video element');
      console.log('Video element exists:', !!remoteVideoRef.current);
      console.log('Stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.readyState}`));
      
      remoteVideoRef.current.srcObject = remoteStream;
      
      // Force play
      remoteVideoRef.current.play()
        .then(() => console.log('✅ Remote video playing'))
        .catch(err => console.error('❌ Remote video play failed:', err));
      
      console.log('✅ Remote video set:', remoteStream.getTracks().map(t => t.kind));
    }
  }, [remoteStream, avatarMode]);

  const handleStart = async () => {
    const audioConstraints = {
      echoCancellation: echoCancellation,
      noiseSuppression: noiseReduction,
      autoGainControl: true
    };
    const preferences = {
      language: selectedLanguage,
      interests: interests,
      ageGroup: ageGroup,
      location: location
    };
    joinRandomChat(socket, preferences, audioConstraints);
  };

  const handleSkip = () => {
    if (messages.length > 0) {
      setShowRatingModal(true);
    } else {
      skipPartner(socket, selectedLanguage);
    }
  };

  const submitRating = (stars) => {
    setRating(stars);
    // Send rating to backend
    if (socket && partner) {
      socket.emit('rate-user', { 
        userId: partner._id, 
        rating: stars,
        sessionId: sessionId 
      });
    }
    
    // Calculate karma earned
    const karmaEarned = stars >= 4 ? 10 : stars >= 3 ? 5 : 0;
    setUserKarma(prev => prev + karmaEarned);
    
    setShowRatingModal(false);
    skipPartner(socket, selectedLanguage);
  };

  const skipWithoutRating = () => {
    setShowRatingModal(false);
    skipPartner(socket, selectedLanguage);
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const submitReport = () => {
    if (!reportReason) return;
    
    if (socket && partner) {
      socket.emit('report-user', {
        reportedUserId: partner._id,
        reason: reportReason,
        details: reportDetails,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      });
    }
    
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
    
    // Show confirmation
    alert('Report submitted. Our team will review it shortly.');
  };

  const handleBlock = () => {
    setShowBlockConfirm(true);
  };

  const confirmBlock = () => {
    if (socket && partner) {
      socket.emit('block-user', {
        blockedUserId: partner._id,
        timestamp: new Date().toISOString()
      });
    }
    
    setIsBlocked(true);
    setShowBlockConfirm(false);
    
    // Skip to next partner
    setTimeout(() => {
      skipPartner(socket, selectedLanguage);
    }, 1000);
  };

  const saveToHistory = () => {
    if (!partner) return;
    const chatData = {
      id: sessionId,
      partnerId: partner._id,
      messages: messages,
      duration: chatDuration,
      timestamp: new Date().toISOString(),
      stats: conversationStats,
      mood: conversationMood,
      partnerRating: partnerRating,
      interests: partner.interests || []
    };
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.unshift(chatData);
    if (history.length > 50) history.pop();
    localStorage.setItem('chatHistory', JSON.stringify(history));
    if (socket) socket.emit('save-chat-history', chatData);
    setIsFavorite(true);
  };

  const loadChatHistory = () => {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setChatHistory(history);
    setShowHistoryModal(true);
  };

  const moodPlaylists = {
    positive: [
      { id: 1, name: 'Happy Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', mood: 'positive' },
      { id: 2, name: 'Upbeat Energy', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', mood: 'positive' },
      { id: 3, name: 'Sunshine Day', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', mood: 'positive' },
      { id: 4, name: 'Feel Good', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', mood: 'positive' },
      { id: 5, name: 'Party Time', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', mood: 'positive' },
      { id: 6, name: 'Summer Breeze', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', mood: 'positive' },
    ],
    neutral: [
      { id: 7, name: 'Chill Lofi', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', mood: 'neutral' },
      { id: 8, name: 'Ambient Calm', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', mood: 'neutral' },
      { id: 9, name: 'Peaceful Mind', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', mood: 'neutral' },
      { id: 10, name: 'Soft Focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', mood: 'neutral' },
      { id: 11, name: 'Zen Garden', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', mood: 'neutral' },
      { id: 12, name: 'Tranquil Waters', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', mood: 'neutral' },
    ],
    negative: [
      { id: 13, name: 'Melancholic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', mood: 'negative' },
      { id: 14, name: 'Reflective', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', mood: 'negative' },
      { id: 15, name: 'Rainy Days', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', mood: 'negative' },
      { id: 16, name: 'Emotional', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', mood: 'negative' },
      { id: 17, name: 'Deep Thoughts', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', mood: 'negative' },
    ],
    chill: [
      { id: 18, name: 'Lofi Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', mood: 'chill' },
      { id: 19, name: 'Study Music', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', mood: 'chill' },
      { id: 20, name: 'Coffee Shop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', mood: 'chill' },
      { id: 21, name: 'Late Night', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', mood: 'chill' },
      { id: 22, name: 'Cozy Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', mood: 'chill' },
      { id: 23, name: 'Lazy Sunday', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', mood: 'chill' },
      { id: 24, name: 'Midnight Drive', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', mood: 'chill' },
    ]
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (socket && partner) {
      socket.emit('music-sync', { action: 'play', track, timestamp: Date.now() });
    }
  };

  const togglePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (socket && partner) {
      socket.emit('music-sync', { action: newState ? 'play' : 'pause', track: currentTrack, timestamp: Date.now() });
    }
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const playlist = moodPlaylists[selectedPlaylist];
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  };

  const prevTrack = () => {
    if (!currentTrack) return;
    const playlist = moodPlaylists[selectedPlaylist];
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  };

  useEffect(() => {
    if (!socket) return;
    const handleMusicSync = ({ action, track, timestamp }) => {
      if (action === 'play') {
        setCurrentTrack(track);
        setIsPlaying(true);
      } else if (action === 'pause') {
        setIsPlaying(false);
      }
    };
    socket.on('music-sync', handleMusicSync);
    return () => socket.off('music-sync', handleMusicSync);
  }, [socket]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100;
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying, musicVolume, currentTrack]);

  useEffect(() => {
    if (isMatched && conversationMood && !currentTrack) {
      const playlist = moodPlaylists[conversationMood] || moodPlaylists.chill;
      setCurrentTrack(playlist[0]);
    }
  }, [conversationMood, isMatched]);

  const challenges = [
    { id: 'wyr', name: 'Would You Rather', icon: '🤔', color: 'bg-purple-500' },
    { id: 'tod', name: 'Truth or Dare', icon: '🎭', color: 'bg-pink-500' },
    { id: '20q', name: '20 Questions', icon: '❓', color: 'bg-blue-500' },
    { id: 'draw', name: 'Drawing Game', icon: '🎨', color: 'bg-green-500' },
    { id: 'trivia', name: 'Trivia Quiz', icon: '🧠', color: 'bg-yellow-500' },
    { id: 'emoji', name: 'Emoji Charades', icon: '😎', color: 'bg-orange-500' },
  ];

  const wyrQuestions = [
    { q1: 'Have the ability to fly', q2: 'Be invisible' },
    { q1: 'Live in the past', q2: 'Live in the future' },
    { q1: 'Always be 10 minutes late', q2: 'Always be 20 minutes early' },
    { q1: 'Have unlimited money', q2: 'Have unlimited time' },
    { q1: 'Read minds', q2: 'See the future' },
  ];

  const truthQuestions = [
    'What\'s your biggest fear?',
    'What\'s the most embarrassing thing that happened to you?',
    'What\'s your secret talent?',
    'Who was your first crush?',
    'What\'s your guilty pleasure?',
  ];

  const dareQuestions = [
    'Do your best dance move',
    'Sing a song',
    'Make a funny face for 10 seconds',
    'Tell a joke',
    'Do 10 jumping jacks',
  ];

  const triviaQuestions = [
    { q: 'What is the capital of France?', a: ['Paris', 'London', 'Berlin', 'Madrid'], correct: 0 },
    { q: 'How many continents are there?', a: ['5', '6', '7', '8'], correct: 2 },
    { q: 'What year did World War II end?', a: ['1943', '1944', '1945', '1946'], correct: 2 },
    { q: 'What is the largest planet?', a: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correct: 2 },
    { q: 'Who painted the Mona Lisa?', a: ['Van Gogh', 'Picasso', 'Da Vinci', 'Monet'], correct: 2 },
  ];

  const emojiCharades = [
    { emoji: '🎬🍿', answer: 'movie' },
    { emoji: '☕📚', answer: 'coffee and book' },
    { emoji: '🏖️☀️', answer: 'beach' },
    { emoji: '🎵🎤', answer: 'singing' },
    { emoji: '🍕🍔', answer: 'fast food' },
  ];

  const sendChallengeInvite = (challengeId) => {
    if (!socket || !partner) return;
    const challenge = challenges.find(c => c.id === challengeId);
    socket.emit('challenge-invite', { 
      challengeId, 
      challengeName: challenge.name,
      from: authUser._id,
      to: partner._id 
    });
    setWaitingForAccept(true);
    setChallengeInvite({ challengeId, challengeName: challenge.name, from: authUser._id });
  };

  const acceptChallengeInvite = () => {
    if (!challengeInvite) return;
    const { challengeId } = challengeInvite;
    
    let data = null;
    if (challengeId === 'wyr') {
      data = wyrQuestions[Math.floor(Math.random() * wyrQuestions.length)];
    } else if (challengeId === 'tod') {
      data = { type: null };
    } else if (challengeId === '20q') {
      data = { questions: 0, guesses: [] };
    } else if (challengeId === 'trivia') {
      data = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
      setTriviaScore({ me: 0, partner: 0 });
    } else if (challengeId === 'emoji') {
      data = emojiCharades[Math.floor(Math.random() * emojiCharades.length)];
    } else if (challengeId === 'draw') {
      data = { word: ['cat', 'house', 'car', 'tree', 'sun'][Math.floor(Math.random() * 5)], drawer: 'me' };
    }
    
    setActiveChallenge(challengeId);
    setChallengeData(data);
    setShowInviteModal(false);
    setChallengeInvite(null);
    
    if (socket && partner) {
      socket.emit('challenge-accept', { challengeId, data, to: partner._id });
    }
  };

  const declineChallengeInvite = () => {
    if (socket && challengeInvite) {
      socket.emit('challenge-decline', { to: challengeInvite.from });
    }
    setShowInviteModal(false);
    setChallengeInvite(null);
  };

  const endChallenge = () => {
    setActiveChallenge(null);
    setChallengeData(null);
    if (socket && partner) {
      socket.emit('challenge-end', { to: partner._id });
    }
  };

  const updateChallenge = (updates) => {
    setChallengeData(prev => ({ ...prev, ...updates }));
    if (socket && partner) {
      socket.emit('challenge-update', { updates, to: partner._id });
    }
  };

  useEffect(() => {
    if (!socket) return;
    
    const handleChallengeInvite = ({ challengeId, challengeName, from }) => {
      // Only show modal if we're the receiver (not the sender)
      if (from !== authUser._id) {
        setChallengeInvite({ challengeId, challengeName, from });
        setShowInviteModal(true);
      }
    };
    
    const handleChallengeAccept = ({ challengeId, data }) => {
      setActiveChallenge(challengeId);
      setChallengeData(data);
      setShowChallenges(false);
      setWaitingForAccept(false);
      setChallengeInvite(null);
    };
    
    const handleChallengeDecline = () => {
      alert('Partner declined the challenge');
      setWaitingForAccept(false);
      setChallengeInvite(null);
    };
    
    const handleChallengeEnd = () => {
      setActiveChallenge(null);
      setChallengeData(null);
    };
    
    const handleChallengeUpdate = ({ updates }) => {
      setChallengeData(prev => ({ ...prev, ...updates }));
    };
    
    const handleChallengeCancel = () => {
      setShowInviteModal(false);
      setChallengeInvite(null);
    };
    
    socket.on('challenge-invite', handleChallengeInvite);
    socket.on('challenge-accept', handleChallengeAccept);
    socket.on('challenge-decline', handleChallengeDecline);
    socket.on('challenge-cancel', handleChallengeCancel);
    socket.on('challenge-end', handleChallengeEnd);
    socket.on('challenge-update', handleChallengeUpdate);
    
    return () => {
      socket.off('challenge-invite', handleChallengeInvite);
      socket.off('challenge-accept', handleChallengeAccept);
      socket.off('challenge-decline', handleChallengeDecline);
      socket.off('challenge-cancel', handleChallengeCancel);
      socket.off('challenge-end', handleChallengeEnd);
      socket.off('challenge-update', handleChallengeUpdate);
    };
  }, [socket]);

  const handleLeave = () => {
    leaveRandomChat(socket);
    navigate("/");
  };

  const analyzeSentiment = (text) => {
    const positive = ['love', 'great', 'awesome', 'happy', 'good', 'nice', 'amazing', 'wonderful', '❤️', '😊', '😄', '👍', '🔥'];
    const negative = ['hate', 'bad', 'terrible', 'sad', 'angry', 'awful', 'worst', '😢', '😡', '😠', '👎'];
    const lowerText = text.toLowerCase();
    
    const posCount = positive.filter(word => lowerText.includes(word)).length;
    const negCount = negative.filter(word => lowerText.includes(word)).length;
    
    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
  };

  const getMoodEmoji = (mood) => {
    if (mood === 'positive') return '😊';
    if (mood === 'negative') return '😔';
    return '😐';
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      const mood = analyzeSentiment(messageInput);
      setConversationMood(mood);
      
      // Update avatar based on sentiment
      if (avatarMode) {
        if (mood === 'positive') setMyAvatar('😄');
        else if (mood === 'negative') setMyAvatar('😔');
        else setMyAvatar('😐');
        setTimeout(() => setMyAvatar('😊'), 2000);
      }
      
      sendMessage(messageInput, socket);
      setMessageInput("");
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      setIsTyping(false);
      playSound('send');
      setConversationStats(prev => ({ ...prev, sent: prev.sent + 1 }));
    }
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    const audio = new Audio();
    if (type === 'send') audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDhkj4KFV+16+qnVRQLRp/g8r5sIQUrgs/y2Ik2CBhkuezooVARDEyl4fG5ZRwFNo3V7859KQUofsz';
    else if (type === 'receive') audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDhkj4KFV+16+qnVRQLRp/g8r5sIQUrgs/y2Ik2CBhkuezooVARDEyl4fG5ZRwFNo3V7859KQUofsz';
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleDoubleTapLike = (msgIndex) => {
    setMessageReactions(prev => ({ ...prev, [msgIndex]: '❤️' }));
    playSound('send');
    setConversationStats(prev => ({ ...prev, reactions: prev.reactions + 1 }));
    
    // Add floating hearts
    const id = Date.now();
    setFloatingEmojis(prev => [...prev, { id, emoji: '❤️', x: Math.random() * 80 + 10 }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 2000);
    
    setTimeout(() => {
      setMessageReactions(prev => {
        const newReactions = { ...prev };
        delete newReactions[msgIndex];
        return newReactions;
      });
    }, 2000);
  };

  const sendQuickReply = (reply) => {
    sendMessage(reply, socket);
    playSound('send');
    setConversationStats(prev => ({ ...prev, sent: prev.sent + 1 }));
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const handleEmojiClick = (emoji) => {
    setMessageInput(messageInput + emoji);
  };

  const handleGifClick = (gifUrl) => {
    sendMessage(gifUrl, socket, 'gif');
    setShowGifPicker(false);
    showLiveReaction(gifUrl, 'gif');
  };

  const handleMemeClick = (memeUrl) => {
    sendMessage(memeUrl, socket, 'meme');
    showLiveReaction(memeUrl, 'meme');
  };

  const showLiveReaction = (content, type) => {
    setLiveReaction({ content, type });
    setTimeout(() => setLiveReaction(null), 3000);
  };

  const sendQuickEmoji = (emoji) => {
    sendMessage(emoji, socket, 'emoji');
    showLiveReaction(emoji, 'emoji');
    playSound('send');
    setConversationStats(prev => ({ ...prev, sent: prev.sent + 1, reactions: prev.reactions + 1 }));
  };

  const handleContextMenu = (e, msgIndex) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, msgIndex });
  };

  const copyMessage = (msgIndex) => {
    const msg = messages[msgIndex];
    navigator.clipboard.writeText(msg.text);
    setContextMenu({ show: false, x: 0, y: 0, msgIndex: null });
  };

  const deleteMessage = (msgIndex) => {
    setDeletedMessages([...deletedMessages, msgIndex]);
    setContextMenu({ show: false, x: 0, y: 0, msgIndex: null });
  };

  const pinMessage = (msgIndex) => {
    if (pinnedMessages.includes(msgIndex)) {
      setPinnedMessages(pinnedMessages.filter(i => i !== msgIndex));
    } else {
      setPinnedMessages([...pinnedMessages, msgIndex]);
    }
    setContextMenu({ show: false, x: 0, y: 0, msgIndex: null });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu({ show: false, x: 0, y: 0, msgIndex: null });
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const checkWinner = (board) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let line of lines) {
      const [a,b,c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  };

  const handleGameClick = (index) => {
    if (gameBoard[index] || checkWinner(gameBoard)) return;
    const newBoard = [...gameBoard];
    newBoard[index] = isXTurn ? 'X' : 'O';
    setGameBoard(newBoard);
    setIsXTurn(!isXTurn);
    
    const winner = checkWinner(newBoard);
    if (winner) {
      setTimeout(() => {
        alert(`${winner} wins!`);
        setGameBoard(Array(9).fill(null));
        setIsXTurn(true);
      }, 100);
    }
  };

  const translateText = (text) => {
    // Simple mock translation - in production use Google Translate API
    const translations = {
      'hello': 'hola', 'hi': 'hola', 'bye': 'adiós', 'thanks': 'gracias',
      'good': 'bueno', 'bad': 'malo', 'yes': 'sí', 'no': 'no'
    };
    return text.toLowerCase().split(' ').map(word => translations[word] || word).join(' ');
  };

  const applyVideoQuality = async (quality) => {
    setVideoQuality(quality);
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const constraints = {
        'sd': { width: 640, height: 480, frameRate: 24 },
        'hd': { width: 1280, height: 720, frameRate: 30 },
        'fhd': { width: 1920, height: 1080, frameRate: 30 }
      };
      await videoTrack.applyConstraints(constraints[quality]);
    }
  };

  const getVideoStyle = () => {
    let filters = [];
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (saturation !== 100) filters.push(`saturate(${saturation}%)`);
    if (beautyMode) filters.push('blur(0.5px) contrast(1.1)');
    
    if (videoFilter === 'blur') filters.push('blur(2px)');
    else if (videoFilter === 'vintage') filters.push('sepia(0.8) contrast(1.2)');
    else if (videoFilter === 'grayscale') filters.push('grayscale(1)');
    else if (videoFilter === 'invert') filters.push('invert(1)');
    else if (videoFilter === 'cartoon') filters.push('contrast(1.5) saturate(1.5)');
    
    return {
      filter: filters.join(' ') || 'none',
      transform: mirrorVideo ? 'scaleX(-1)' : 'none'
    };
  };

  const toggleMute = () => {
    if (webrtcService) {
      webrtcService.toggleAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.applyConstraints({
          echoCancellation: echoCancellation,
          noiseSuppression: noiseReduction,
          autoGainControl: true
        });
      }
    }
  }, [noiseReduction, echoCancellation, localStream]);



  const toggleVideo = () => {
    if (webrtcService) {
      webrtcService.toggleVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      // Restore camera
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
        
        setScreenStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        
        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.error('Screen share error:', err);
      }
    }
  };

  const togglePiP = async () => {
    if (!remoteVideoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else {
        await remoteVideoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  };

  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiPActive(!!document.pictureInPictureElement);
    };
    
    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);
    
    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Waveform animation
      const waveInterval = setInterval(() => {
        setAudioWaveform(Array(20).fill(0).map(() => Math.random() * 100));
      }, 100);
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            clearInterval(timer);
            clearInterval(waveInterval);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        clearInterval(timer);
        clearInterval(waveInterval);
      });
    } catch (err) {
      console.error('Recording error:', err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioWaveform([]);
    }
  };
  
  const sendVoiceMessage = () => {
    if (audioBlob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage(reader.result, socket, 'voice');
        setAudioBlob(null);
        setRecordingTime(0);
        playSound('send');
      };
      reader.readAsDataURL(audioBlob);
    }
  };
  
  const cancelVoiceMessage = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (authUser) {
      setUserKarma(authUser.karma || 0);
      setUserBadges(authUser.badges || []);
    }
  }, [authUser]);

  useEffect(() => {
    if (partner) {
      setPartnerRating(partner.averageRating || 0);
    }
  }, [partner]);

  useEffect(() => {
    if (isSearching) {
      setConnectionProgress(0);
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
      
      const progressInterval = setInterval(() => {
        setConnectionProgress(prev => {
          if (prev >= 95) return 95;
          return prev + Math.random() * 15;
        });
      }, 300);
      
      const factInterval = setInterval(() => {
        setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
      }, 4000);
      
      return () => {
        clearInterval(progressInterval);
        clearInterval(factInterval);
      };
    } else if (isMatched) {
      setConnectionProgress(100);
    }
  }, [isSearching, isMatched]);

  const karmaLevel = getKarmaLevel(userKarma);

  const getCulturalPrompt = () => {
    const partnerCity = partnerLocation?.city || 'your city';
    const partnerCountry = partnerLocation?.country || 'your country';
    const myCity = myLocation?.city || 'my city';
    const myCountry = myLocation?.country || 'my country';
    
    const prompts = [
      `🍕 What's a popular dish in ${partnerCountry}?`,
      `🎉 Tell me about a festival celebrated in ${partnerCity}`,
      `🏛️ What's a famous landmark in ${partnerCity}?`,
      `🎵 Share a popular song from ${partnerCountry}`,
      `⚽ What sports are popular in ${partnerCountry}?`,
      `🌆 Describe ${partnerCity} in 3 words`,
      `🎭 What's unique about ${partnerCountry}'s culture?`,
      `📚 Recommend a book or movie from ${partnerCountry}`,
      `🌍 Have you been to ${myCity}? What do you know about it?`,
      `☕ What's the coffee/tea culture like in ${partnerCity}?`,
      `🚇 Tell me about public transport in ${partnerCity}`,
      `🎨 What's the art scene like in ${partnerCountry}?`,
    ];
    
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    setMessageInput(prompt);
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        messageInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  useEffect(() => {
    // Fetch user's location from IP
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setMyLocation({
          city: data.city,
          country: data.country_name,
          timezone: data.timezone,
          time: new Date().toLocaleTimeString('en-US', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit' }),
          weather: `${data.city}, ${data.country_name}`
        });
      })
      .catch(() => {
        setMyLocation({
          city: 'Unknown',
          country: 'Unknown',
          timezone: 'UTC',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
      });
  }, []);

  useEffect(() => {
    if (partner && socket) {
      socket.emit('request-location', { to: partner._id });
    }
  }, [partner, socket]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('request-location', ({ from }) => {
      if (myLocation) {
        socket.emit('share-location', { to: from, location: myLocation });
      }
    });
    
    socket.on('share-location', ({ location }) => {
      setPartnerLocation(location);
    });
    
    return () => {
      socket.off('request-location');
      socket.off('share-location');
    };
  }, [socket, myLocation]);

  if (!isSearching && !isMatched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20">
        <div className="text-center space-y-6 p-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
            <Shuffle size={64} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold">Random Video Chat</h1>
          <p className="text-lg text-base-content/70">Connect with strangers around the world</p>
          
          {/* Karma & Level Display */}
          <div className="bg-base-200 rounded-xl p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-2xl ${karmaLevel.color}`}>{karmaLevel.icon}</span>
                <div>
                  <div className="font-bold">{karmaLevel.level}</div>
                  <div className="text-xs text-base-content/60">{userKarma} Karma Points</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={16} className="text-success" />
                <span className="text-sm font-bold text-success">+10 per 5⭐</span>
              </div>
            </div>
            
            {/* Badges */}
            {userBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-base-300">
                {userBadges.slice(0, 6).map((badgeId) => {
                  const badge = badges.find(b => b.id === badgeId);
                  return badge ? (
                    <div key={badgeId} className="badge badge-lg gap-2" title={badge.requirement}>
                      <span>{badge.icon}</span>
                      <span>{badge.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Globe size={18} />
                  Select Language
                </span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  🎂 Age Group
                </span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              >
                {ageGroups.map(group => (
                  <option key={group.code} value={group.code}>{group.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  📍 Location
                </span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {locations.map(loc => (
                  <option key={loc.code} value={loc.code}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  ❤️ Interests
                </span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {popularInterests.map((interest, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!interests.includes(interest)) {
                        setInterests([...interests, interest]);
                      }
                    }}
                    className={`btn btn-xs ${
                      interests.includes(interest) ? 'btn-primary' : 'btn-ghost'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type custom interest..."
                className="input input-bordered input-sm w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setInterests([...interests, e.target.value.trim()]);
                    e.target.value = '';
                  }
                }}
              />
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {interests.map((interest, idx) => (
                    <span key={idx} className="badge badge-primary gap-2">
                      {interest}
                      <button onClick={() => setInterests(interests.filter((_, i) => i !== idx))} className="text-xs">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <button onClick={handleStart} className="btn btn-primary btn-lg gap-2 w-full">
              <Shuffle size={24} />
              Start Chatting
            </button>
            <button onClick={loadChatHistory} className="btn btn-outline btn-lg gap-2 w-full">
              <History size={24} />
              Chat History ({JSON.parse(localStorage.getItem('chatHistory') || '[]').length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        
        <div className="text-center space-y-8 z-10 max-w-md px-6">
          {/* Animated Globe */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-base-100 rounded-full flex items-center justify-center">
              <Globe size={64} className="text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute -inset-4 border-4 border-primary/30 rounded-full animate-ping"></div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-2 animate-pulse">Finding a stranger...</h2>
            <p className="text-base-content/70">Matching based on your preferences</p>
            
            {/* Matching Criteria */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {selectedLanguage !== 'any' && (
                <span className="badge badge-primary badge-lg gap-2">
                  <Globe size={14} />
                  {languages.find(l => l.code === selectedLanguage)?.name}
                </span>
              )}
              {ageGroup !== 'any' && (
                <span className="badge badge-secondary badge-lg gap-2">
                  🎂 {ageGroups.find(a => a.code === ageGroup)?.name}
                </span>
              )}
              {location !== 'any' && (
                <span className="badge badge-accent badge-lg gap-2">
                  📍 {locations.find(l => l.code === location)?.name}
                </span>
              )}
              {interests.slice(0, 3).map((interest, idx) => (
                <span key={idx} className="badge badge-info badge-lg">
                  {interest}
                </span>
              ))}
              {interests.length > 3 && (
                <span className="badge badge-ghost badge-lg">
                  +{interests.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-300 relative overflow-hidden"
                style={{ width: `${connectionProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer" style={{ animation: 'shimmer 1s infinite' }}></div>
              </div>
            </div>
            <div className="text-sm font-bold text-primary">{Math.round(connectionProgress)}%</div>
          </div>
          
          {/* Fun Facts */}
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-primary/20 min-h-[100px] flex items-center justify-center">
            <p className="text-lg font-medium animate-in fade-in slide-in-from-bottom-4 duration-500">
              {funFact}
            </p>
          </div>
          
          {/* Loading Dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
          
          <button onClick={handleLeave} className="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                <AlertTriangle size={24} className="text-error" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Report User</h2>
                <p className="text-xs text-base-content/60">Help keep the community safe</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              {reportReasons.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    reportReason === reason.id
                      ? 'border-error bg-error/10'
                      : 'border-base-300 hover:border-error/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="report"
                    value={reason.id}
                    checked={reportReason === reason.id}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="radio radio-error radio-sm mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-sm">{reason.label}</div>
                    <div className="text-xs text-base-content/60">{reason.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            
            <textarea
              placeholder="Additional details (optional)..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="textarea textarea-bordered w-full mb-4 text-sm"
              rows="3"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason}
                className="btn btn-error flex-1 gap-2"
              >
                <Shield size={18} />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-3">
                <Ban size={32} className="text-error" />
              </div>
              <h2 className="text-xl font-bold mb-2">Block this user?</h2>
              <p className="text-sm text-base-content/70">
                You won't be matched with them again. This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlock}
                className="btn btn-error flex-1 gap-2"
              >
                <Ban size={18} />
                Block User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl animate-in zoom-in max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <History size={24} className="text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Chat History</h2>
                  <p className="text-xs text-base-content/60">{chatHistory.length} saved</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="btn btn-circle btn-ghost btn-sm">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History size={48} className="mx-auto text-base-content/30 mb-3" />
                  <p className="text-base-content/60">No saved conversations</p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div key={chat.id} className="bg-base-200 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="font-bold">Stranger</div>
                        <div className="text-xs text-base-content/60">
                          {new Date(chat.timestamp).toLocaleDateString()} • {Math.floor(chat.duration / 60)}:{(chat.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
                          localStorage.setItem('chatHistory', JSON.stringify(history.filter(c => c.id !== chat.id)));
                          setChatHistory(history.filter(c => c.id !== chat.id));
                        }}
                        className="btn btn-xs btn-ghost text-error"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-base-100 rounded p-2 text-center">
                        <div className="text-base-content/60">Messages</div>
                        <div className="font-bold">{chat.messages?.length || 0}</div>
                      </div>
                      <div className="bg-base-100 rounded p-2 text-center">
                        <div className="text-base-content/60">Sent</div>
                        <div className="font-bold text-primary">{chat.stats?.sent || 0}</div>
                      </div>
                      <div className="bg-base-100 rounded p-2 text-center">
                        <div className="text-base-content/60">Mood</div>
                        <div className="text-lg">{getMoodEmoji(chat.mood)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Challenge Invite Modal */}
      {showInviteModal && challengeInvite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Lightbulb size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Challenge Invitation!</h2>
              <p className="text-sm text-base-content/70">
                Your partner wants to play
              </p>
              <div className="text-2xl font-bold text-primary mt-2">
                {challengeInvite.challengeName}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={declineChallengeInvite}
                className="btn btn-ghost flex-1"
              >
                Decline
              </button>
              <button
                onClick={acceptChallengeInvite}
                className="btn btn-primary flex-1 gap-2"
              >
                <Lightbulb size={18} />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in">
            <h2 className="text-2xl font-bold text-center mb-2">Rate this conversation</h2>
            <p className="text-center text-base-content/70 mb-6">Help us improve the community</p>
            
            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    size={48}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            
            <div className="text-center text-sm text-base-content/60 mb-4">
              {hoverRating === 5 && 'Amazing! 🎉'}
              {hoverRating === 4 && 'Great conversation! 😊'}
              {hoverRating === 3 && 'Good 👍'}
              {hoverRating === 2 && 'Could be better 🤔'}
              {hoverRating === 1 && 'Not great 😕'}
              {hoverRating === 0 && 'Click a star to rate'}
            </div>
            
            <button
              onClick={skipWithoutRating}
              className="btn btn-ghost btn-block"
            >
              Skip Rating
            </button>
          </div>
        </div>
      )}

      <div ref={containerRef} className="fixed inset-0 z-50 bg-base-300 flex">
      {/* Video Section */}
      <div className="flex-1 relative">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  animation: `fall ${2 + Math.random() * 2}s linear`,
                  fontSize: '24px',
                }}
              >
                {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}
        
        {/* Floating Emojis */}
        {floatingEmojis.map(({ id, emoji, x }) => (
          <div
            key={id}
            className="absolute text-4xl pointer-events-none z-20"
            style={{
              left: `${x}%`,
              bottom: '20%',
              animation: 'float-up 2s ease-out forwards',
            }}
          >
            {emoji}
          </div>
        ))}
        {/* Live Reaction Overlay */}
        {liveReaction && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-in fade-in zoom-in">
            {liveReaction.type === 'gif' || liveReaction.type === 'meme' ? (
              <img src={liveReaction.content} alt="reaction" className="max-w-lg max-h-[500px] rounded-xl shadow-2xl animate-bounce" />
            ) : (
              <span className="text-9xl drop-shadow-2xl animate-bounce">{liveReaction.content}</span>
            )}
          </div>
        )}
        {/* Remote Video or Avatar */}
        {avatarMode ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center">
            <div className="text-[15rem] mb-8 transition-transform duration-300 hover:scale-110">
              {strangerAvatar}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xl font-medium">
              Stranger
            </div>
          </div>
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover bg-black"
            style={getVideoStyle()}
          />
        )}
        
        {/* Local Video or Avatar */}
        {avatarMode ? (
          <div className="absolute bottom-4 right-4 w-48 h-36 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800 flex flex-col items-center justify-center">
            <div className="text-6xl mb-2">
              {myAvatar}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">You</div>
          </div>
        ) : (
          <div className="absolute bottom-4 right-4">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-48 h-36 rounded-xl border-4 border-white/20 object-cover shadow-2xl bg-gray-800"
              style={{ transform: mirrorVideo ? 'scaleX(-1)' : 'none' }}
            />
            {isScreenSharing && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <Monitor size={12} />
                Sharing
              </div>
            )}
          </div>
        )}

        {/* Quality Indicators */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs space-y-1 z-20">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${fps > 25 ? 'bg-green-500' : fps > 15 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
            <span>{fps} FPS</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize2 size={12} />
            <span className="uppercase">{videoQuality}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📶</span>
            <span>{bitrate} KB/s</span>
          </div>
        </div>

        {/* Quality & Filter Controls */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          <button onClick={() => setAvatarMode(!avatarMode)} className={`btn btn-sm ${avatarMode ? 'bg-primary' : 'bg-black/50'} backdrop-blur-sm border-0 gap-2`}>
            <User size={18} /> {avatarMode ? 'Avatar ON' : 'Avatar'}
          </button>
          {avatarMode && (
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="btn btn-sm bg-black/50 backdrop-blur-sm border-0 text-2xl">
              {myAvatar}
            </button>
          )}
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-sm bg-black/50 backdrop-blur-sm border-0 gap-2">
            <Sparkles size={18} /> Filters
          </button>
          <button onClick={() => setShowQualitySettings(!showQualitySettings)} className="btn btn-sm bg-black/50 backdrop-blur-sm border-0 gap-2">
            <Settings size={18} /> Quality
          </button>
          
          {showAvatarPicker && (
            <div className="absolute top-12 left-0 bg-black/90 backdrop-blur-md rounded-lg p-3 animate-in slide-in-from-top">
              <h3 className="text-white text-xs font-bold mb-2">Choose Avatar</h3>
              <div className="grid grid-cols-6 gap-2">
                {['😊', '😎', '🥳', '😍', '🤩', '😜', '🤓', '😏', '😤', '😴', '🤖', '👽', '👾', '🦄', '👹', '👺', '💀', '👻', '👩', '👨', '👶', '👵', '👴', '👱'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { setMyAvatar(emoji); setShowAvatarPicker(false); }}
                    className={`btn btn-sm text-2xl ${myAvatar === emoji ? 'btn-primary' : 'btn-ghost'} hover:scale-125 transition-transform`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {showFilters && (
            <div className="absolute top-12 left-0 bg-black/80 backdrop-blur-md rounded-lg p-2 flex gap-2 animate-in slide-in-from-top">
              {['none', 'blur', 'vintage', 'grayscale', 'invert', 'cartoon'].map(filter => (
                <button
                  key={filter}
                  onClick={() => { setVideoFilter(filter); setShowFilters(false); }}
                  className={`btn btn-xs ${videoFilter === filter ? 'btn-primary' : 'btn-ghost'} capitalize`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
          

          
          {showQualitySettings && (
            <div className="absolute top-12 right-0 bg-black/90 backdrop-blur-md rounded-lg p-4 w-72 animate-in slide-in-from-top space-y-3">
              <div>
                <label className="text-white text-xs font-bold mb-2 block">Video Quality</label>
                <div className="flex gap-2">
                  {['sd', 'hd', 'fhd'].map(q => (
                    <button key={q} onClick={() => applyVideoQuality(q)} className={`btn btn-xs flex-1 ${videoQuality === q ? 'btn-primary' : 'btn-ghost'} uppercase`}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-white text-xs font-bold flex items-center gap-2">
                  <Sun size={14} /> Brightness: {brightness}%
                </label>
                <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(e.target.value)} className="range range-xs range-primary" />
              </div>
              
              <div>
                <label className="text-white text-xs font-bold flex items-center gap-2">
                  <Contrast size={14} /> Contrast: {contrast}%
                </label>
                <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(e.target.value)} className="range range-xs range-primary" />
              </div>
              
              <div>
                <label className="text-white text-xs font-bold flex items-center gap-2">
                  <Droplet size={14} /> Saturation: {saturation}%
                </label>
                <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(e.target.value)} className="range range-xs range-primary" />
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setMirrorVideo(!mirrorVideo)} className={`btn btn-xs flex-1 ${mirrorVideo ? 'btn-primary' : 'btn-ghost'}`}>
                  🪞 Mirror
                </button>
                <button onClick={() => setBeautyMode(!beautyMode)} className={`btn btn-xs flex-1 ${beautyMode ? 'btn-primary' : 'btn-ghost'}`}>
                  ✨ Beauty
                </button>
              </div>
              
              <div className="pt-2 border-t border-white/20">
                <label className="text-white text-xs font-bold block mb-2">Audio Enhancement</label>
                <div className="flex gap-2">
                  <button onClick={() => setNoiseReduction(!noiseReduction)} className={`btn btn-xs flex-1 ${noiseReduction ? 'btn-primary' : 'btn-ghost'}`}>
                    🎤 Noise Cancel
                  </button>
                  <button onClick={() => setEchoCancellation(!echoCancellation)} className={`btn btn-xs flex-1 ${echoCancellation ? 'btn-primary' : 'btn-ghost'}`}>
                    🔊 Echo Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen & PiP Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={toggleFullscreen}
            className="btn btn-sm bg-black/50 backdrop-blur-sm border-0 gap-2 hover:bg-black/70"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button 
            onClick={togglePiP}
            className="btn btn-sm bg-black/50 backdrop-blur-sm border-0 gap-2 hover:bg-black/70"
            title="Picture-in-Picture"
          >
            <PictureInPicture2 size={18} />
          </button>
        </div>

        {/* Quick Emoji Reactions */}
        <div className="absolute top-28 left-4 flex gap-2 z-20">
          {['👍', '❤️', '😂', '😮', '🔥'].map((emoji, idx) => (
            <button key={idx} onClick={() => sendQuickEmoji(emoji)} className="btn btn-circle btn-sm bg-white/20 hover:bg-white/40 backdrop-blur-sm text-2xl border-0 hover:scale-125 transition-transform shadow-lg">
              {emoji}
            </button>
          ))}
        </div>

        {/* Connection Quality Indicator */}
        <div className="absolute bottom-24 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connectionQuality === 'good' ? 'bg-green-500' : connectionQuality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></span>
          {connectionQuality === 'good' ? 'HD' : connectionQuality === 'medium' ? 'SD' : 'Poor'}
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl">
          <button onClick={toggleMute} className={`btn btn-circle ${isMuted ? "btn-error" : "btn-ghost bg-white/20"}`}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={toggleVideo} className={`btn btn-circle ${isVideoOff ? "btn-error" : "btn-ghost bg-white/20"}`}>
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button onClick={toggleScreenShare} className={`btn btn-circle ${isScreenSharing ? "btn-success" : "btn-ghost bg-white/20"}`} title="Share Screen">
            {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
          </button>
          <button onClick={handleSkip} className="btn btn-circle btn-warning">
            <SkipForward size={24} />
          </button>
          <button onClick={handleLeave} className="btn btn-circle btn-error">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-base-100 rounded-lg shadow-2xl border border-base-300 p-2 z-50 min-w-[150px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => copyMessage(contextMenu.msgIndex)} className="btn btn-ghost btn-sm w-full justify-start gap-2">
            <Copy size={16} /> Copy
          </button>
          <button onClick={() => pinMessage(contextMenu.msgIndex)} className="btn btn-ghost btn-sm w-full justify-start gap-2">
            <Pin size={16} /> {pinnedMessages.includes(contextMenu.msgIndex) ? 'Unpin' : 'Pin'}
          </button>
          {messages[contextMenu.msgIndex]?.from === 'me' && (
            <button onClick={() => deleteMessage(contextMenu.msgIndex)} className="btn btn-ghost btn-sm w-full justify-start gap-2 text-error">
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      )}

      {/* Chat Sidebar */}
      <div className="w-80 bg-base-200 flex flex-col">
        <div className="p-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="avatar online placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-xl">👤</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">Stranger</h3>
                  {partnerRating > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{partnerRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className={`badge badge-xs ${connectionQuality === 'good' ? 'badge-success' : connectionQuality === 'medium' ? 'badge-warning' : 'badge-error'}`}></span>
                  <span className="text-base-content/60">{Math.floor(chatDuration / 60)}:{(chatDuration % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="btn btn-circle btn-ghost btn-xs">
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button onClick={() => setShowStats(!showStats)} className="btn btn-circle btn-ghost btn-xs">
                <BarChart3 size={16} />
              </button>
              <button onClick={() => setShowGame(!showGame)} className="btn btn-circle btn-ghost btn-xs">
                <Gamepad2 size={16} />
              </button>
              <button onClick={() => setShowChallenges(!showChallenges)} className={`btn btn-circle btn-ghost btn-xs ${showChallenges ? 'text-primary' : ''}`} title="Challenges">
                <Lightbulb size={16} />
              </button>
              <button onClick={() => setAutoTranslate(!autoTranslate)} className={`btn btn-circle btn-ghost btn-xs ${autoTranslate ? 'text-primary' : ''}`} title="Auto Translate">
                <Languages size={16} />
              </button>
              <button onClick={() => setShowMusicPlayer(!showMusicPlayer)} className={`btn btn-circle btn-ghost btn-xs ${showMusicPlayer ? 'text-primary' : ''}`} title="Music Player">
                <Music size={16} />
              </button>
              <button onClick={() => setShowLocationInfo(!showLocationInfo)} className={`btn btn-circle btn-ghost btn-xs ${showLocationInfo ? 'text-primary' : ''}`} title="Location Info">
                <Globe size={16} />
              </button>
            </div>
          </div>
          
          {/* Location Info */}
          {showLocationInfo && (
            <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-lg p-3 mb-2 animate-in slide-in-from-top">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" />
                  <span className="text-xs font-bold">Location Info</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-base-100 rounded p-2">
                  <div className="text-xs text-base-content/60">You</div>
                  <div className="font-bold text-sm">🕐 {myLocation?.time || '--:--'}</div>
                  <div className="text-xs text-base-content/60">📍 {myLocation?.city || 'Loading...'}</div>
                </div>
                <div className="bg-base-100 rounded p-2">
                  <div className="text-xs text-base-content/60">Partner</div>
                  <div className="font-bold text-sm">🕐 {partnerLocation?.time || '--:--'}</div>
                  <div className="text-xs text-base-content/60">📍 {partnerLocation?.city || 'Unknown'}</div>
                </div>
              </div>
              
              {(myLocation?.country || partnerLocation?.country) && (
                <div className="bg-base-100 rounded p-2 mb-2">
                  <div className="text-xs text-base-content/60 mb-1">🌍 Countries</div>
                  <div className="flex justify-between text-sm">
                    <span>{myLocation?.country || '?'}</span>
                    <span>↔️</span>
                    <span>{partnerLocation?.country || '?'}</span>
                  </div>
                </div>
              )}
              
              <div className="bg-base-100 rounded p-2 mb-2">
                <div className="text-xs text-base-content/60 mb-1">Cultural Exchange</div>
                <button
                  onClick={getCulturalPrompt}
                  className="btn btn-xs btn-primary w-full gap-1"
                >
                  <Sparkles size={12} />
                  Get Conversation Starter
                </button>
              </div>
              
              <div className="bg-base-100 rounded p-2 mb-2">
                <div className="text-xs text-base-content/60 mb-1">🏙️ Nearby Places</div>
                <div className="text-xs">
                  {myLocation?.city ? `Explore ${myLocation.city} together!` : 'Loading location...'}
                </div>
              </div>
              
              <div className="text-xs text-center text-base-content/60">
                💡 Ask about local culture, food, or places!
              </div>
            </div>
          )}
          
          {/* Music Player */}
          {showMusicPlayer && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-3 mb-2 animate-in slide-in-from-top">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Music size={16} className="text-purple-500" />
                  <span className="text-xs font-bold">Synced Music</span>
                </div>
                <select
                  value={selectedPlaylist}
                  onChange={(e) => {
                    setSelectedPlaylist(e.target.value);
                    const playlist = moodPlaylists[e.target.value];
                    if (playlist) playTrack(playlist[0]);
                  }}
                  className="select select-xs"
                >
                  <option value="chill">🎧 Chill</option>
                  <option value="positive">😊 Happy</option>
                  <option value="neutral">😐 Calm</option>
                  <option value="negative">😔 Mellow</option>
                </select>
              </div>
              
              {currentTrack && (
                <>
                  <div className="text-xs font-medium mb-2 truncate">{currentTrack.name}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={prevTrack} className="btn btn-circle btn-xs btn-ghost">
                      <SkipBack size={14} />
                    </button>
                    <button onClick={togglePlayPause} className="btn btn-circle btn-sm btn-primary">
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={nextTrack} className="btn btn-circle btn-xs btn-ghost">
                      <SkipNext size={14} />
                    </button>
                    <div className="flex-1 flex items-center gap-2">
                      <Volume2 size={14} />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(Number(e.target.value))}
                        className="range range-xs range-primary flex-1"
                      />
                      <span className="text-xs w-8">{musicVolume}%</span>
                    </div>
                  </div>
                  <audio ref={audioRef} src={currentTrack.url} loop />
                </>
              )}
            </div>
          )}
          
          {/* Safety Controls */}
          <div className="px-4 py-2 bg-base-300/50 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-base-content/60">
                <Shield size={14} className="text-success" />
                <span>Safety Tools</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (!isFavorite) saveToHistory(); }}
                  className={`btn btn-xs btn-ghost gap-1 ${isFavorite ? 'text-error' : ''}`}
                  title="Save Chat"
                >
                  <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={handleReport}
                  className="btn btn-xs btn-ghost gap-1 text-warning hover:bg-warning/20"
                  title="Report User"
                >
                  <AlertTriangle size={14} />
                </button>
                <button
                  onClick={handleBlock}
                  className="btn btn-xs btn-ghost gap-1 text-error hover:bg-error/20"
                  title="Block User"
                  disabled={isBlocked}
                >
                  <Ban size={14} />
                </button>
              </div>
            </div>
          </div>
          {showStats && (
            <div className="bg-base-100 rounded-lg p-2 mb-2 animate-in slide-in-from-top">
              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                <div>
                  <div className="text-xs text-base-content/60">Sent</div>
                  <div className="font-bold text-primary">{conversationStats.sent}</div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60">Received</div>
                  <div className="font-bold text-secondary">{conversationStats.received}</div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60">Reactions</div>
                  <div className="font-bold text-accent">{conversationStats.reactions}</div>
                </div>
              </div>
              <div className="text-center pt-2 border-t border-base-300">
                <div className="text-xs text-base-content/60">Conversation Vibe</div>
                <div className="text-2xl">{getMoodEmoji(conversationMood)}</div>
                <div className="text-xs capitalize font-medium">{conversationMood}</div>
              </div>
            </div>
          )}
          {partner?.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {partner.interests.map((interest, idx) => (
                <span key={idx} className="badge badge-xs badge-primary">{interest}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-base-200 to-base-300">
          {showChallenges && !activeChallenge && !waitingForAccept && (
            <div className="bg-base-100 rounded-lg p-4 shadow-lg">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Lightbulb size={18} className="text-primary" />
                Challenges & Activities
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {challenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    onClick={() => sendChallengeInvite(challenge.id)}
                    className={`${challenge.color} text-white p-3 rounded-lg hover:scale-105 transition-transform`}
                  >
                    <div className="text-2xl mb-1">{challenge.icon}</div>
                    <div className="text-xs font-bold">{challenge.name}</div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-center mt-2 text-base-content/60">Click to invite partner</div>
            </div>
          )}

          {waitingForAccept && challengeInvite && !activeChallenge && (
            <div className="bg-primary/20 rounded-lg p-4 shadow-lg border-2 border-primary animate-pulse">
              <div className="text-center">
                <div className="text-4xl mb-2">⏳</div>
                <h3 className="font-bold mb-1">Waiting for partner...</h3>
                <p className="text-sm text-base-content/70 mb-3">
                  Invited to play {challengeInvite.challengeName}
                </p>
                <button 
                  onClick={() => {
                    setWaitingForAccept(false);
                    setChallengeInvite(null);
                    if (socket && partner) {
                      socket.emit('challenge-cancel', { to: partner._id });
                    }
                  }}
                  className="btn btn-xs btn-ghost"
                >
                  Cancel Invite
                </button>
              </div>
            </div>
          )}

          {activeChallenge === 'wyr' && challengeData && (
            <div className="bg-purple-500/20 rounded-lg p-4 shadow-lg border-2 border-purple-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  🤔 Would You Rather?
                </h3>
                <button onClick={endChallenge} className="btn btn-xs btn-ghost">✕</button>
              </div>
              <div className="space-y-2">
                <button className="btn btn-block btn-primary">{challengeData.q1}</button>
                <div className="text-center text-sm font-bold">OR</div>
                <button className="btn btn-block btn-secondary">{challengeData.q2}</button>
              </div>
              <button onClick={() => startChallenge('wyr')} className="btn btn-xs btn-ghost w-full mt-2">Next Question</button>
            </div>
          )}

          {activeChallenge === 'tod' && challengeData && (
            <div className="bg-pink-500/20 rounded-lg p-4 shadow-lg border-2 border-pink-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">🎭 Truth or Dare</h3>
                <button onClick={endChallenge} className="btn btn-xs btn-ghost">✕</button>
              </div>
              {!challengeData.type ? (
                <div className="space-y-2">
                  <button onClick={() => updateChallenge({ type: 'truth', q: truthQuestions[Math.floor(Math.random() * truthQuestions.length)] })} className="btn btn-block btn-info">Truth</button>
                  <button onClick={() => updateChallenge({ type: 'dare', q: dareQuestions[Math.floor(Math.random() * dareQuestions.length)] })} className="btn btn-block btn-error">Dare</button>
                </div>
              ) : (
                <div>
                  <div className="bg-base-100 rounded p-3 mb-2">
                    <div className="text-xs font-bold mb-1">{challengeData.type.toUpperCase()}</div>
                    <div>{challengeData.q}</div>
                  </div>
                  <button onClick={() => updateChallenge({ type: null })} className="btn btn-xs btn-ghost w-full">New Challenge</button>
                </div>
              )}
            </div>
          )}

          {activeChallenge === '20q' && challengeData && (
            <div className="bg-blue-500/20 rounded-lg p-4 shadow-lg border-2 border-blue-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">❓ 20 Questions</h3>
                <button onClick={endChallenge} className="btn btn-xs btn-ghost">✕</button>
              </div>
              <div className="text-center mb-3">
                <div className="text-2xl font-bold">{challengeData.questions}/20</div>
                <div className="text-xs">Questions Asked</div>
              </div>
              <div className="text-sm text-center mb-2">Think of something and let your partner guess!</div>
              <button onClick={() => updateChallenge({ questions: challengeData.questions + 1 })} className="btn btn-sm btn-primary w-full">Question Asked</button>
            </div>
          )}

          {activeChallenge === 'trivia' && challengeData && (
            <div className="bg-yellow-500/20 rounded-lg p-4 shadow-lg border-2 border-yellow-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">🧠 Trivia Quiz</h3>
                <button onClick={endChallenge} className="btn btn-xs btn-ghost">✕</button>
              </div>
              <div className="flex justify-around mb-3 text-xs">
                <div>You: <span className="font-bold">{triviaScore.me}</span></div>
                <div>Partner: <span className="font-bold">{triviaScore.partner}</span></div>
              </div>
              <div className="bg-base-100 rounded p-3 mb-2 font-bold">{challengeData.q}</div>
              <div className="space-y-1">
                {challengeData.a.map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx === challengeData.correct) {
                        setTriviaScore(prev => ({ ...prev, me: prev.me + 1 }));
                      }
                      startChallenge('trivia');
                    }}
                    className="btn btn-sm btn-block btn-ghost"
                  >
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeChallenge === 'emoji' && challengeData && (
            <div className="bg-orange-500/20 rounded-lg p-4 shadow-lg border-2 border-orange-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">😎 Emoji Charades</h3>
                <button onClick={endChallenge} className="btn btn-xs btn-ghost">✕</button>
              </div>
              <div className="text-center mb-3">
                <div className="text-6xl mb-2">{challengeData.emoji}</div>
                <div className="text-xs">Guess what this means!</div>
              </div>
              <input
                type="text"
                placeholder="Type your guess..."
                className="input input-sm input-bordered w-full mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.toLowerCase().includes(challengeData.answer.toLowerCase())) {
                    alert('Correct! 🎉');
                    startChallenge('emoji');
                    e.target.value = '';
                  }
                }}
              />
              <button onClick={() => startChallenge('emoji')} className="btn btn-xs btn-ghost w-full">Skip</button>
            </div>
          )}

          {activeChallenge === 'draw' && challengeData && (
            <div className="bg-green-500/20 rounded-lg p-4 shadow-lg border-2 border-green-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">🎨 Drawing Game</h3>
                <button onClick={endChallenge} className="btn btn-xs btn-ghost">✕</button>
              </div>
              <div className="bg-base-100 rounded p-2 mb-2 text-center">
                <div className="text-xs">Draw this:</div>
                <div className="font-bold text-lg">{challengeData.word}</div>
              </div>
              <canvas
                ref={canvasRef}
                width={250}
                height={200}
                className="border-2 border-base-300 rounded w-full bg-white cursor-crosshair"
                onMouseDown={(e) => {
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  const rect = canvas.getBoundingClientRect();
                  ctx.beginPath();
                  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                  canvas.isDrawing = true;
                }}
                onMouseMove={(e) => {
                  const canvas = canvasRef.current;
                  if (!canvas.isDrawing) return;
                  const ctx = canvas.getContext('2d');
                  const rect = canvas.getBoundingClientRect();
                  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                  ctx.stroke();
                }}
                onMouseUp={() => {
                  const canvas = canvasRef.current;
                  canvas.isDrawing = false;
                }}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => {
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                }} className="btn btn-xs flex-1">Clear</button>
                <button onClick={() => startChallenge('draw')} className="btn btn-xs btn-primary flex-1">New Word</button>
              </div>
            </div>
          )}

          {showGame && (
            <div className="bg-base-100 rounded-lg p-4 mb-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Gamepad2 size={18} /> Tic-Tac-Toe
                </h3>
                <button onClick={() => { setGameBoard(Array(9).fill(null)); setIsXTurn(true); }} className="btn btn-xs btn-ghost">Reset</button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                {gameBoard.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGameClick(idx)}
                    className="btn btn-square h-16 text-2xl font-bold hover:scale-105 transition-transform"
                  >
                    {cell}
                  </button>
                ))}
              </div>
              <div className="text-center mt-3 text-sm">
                Turn: <span className="font-bold">{isXTurn ? 'X' : 'O'}</span>
              </div>
            </div>
          )}
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <div className="text-6xl mb-4 animate-bounce">👋</div>
              <p className="text-base-content/70 font-medium">Say hi to start the conversation!</p>
              <p className="text-xs text-base-content/50 mt-2">Send a message, emoji, or GIF</p>
            </div>
          )}
          {pinnedMessages.length > 0 && (
            <div className="bg-warning/20 rounded-lg p-2 mb-2 border border-warning/50">
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <Pin size={14} className="text-warning" />
                Pinned Messages
              </div>
              {pinnedMessages.map(idx => (
                <div key={idx} className="text-xs bg-base-100 rounded p-1 mb-1">
                  {messages[idx]?.text?.substring(0, 50)}...
                </div>
              ))}
            </div>
          )}
          {messages.map((msg, idx) => (
            !deletedMessages.includes(idx) && (
              <div key={idx} className={`chat ${msg.from === "me" ? "chat-end" : "chat-start"} animate-in slide-in-from-bottom-2 relative group`}>
                <div 
                  onDoubleClick={() => msg.from === 'stranger' && handleDoubleTapLike(idx)}
                  onContextMenu={(e) => handleContextMenu(e, idx)}
                  className={`chat-bubble ${msg.from === "me" ? 'chat-bubble-primary' : 'chat-bubble-secondary'} ${pinnedMessages.includes(idx) ? 'ring-2 ring-warning' : ''} shadow-md cursor-pointer hover:scale-105 transition-transform`}
                >
                  {pinnedMessages.includes(idx) && (
                    <Pin size={12} className="absolute -top-1 -right-1 text-warning" />
                  )}
                  {msg.type === 'sticker' ? (
                    <img src={msg.text} alt="sticker" className="max-w-[150px] rounded-lg animate-in zoom-in" />
                  ) : msg.type === 'voice' ? (
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <button 
                        onClick={() => {
                          const audio = new Audio(msg.text);
                          audio.play();
                        }}
                        className="btn btn-circle btn-sm btn-primary"
                      >
                        ▶
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 h-8">
                          {[...Array(15)].map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-current rounded-full opacity-50"
                              style={{ height: `${20 + Math.random() * 80}%`, minHeight: '3px' }}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <Mic size={16} className="opacity-50" />
                    </div>
                  ) : msg.type === 'gif' || msg.type === 'meme' ? (
                    <img src={msg.text} alt={msg.type} className="max-w-full rounded-lg" />
                  ) : (
                    <>
                      <span className="text-sm">{msg.text}</span>
                      {autoTranslate && msg.from === 'stranger' && (
                        <div className="text-xs opacity-70 mt-1 italic border-t border-white/20 pt-1">
                          <Languages size={10} className="inline" /> {translateText(msg.text)}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center gap-1 text-[10px] opacity-70 mt-1">
                    <Clock size={10} />
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {msg.from === 'me' && (
                      <CheckCheck size={12} className="text-primary" />
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleContextMenu(e, idx)}
                  className="opacity-0 group-hover:opacity-100 btn btn-circle btn-ghost btn-xs absolute top-0 right-0"
                >
                  <MoreVertical size={14} />
                </button>
                {messageReactions[idx] && (
                  <div className="absolute -top-2 right-0 text-2xl animate-bounce">
                    {messageReactions[idx]}
                  </div>
                )}
                {msg.from === 'stranger' && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-base-content/50 mt-1">
                    Double-tap to ❤️
                  </div>
                )}
              </div>
            )
          ))}
          {isTyping && (
            <div className="chat chat-start animate-pulse">
              <div className="chat-bubble chat-bubble-secondary">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-base-300">
          {showStickerPicker && (
            <div className="bg-base-100 border-b border-base-300 animate-in slide-in-from-bottom">
              <div className="p-3">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  Animated Stickers
                </h3>
                <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {animatedStickers.map((sticker, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        sendMessage(sticker, socket, 'sticker');
                        setShowStickerPicker(false);
                        playSound('send');
                      }}
                      className="cursor-pointer hover:scale-110 transition-transform rounded-lg overflow-hidden shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary"
                    >
                      <img src={sticker} alt="sticker" className="w-full h-20 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {showEmojiPicker && (
            <div className="bg-base-100 border-b border-base-300">
              <div className="flex gap-1 p-2 overflow-x-auto">
                {Object.keys(emojiCategories).map(cat => (
                  <button key={cat} type="button" onClick={() => setActiveEmojiTab(cat)} className={`btn btn-xs capitalize ${activeEmojiTab === cat ? 'btn-primary' : 'btn-ghost'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="p-3 grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                {emojiCategories[activeEmojiTab].map((emoji, idx) => (
                  <button key={idx} type="button" onClick={() => handleEmojiClick(emoji)} className="text-3xl hover:scale-125 transition-transform p-1">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showGifPicker && (
            <div className="bg-base-100 border-b border-base-300">
              <div className="flex gap-2 p-3 border-b">
                <button type="button" onClick={() => setGifSearch('')} className={`btn btn-sm flex-1 ${!gifSearch ? 'btn-primary' : 'btn-ghost'}`}>🎬 GIFs</button>
                <button type="button" onClick={() => setGifSearch('memes')} className={`btn btn-sm flex-1 ${gifSearch === 'memes' ? 'btn-primary' : 'btn-ghost'}`}>😂 Memes</button>
              </div>
              {gifSearch !== 'memes' ? (
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="Search trending GIFs..."
                    value={gifSearch}
                    onChange={(e) => setGifSearch(e.target.value)}
                    className="input input-sm input-bordered w-full mb-3"
                  />
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {trendingGifs.map((gif, idx) => (
                      <img key={idx} src={gif} alt="gif" onClick={() => handleGifClick(gif)} className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-105 transition-all shadow-md" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {memeTemplates.map((meme, idx) => (
                    <div key={idx} onClick={() => handleMemeClick(meme.url)} className="cursor-pointer hover:scale-105 transition-all">
                      <img src={meme.url} alt={meme.name} className="w-full h-28 object-cover rounded-lg shadow-md" />
                      <p className="text-xs text-center mt-1 font-medium">{meme.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="px-3 py-2 flex gap-1 overflow-x-auto">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => sendQuickReply(reply)}
                className="btn btn-xs btn-ghost bg-base-100 hover:bg-primary/20 whitespace-nowrap gap-1 shadow-sm"
              >
                <Zap size={12} />
                {reply}
              </button>
            ))}
          </div>
          {/* Voice Message Recording */}
          {(isRecording || audioBlob) && (
            <div className="p-3 bg-error/10 border-t border-error/30 animate-in slide-in-from-bottom">
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-error rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-error">
                          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </span>
                        <span className="text-xs text-base-content/60">/ 1:00</span>
                      </div>
                      {/* Waveform */}
                      <div className="flex items-center gap-1 h-12">
                        {audioWaveform.map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-error rounded-full transition-all duration-100"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <button onClick={stopRecording} className="btn btn-circle btn-error">
                      <X size={24} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="btn btn-circle btn-success btn-sm" onClick={() => {
                        const audio = new Audio(URL.createObjectURL(audioBlob));
                        audio.play();
                      }}>
                        ▶
                      </div>
                      <div>
                        <div className="text-sm font-bold">Voice Message</div>
                        <div className="text-xs text-base-content/60">{recordingTime}s</div>
                      </div>
                    </div>
                    <button onClick={cancelVoiceMessage} className="btn btn-circle btn-ghost btn-sm">
                      <Trash2 size={18} />
                    </button>
                    <button onClick={sendVoiceMessage} className="btn btn-circle btn-primary">
                      <Send size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="p-3">
            <div className="flex items-center gap-2 bg-base-100 rounded-full px-2 py-1 shadow-lg">
              <button type="button" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); setShowStickerPicker(false); }} className="btn btn-circle btn-ghost btn-sm hover:bg-primary/20">
                <Smile size={22} />
              </button>
              <button type="button" onClick={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); setShowGifPicker(false); }} className="btn btn-circle btn-ghost btn-sm hover:bg-primary/20" title="Animated Stickers">
                <Sparkles size={22} />
              </button>
              <button type="button" onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); setShowStickerPicker(false); }} className="btn btn-circle btn-ghost btn-sm hover:bg-primary/20">
                <ImageIcon size={22} />
              </button>
              <button 
                type="button" 
                onClick={isRecording ? stopRecording : startRecording}
                className={`btn btn-circle btn-ghost btn-sm hover:bg-primary/20 ${isRecording ? 'animate-pulse bg-error/20' : ''}`}
                title="Voice Message"
              >
                <Mic size={22} className={isRecording ? 'text-error' : ''} />
              </button>
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                placeholder="Type a message..."
                className="input input-sm bg-transparent border-0 flex-1 focus:outline-none"
                disabled={isRecording || audioBlob}
              />
              <button type="submit" disabled={!messageInput.trim()} className="btn btn-circle btn-primary btn-sm shadow-lg hover:scale-110 transition-transform disabled:opacity-50">
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default RandomChat;

// Add to your global CSS or tailwind config
const style = document.createElement('style');
style.textContent = `
  @keyframes fall {
    to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
  }
  @keyframes float-up {
    to { transform: translateY(-200px); opacity: 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(style);
