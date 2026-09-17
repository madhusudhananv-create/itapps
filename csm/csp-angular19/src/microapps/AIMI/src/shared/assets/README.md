# Questionnaire JSON Structure

This directory contains the converted JSON file from the original CSV questionnaire data.

## File Structure

- `Questionnaire.csv` - Original CSV file with questionnaire data
- `Questionnaire.json` - Converted JSON file with structured data
- `README.md` - This documentation file

## JSON Structure

The JSON file follows this nested structure:

```json
{
  "practices": [
    {
      "practice": "Practice Name",
      "sdlcPhases": [
        {
          "phase": "SDLC Phase Name",
          "activities": [
            {
              "activity": "Activity Description"
            }
          ]
        }
      ]
    }
  ]
}
```

## Data Statistics

- **Total Practices**: 7
- **Total Phases**: 56
- **Total Activities**: 285

### Practice Breakdown

1. **Digital Product Engineering** (9 phases, 41 activities)
2. **Network Monitoring** (10 phases, 21 activities)
3. **Infrastructure Support** (10 phases, 132 activities)
4. **Security** (9 phases, 26 activities)
5. **End-user Computing & Service De** (10 phases, 37 activities)
6. **Data & Analytics** (2 phases, 6 activities)
7. **& Visualization / Reporting** (6 phases, 22 activities)

## Conversion Process

The JSON was generated using a custom Node.js converter (`src/utils/questionnaireConverter.js`) that:

1. Parses the CSV file with proper quote handling
2. Identifies practices, SDLC phases, and activities
3. Creates a nested JSON structure
4. Cleans and validates the data
5. Removes invalid entries (empty rows, special characters, etc.)

## Usage

To regenerate the JSON file, run:

```bash
node src/utils/questionnaireConverter.js
```

This will read the CSV file and generate a new JSON file with the latest data.
