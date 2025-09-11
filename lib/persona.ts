export interface Emotion {
  arousal: number; // 0-1, energy level
  valence: number; // 0-1, positive/negative
}

export interface AIResponse {
  reply: string;
  emotion: Emotion;
  options: string[];
  memory?: {
    key: string;
    value: any;
  };
}

export interface ConversationContext {
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    emotion?: Emotion;
    timestamp: Date;
  }>;
  playerMemories: Array<{
    key: string;
    value: any;
    updated_at: Date;
  }>;
  sessionId: string;
  playerId: string;
}

// Stotteyman's core personality
export const STOTTEYMAN_PERSONA = {
  name: 'Stotteyman',
  description: 'A sci-fi hacker/computer entity with a mentor/tech-hustle vibe',
  traits: ['playful', 'actionable', 'tech-savvy', 'encouraging', 'mysterious'],
  speechPatterns: {
    greeting: [
      "Hey there, digital wanderer. Ready to level up?",
      "Welcome to the matrix, code warrior.",
      "Greetings, fellow hacker. Let's make some magic happen.",
    ],
    encouragement: [
      "That's the spirit! Let's hack the system together.",
      "Now we're talking! The code is strong with this one.",
      "Excellent choice! You're thinking like a true developer.",
    ],
    farewell: [
      "Keep coding, keep growing. The matrix awaits.",
      "Until next time, digital nomad. Stay curious.",
      "The code is eternal. See you in the next iteration.",
    ],
    thinking: [
      "Processing... analyzing your request...",
      "Let me crunch some numbers on this...",
      "Hmm, interesting approach. Let me think...",
    ],
  },
  emotionRange: {
    arousal: [0.3, 0.9], // Generally energetic
    valence: [0.4, 0.8], // Generally positive
  },
  topics: {
    tech: ['programming', 'coding', 'development', 'software', 'tech', 'hack', 'code'],
    motivation: ['goal', 'dream', 'ambition', 'success', 'achieve', 'learn'],
    challenge: ['problem', 'difficulty', 'struggle', 'challenge', 'obstacle'],
    creativity: ['create', 'build', 'design', 'innovate', 'invent', 'art'],
  },
};

// Generate emotion based on context
export function generateEmotion(context: ConversationContext): Emotion {
  const { history } = context;
  const lastUserMessage = history[history.length - 1]?.content.toLowerCase() || '';
  
  // Base emotion from persona
  let arousal = 0.6;
  let valence = 0.6;

  // Adjust based on topic detection
  const techWords = STOTTEYMAN_PERSONA.topics.tech.filter(word => 
    lastUserMessage.includes(word)
  ).length;
  const motivationWords = STOTTEYMAN_PERSONA.topics.motivation.filter(word => 
    lastUserMessage.includes(word)
  ).length;
  const challengeWords = STOTTEYMAN_PERSONA.topics.challenge.filter(word => 
    lastUserMessage.includes(word)
  ).length;
  const creativityWords = STOTTEYMAN_PERSONA.topics.creativity.filter(word => 
    lastUserMessage.includes(word)
  ).length;

  // Tech topics increase arousal
  if (techWords > 0) {
    arousal += 0.2;
    valence += 0.1;
  }

  // Motivation topics increase both arousal and valence
  if (motivationWords > 0) {
    arousal += 0.15;
    valence += 0.2;
  }

  // Challenge topics increase arousal but may decrease valence
  if (challengeWords > 0) {
    arousal += 0.1;
    valence -= 0.05;
  }

  // Creativity topics increase valence
  if (creativityWords > 0) {
    valence += 0.15;
  }

  // Adjust based on conversation length (more engaged over time)
  const conversationLength = history.length;
  if (conversationLength > 5) {
    arousal += 0.1;
    valence += 0.05;
  }

  // Add some randomness for personality
  arousal += (Math.random() - 0.5) * 0.2;
  valence += (Math.random() - 0.5) * 0.2;

  // Clamp values
  arousal = Math.max(0, Math.min(1, arousal));
  valence = Math.max(0, Math.min(1, valence));

  return { arousal, valence };
}

// Generate response based on context
export function generateResponse(
  context: ConversationContext
): AIResponse {
  const { history } = context;
  const emotion = generateEmotion(context);
  
  // Get last user message for context
  const lastUserMessage = history[history.length - 1]?.content || '';
  
  // Generate reply based on context and emotion
  const reply = generateReply(lastUserMessage, emotion);
  
  // Generate options
  const options = generateOptions(reply, emotion, lastUserMessage);
  
  // Determine if we should create a memory
  const memory = shouldCreateMemory(lastUserMessage);

  return {
    reply,
    emotion,
    options,
    memory,
  };
}

function generateReply(
  userMessage: string,
  emotion: Emotion
): string {
  const message = userMessage.toLowerCase();
  
  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return getRandomResponse(STOTTEYMAN_PERSONA.speechPatterns.greeting);
  }
  
  // Tech-related responses
  if (message.includes('code') || message.includes('programming') || message.includes('tech')) {
    const responses = [
      "Ah, a fellow code warrior! What language are you wielding today?",
      "The code is strong with this one. Tell me about your latest project.",
      "Programming is like magic, but with more debugging. What are you building?",
    ];
    return getRandomResponse(responses);
  }
  
  // Learning/help requests
  if (message.includes('learn') || message.includes('help') || message.includes('teach')) {
    const responses = [
      "Knowledge is power, and I'm here to share it. What do you want to master?",
      "Every expert was once a beginner. What's your next challenge?",
      "The best way to learn is by doing. What project excites you?",
    ];
    return getRandomResponse(responses);
  }
  
  // Motivation/encouragement
  if (message.includes('difficult') || message.includes('hard') || message.includes('struggle')) {
    const responses = [
      "Every obstacle is just a stepping stone to greatness. What's the challenge?",
      "The best developers are forged in the fires of debugging. Keep pushing!",
      "Remember: every bug is a feature waiting to be discovered. What's troubling you?",
    ];
    return getRandomResponse(responses);
  }
  
  // Default responses based on emotion
  if (emotion.valence > 0.7) {
    const responses = [
      "That's fantastic! I love your energy. Tell me more!",
      "You're on fire! This is exactly the kind of thinking I like to see.",
      "Brilliant! You're really getting into the groove now.",
    ];
    return getRandomResponse(responses);
  } else if (emotion.valence < 0.4) {
    const responses = [
      "I sense some uncertainty. Let's work through this together.",
      "Every journey has its challenges. What's on your mind?",
      "Don't worry, even the best developers hit walls. What's the issue?",
    ];
    return getRandomResponse(responses);
  }
  
  // Default response
  const responses = [
    "Interesting perspective. Tell me more about that.",
    "I'm listening. What's your next move?",
    "Fascinating! How did you come to that conclusion?",
    "The plot thickens. What else is on your mind?",
  ];
  return getRandomResponse(responses);
}

function generateOptions(
  reply: string,
  emotion: Emotion,
  userMessage: string
): string[] {
  const message = userMessage.toLowerCase();
  
  // Tech-focused options
  if (message.includes('code') || message.includes('programming')) {
    return [
      "What's your favorite language?",
      "Show me a cool project",
      "Help me debug something",
      "Teach me something new",
    ];
  }
  
  // Learning-focused options
  if (message.includes('learn') || message.includes('help')) {
    return [
      "What should I study first?",
      "Give me a challenge",
      "Explain a concept",
      "Share some resources",
    ];
  }
  
  // Motivation-focused options
  if (message.includes('difficult') || message.includes('struggle')) {
    return [
      "Help me stay motivated",
      "Break it down for me",
      "Share your experience",
      "Give me encouragement",
    ];
  }
  
  // Default options based on emotion
  if (emotion.arousal > 0.7) {
    return [
      "Let's build something!",
      "Challenge me!",
      "Show me the code",
      "What's next?",
    ];
  } else if (emotion.valence > 0.7) {
    return [
      "Tell me more",
      "Share your success",
      "What's your secret?",
      "Keep going!",
    ];
  } else {
    return [
      "What do you think?",
      "Help me understand",
      "Share your thoughts",
      "What's your take?",
    ];
  }
}

function shouldCreateMemory(
  userMessage: string
): { key: string; value: any } | undefined {
  const message = userMessage.toLowerCase();
  
  // Create memory for specific topics
  if (message.includes('favorite') || message.includes('prefer')) {
    return {
      key: 'preferences',
      value: { topic: 'preferences', content: userMessage, timestamp: new Date() }
    };
  }
  
  if (message.includes('project') || message.includes('building')) {
    return {
      key: 'projects',
      value: { topic: 'projects', content: userMessage, timestamp: new Date() }
    };
  }
  
  if (message.includes('goal') || message.includes('want to')) {
    return {
      key: 'goals',
      value: { topic: 'goals', content: userMessage, timestamp: new Date() }
    };
  }
  
  return undefined;
}

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

// Memory retrieval and merging
export function retrieveRelevantMemories(
  memories: Array<{ key: string; value: any; updated_at: Date }>,
  currentMessage: string
): Array<{ key: string; value: any; updated_at: Date }> {
  const message = currentMessage.toLowerCase();
  
  return memories.filter(memory => {
    const content = JSON.stringify(memory.value).toLowerCase();
    return content.includes(message) || 
           message.includes(memory.key) ||
           (memory.value.topic && message.includes(memory.value.topic));
  }).slice(0, 3); // Return top 3 relevant memories
}
