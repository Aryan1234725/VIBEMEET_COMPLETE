import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';

import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Grid
} from '@mui/material';

export default function History() {

    const { getHistoryOfUser, createMeeting } = useContext(AuthContext);

    const [meetingCode, setMeetingCode] = useState("");
    const [meetings, setMeetings] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history || []);
            } catch {
                console.log("Error fetching history");
            }
        }
        fetchHistory();
    }, [getHistoryOfUser]);

    const handleJoinMeeting = () => {
        if (!meetingCode) return;
        navigate(`/meet/${meetingCode}`);
    };

    const handleCreateMeeting = async () => {
        const code = await createMeeting();
        navigate(`/meet/${code}`);
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    return (
        <Box sx={{ padding: "40px" }}>

            {/* NAVBAR */}
            <Box display="flex" justifyContent="space-between" mb={5}>
                <Typography variant="h5" fontWeight="bold">
                    VIBEMEET
                </Typography>

                <Box>
                    <Button>Upgrade</Button>
                    <Button>Logout</Button>
                </Box>
            </Box>

            {/* HERO SECTION */}
            <Box display="flex" flexWrap="wrap" alignItems="center" mb={6}>

                {/* LEFT SIDE */}
                <Box flex={1} minWidth="320px">

                    <Typography variant="h4" fontWeight="bold" mb={2}>
                        Providing Quality Video Call Just Like Quality Education
                    </Typography>

                    {/* JOIN */}
                    <Box display="flex" gap={2} mt={3}>
                        <TextField
                            label="Meeting Code"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleJoinMeeting}>
                            Join
                        </Button>
                    </Box>

                    {/* CREATE */}
                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={handleCreateMeeting}
                    >
                        New Meeting
                    </Button>

                </Box>

                {/* RIGHT IMAGE */}
                <Box flex={1} textAlign="center" minWidth="300px">
                    <img
                        src="/video-call.png" // same image as home
                        alt="video"
                        style={{ width: "80%", maxWidth: "400px" }}
                    />
                </Box>

            </Box>

            {/* HISTORY SECTION */}
            <Box mt={4}>
                <Typography variant="h5" mb={3}>
                    Meeting History
                </Typography>

                <Grid container spacing={3}>
                    {
                        meetings.length > 0 ? meetings.map((e, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card sx={{ borderRadius: 3 }}>
                                    <CardContent>

                                        <Typography fontWeight="bold">
                                            Code: {e.meetingCode}
                                        </Typography>

                                        <Typography color="text.secondary">
                                            Date: {formatDate(e.date)}
                                        </Typography>

                                        <Button
                                            variant="contained"
                                            sx={{ mt: 2 }}
                                            onClick={() => navigate(`/meet/${e.meetingCode}`)}
                                        >
                                            Join Again
                                        </Button>

                                    </CardContent>
                                </Card>
                            </Grid>
                        )) : (
                            <Typography>No meetings found</Typography>
                        )
                    }
                </Grid>
            </Box>

        </Box>
    );
}