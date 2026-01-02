import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/api/apiClient';

// Aktifkan animasi di Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen = () => {
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchFaqs = async () => {
    try {
      const response = await apiClient.get('/faq');
      const data = response.data.data.map((item: any) => {
        const hasNewLine = item.answer.includes('\n');
        const listItems = hasNewLine
          ? item.answer.split('\n').filter((line: string) => line.trim() !== '')
          : [];

        return {
          question: item.question,
          answer: item.answer,
          answerLines: listItems,
          isList: hasNewLine,
        };
      });
      setFaqItems(data);
    } catch (error) {
      console.error('Gagal mengambil data FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const toggleAccordion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')} // Path background Cattake
      style={styles.fullBackground}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.15 }}
    >
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.headerTitle}>FAQ?</Text>

            {loading ? (
              <ActivityIndicator color="#78C89F" size="large" style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.accordionContainer}>
                {faqItems.map((item: any, index: number) => (
                  <View key={index} style={styles.faqWrapper}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleAccordion(index)}
                      style={[
                        styles.questionBox,
                        expandedIndex === index && styles.questionBoxActive
                      ]}
                    >
                      <Text style={styles.questionText}>{item.question}</Text>
                      <Ionicons
                        name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#374151"
                      />
                    </TouchableOpacity>

                    {expandedIndex === index && (
                      <View style={styles.answerBox}>
                        {item.isList ? (
                          item.answerLines.map((line: string, i: number) => (
                            <View key={i} style={styles.listItem}>
                              <Text style={styles.bullet}>•</Text>
                              <Text style={styles.answerText}>{line}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.answerText}>{item.answer}</Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  fullBackground: {
    flex: 1,
    backgroundColor: '#2c473c', // Dasar warna hijau Cattake
  },
  safeContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 24,
  },
  accordionContainer: {
    gap: 12,
  },
  faqWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  questionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  questionBoxActive: {
    borderBottomWidth: 0,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    paddingRight: 10,
  },
  answerBox: {
    paddingBottom: 18,
    paddingHorizontal: 4,
  },
  answerText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 15,
    color: '#4b5563',
    marginRight: 8,
    marginLeft: 4,
  },
});
