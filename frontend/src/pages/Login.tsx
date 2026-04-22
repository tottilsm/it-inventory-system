import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.REACT_APP_API_URL || '/api';
      const res = await fetch(baseUrl + '/api-auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const text = await res.text();
        if (text.includes('csrf') || text.includes('CSRF')) {
          setError('CSRF token required. Try /admin/ first, or use token auth.');
        } else {
          setError('Invalid credentials. Try admin / admin123');
        }
      }
    } catch (err) {
      setError('Cannot connect to server. Check that the backend is running.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <InventoryIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              Inventory System
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Sign in to manage your inventory
            </Typography>
          </Box>

          {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;