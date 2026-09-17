import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse CSV content and convert to structured JSON
 * @param {string} csvContent - Raw CSV content
 * @returns {Object} Structured JSON data
 */
function parseCSVToJSON(csvContent) {
  const lines = csvContent.split('\n').filter((line) => line.trim() !== '');
  const practices = [];

  let currentPractice = null;
  let currentPhase = null;

  for (let i = 1; i < lines.length; i++) {
    // Skip header row
    const line = lines[i];

    // Handle CSV parsing with proper quote handling
    const columns = parseCSVLine(line);

    const practice = columns[0]?.trim();
    const phase = columns[1]?.trim();
    const activity = columns[2]?.trim();

    // Skip completely empty rows or rows with only commas/special characters
    if (!practice && !phase && !activity) {
      continue;
    }

    // Skip rows that are just commas or special characters
    if (practice && (practice.match(/^,+$/) || practice.match(/^#REF!+$/))) {
      continue;
    }

    // New practice - only if we have a valid practice name
    if (
      practice &&
      practice !== 'Practice' &&
      practice !== '' &&
      practice.length > 2
    ) {
      // Save previous practice if exists
      if (currentPractice && currentPhase) {
        currentPractice.sdlcPhases.push(currentPhase);
        currentPhase = null;
      }
      if (currentPractice) {
        practices.push(currentPractice);
      }

      currentPractice = {
        practice: practice,
        sdlcPhases: [],
      };
      currentPhase = null;
    }

    // New phase - only if we have a valid phase name
    if (
      phase &&
      phase !== 'SDLC Phases' &&
      phase !== '' &&
      phase.length > 2 &&
      currentPractice
    ) {
      // Save previous phase if exists
      if (currentPhase) {
        currentPractice.sdlcPhases.push(currentPhase);
      }

      currentPhase = {
        phase: phase,
        activities: [],
      };
    }

    // New activity - only if we have a valid activity
    if (
      activity &&
      activity !== 'SDLC Activities' &&
      activity !== '' &&
      activity.length > 2 &&
      currentPhase
    ) {
      currentPhase.activities.push({
        activity: activity,
      });
    }
  }

  // Add the last phase and practice
  if (currentPractice && currentPhase) {
    currentPractice.sdlcPhases.push(currentPhase);
  }
  if (currentPractice) {
    practices.push(currentPractice);
  }

  return { practices };
}

/**
 * Parse CSV line with proper quote handling
 * @param {string} line - CSV line
 * @returns {Array} Array of column values
 */
function parseCSVLine(line) {
  const columns = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      columns.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last column
  columns.push(current.trim());

  return columns;
}

/**
 * Clean and validate the parsed data
 * @param {Object} data - Parsed questionnaire data
 * @returns {Object} Cleaned data
 */
function cleanData(data) {
  const cleanedPractices = [];

  data.practices.forEach((practice) => {
    // Skip practices with empty names, very short names, or invalid characters
    if (
      !practice.practice ||
      practice.practice.length < 3 ||
      practice.practice.match(/^,+$/) ||
      practice.practice.match(/^#REF!+$/)
    ) {
      return;
    }

    const cleanedPhases = [];
    practice.sdlcPhases.forEach((phase) => {
      // Skip phases with empty names or invalid characters
      if (
        !phase.phase ||
        phase.phase.length < 3 ||
        phase.phase.match(/^,+$/) ||
        phase.phase.match(/^#REF!+$/)
      ) {
        return;
      }

      const cleanedActivities = [];
      phase.activities.forEach((activity) => {
        // Skip activities with empty names or invalid characters
        if (
          !activity.activity ||
          activity.activity.length < 3 ||
          activity.activity.match(/^,+$/) ||
          activity.activity.match(/^#REF!+$/)
        ) {
          return;
        }

        cleanedActivities.push(activity);
      });

      if (cleanedActivities.length > 0) {
        cleanedPhases.push({
          phase: phase.phase,
          activities: cleanedActivities,
        });
      }
    });

    if (cleanedPhases.length > 0) {
      cleanedPractices.push({
        practice: practice.practice,
        sdlcPhases: cleanedPhases,
      });
    }
  });

  return { practices: cleanedPractices };
}

/**
 * Generate JSON from CSV file
 * @param {string} csvPath - Path to CSV file
 * @param {string} jsonPath - Path to output JSON file
 */
export function generateQuestionnaireJSON(csvPath, jsonPath) {
  try {
    // Read the CSV file
    const csvContent = readFileSync(csvPath, 'utf-8');

    // Generate JSON
    const rawData = parseCSVToJSON(csvContent);
    const cleanedData = cleanData(rawData);
    const jsonContent = JSON.stringify(cleanedData, null, 2);

    // Write to JSON file
    writeFileSync(jsonPath, jsonContent, 'utf-8');

    console.log('JSON file generated successfully at:', jsonPath);
    console.log('Total practices processed:', cleanedData.practices.length);

    return cleanedData;
  } catch (error) {
    console.error('Error generating JSON:', error.message);
    throw error;
  }
}

/**
 * Get statistics about the generated data
 * @param {Object} data - Parsed questionnaire data
 */
export function getStatistics(data) {
  const stats = {
    totalPractices: data.practices.length,
    totalPhases: 0,
    totalActivities: 0,
    practices: [],
  };

  data.practices.forEach((practice, index) => {
    const practiceStats = {
      name: practice.practice,
      phases: practice.sdlcPhases.length,
      activities: 0,
    };

    practice.sdlcPhases.forEach((phase) => {
      practiceStats.activities += phase.activities.length;
      stats.totalActivities += phase.activities.length;
    });

    stats.totalPhases += practice.sdlcPhases.length;
    stats.practices.push(practiceStats);
  });

  return stats;
}

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const csvPath = join(__dirname, '../assets/questionnaire.csv');
  const jsonPath = join(__dirname, '../assets/questionnaire.json');

  const data = generateQuestionnaireJSON(csvPath, jsonPath);
  const stats = getStatistics(data);

  console.log('\n=== Statistics ===');
  console.log(`Total Practices: ${stats.totalPractices}`);
  console.log(`Total Phases: ${stats.totalPhases}`);
  console.log(`Total Activities: ${stats.totalActivities}`);

  console.log('\n=== Practice Details ===');
  stats.practices.forEach((practice, index) => {
    console.log(
      `${index + 1}. ${practice.name} (${practice.phases} phases, ${practice.activities} activities)`
    );
  });
}
