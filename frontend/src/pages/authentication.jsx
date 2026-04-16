import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar, Alert, InputAdornment, IconButton, LinearProgress, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import GoogleIcon from '@mui/icons-material/Google';

const defaultTheme = createTheme();

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_LENGTH     = 50;
const MIN_USERNAME   = 3;
const MIN_PASSWORD   = 6;

// Only letters, numbers, underscore, hyphen allowed in username
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// ── Password strength calculator ──────────────────────────────────────────────
function getPasswordStrength(pwd) {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6)                        score++;
    if (pwd.length >= 10)                       score++;
    if (/[A-Z]/.test(pwd))                      score++;
    if (/[0-9]/.test(pwd))                      score++;
    if (/[^a-zA-Z0-9]/.test(pwd))              score++;

    const levels = [
        { label: 'Very Weak', color: '#ef4444' },
        { label: 'Weak',      color: '#f97316' },
        { label: 'Fair',      color: '#eab308' },
        { label: 'Good',      color: '#22c55e' },
        { label: 'Strong',    color: '#16a34a' },
        { label: 'Strong',    color: '#16a34a' },
    ];
    return { score, ...levels[score] };
}

export default function Authentication() {

    const [username,      setUsername]      = React.useState("");
    const [password,      setPassword]      = React.useState("");
    const [name,          setName]          = React.useState("");
    const [showPassword,  setShowPassword]  = React.useState(false);
    const [errors,        setErrors]        = React.useState({});
    const [touched,       setTouched]       = React.useState({});  // track which fields were interacted with
    const [message,       setMessage]       = React.useState("");
    const [formState,     setFormState]     = React.useState(0);   // 0 = login, 1 = signup
    const [open,          setOpen]          = React.useState(false);
    const [snackSeverity, setSnackSeverity] = React.useState('info');
    const [loading,       setLoading]       = React.useState(false);

    const { handleRegister, handleLogin, setUserData } = React.useContext(AuthContext);
    const navigate = useNavigate();

    const passwordStrength = getPasswordStrength(password);

    // ── Validate a single field ───────────────────────────────────────────────
    const validateField = (field, value) => {
        switch (field) {

            case 'name':
                if (!value.trim())
                    return 'Full name is required';
                if (value.trim().length < 2)
                    return 'Name must be at least 2 characters';
                if (value.length > MAX_LENGTH)
                    return `Maximum ${MAX_LENGTH} characters allowed`;
                if (/[^a-zA-Z\s'-]/.test(value))
                    return 'Name can only contain letters, spaces, hyphens or apostrophes';
                return '';

            case 'username':
                if (!value.trim())
                    return 'Username is required';
                if (value.length < MIN_USERNAME)
                    return `Minimum ${MIN_USERNAME} characters required`;
                if (value.length > MAX_LENGTH)
                    return `Maximum ${MAX_LENGTH} characters allowed`;
                if (!USERNAME_REGEX.test(value))
                    return 'Only letters, numbers, _ and - are allowed';
                if (/^\d/.test(value))
                    return 'Username cannot start with a number';
                return '';

            case 'password':
                if (!value)
                    return 'Password is required';
                if (value.length < MIN_PASSWORD)
                    return `Minimum ${MIN_PASSWORD} characters required`;
                if (value.length > MAX_LENGTH)
                    return `Maximum ${MAX_LENGTH} characters allowed`;
                if (/\s/.test(value))
                    return 'Password cannot contain spaces';
                return '';

            default:
                return '';
        }
    };

    // ── Validate all fields at once (on submit) ───────────────────────────────
    const validateAll = () => {
        const fields = formState === 1
            ? ['name', 'username', 'password']
            : ['username', 'password'];

        const values = { name, username, password };
        const newErrors = {};
        const allTouched = {};

        fields.forEach(field => {
            const err = validateField(field, values[field]);
            if (err) newErrors[field] = err;
            allTouched[field] = true;
        });

        setErrors(newErrors);
        setTouched(allTouched);
        return Object.keys(newErrors).length === 0;
    };

    // ── Live validation on change ─────────────────────────────────────────────
    const handleChange = (field, value) => {
        // Enforce max length hard limit
        if (value.length > MAX_LENGTH) return;

        switch (field) {
            case 'name':     setName(value);     break;
            case 'username': setUsername(value); break;
            case 'password': setPassword(value); break;
            default: break;
        }

        // Only show error live if field was already touched
        if (touched[field]) {
            const err = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: err }));
        }
    };

    // ── Mark field as touched on blur ─────────────────────────────────────────
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const values = { name, username, password };
        const err = validateField(field, values[field]);
        setErrors(prev => ({ ...prev, [field]: err }));
    };

    // ── Switch between login / signup ─────────────────────────────────────────
    const switchForm = (state) => {
        setFormState(state);
        setErrors({});
        setTouched({});
        setName('');
        setUsername('');
        setPassword('');
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleAuth = async () => {
        if (!validateAll()) return;

        setLoading(true);
        try {
            if (formState === 0) {
                await handleLogin(username.trim(), password);
                setMessage("✅ Login successful! Welcome back.");
                setSnackSeverity('success');
            } else {
                const result = await handleRegister(name.trim(), username.trim(), password);
                setMessage(result || "✅ Account created! Please sign in.");
                setSnackSeverity('success');
                switchForm(0);
            }
            setOpen(true);
        } catch (err) {
            const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
            setMessage(msg);
            setSnackSeverity('error');
            setOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // ── Handle Enter key ──────────────────────────────────────────────────────
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('token');
        if (tokenParam) {
            localStorage.setItem('token', tokenParam);
            setUserData({ token: tokenParam });
            params.delete('token');
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/home');
        }
    }, [navigate, setUserData]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAuth();
    };

    const handleOAuthLogin = (provider) => {
    const BASE_URL =
        process.env.NODE_ENV === "production"
            ? "https://vibemeet-complete-6.onrender.com"
            : "http://localhost:8080";

    window.location.href = `${BASE_URL}/oauth2/authorization/${provider}`;
};

    // ── Helper: character counter color ──────────────────────────────────────
    const counterColor = (len) => {
        if (len >= MAX_LENGTH)      return '#ef4444';
        if (len >= MAX_LENGTH * 0.8) return '#f97316';
        return '#9ca3af';
    };

    // ── Helper: field end adornment (tick / cross) ────────────────────────────
    const fieldAdornment = (field, value) => {
        if (!touched[field] || !value) return null;
        const err = errors[field];
        return (
            <InputAdornment position="end">
                {err
                    ? <ErrorIcon style={{ color: '#ef4444', fontSize: 18 }} />
                    : <CheckCircleIcon style={{ color: '#22c55e', fontSize: 18 }} />
                }
            </InputAdornment>
        );
    };

    // ── Common TextField sx ───────────────────────────────────────────────────
    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': { borderWidth: 2 },
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />

                {/* ── Left image panel ── */}
                <Grid
                    item xs={false} sm={4} md={7}
                    sx={{
                        backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                {/* ── Right form panel ── */}
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box sx={{
                        my: 8, mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>

                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        {/* ── Toggle buttons ── */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Button
                                variant={formState === 0 ? 'contained' : 'outlined'}
                                onClick={() => switchForm(0)}
                                sx={{ borderRadius: 3, px: 4 }}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant={formState === 1 ? 'contained' : 'outlined'}
                                onClick={() => switchForm(1)}
                                sx={{ borderRadius: 3, px: 4 }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>

                            {/* ── Full Name (signup only) ── */}
                            {formState === 1 && (
                                <Box sx={{ position: 'relative', mt: 1 }}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Full Name"
                                        value={name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        onBlur={() => handleBlur('name')}
                                        onKeyDown={handleKeyDown}
                                        error={touched.name && !!errors.name}
                                        helperText={touched.name && errors.name ? errors.name : ' '}
                                        inputProps={{ maxLength: MAX_LENGTH }}
                                        InputProps={{ endAdornment: fieldAdornment('name', name) }}
                                        sx={fieldSx}
                                    />
                                    {/* Character counter */}
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            position: 'absolute', right: 0, top: 8,
                                            color: counterColor(name.length),
                                            fontSize: 11,
                                        }}
                                    >
                                        {name.length}/{MAX_LENGTH}
                                    </Typography>
                                </Box>
                            )}

                            {/* ── Username ── */}
                            <Box sx={{ position: 'relative', mt: formState === 1 ? 0 : 1 }}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Username"
                                    value={username}
                                    onChange={e => handleChange('username', e.target.value)}
                                    onBlur={() => handleBlur('username')}
                                    onKeyDown={handleKeyDown}
                                    error={touched.username && !!errors.username}
                                    helperText={
                                        touched.username && errors.username
                                            ? errors.username
                                            : 'Letters, numbers, _ and - only'
                                    }
                                    inputProps={{ maxLength: MAX_LENGTH }}
                                    InputProps={{ endAdornment: fieldAdornment('username', username) }}
                                    sx={fieldSx}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: 'absolute', right: 0, top: 8,
                                        color: counterColor(username.length),
                                        fontSize: 11,
                                    }}
                                >
                                    {username.length}/{MAX_LENGTH}
                                </Typography>
                            </Box>

                            {/* ── Password ── */}
                            <Box sx={{ position: 'relative' }}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => handleChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    onKeyDown={handleKeyDown}
                                    error={touched.password && !!errors.password}
                                    helperText={
                                        touched.password && errors.password
                                            ? errors.password
                                            : `Min ${MIN_PASSWORD} characters required`
                                    }
                                    inputProps={{ maxLength: MAX_LENGTH }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(v => !v)}
                                                    edge="end"
                                                    size="small"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={fieldSx}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: 'absolute', right: 0, top: 8,
                                        color: counterColor(password.length),
                                        fontSize: 11,
                                    }}
                                >
                                    {password.length}/{MAX_LENGTH}
                                </Typography>
                            </Box>

                            {/* ── Password strength bar (signup only) ── */}
                            {formState === 1 && password.length > 0 && (
                                <Box sx={{ mt: 0.5, mb: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(passwordStrength.score / 5) * 100}
                                        sx={{
                                            height: 5,
                                            borderRadius: 3,
                                            backgroundColor: '#e5e7eb',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: passwordStrength.color,
                                                borderRadius: 3,
                                            }
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{ color: passwordStrength.color, fontWeight: 600, fontSize: 11 }}
                                    >
                                        Password strength: {passwordStrength.label}
                                    </Typography>
                                </Box>
                            )}

                            {/* ── Submit button ── */}
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAuth}
                                disabled={loading}
                                sx={{
                                    mt: 2, mb: 2,
                                    py: 1.3,
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    fontSize: 15,
                                    letterSpacing: 0.5,
                                }}
                            >
                                {loading
                                    ? (formState === 0 ? 'Signing in...' : 'Creating account...')
                                    : (formState === 0 ? 'Sign In' : 'Create Account')
                                }
                            </Button>

                            {formState === 0 && (
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleOAuthLogin('google')}
                                        sx={{
                                            borderRadius: 3,
                                            minHeight: 40,
                                            px: 2.5,
                                            borderColor: '#dadce0',
                                            color: 'text.primary',
                                            textTransform: 'none',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                                borderColor: '#c4c4c4',
                                            }
                                        }}
                                        aria-label="Continue with Google"
                                        startIcon={<GoogleIcon />}
                                    >
                                        Continue with Google
                                    </Button>
                                </Box>
                            )}

                            {/* ── Switch hint ── */}
                            <Typography
                                variant="body2"
                                align="center"
                                sx={{ color: 'text.secondary', cursor: 'pointer' }}
                                onClick={() => switchForm(formState === 0 ? 1 : 0)}
                            >
                                {formState === 0
                                    ? "Don't have an account? "
                                    : 'Already have an account? '
                                }
                                <span style={{ color: '#1976d2', fontWeight: 600 }}>
                                    {formState === 0 ? 'Sign Up' : 'Sign In'}
                                </span>
                            </Typography>

                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* ── Snackbar ── */}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snackSeverity}
                    variant="filled"
                    onClose={() => setOpen(false)}
                    sx={{ width: '100%' }}
                >
                    {message}
                </Alert>
            </Snackbar>

        </ThemeProvider>
    );
}