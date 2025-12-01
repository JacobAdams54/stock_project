/**
 * UserModelManager Component
 *
 * Admin interface for managing AI model access for users.
 * Allows admins to grant or revoke access to AI prediction models (ARIMAX, Deep Learning).
 *
 * @module components/admin/UserModelManager
 */
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

interface User {
  uid: string;
  displayName: string;
  email: string;
  availableModels: Array<'arimax' | 'dl'>;
}

const AI_MODELS = [
  { id: 'arimax' as const, name: 'ARIMAX', description: 'Free model' },
  { id: 'dl' as const, name: 'Deep Learning', description: 'Premium model' },
] as const;

/**
 * UserModelManager - Admin component for managing user AI model access
 */
export default function UserModelManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load all users
  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const usersCol = collection(db, 'users');
        const usersSnap = await getDocs(usersCol);

        const loadedUsers: User[] = [];
        usersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          loadedUsers.push({
            uid: docSnap.id,
            displayName:
              data.displayName ||
              data.email ||
              `User ${docSnap.id.slice(0, 8)}`,
            email: data.email || 'Email not available',
            availableModels: data.preferences?.availableModels || ['arimax'],
          });
        });

        setUsers(loadedUsers);
      } catch {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  // Update selected user when selection changes
  useEffect(() => {
    if (selectedUserId) {
      const user = users.find((u) => u.uid === selectedUserId);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId, users]);

  // Toggle model access
  const handleModelToggle = (modelId: 'arimax' | 'dl') => {
    if (!selectedUser) return;

    const currentModels = selectedUser.availableModels;
    let newModels: Array<'arimax' | 'dl'>;

    if (currentModels.includes(modelId)) {
      // Remove model (but always keep at least arimax)
      if (modelId === 'arimax' && currentModels.length === 1) {
        setError('Users must have at least one model (ARIMAX is required)');
        return;
      }
      newModels = currentModels.filter((m) => m !== modelId);
    } else {
      // Add model
      newModels = [...currentModels, modelId];
    }

    // Update local state
    setSelectedUser({
      ...selectedUser,
      availableModels: newModels,
    });

    // Update users array
    setUsers(
      users.map((u) =>
        u.uid === selectedUser.uid ? { ...u, availableModels: newModels } : u
      )
    );
  };

  // Save changes to Firestore
  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const userRef = doc(db, 'users', selectedUser.uid);
      await setDoc(
        userRef,
        {
          preferences: {
            availableModels: selectedUser.availableModels,
          },
        },
        { merge: true }
      );

      setSuccess(
        `Successfully updated AI model access for ${selectedUser.displayName}`
      );
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manage User AI Model Access
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Grant or revoke access to premium AI prediction models for users
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* User Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="user-select-label">Select User</InputLabel>
        <Select
          labelId="user-select-label"
          value={selectedUserId}
          label="Select User"
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {users.map((user) => (
            <MenuItem key={user.uid} value={user.uid}>
              {user.displayName} - {user.uid.slice(0, 8)}...
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Model Access Controls */}
      {selectedUser && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            AI Model Access for {selectedUser.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current models:{' '}
            {selectedUser.availableModels
              .map((m) => m.toUpperCase())
              .join(', ')}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            {AI_MODELS.map((model) => (
              <FormControlLabel
                key={model.id}
                control={
                  <Checkbox
                    checked={selectedUser.availableModels.includes(model.id)}
                    onChange={() => handleModelToggle(model.id)}
                    disabled={
                      model.id === 'arimax' &&
                      selectedUser.availableModels.length === 1
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      {model.name}
                      {model.id === 'arimax' && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          (Required)
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {model.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ mt: 2 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
