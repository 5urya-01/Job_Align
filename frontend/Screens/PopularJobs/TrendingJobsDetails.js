import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const getInitials = (title) => {
  return title
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export default function JobDetail({ route }) {
  const { job } = route.params;
  const [openSkillIndex, setOpenSkillIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const navigation = useNavigation(); // Initialize useNavigation

  const toggleSkill = (index) => {
    setOpenSkillIndex(openSkillIndex === index ? null : index);
  };

  const handleSeeSimilarJobs = () => {
    // CORRECTED LINE: Navigate to the 'BottomTab' navigator,
    // then specify the 'Jobs' screen inside it, and pass params to that screen.
    navigation.navigate('BottomTab', {
      screen: 'Jobs', // This is the screen name within the BottomTab navigator
      params: {
        preselectedRole: job.title, // Pass the job title as a preselected role to the 'Jobs' screen
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#CAF0F8" />
      <LinearGradient
        colors={['#CAF0F8', 'white']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* <View style={styles.backgroundImageContainer}>
            <Image source={job.image} style={styles.backgroundImage} />
          </View> */}

          <View style={styles.circleContainer}>
            <Image source={job.image} style={styles.circleImage} />
            <View style={styles.circleOverlay}>
              <Text style={styles.circleInitials}>{getInitials(job.title)}</Text>
            </View>
          </View>

          <Text style={styles.jobTitle}>{job.title}</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                About Job
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'skills' && styles.activeTab]}
              onPress={() => setActiveTab('skills')}
            >
              <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>
                Skills Required
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'about' && (
            <View>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>About Job</Text>
                <Text style={styles.description}>{job.about}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Job Description</Text>
                {job.description.map((point, index) => (
                  <View key={index} style={styles.bulletPointContainer}>
                    <Text style={styles.bullet}>⬤</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'skills' && (
            <View>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Skills Required</Text>

                <View style={styles.skillButtonsContainer}>
                  
                  {[...job.skills]
                    .sort((a, b) => a.skill.length - b.skill.length) 
                    .map((skillItem, index) => (
                <TouchableOpacity key={index} style={styles.skillButton}>
               <Text style={styles.skillButtonText}>{skillItem.skill}</Text>
             </TouchableOpacity>
            ))}

                </View>
              </View>

              <Text style={styles.sectionTitle}>Topics Covered</Text>
              {job.skills.map((skillItem, index) => (
                <View key={index} style={styles.accordionContainer}>
                  <TouchableOpacity
                    onPress={() => toggleSkill(index)}
                    style={styles.accordionHeader}
                  >
                    <Text style={styles.accordionTitle}>{skillItem.skill}</Text>
                    <AntDesign
                      name={openSkillIndex === index ? 'minuscircleo' : 'pluscircleo'}
                      size={20}
                      color="#0077B6"
                    />
                  </TouchableOpacity>
                  {openSkillIndex === index && (
                    <View style={styles.subSkillContainer}>
                      {skillItem.subskills.map((subskill, subIndex) => (
                        <View key={subIndex} style={styles.bulletPointContainer}>
                          <Text style={styles.bullet}>⬤</Text>
                          <Text style={styles.subSkill}>{subskill}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSeeSimilarJobs}>
            <Text style={styles.buttonText}>See Similar Jobs here</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#CAF0F8',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  backgroundImageContainer: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight * 0.2,
    top: 0,
    zIndex: -1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  circleContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 40,
    position: 'relative',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  circleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInitials: {
    fontSize: 37,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    letterSpacing: 2,
  },
  jobTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#0077B6',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFF',
    borderRadius: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#ADE8F4',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0077B6',
  },
  activeTabText: {
    color: '#03045E',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#0077B6',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: 'Poppins_400Regular',
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
  },
  bullet: {
    fontSize: 12,
    marginRight: 8,
    color: '#0077B6',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
  },
  skillButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillButton: {
    backgroundColor: '#e6f7fb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillButtonText: {
    fontSize: 13,
    color: '#0077B6',
    fontFamily: 'Poppins_500Medium',
  },
  accordionContainer: {
    backgroundColor: '#ADE8F4',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: 'black',
  },
  subSkillContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  subSkill: {
    flex: 1,
    fontSize: 14,
    color: '#03045E',
    fontFamily: 'Poppins_400Regular',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});
