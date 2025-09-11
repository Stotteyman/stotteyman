import { NextRequest, NextResponse } from 'next/server';
import { getFlag, setFlag } from '@/lib/db';

export async function GET() {
  try {
    // Get default persona
    const persona = await getFlag(null, 'default_persona');
    
    if (!persona) {
      // Return default persona if none exists
      const defaultPersona = {
        name: 'Stotteyman',
        description: 'A sci-fi hacker/computer entity with a mentor/tech-hustle vibe',
        traits: ['playful', 'actionable', 'tech-savvy', 'encouraging'],
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
        },
        emotionRange: {
          arousal: [0.3, 0.9],
          valence: [0.4, 0.8],
        },
      };
      
      return NextResponse.json({ persona: defaultPersona });
    }
    
    return NextResponse.json({ persona });
    
  } catch (error) {
    console.error('Admin persona GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load persona' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { persona } = body;
    
    if (!persona) {
      return NextResponse.json(
        { error: 'Persona data is required' },
        { status: 400 }
      );
    }
    
    // Save persona as a flag
    await setFlag(null, 'default_persona', persona);
    
    return NextResponse.json({
      success: true,
      message: 'Persona saved successfully',
    });
    
  } catch (error) {
    console.error('Admin persona POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save persona' },
      { status: 500 }
    );
  }
}
