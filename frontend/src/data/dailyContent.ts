// Word/phrase and example stay in English (the language being learned) — only the definition goes through i18n.
export interface WordEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definitionKey: string;
  example: string;
}

export const WORD_BANK: WordEntry[] = [
  {
    word: "Resilient",
    phonetic: "/rɪˈzɪl.i.ənt/",
    partOfSpeech: "adjective",
    definitionKey: "dailyContent.words.resilient",
    example: "The team stayed resilient even after losing the first two matches.",
  },
  {
    word: "Articulate",
    phonetic: "/ɑːˈtɪk.jə.leɪt/",
    partOfSpeech: "verb",
    definitionKey: "dailyContent.words.articulate",
    example: "He struggled to articulate why the plan felt wrong.",
  },
  {
    word: "Candid",
    phonetic: "/ˈkæn.dɪd/",
    partOfSpeech: "adjective",
    definitionKey: "dailyContent.words.candid",
    example: "Thanks for being candid about the risks.",
  },
  {
    word: "Diligent",
    phonetic: "/ˈdɪl.ɪ.dʒənt/",
    partOfSpeech: "adjective",
    definitionKey: "dailyContent.words.diligent",
    example: "Her diligent studying paid off on exam day.",
  },
];

export interface IdiomEntry {
  phrase: string;
  meaningKey: string;
}

export const IDIOM_BANK: IdiomEntry[] = [
  { phrase: "Hit the books", meaningKey: "dailyContent.idioms.hitTheBooks" },
  { phrase: "Break the ice", meaningKey: "dailyContent.idioms.breakTheIce" },
  { phrase: "On the same page", meaningKey: "dailyContent.idioms.sameSage" },
  { phrase: "Under the weather", meaningKey: "dailyContent.idioms.underWeather" },
];

// Word + options are the vocabulary being tested — not translated, only the surrounding chrome is.
export interface WordChallenge {
  word: string;
  options: string[];
  correctIndex: number;
}

export const WORD_CHALLENGES: WordChallenge[] = [
  { word: "Meticulous", options: ["Careless", "Very careful", "Cheerful", "Loud"], correctIndex: 1 },
  { word: "Concise", options: ["Brief and clear", "Confusing", "Very long", "Formal"], correctIndex: 0 },
  { word: "Reluctant", options: ["Eager", "Unwilling", "Curious", "Confident"], correctIndex: 1 },
  { word: "Ambiguous", options: ["Perfectly clear", "Open to interpretation", "Very loud", "Well organized"], correctIndex: 1 },
];
