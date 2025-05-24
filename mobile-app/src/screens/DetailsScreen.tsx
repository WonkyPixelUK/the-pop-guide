import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

type Funko = {
  id: string;
  name: string;
  series: string;
  image_url: string;
  barcode: string;
  description?: string;
  release_date?: string;
  price?: number;
};

export const DetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { funko } = route.params as { funko: Funko };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: funko.image_url }} />
        <Card.Content>
          <Title>{funko.name}</Title>
          <Paragraph>Series: {funko.series}</Paragraph>
          {funko.description && (
            <Paragraph style={styles.description}>{funko.description}</Paragraph>
          )}
          {funko.release_date && (
            <Paragraph>Release Date: {funko.release_date}</Paragraph>
          )}
          {funko.price && (
            <Paragraph>Price: ${funko.price.toFixed(2)}</Paragraph>
          )}
          <Paragraph>Barcode: {funko.barcode}</Paragraph>
        </Card.Content>
      </Card>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Scanner')}
          style={styles.button}
        >
          Scan Another
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Collection')}
          style={styles.button}
        >
          Back to Collection
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 8,
  },
}); 