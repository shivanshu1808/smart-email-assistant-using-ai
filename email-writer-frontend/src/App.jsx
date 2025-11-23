import { 
  Container, 
  TextField, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button, 
  CircularProgress
} from '@mui/material';
import './App.css';
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedReply, setGeneratedReply] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try{
      const response = await axios.post("http://localhost:8080/api/email/generate",{
         emailContent,
         tone
      })
      setGeneratedReply(typeof response.data === 'string' ?
        response.data : JSON.stringify(response.data)
      );
    } catch(error){

    } finally{
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: 5, 
        backgroundColor: 'white', 
        borderRadius: 2, 
        boxShadow: 3, 
        minHeight: '100vh'
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Email Reply Generator
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          label="Original Email Content"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
            value={tone}
            label="Tone (Optional)"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          sx={{ mb: 2 }}
          onClick={handleSubmit}
          disabled={!emailContent || loading}
        >
          {loading ? <CircularProgress size={24} /> : "Generate Reply"}
        </Button>

        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          value={generatedReply || ''}
          InputProps={{ readOnly: true }}
          sx={{ mb: 2 }}
        />

        <Button 
          variant="outlined"
          onClick={() => navigator.clipboard.writeText(generatedReply)}
          disabled={!generatedReply}
        >
          Copy To Clipboard
        </Button>
      </Box>
    </Container>
  );
}

export default App;
