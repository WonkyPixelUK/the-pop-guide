import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Card, Text, Button, Avatar, Divider } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={80} 
              label={user?.email ? getInitials(user.email) : 'U'} 
              style={styles.avatar}
              theme={{ colors: { primary: '#e46c1b' } }}
            />
            <Text style={styles.emailText}>{user?.email}</Text>
            <Text style={styles.memberSince}>
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.optionsCard}>
        <Card.Content>
          <View style={styles.option}>
            <Text style={styles.optionText}>Email Verified</Text>
            <Text style={styles.optionValue}>
              {user?.email_confirmed_at ? '✅ Yes' : '❌ No'}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.option}>
            <Text style={styles.optionText}>Account ID</Text>
            <Text style={styles.optionValue}>{user?.id?.substring(0, 8)}...</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Feature Coming Soon', 'Edit profile functionality will be available soon!')}
            style={styles.actionButton}
            buttonColor="#e46c1b"
          >
            Edit Profile
          </Button>

          <Button
            mode="contained"
            onPress={() => Alert.alert('Feature Coming Soon', 'Export data functionality will be available soon!')}
            style={styles.actionButton}
            buttonColor="#666"
          >
            Export Data
          </Button>

          <Button
            mode="contained"
            onPress={handleSignOut}
            style={[styles.actionButton, styles.signOutButton]}
            buttonColor="#dc2626"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
    borderRadius: 12,
  },
  cardContent: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#e46c1b',
    marginBottom: 16,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#999',
  },
  optionsCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
    borderRadius: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  optionValue: {
    fontSize: 16,
    color: '#999',
  },
  divider: {
    backgroundColor: '#444',
  },
  actionsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
  },
  actionButton: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  signOutButton: {
    marginBottom: 0,
  },
}); 