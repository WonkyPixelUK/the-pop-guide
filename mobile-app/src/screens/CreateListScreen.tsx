import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { Share, Linking } from 'react-native';
import { supabase } from '../services/supabase';

export const CreateListScreen = ({ navigation }: any) => {
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const validateSlug = (slug: string) => /^[a-z0-9-]+$/.test(slug);

  const checkSlugAvailability = async (slug: string) => {
    if (!validateSlug(slug)) {
      setSlugError('Only a-z, 0-9, and hyphens allowed');
      return false;
    }
    const { data } = await supabase
      .from('custom_lists')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (data) {
      setSlugError('Slug is already taken');
      return false;
    }
    setSlugError('');
    return true;
  };

  const handleCreateList = async () => {
    if (!listName.trim()) return;
    if (customSlug && !(await checkSlugAvailability(customSlug))) return;
    setCreating(true);
    const { data, error } = await supabase
      .from('custom_lists')
      .insert({
        name: listName,
        description,
        is_public: isPublic,
        slug: customSlug || null,
        // user_id: ... (add user id if you have auth)
      })
      .select()
      .single();
    setCreating(false);
    if (!error && data) {
      const url = data.slug
        ? `https://popguide.co.uk/lists/${data.slug}`
        : `https://popguide.co.uk/lists/${data.id}`;
      setShareUrl(url);
      setListName('');
      setDescription('');
      setIsPublic(false);
      setCustomSlug('');
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareUrl);
    setSnackbarVisible(true);
  };

  const handleShare = async () => {
    await Share.share({
      message: `Check out my Funko list: ${shareUrl}`,
      url: shareUrl,
      title: 'My Funko List',
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?text=Check out my Funko list: ${shareUrl}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:?subject=My Funko List&body=Check out my Funko list: ${shareUrl}`);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="List Name"
        value={listName}
        onChangeText={setListName}
        style={styles.input}
      />
      <TextInput
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        label="Custom URL (optional)"
        value={customSlug}
        onChangeText={text => setCustomSlug(text.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
        onBlur={() => customSlug && checkSlugAvailability(customSlug)}
        placeholder="e.g. richs-funkos-for-sale-v1"
        error={!!slugError}
        style={styles.input}
      />
      {slugError ? <Text style={{ color: 'red' }}>{slugError}</Text> : null}
      <Button
        mode="contained"
        onPress={handleCreateList}
        disabled={!listName.trim() || !!slugError || creating}
        style={styles.button}
        loading={creating}
      >
        Create List
      </Button>
      {shareUrl ? (
        <View style={styles.shareContainer}>
          <Text selectable style={styles.shareUrl}>{shareUrl}</Text>
          <Button icon="content-copy" onPress={handleCopy} style={styles.shareButton}>Copy</Button>
          <Button icon="share-variant" onPress={handleShare} style={styles.shareButton}>Share</Button>
          <Button icon="whatsapp" onPress={handleWhatsApp} style={styles.shareButton}>WhatsApp</Button>
          <Button icon="email" onPress={handleEmail} style={styles.shareButton}>Email</Button>
        </View>
      ) : null}
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>
        Link copied!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#18181b',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#27272a',
  },
  button: {
    marginBottom: 24,
    backgroundColor: '#f97316',
  },
  shareContainer: {
    marginTop: 24,
    alignItems: 'flex-start',
  },
  shareUrl: {
    color: '#f97316',
    marginBottom: 8,
  },
  shareButton: {
    marginBottom: 8,
  },
});

export default CreateListScreen; 