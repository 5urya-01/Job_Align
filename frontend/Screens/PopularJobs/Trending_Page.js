import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import jobsData from './Jobs_Data';
import { LinearGradient } from 'expo-linear-gradient';

export default function Trending_Page({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeSearch = query => setSearchQuery(query);

  const filteredJobs = jobsData.filter(job => {
    const query = searchQuery.toLowerCase();
    const inTitle = job.title.toLowerCase().includes(query);
    const inKeywords = job.keywordsToSearch.some(keyword =>
      keyword.toLowerCase().includes(query)
    );
    return inTitle || inKeywords;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.imageCard,
        // filteredJobs.length === 1 && styles.singleCard,
      ]}

      activeOpacity={0.85}
      onPress={() => navigation.navigate('TrendingJobsDetails', { job: item })}
    >
      <Image
        source={item.image}
        style={styles.blurImage}
        blurRadius={4}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        {item.title.split(' ').map((word, index) => (
          <Text key={index} style={styles.overlayText}>
            {word}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safe}>
      <View style={{ flex: 1, backgroundColor: '#CAF0F8' }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <LinearGradient
          colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 0.8 }}
          locations={[0, 0.4, 1]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1,marginTop:20 }}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Find your Dream Job with us...</Text>
                <Searchbar
                  placeholder="Search jobs..."
                  onChangeText={onChangeSearch}
                  value={searchQuery}
                  style={styles.searchbar}
                />
                <Text style={styles.subtitle}>Top Trending Technologies</Text>
              </View>
              <FlatList
                data={filteredJobs}
                keyExtractor={item => item.id.toString()}
                key={filteredJobs.length === 1 ? 'single' : 'multi'}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                numColumns={filteredJobs.length === 1 ? 1 : 2}
                // numColumns={2}
                ListEmptyComponent={
                  <Text style={styles.noJobsText}>No jobs found.</Text>
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
    color: '#222',
    marginTop: 17
  },
  searchbar: {
    height: 50,
    borderRadius: 30,
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#0077B6',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 13,
    fontFamily: 'Poppins_700Bold',
    color: '#444',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  imageCard: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    maxHeight: 150,
  },
  singleCard: {
    maxHeight: 160,
  },
  blurImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  noJobsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
});
