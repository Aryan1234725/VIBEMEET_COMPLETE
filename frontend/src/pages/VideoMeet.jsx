// ✅ FIXED VERSION - Recording + Chat fixes applied

import React, { useEffect, useRef, useState, useCallback } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Menu, MenuItem, Tooltip, Drawer, Avatar, Chip, Snackbar, Alert, Slider, Switch, FormControlLabel } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import ChatIcon from '@mui/icons-material/Chat'
import PeopleIcon from '@mui/icons-material/People';
import PanToolIcon from '@mui/icons-material/PanTool';
import SettingsIcon from '@mui/icons-material/Settings';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import SendIcon from '@mui/icons-material/Send';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';

import server from '../environment';

const server_url = server;

export default function VideoMeetComponent() {

    const socketRef = useRef(null);
    const socketIdRef = useRef(null);
    const localVideoref = useRef(null);
    const remoteVideoref = useRef({});
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const screenStreamRef = useRef(null);
    const peerConnectionRef = useRef({});
    const remoteStreamsRef = useRef({});
    const recordingCanvasRef = useRef(null);
    const recordingAnimationRef = useRef(null);
    const recordingStreamRef = useRef(null);

    // ✅ FIX 1: Use a ref to track recording state inside animation loop
    //    (useState closes over stale value in requestAnimationFrame)
    const isRecordingRef = useRef(false);
    const recordingTimeRef = useRef(0);

    // Core states
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [facingMode, setFacingMode] = useState('user');
    
    // Chat states
    const [showModal, setModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [username, setUsername] = useState("");
    const [askForUsername, setAskForUsername] = useState(true);
    
    // Participant states
    const [showParticipants, setShowParticipants] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [handRaised, setHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState([]);
    const [reactions, setReactions] = useState([]);
    const [mutedParticipants, setMutedParticipants] = useState({});
    
    // UI states
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPiPMode, setIsPiPMode] = useState(false);
    const [backgroundBlur, setBackgroundBlur] = useState(false);
    const [videoFilter, setVideoFilter] = useState('none');
    const [layoutMode, setLayoutMode] = useState('grid');
    const [pinnedVideo, setPinnedVideo] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Video adjustment states
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [mirrorVideo, setMirrorVideo] = useState(false);
    
    // Audio settings
    const [noiseSuppression, setNoiseSuppression] = useState(true);
    const [autoGainControl, setAutoGainControl] = useState(true);
    const [echoCancellation, setEchoCancellation] = useState(true);
    
    // Other states
    const [recordingTime, setRecordingTime] = useState(0);
    const [chatNotifications] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const connectionQuality = 'good';

    const emojis = ['👍', '👏', '❤️', '😂', '😮', '🎉', '👋', '🔥', '✨', '💯'];
    const filterOptions = [
        { name: 'None', value: 'none' },
        { name: 'Grayscale', value: 'grayscale(100%)' },
        { name: 'Sepia', value: 'sepia(100%)' },
        { name: 'Invert', value: 'invert(100%)' },
        { name: 'Vintage', value: 'sepia(50%) contrast(120%)' },
        { name: 'Cool', value: 'hue-rotate(180deg)' },
        { name: 'Warm', value: 'sepia(30%) saturate(150%)' },
    ];

    const showSnackbar = useCallback((msg, severity = 'info') => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    }, []);

    const getMedia = useCallback(async () => {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: { exact: facingMode }
                },
                audio: {
                    echoCancellation: echoCancellation,
                    noiseSuppression: noiseSuppression,
                    autoGainControl: autoGainControl,
                    sampleRate: 44100,
                    sampleSize: 16,
                    channelCount: 1
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            
            window.localStream = stream;

            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
            }

            Object.values(peerConnectionRef.current).forEach(peerConnection => {
                stream.getTracks().forEach(track => {
                    const sender = peerConnection.getSenders().find(s => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        peerConnection.addTrack(track, stream);
                    }
                });
            });

            return stream;

        } catch (err) {
            console.error("Media error:", err);
            showSnackbar('Error accessing camera/microphone', 'error');
        }
    }, [facingMode, echoCancellation, noiseSuppression, autoGainControl]);

    const connectSocket = () => {
        socketRef.current = io.connect(server_url, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id;
            socketRef.current.emit("join-room", { roomId: "default-room", userId: socketIdRef.current, username: username });
        });

        socketRef.current.on("existing-users", (users) => {
            setRemoteUsers(users);
            setParticipants(users.map(u => ({ id: u.userId, username: u.username || u.userId.slice(0, 8) })));
            users.forEach(user => {
                if (user.userId !== socketIdRef.current) {
                    createPeerConnection(user.userId, true);
                }
            });
        });

        socketRef.current.on("user-joined", (user) => {
            if (user.userId !== socketIdRef.current) {
                setRemoteUsers(prev => [...prev, user]);
                setParticipants(prev => [...prev, { id: user.userId, username: user.username || user.userId.slice(0, 8) }]);
                createPeerConnection(user.userId, true);
                showSnackbar(`${user.username || 'Someone'} joined the meeting`, 'info');
            }
        });

        socketRef.current.on("offer", async ({ from, offer }) => {
            await handleReceiveOffer(from, offer);
        });

        socketRef.current.on("answer", async ({ from, answer }) => {
            await handleReceiveAnswer(from, answer);
        });

        socketRef.current.on("ice-candidate", async ({ from, candidate }) => {
            await handleIceCandidate(from, candidate);
        });

        socketRef.current.on("user-left", (userId) => {
            handleUserLeft(userId);
        });

        // ✅ FIX 2: Chat — server broadcasts (data, sender, senderId).
        //    We listen in that same order. Own messages are added locally in sendMessage().
        socketRef.current.on("chat-message", (data, sender, senderId) => {
            // Only add messages from OTHER users here; own message is added in sendMessage()
            if (senderId !== socketIdRef.current) {
                setMessages(prev => [...prev, { sender, data, timestamp: new Date().toLocaleTimeString() }]);
                setNewMessages(n => n + 1);
                if (chatNotifications) showSnackbar(`💬 New message from ${sender}`, 'info');
            }
        });

        socketRef.current.on("hand-raised", (userId, uname, raised) => {
            if (raised) {
                setRaisedHands(prev => [...prev, { id: userId, username: uname }]);
                showSnackbar(`${uname} raised their hand ✋`, 'info');
            } else {
                setRaisedHands(prev => prev.filter(h => h.id !== userId));
            }
        });

        socketRef.current.on("reaction", (userId, uname, emoji) => {
            const r = { id: Date.now(), emoji, username: uname };
            setReactions(prev => [...prev, r]);
            setTimeout(() => setReactions(prev => prev.filter(x => x.id !== r.id)), 3000);
        });
    };

    const createPeerConnection = useCallback(async (userId, isInitiator = false) => {
        if (peerConnectionRef.current[userId]) {
            return peerConnectionRef.current[userId];
        }

        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };

        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current[userId] = peerConnection;

        if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, window.localStream);
            });
        }

        peerConnection.ontrack = (event) => {
            if (!remoteStreamsRef.current[userId]) {
                remoteStreamsRef.current[userId] = new MediaStream();
            }
            event.streams[0].getTracks().forEach(track => {
                remoteStreamsRef.current[userId].addTrack(track);
            });
            
            if (remoteVideoref.current[userId]) {
                remoteVideoref.current[userId].srcObject = remoteStreamsRef.current[userId];
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit("ice-candidate", {
                    to: userId,
                    candidate: event.candidate
                });
            }
        };

        if (isInitiator && window.localStream) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socketRef.current.emit("offer", {
                to: userId,
                offer: offer
            });
        }

        return peerConnection;
    }, []);

    const handleReceiveOffer = async (from, offer) => {
        const peerConnection = await createPeerConnection(from, false);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socketRef.current.emit("answer", {
            to: from,
            answer: answer
        });
    };

    const handleReceiveAnswer = async (from, answer) => {
        const peerConnection = peerConnectionRef.current[from];
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const handleIceCandidate = async (from, candidate) => {
        const peerConnection = peerConnectionRef.current[from];
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const handleUserLeft = (userId) => {
        if (peerConnectionRef.current[userId]) {
            peerConnectionRef.current[userId].close();
            delete peerConnectionRef.current[userId];
        }
        if (remoteStreamsRef.current[userId]) {
            remoteStreamsRef.current[userId].getTracks().forEach(track => track.stop());
            delete remoteStreamsRef.current[userId];
        }
        setRemoteUsers(prev => prev.filter(user => user.userId !== userId));
        setParticipants(prev => prev.filter(p => p.id !== userId));
    };

    useEffect(() => {
        const peerConnections = peerConnectionRef.current;
        const socket = socketRef.current;
        const screenStream = screenStreamRef.current;

        if (!askForUsername) {
            getMedia();
            connectSocket();
        }

        return () => {
            if (recordingAnimationRef.current) {
                cancelAnimationFrame(recordingAnimationRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            Object.values(peerConnections).forEach(peerConnection => {
                if (peerConnection) peerConnection.close();
            });
            if (socket) socket.disconnect();
            if (window.localStream) window.localStream.getTracks().forEach(track => track.stop());
            if (screenStream) screenStream.getTracks().forEach(track => track.stop());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [askForUsername]);

    // Recording timer — keep ref in sync so canvas loop can read it
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                recordingTimeRef.current += 1;
                setRecordingTime(recordingTimeRef.current);
            }, 1000);
        } else {
            recordingTimeRef.current = 0;
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // ✅ FIX 3: Recording — use isRecordingRef (not isRecording state) inside
    //    requestAnimationFrame so the loop doesn't close over a stale false value.
    const startRecording = () => {
        try {
            if (!window.localStream) {
                showSnackbar('No video stream available', 'error');
                return;
            }

            recordedChunksRef.current = [];

            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            recordingCanvasRef.current = canvas;
            const ctx = canvas.getContext('2d');

            // Set the ref BEFORE starting the animation loop
            isRecordingRef.current = true;

            const captureFrame = () => {
                // ✅ Read from ref — always current, not stale closure
                if (!isRecordingRef.current) return;

                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const localVideo = localVideoref.current;
                const hasLocalVideo = localVideo && localVideo.videoWidth > 0 && localVideo.readyState >= 2;

                const remoteVideoElements = Object.values(remoteVideoref.current).filter(
                    v => v && v.videoWidth > 0 && v.readyState >= 2
                );

                if (isScreenSharing && hasLocalVideo) {
                    const screenWidth = Math.floor(canvas.width * 0.75);
                    const sidebarWidth = canvas.width - screenWidth;

                    ctx.drawImage(localVideo, 0, 0, screenWidth, canvas.height);

                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.fillRect(10, 10, 160, 30);
                    ctx.fillStyle = '#4CAF50';
                    ctx.font = 'bold 14px Arial';
                    ctx.fillText('🖥 Screen Sharing', 16, 30);

                    if (remoteVideoElements.length > 0) {
                        const tileHeight = Math.floor(canvas.height / remoteVideoElements.length);
                        remoteVideoElements.forEach((vid, index) => {
                            const y = index * tileHeight;
                            ctx.drawImage(vid, screenWidth, y, sidebarWidth, tileHeight);
                            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                            ctx.lineWidth = 1;
                            ctx.strokeRect(screenWidth, y, sidebarWidth, tileHeight);
                        });
                    } else {
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.fillRect(screenWidth, 0, sidebarWidth, canvas.height);
                        ctx.fillStyle = 'white';
                        ctx.font = '16px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('No other participants', screenWidth + sidebarWidth / 2, canvas.height / 2);
                        ctx.textAlign = 'left';
                    }
                } else {
                    const allVideos = [];
                    if (hasLocalVideo) allVideos.push({ video: localVideo, isLocal: true });
                    remoteVideoElements.forEach(v => allVideos.push({ video: v, isLocal: false }));

                    if (allVideos.length > 0) {
                        const cols = Math.ceil(Math.sqrt(allVideos.length));
                        const rows = Math.ceil(allVideos.length / cols);
                        const tileWidth = Math.floor(canvas.width / cols);
                        const tileHeight = Math.floor(canvas.height / rows);

                        allVideos.forEach((item, index) => {
                            const col = index % cols;
                            const row = Math.floor(index / cols);
                            const x = col * tileWidth;
                            const y = row * tileHeight;

                            ctx.drawImage(item.video, x, y, tileWidth, tileHeight);

                            ctx.fillStyle = 'rgba(0,0,0,0.6)';
                            ctx.fillRect(x + 10, y + tileHeight - 35, 80, 25);
                            ctx.fillStyle = 'white';
                            ctx.font = 'bold 12px Arial';
                            ctx.fillText(item.isLocal ? 'You' : 'Participant', x + 16, y + tileHeight - 18);
                        });
                    } else {
                        ctx.fillStyle = '#555';
                        ctx.font = 'bold 20px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('No video available', canvas.width / 2, canvas.height / 2);
                        ctx.textAlign = 'left';
                    }
                }

                // Recording indicator — read time from ref so it's always fresh
                ctx.fillStyle = 'rgba(220, 0, 0, 0.9)';
                ctx.beginPath();
                ctx.arc(30, 30, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(`REC ${formatTime(recordingTimeRef.current)}`, 50, 36);

                recordingAnimationRef.current = requestAnimationFrame(captureFrame);
            };

            captureFrame();

            const canvasStream = canvas.captureStream(30);
            // ✅ FIX A: Store only the canvas video stream in recordingStreamRef.
            //    We do NOT add the live audio tracks to canvasStream directly because
            //    stopping canvasStream tracks later would kill the live mic/screen audio.
            //    Instead we create a dedicated AudioContext mix and add a CLONED audio track.
            recordingStreamRef.current = canvasStream;

            // Build a mixed audio track from all available sources using AudioContext
            let audioDestination = null;
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    const audioCtx = new AudioContext();
                    audioDestination = audioCtx.createMediaStreamDestination();

                    // Mix local mic audio
                    if (window.localStream && window.localStream.getAudioTracks().length > 0) {
                        const micSource = audioCtx.createMediaStreamSource(window.localStream);
                        micSource.connect(audioDestination);
                    }

                    // Mix screen share system audio if present
                    if (screenStreamRef.current && screenStreamRef.current.getAudioTracks().length > 0) {
                        const screenAudioSource = audioCtx.createMediaStreamSource(screenStreamRef.current);
                        screenAudioSource.connect(audioDestination);
                    }

                    // Add the mixed audio track to canvas stream
                    audioDestination.stream.getAudioTracks().forEach(track => {
                        canvasStream.addTrack(track);
                    });
                }
            } catch (audioErr) {
                console.warn('AudioContext mix failed, falling back to direct track clone:', audioErr);
                // Fallback: clone the audio track so stopping it won't affect live stream
                if (window.localStream && window.localStream.getAudioTracks().length > 0) {
                    const clonedAudio = window.localStream.getAudioTracks()[0].clone();
                    canvasStream.addTrack(clonedAudio);
                }
            }

            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm';

            const recorder = new MediaRecorder(canvasStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 3000000,
                audioBitsPerSecond: 128000
            });

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                // ✅ FIX B: request one final chunk before assembling the blob,
                //    and append anchor to document so Firefox/Safari can trigger download.
                const chunks = recordedChunksRef.current;
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `meeting-recording-${Date.now()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    // Delay revoke so browser has time to start the download
                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    }, 2000);
                    showSnackbar('✅ Recording saved successfully!', 'success');
                } else {
                    showSnackbar('⚠️ Recording was empty — nothing to save', 'warning');
                }
                recordedChunksRef.current = [];
            };

            // ✅ FIX C: Use timeslice of 500ms instead of 1000ms so we get more
            //    frequent chunks and don't lose data if the last chunk is missed.
            recorder.start(500);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            showSnackbar('🔴 Recording started', 'info');

        } catch (error) {
            console.error('Recording error:', error);
            isRecordingRef.current = false;
            showSnackbar('Failed to start recording: ' + error.message, 'error');
        }
    };

    const stopRecording = () => {
        // ✅ FIX D: Stop ref first so animation loop exits on its next frame
        isRecordingRef.current = false;

        if (recordingAnimationRef.current) {
            cancelAnimationFrame(recordingAnimationRef.current);
            recordingAnimationRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            // Request any buffered data before stopping so the last chunk isn't lost
            mediaRecorderRef.current.requestData();
            mediaRecorderRef.current.stop();
        }

        // ✅ FIX E: Only stop the canvas VIDEO track on the recording stream.
        //    Do NOT stop audio tracks here — they are either from AudioContext (auto-managed)
        //    or cloned tracks (isolated from live stream), but we still mustn't stop shared ones.
        if (recordingStreamRef.current) {
            recordingStreamRef.current.getVideoTracks().forEach(track => track.stop());
            recordingStreamRef.current = null;
        }

        setIsRecording(false);
    };

    const handleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" },
                    audio: true
                });

                screenStreamRef.current = screenStream;

                const videoTrack = screenStream.getVideoTracks()[0];
                const oldVideoTrack = window.localStream.getVideoTracks()[0];
                
                window.localStream.removeTrack(oldVideoTrack);
                window.localStream.addTrack(videoTrack);
                
                Object.values(peerConnectionRef.current).forEach(peerConnection => {
                    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                });
                
                if (localVideoref.current) {
                    localVideoref.current.srcObject = window.localStream;
                }

                videoTrack.onended = () => stopScreenShare();
                setIsScreenSharing(true);
                showSnackbar('🖥 Screen sharing started', 'info');

            } catch (err) {
                console.error("Screen share error:", err);
                showSnackbar('Screen share cancelled or failed', 'error');
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = async () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }

        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: facingMode } },
                audio: {
                    echoCancellation: echoCancellation,
                    noiseSuppression: noiseSuppression,
                    autoGainControl: autoGainControl
                }
            });

            const videoTrack = cameraStream.getVideoTracks()[0];
            const oldVideoTrack = window.localStream.getVideoTracks()[0];
            
            window.localStream.removeTrack(oldVideoTrack);
            window.localStream.addTrack(videoTrack);
            
            Object.values(peerConnectionRef.current).forEach(peerConnection => {
                const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            });
            
            if (localVideoref.current) {
                localVideoref.current.srcObject = window.localStream;
            }
            
            setIsScreenSharing(false);
            showSnackbar('Camera resumed', 'info');
        } catch (err) {
            console.error("Restore camera error:", err);
        }
    };

    const handleVideo = () => {
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => track.enabled = !video);
            setVideo(!video);
        }
    };

    const handleAudio = () => {
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => track.enabled = !audio);
            setAudio(!audio);
        }
    };

    const switchCamera = async () => {
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        await getMedia();
        showSnackbar(`Switched to ${newFacingMode === 'user' ? 'front' : 'back'} camera`, 'info');
    };

    // ✅ FIX 4: sendMessage — add own message to local state immediately,
    //    then emit. Argument order matches server: (message, username).
    const sendMessage = () => {
        if (message.trim()) {
            const timestamp = new Date().toLocaleTimeString();
            // Add to own message list right away
            setMessages(prev => [...prev, { sender: username, data: message, timestamp }]);
            // Emit to server so others receive it
            socketRef.current.emit('chat-message', message, username);
            setMessage('');
        }
    };

    const handleHandRaise = () => {
        const newState = !handRaised;
        setHandRaised(newState);
        socketRef.current.emit('raise-hand', newState, username);
        showSnackbar(newState ? '✋ Hand raised' : 'Hand lowered', 'info');
    };

    const sendReaction = (emoji) => {
        socketRef.current.emit('send-reaction', emoji, username);
        setShowEmojiPicker(false);
        const r = { id: Date.now(), emoji };
        setReactions(prev => [...prev, r]);
        setTimeout(() => setReactions(prev => prev.filter(x => x.id !== r.id)), 3000);
    };

    const takeScreenshot = () => {
        try {
            const vid = localVideoref.current;
            if (vid && vid.videoWidth) {
                const canvas = document.createElement('canvas');
                canvas.width = vid.videoWidth;
                canvas.height = vid.videoHeight;
                canvas.getContext('2d').drawImage(vid, 0, 0);
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `screenshot-${Date.now()}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showSnackbar('📸 Screenshot saved!', 'success');
                });
            }
        } catch (e) {
            showSnackbar('Screenshot failed', 'error');
        }
    };

    const copyMeetingLink = () => {
        navigator.clipboard.writeText(window.location.href);
        showSnackbar('🔗 Meeting link copied!', 'success');
    };

    const joinMeeting = () => {
        if (username.trim()) {
            setAskForUsername(false);
            setParticipants([{ id: 'self', username: username, isSelf: true }]);
        } else {
            showSnackbar('Please enter your name', 'warning');
        }
    };

    const handleEndCall = () => {
        stopRecording();
        if (window.localStream) window.localStream.getTracks().forEach(track => track.stop());
        if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
        if (socketRef.current) socketRef.current.disconnect();
        window.location.href = '/';
    };

    const getCombinedFilter = () => {
        const filters = [];
        if (videoFilter !== 'none') filters.push(videoFilter);
        if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
        if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
        if (saturation !== 100) filters.push(`saturate(${saturation}%)`);
        if (backgroundBlur) filters.push('blur(4px)');
        return filters.length ? filters.join(' ') : 'none';
    };

    if (askForUsername) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 20, backgroundColor: '#1a1a2e' }}>
                <h2 style={{ color: 'white' }}>🎥 Join Meeting</h2>
                <TextField
                    label="Your Name"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && joinMeeting()}
                    variant="outlined"
                    style={{ width: 300 }}
                    InputProps={{ style: { color: 'white' } }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                />
                <Button variant="contained" onClick={joinMeeting}>Join</Button>
                <video ref={localVideoref} autoPlay muted style={{ width: 400, borderRadius: 10 }} />
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#1a1a2e', overflow: 'hidden' }}>
            
            {/* Video Grid */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '85%', height: '75%', display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 15, padding: 20, overflow: 'auto'
            }}>
                {remoteUsers.map(user => (
                    <div key={user.userId} style={{ position: 'relative', backgroundColor: '#111', borderRadius: 10, overflow: 'hidden' }}>
                        <video
                            ref={el => remoteVideoref.current[user.userId] = el}
                            autoPlay
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 5, color: 'white' }}>
                            {user.username || user.userId.slice(0, 8)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Local Video */}
            <div style={{ position: 'absolute', bottom: 100, right: 20, zIndex: 100 }}>
                <video
                    ref={localVideoref}
                    autoPlay
                    muted
                    style={{
                        width: 200, height: 150, borderRadius: 10, border: '2px solid white',
                        objectFit: 'cover', transform: mirrorVideo ? 'scaleX(-1)' : 'none',
                        filter: getCombinedFilter()
                    }}
                />
                <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 5, color: 'white', fontSize: 12 }}>
                    You {isScreenSharing && '(Sharing)'}
                </div>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
                <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'red', color: 'white', padding: '8px 20px', borderRadius: 20, zIndex: 1000 }}>
                    🔴 RECORDING {formatTime(recordingTime)}
                </div>
            )}

            {/* Control Bar */}
            <div style={{
                position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 10, background: 'rgba(0,0,0,0.8)', padding: '10px 20px',
                borderRadius: 50, zIndex: 1000
            }}>
                <IconButton onClick={handleVideo} style={{ color: video ? '#4CAF50' : '#f44336' }}>
                    {video ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>

                <IconButton onClick={handleAudio} style={{ color: audio ? '#4CAF50' : '#f44336' }}>
                    {audio ? <MicIcon /> : <MicOffIcon />}
                </IconButton>

                <IconButton onClick={switchCamera} style={{ color: '#2196F3' }}>
                    <CameraswitchIcon />
                </IconButton>

                <IconButton onClick={handleScreenShare} style={{ color: isScreenSharing ? '#4CAF50' : '#FF9800' }}>
                    {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>

                <IconButton onClick={isRecording ? stopRecording : startRecording} style={{ color: isRecording ? '#f44336' : '#9C27B0' }}>
                    {isRecording ? <StopIcon /> : <FiberManualRecordIcon />}
                </IconButton>

                <IconButton onClick={takeScreenshot} style={{ color: 'white' }}>
                    <CameraAltIcon />
                </IconButton>

                <IconButton onClick={handleHandRaise} style={{ color: handRaised ? '#FFD700' : 'white' }}>
                    <PanToolIcon />
                </IconButton>

                <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ color: 'white' }}>
                    <InsertEmoticonIcon />
                </IconButton>

                <Badge badgeContent={newMessages} color="error">
                    <IconButton onClick={() => { setModal(true); setNewMessages(0); }} style={{ color: 'white' }}>
                        <ChatIcon />
                    </IconButton>
                </Badge>

                <IconButton onClick={() => setShowParticipants(true)} style={{ color: 'white' }}>
                    <PeopleIcon />
                </IconButton>

                <IconButton onClick={() => setShowSettings(true)} style={{ color: 'white' }}>
                    <SettingsIcon />
                </IconButton>

                <IconButton onClick={handleEndCall} style={{ color: '#f44336' }}>
                    <CallEndIcon />
                </IconButton>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'white', padding: 10, borderRadius: 20, display: 'flex', gap: 10, zIndex: 2000 }}>
                    {emojis.map(emoji => (
                        <span key={emoji} onClick={() => sendReaction(emoji)} style={{ cursor: 'pointer', fontSize: 30 }}>{emoji}</span>
                    ))}
                </div>
            )}

            {/* Reactions Animation */}
            <div style={{ position: 'absolute', bottom: 200, right: 100, pointerEvents: 'none' }}>
                {reactions.map(r => (
                    <div key={r.id} style={{ fontSize: 40, animation: 'floatUp 2s ease-out forwards' }}>{r.emoji}</div>
                ))}
            </div>

            {/* Chat Drawer */}
            <Drawer anchor="right" open={showModal} onClose={() => setModal(false)}>
                <div style={{ width: 350, padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3>Chat</h3>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ marginBottom: 10, padding: 8, background: '#f0f0f0', borderRadius: 8 }}>
                                <b>{msg.sender}</b> <span style={{ fontSize: 11, color: '#666' }}>{msg.timestamp}</span>
                                <p style={{ margin: '5px 0 0 0' }}>{msg.data}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <TextField
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && sendMessage()}
                            fullWidth
                            size="small"
                            placeholder="Type a message..."
                        />
                        <Button onClick={sendMessage} variant="contained">Send</Button>
                    </div>
                </div>
            </Drawer>

            {/* Participants Drawer */}
            <Drawer anchor="right" open={showParticipants} onClose={() => setShowParticipants(false)}>
                <div style={{ width: 300, padding: 20 }}>
                    <h3>Participants ({participants.length})</h3>
                    {participants.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <Avatar>{p.username?.[0]}</Avatar>
                            <span>{p.username} {p.isSelf && '(You)'}</span>
                        </div>
                    ))}
                    {raisedHands.length > 0 && (
                        <>
                            <h4>Raised Hands</h4>
                            {raisedHands.map(h => <Chip key={h.id} label={h.username} icon={<PanToolIcon />} />)}
                        </>
                    )}
                </div>
            </Drawer>

            {/* Settings Drawer */}
            <Drawer anchor="right" open={showSettings} onClose={() => setShowSettings(false)}>
                <div style={{ width: 350, padding: 20 }}>
                    <h3>Settings</h3>
                    <h4>Video</h4>
                    <p>Brightness</p>
                    <Slider value={brightness} onChange={(e, v) => setBrightness(v)} min={0} max={200} />
                    <p>Contrast</p>
                    <Slider value={contrast} onChange={(e, v) => setContrast(v)} min={0} max={200} />
                    <p>Saturation</p>
                    <Slider value={saturation} onChange={(e, v) => setSaturation(v)} min={0} max={200} />
                    
                    <h4>Filters</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {filterOptions.map(f => (
                            <Button key={f.value} size="small" variant={videoFilter === f.value ? 'contained' : 'outlined'} onClick={() => setVideoFilter(f.value)}>
                                {f.name}
                            </Button>
                        ))}
                    </div>
                    
                    <h4>Audio</h4>
                    <FormControlLabel control={<Switch checked={echoCancellation} onChange={e => setEchoCancellation(e.target.checked)} />} label="Echo Cancellation" />
                    <FormControlLabel control={<Switch checked={noiseSuppression} onChange={e => setNoiseSuppression(e.target.checked)} />} label="Noise Suppression" />
                    <FormControlLabel control={<Switch checked={autoGainControl} onChange={e => setAutoGainControl(e.target.checked)} />} label="Auto Gain Control" />
                    
                    <FormControlLabel control={<Switch checked={mirrorVideo} onChange={e => setMirrorVideo(e.target.checked)} />} label="Mirror Video" />
                    
                    <Button onClick={copyMeetingLink} startIcon={<ContentCopyIcon />} fullWidth>Copy Meeting Link</Button>
                </div>
            </Drawer>

            {/* Snackbar */}
            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
            </Snackbar>

            <style>
                {`
                    @keyframes floatUp {
                        0% { opacity: 1; transform: translateY(0) scale(1); }
                        100% { opacity: 0; transform: translateY(-100px) scale(0.5); }
                    }
                `}
            </style>
        </div>
    );
}
