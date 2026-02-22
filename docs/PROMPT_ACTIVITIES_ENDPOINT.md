# Prompt: Create Activities API Endpoint

Copy everything below the line into your server chat to implement the endpoint.

---

Create an API endpoint for the EduSense app’s **Concept Playground** that returns a collection of learning activities.

## Endpoint

- **Method:** `GET`
- **Path:** `/api/activities`
- **Query parameters (all optional):**
  - `topic` (string) – filter by topic (e.g. `"Energy Sources"`)
  - `cognitive_load` (string) – filter by cognitive load: `LOW`, `MEDIUM`, or `HIGH`
  - `activity_type` (string) – filter by type: `TRUE_FALSE`, `MCQ`, `MATCHING`, or `FILL_BLANK_WORD_BANK`

## Response

Return a JSON array of activity objects. Each activity has a common base plus type-specific `items` and optional `word_bank` for fill-in-the-blank.

**Common fields (every activity):**
- `topic` (string)
- `cognitive_load` (string): `"LOW"` | `"MEDIUM"` | `"HIGH"`
- `activity_type` (string): `"TRUE_FALSE"` | `"MCQ"` | `"MATCHING"` | `"FILL_BLANK_WORD_BANK"`
- `difficulty_level` (string): `"basic"` | `"intermediate"` | `"advanced"`
- `title` (string)
- `instructions` (string)
- `estimated_time` (number, minutes)
- `points` (number)
- `feedback` (object, optional): can include `all_correct`, `partial`, `low_score`, `correct_match`, `incorrect_match` (strings)

**Type-specific:**

1. **TRUE_FALSE** – `items` array of:
   - `id` (number), `statement` (string), `correct_answer` (boolean), `explanation` (string)

2. **MCQ** – `items` array of:
   - `id` (number), `question` (string), `options` (string[]), `correct_answer` (string), optional `hint`, optional `explanation`

3. **MATCHING** – `items` array of:
   - `id` (number), `left_item` (string), `right_item` (string), `pair_id` (string, e.g. `"A"`, `"B"`)

4. **FILL_BLANK_WORD_BANK** – `word_bank` (string[]) plus `items` array of:
   - `id` (number), `sentence` (string, use `______` for blank), `correct_answer` (string), optional `hint`

## Example response (one TRUE_FALSE activity)

```json
[
  {
    "topic": "Energy Sources",
    "cognitive_load": "HIGH",
    "activity_type": "TRUE_FALSE",
    "difficulty_level": "basic",
    "title": "Basic Facts About Energy Sources",
    "instructions": "Read each statement carefully and choose True or False",
    "estimated_time": 5,
    "points": 20,
    "items": [
      {
        "id": 1,
        "statement": "The Sun is the main source of energy for Earth.",
        "correct_answer": true,
        "explanation": "Yes! The Sun provides light and heat energy that supports almost all life on Earth."
      },
      {
        "id": 2,
        "statement": "Coal and petroleum are renewable energy sources.",
        "correct_answer": false,
        "explanation": "Coal and petroleum are non-renewable fossil fuels that take millions of years to form."
      }
    ],
    "feedback": {
      "all_correct": "Excellent! You understand energy sources basics!",
      "partial": "Good try! Review the incorrect answers.",
      "low_score": "Let's learn about energy sources together."
    }
  }
]
```

## Requirements

- If no query params are sent, return all activities (or a default set).
- Filter by `topic`, `cognitive_load`, and/or `activity_type` when provided.
- Response must be valid JSON; Content-Type: `application/json`.
- Activities can be stored in a database or JSON file; the client only needs this GET endpoint.

Implement the endpoint and, if applicable, add the activities from the example above (and the other types: MCQ, MATCHING, FILL_BLANK_WORD_BANK) so the client receives a full collection for the Concept Playground.
