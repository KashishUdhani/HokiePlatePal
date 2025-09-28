import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const API_BASE = 'http://localhost:5002/api';

interface Restrictions {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
}

interface Preferences {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  foodPreferences: string;
  restrictions: Restrictions;
}

interface MealItem {
  item: string;
  dining_hall: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPlan {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
}

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPlanData {
  meal_plan: MealPlan;
  totals: Totals;
  notes: string;
}

const PlatePal = () => {
  const [preferences, setPreferences] = useState<Preferences>({
    calories: '2000',
    protein: '25',
    carbs: '45',
    fat: '30',
    foodPreferences: '',
    restrictions: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
  });

  const [mealPlan, setMealPlan] = useState<MealPlanData | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<string>('checking');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('error');
    }
  };

  const handleRestrictionChange = (restriction: keyof Restrictions) => {
    setPreferences(prev => ({
      ...prev,
      restrictions: {
        ...prev.restrictions,
        [restriction]: !prev.restrictions[restriction],
      },
    }));
  };

  const validateMacros = (): boolean => {
    const total =
      parseInt(preferences.protein) +
      parseInt(preferences.carbs) +
      parseInt(preferences.fat);
    return Math.abs(total - 100) <= 5;
  };

  const generateMealPlan = async () => {
    if (!validateMacros()) {
      Alert.alert(
        'Error',
        'Macro percentages must add up to approximately 100%',
      );
      return;
    }

    if (apiStatus !== 'connected') {
      Alert.alert(
        'Connection Error',
        'Cannot connect to nutrition server. Please check if the server is running.',
      );
      return;
    }

    setLoading(true);

    try {
      const restrictionsList = Object.entries(preferences.restrictions)
        .filter(([key, value]) => value)
        .map(([key, value]) => key.replace(/([A-Z])/g, '-$1').toLowerCase());

      const requestData = {
        calories: parseInt(preferences.calories),
        macro_focus: {
          protein: parseInt(preferences.protein),
          carbs: parseInt(preferences.carbs),
          fat: parseInt(preferences.fat),
        },
        dietary_restrictions: restrictionsList,
        food_preferences: preferences.foodPreferences,
      };

      const response = await fetch(`${API_BASE}/chatbot/meal-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate meal plan');
      }

      const result = await response.json();
      setMealPlan(result.data);

      if (preferences.foodPreferences) {
        getQuickSuggestions(preferences.foodPreferences);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getQuickSuggestions = async (message: string) => {
    try {
      const response = await fetch(`${API_BASE}/chatbot/quick-suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuggestions(result.data.suggestions);
      }
    } catch (error) {
      console.log('Could not get suggestions:', error);
    }
  };

  const renderMealSection = (mealType: string, items: MealItem[]) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.mealSection} key={mealType}>
        <Text style={styles.mealTitle}>
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </Text>
        {items.map((item, index) => (
          <View key={index} style={styles.mealItem}>
            <Text style={styles.itemName}>{item.item}</Text>
            <Text style={styles.itemLocation}>{item.dining_hall}</Text>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionBadge}>
                <Text style={styles.nutritionText}>{item.calories} cal</Text>
              </View>
              <View style={styles.nutritionBadge}>
                <Text style={styles.nutritionText}>{item.protein}g protein</Text>
              </View>
              <View style={styles.nutritionBadge}>
                <Text style={styles.nutritionText}>{item.carbs}g carbs</Text>
              </View>
              <View style={styles.nutritionBadge}>
                <Text style={styles.nutritionText}>{item.fat}g fat</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#8B0000" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
       >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PlatePal</Text>
          <Text style={styles.headerSubtitle}>
            Virginia Tech Nutrition Assistant
          </Text>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    apiStatus === 'connected' ? '#4CAF50' : '#F44336',
                },
              ]}
            />
            <Text style={styles.statusText}>
              {apiStatus === 'connected'
                ? 'Connected'
                : apiStatus === 'checking'
                ? 'Checking...'
                : 'Disconnected'}
            </Text>
          </View>
        </View>

        {/* Preferences Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Your Preferences</Text>

          {/* Calories */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Calories</Text>
            <TextInput
              style={styles.input}
              value={preferences.calories}
              onChangeText={text =>
                setPreferences(prev => ({ ...prev, calories: text }))
              }
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Macros */}
          <Text style={styles.label}>Macro Targets (%)</Text>
          <View style={styles.macroRow}>
            <View style={styles.macroInput}>
              <Text style={styles.macroLabel}>Protein</Text>
              <TextInput
                style={styles.smallInput}
                value={preferences.protein}
                onChangeText={text =>
                  setPreferences(prev => ({ ...prev, protein: text }))
                }
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <TextInput
                style={styles.smallInput}
                value={preferences.carbs}
                onChangeText={text =>
                  setPreferences(prev => ({ ...prev, carbs: text }))
                }
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={styles.macroLabel}>Fat</Text>
              <TextInput
                style={styles.smallInput}
                value={preferences.fat}
                onChangeText={text =>
                  setPreferences(prev => ({ ...prev, fat: text }))
                }
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Dietary Restrictions */}
          <Text style={styles.label}>Dietary Restrictions</Text>
          <View style={styles.restrictionsContainer}>
            {Object.entries(preferences.restrictions).map(([key, value]) => (
              <View key={key} style={styles.restrictionItem}>
                <Text style={styles.restrictionLabel}>
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
                <Switch
                  value={value}
                  onValueChange={() =>
                    handleRestrictionChange(key as keyof Restrictions)
                  }
                  trackColor={{ false: '#D1D5DB', true: '#CD5C5C' }}
                  thumbColor={value ? '#8B0000' : '#F3F4F6'}
                />
              </View>
            ))}
          </View>

          {/* Food Preferences */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Preferences</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={preferences.foodPreferences}
              onChangeText={text =>
                setPreferences(prev => ({ ...prev, foodPreferences: text }))
              }
              placeholder="e.g., I love spicy food, prefer lean proteins..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.disabledButton]}
            onPress={generateMealPlan}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Meal Plan Results */}
        {mealPlan && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Your Meal Plan</Text>

            {renderMealSection('breakfast', mealPlan.meal_plan.breakfast)}
            {renderMealSection('lunch', mealPlan.meal_plan.lunch)}
            {renderMealSection('dinner', mealPlan.meal_plan.dinner)}
            {renderMealSection('snacks', mealPlan.meal_plan.snacks)}

            {/* Daily Totals */}
            <View style={styles.totalsContainer}>
              <Text style={styles.totalsTitle}>Daily Totals</Text>
              <View style={styles.totalsGrid}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalNumber}>
                    {mealPlan.totals.calories}
                  </Text>
                  <Text style={styles.totalLabel}>Calories</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalNumber}>
                    {mealPlan.totals.protein}g
                  </Text>
                  <Text style={styles.totalLabel}>Protein</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalNumber}>
                    {mealPlan.totals.carbs}g
                  </Text>
                  <Text style={styles.totalLabel}>Carbs</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalNumber}>{mealPlan.totals.fat}g</Text>
                  <Text style={styles.totalLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {/* Notes */}
            {mealPlan.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{mealPlan.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Quick Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Quick Suggestions</Text>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#8B0000', // VT Maroon
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CD5C5C', // Pale Orange/Red
    marginBottom: 15,
    textAlign: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B0000', // VT Maroon
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 5,
    textAlign: 'center',
  },
  smallInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'white',
    color: '#374151',
  },
  restrictionsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 5,
    marginBottom: 20,
  },
  restrictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  restrictionLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: '#8B0000', // VT Maroon
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  mealSection: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000', // VT Maroon
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000', // VT Maroon
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  mealItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutritionBadge: {
    backgroundColor: '#CD5C5C', // Pale Orange/Red
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  nutritionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  totalsContainer: {
    backgroundColor: '#8B0000', // VT Maroon
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  totalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  totalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  totalLabel: {
    fontSize: 12,
    color: '#CD5C5C', // Pale Orange/Red
    marginTop: 4,
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#FEF3CD',
    borderWidth: 1,
    borderColor: '#CD5C5C',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  notesText: {
    color: '#92400E',
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionsContainer: {
    padding: 20,
  },
  suggestionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#CD5C5C', // Pale Orange/Red
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 18,
  },
});

export default PlatePal;