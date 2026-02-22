/**
 * Activity database for Concept Playground.
 * In production, replace with API fetch (e.g. GET /api/activities?topic=...).
 */

import type { Activity } from "@/types/activities";

export const ACTIVITIES: Activity[] = [
  {
    topic: "Energy Sources",
    cognitive_load: "HIGH",
    activity_type: "TRUE_FALSE",
    difficulty_level: "basic",
    title: "Basic Facts About Energy Sources",
    instructions: "Read each statement carefully and choose True or False",
    estimated_time: 5,
    points: 20,
    items: [
      {
        id: 1,
        statement: "The Sun is the main source of energy for Earth.",
        correct_answer: true,
        explanation:
          "Yes! The Sun provides light and heat energy that supports almost all life on Earth.",
      },
      {
        id: 2,
        statement: "Coal and petroleum are renewable energy sources.",
        correct_answer: false,
        explanation:
          "Coal and petroleum are non-renewable fossil fuels that take millions of years to form.",
      },
      {
        id: 3,
        statement: "Wind energy can be used to generate electricity.",
        correct_answer: true,
        explanation: "Wind turbines convert wind energy into electrical energy.",
      },
      {
        id: 4,
        statement: "All energy sources are unlimited and will never run out.",
        correct_answer: false,
        explanation:
          "Fossil fuels like coal and oil are limited and can run out. Only renewable sources are unlimited.",
      },
      {
        id: 5,
        statement: "Solar energy comes from the Sun.",
        correct_answer: true,
        explanation:
          "Solar energy is light and heat energy that comes directly from the Sun.",
      },
    ],
    feedback: {
      all_correct: "Excellent! You understand energy sources basics!",
      partial: "Good try! Review the incorrect answers.",
      low_score: "Let's learn about energy sources together.",
    },
  },
  {
    topic: "Energy Sources",
    cognitive_load: "HIGH",
    activity_type: "MCQ",
    difficulty_level: "basic",
    title: "Understanding Energy Sources",
    instructions: "Choose the correct answer. Use hints if you need help!",
    estimated_time: 8,
    points: 30,
    items: [
      {
        id: 1,
        question: "Which is the ultimate source of energy for Earth?",
        options: ["Moon", "The Sun", "Stars", "Wind"],
        correct_answer: "The Sun",
        hint: "Think about what gives light and heat every day",
        explanation:
          "The Sun is the ultimate source of most energy on Earth, providing light and heat.",
      },
      {
        id: 2,
        question: "Which of these is a renewable energy source?",
        options: ["Coal", "Petroleum", "Solar energy", "Natural gas"],
        correct_answer: "Solar energy",
        hint: "Which one will never run out?",
        explanation:
          "Solar energy is renewable because the Sun will keep shining for billions of years.",
      },
      {
        id: 3,
        question:
          "What do we call energy sources that can be used again and again?",
        options: [
          "Fossil fuels",
          "Renewable energy",
          "Coal energy",
          "Limited energy",
        ],
        correct_answer: "Renewable energy",
        hint: "Think about sources that renew themselves",
        explanation:
          "Renewable energy sources like solar, wind, and water can be used repeatedly without running out.",
      },
      {
        id: 4,
        question:
          "Which energy source is formed from dead plants and animals buried millions of years ago?",
        options: ["Solar energy", "Wind energy", "Fossil fuels", "Biomass"],
        correct_answer: "Fossil fuels",
        hint: "Think about coal and petroleum",
        explanation:
          "Fossil fuels like coal and oil were formed from ancient plants and animals over millions of years.",
      },
      {
        id: 5,
        question: "What do we get from burning wood or biogas?",
        options: ["Light only", "Heat energy", "Sound", "Magnetic energy"],
        correct_answer: "Heat energy",
        hint: "What do you feel near a fire?",
        explanation:
          "Burning wood or biogas releases heat energy that can be used for cooking and heating.",
      },
    ],
  },
  {
    topic: "Energy Sources",
    cognitive_load: "HIGH",
    activity_type: "MATCHING",
    difficulty_level: "basic",
    title: "Match Energy Sources to Their Types",
    instructions: "Match each energy source with its description",
    estimated_time: 7,
    points: 25,
    items: [
      {
        id: 1,
        left_item: "Sunlight",
        right_item: "Renewable energy from the Sun",
        pair_id: "A",
      },
      {
        id: 2,
        left_item: "Coal",
        right_item: "Non-renewable fossil fuel",
        pair_id: "B",
      },
      {
        id: 3,
        left_item: "Wind",
        right_item: "Renewable energy from moving air",
        pair_id: "C",
      },
      {
        id: 4,
        left_item: "Flowing water",
        right_item: "Renewable energy for hydropower",
        pair_id: "D",
      },
      {
        id: 5,
        left_item: "Petroleum",
        right_item: "Non-renewable fossil fuel from ancient organisms",
        pair_id: "E",
      },
    ],
    feedback: {
      correct_match: "Great match! ✓",
      incorrect_match: "Try again!",
    },
  },
  {
    topic: "Energy Sources",
    cognitive_load: "HIGH",
    activity_type: "FILL_BLANK_WORD_BANK",
    difficulty_level: "basic",
    title: "Complete Energy Sources Sentences",
    instructions: "Use words from the word bank to fill in the blanks",
    estimated_time: 8,
    points: 30,
    word_bank: ["Sun", "renewable", "fossil fuels", "wind", "biomass", "hydropower"],
    items: [
      {
        id: 1,
        sentence: "The ______ is the main source of energy for our planet.",
        correct_answer: "Sun",
        hint: "What gives us light and heat?",
      },
      {
        id: 2,
        sentence: "Coal, petroleum, and natural gas are called ______.",
        correct_answer: "fossil fuels",
        hint: "What are fuels formed from ancient organisms?",
      },
      {
        id: 3,
        sentence:
          "Energy sources that can be used again and again are called ______ energy.",
        correct_answer: "renewable",
        hint: "What type of energy doesn't run out?",
      },
      {
        id: 4,
        sentence:
          "______ energy is generated by moving air turning turbines.",
        correct_answer: "wind",
        hint: "What moves air called?",
      },
      {
        id: 5,
        sentence: "Energy from flowing water is called ______.",
        correct_answer: "hydropower",
        hint: "What is water energy called?",
      },
      {
        id: 6,
        sentence:
          "Wood, crop waste, and animal dung are examples of ______.",
        correct_answer: "biomass",
        hint: "What is energy from organic materials called?",
      },
    ],
  },
];
