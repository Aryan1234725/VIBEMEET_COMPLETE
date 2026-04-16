import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Button, Typography, Box, Container, Grid, Card, CardContent, IconButton } from '@mui/material';
import { VideoCall, CalendarToday, Add, MoreVert } from '@mui/icons-material';

export default function GoogleMeetInterface() {
    const navigate = useNavigate();
    
    // Mock data for existing meetings
    const [existingMeetings] = useState([
        { id: '1', title: '12:30 PM Weekly Review', time: '12:30 PM', code: 'abc123' },
        { id: '2', title: '2:00 PM Team Standup', time: '2:00 PM', code: 'def456' }
    ]);

    const [generatedMeetingLink, setGeneratedMeetingLink] = useState('');

    const handleCreateMeeting = () => {
        const meetingCode = Math.random().toString(36).substring(2, 8);
        const meetingLink = `${window.location.origin}/${meetingCode}`;
        setGeneratedMeetingLink(meetingLink);
    };

    const handleInstantMeeting = () => {
        const meetingCode = Math.random().toString(36).substring(2, 8);
        navigate(`/${meetingCode}`);
    };

    const handleJoinMeeting = (meetingCode) => {
        navigate(`/${meetingCode}`);
    };

    const handleScheduleMeeting = () => {
        // Open Google Calendar or navigate to scheduling page
        window.open('https://calendar.google.com', '_blank');
    };

    return (
        <div className="googleMeetContainer">
            <Container maxWidth="lg">
                {/* Header */}
                <Box className="meetHeader">
                    <Typography variant="h4" component="h1" className="meetTitle">
                        Google Meet
                    </Typography>
                </Box>

                {/* Main Content */}
                <Grid container spacing={4} className="meetMainContent">
                    {/* Left Section - Meeting Creation Options */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" className="sectionTitle">
                            Start a meeting
                        </Typography>
                        
                        <Box className="meetingOptions">
                            <Card className="meetingOptionCard" onClick={handleCreateMeeting}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <VideoCall color="primary" />
                                        <Typography variant="h6">Create a meeting for later</Typography>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Generate a meeting link that you can share with participants
                                    </Typography>
                                </CardContent>
                            </Card>

                            {generatedMeetingLink && (
                                <Card className="meetingOptionCard" sx={{ backgroundColor: '#f7f7f7', borderColor: '#e0e0e0' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Meeting link generated
                                        </Typography>
                                        <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                                            {generatedMeetingLink}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => navigator.clipboard.writeText(generatedMeetingLink)}
                                        >
                                            Copy link
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="meetingOptionCard" onClick={handleInstantMeeting}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <VideoCall color="primary" />
                                        <Typography variant="h6">Start an instant meeting</Typography>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Start a meeting right away and share the link with participants
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card className="meetingOptionCard" onClick={handleScheduleMeeting}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <CalendarToday color="primary" />
                                        <Typography variant="h6">Schedule in Google Calendar</Typography>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Schedule a meeting and send invitations through Google Calendar
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>

                    {/* Right Section - Existing Meetings */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" className="sectionTitle">
                            Your meetings
                        </Typography>
                        
                        <Box className="existingMeetings">
                            {existingMeetings.length === 0 ? (
                                <Box textAlign="center" py={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        No previous meetings found
                                    </Typography>
                                </Box>
                            ) : (
                                existingMeetings.map((meeting) => (
                                    <Card key={meeting.id} className="meetingCard">
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="h6">{meeting.title}</Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {meeting.time}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary"
                                                        onClick={() => handleJoinMeeting(meeting.code)}
                                                    >
                                                        Join now
                                                    </Button>
                                                    <IconButton>
                                                        <MoreVert />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}
