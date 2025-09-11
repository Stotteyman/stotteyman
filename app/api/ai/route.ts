import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, type ConversationContext } from '@/lib/persona';
import { createTurn, setMemory } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { history, choice, playerId, sessionId } = body;

    if (!choice) {
      return NextResponse.json(
        { error: 'Choice is required' },
        { status: 400 }
      );
    }

    // Convert history to the format expected by persona
    const conversationHistory = history.map((turn: any) => ({
      role: turn.role,
      content: turn.content,
      emotion: turn.emotion,
      timestamp: new Date(turn.timestamp),
    }));

    // Get player memories if playerId is provided
    let playerMemories: Array<{ key: string; value: any; updated_at: Date }> = [];
    if (playerId) {
      try {
        const { getAllMemories } = await import('@/lib/db');
        playerMemories = await getAllMemories(playerId);
      } catch (error) {
        console.warn('Failed to load player memories:', error);
      }
    }

    // Create conversation context
    const context: ConversationContext = {
      history: conversationHistory,
      playerMemories,
      sessionId: sessionId || 'anonymous',
      playerId: playerId || 'anonymous',
    };

    // Generate AI response
    const response = generateResponse(context);

    // Log the turn to database if sessionId is provided
    if (sessionId) {
      try {
        await createTurn({
          session_id: sessionId,
          role: 'assistant',
          content: { text: response.reply },
          options_shown: response.options,
          emotion: response.emotion,
        });
      } catch (error) {
        console.warn('Failed to log turn to database:', error);
      }
    }

    // Store memory if one was created
    if (response.memory && playerId) {
      try {
        await setMemory(playerId, response.memory.key, response.memory.value);
      } catch (error) {
        console.warn('Failed to store memory:', error);
      }
    }

    return NextResponse.json({
      reply: response.reply,
      emotion: response.emotion,
      options: response.options,
      memory: response.memory,
    });

  } catch (error) {
    console.error('AI endpoint error:', error);
    
    // Return fallback response
    return NextResponse.json({
      reply: "I'm experiencing some technical difficulties. Let me try to help you in a different way.",
      emotion: { arousal: 0.3, valence: 0.4 },
      options: [
        "Try again",
        "Ask something else",
        "Go back to menu"
      ],
    });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI endpoint is running',
    timestamp: new Date().toISOString(),
  });
}
