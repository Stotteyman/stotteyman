import { NextRequest, NextResponse } from 'next/server';
import { createTurn, createSession, updatePlayerIntroSeen, setFlag } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action, 
      playerId, 
      sessionId, 
      turn, 
      flag, 
      deviceType, 
      userAgent 
    } = body;

    switch (action) {
      case 'create_session':
        if (!playerId) {
          return NextResponse.json(
            { error: 'Player ID is required for session creation' },
            { status: 400 }
          );
        }

        const session = await createSession(
          playerId, 
          deviceType, 
          userAgent
        );

        return NextResponse.json({
          sessionId: session.id,
          success: true,
        });

      case 'log_turn':
        if (!sessionId || !turn) {
          return NextResponse.json(
            { error: 'Session ID and turn data are required' },
            { status: 400 }
          );
        }

        const newTurn = await createTurn({
          session_id: sessionId,
          role: turn.role,
          content: turn.content,
          options_shown: turn.options_shown,
          chosen_option: turn.chosen_option,
          emotion: turn.emotion,
        });

        return NextResponse.json({
          turnId: newTurn.id,
          success: true,
        });

      case 'mark_intro_seen':
        if (!playerId) {
          return NextResponse.json(
            { error: 'Player ID is required' },
            { status: 400 }
          );
        }

        await updatePlayerIntroSeen(playerId);

        return NextResponse.json({
          success: true,
        });

      case 'set_flag':
        if (!flag || !flag.name) {
          return NextResponse.json(
            { error: 'Flag name and value are required' },
            { status: 400 }
          );
        }

        await setFlag(playerId, flag.name, flag.value);

        return NextResponse.json({
          success: true,
        });

      case 'analytics':
        // Log analytics event
        const analyticsData = {
          event: body.event,
          properties: body.properties || {},
          timestamp: new Date().toISOString(),
          playerId,
          sessionId,
          deviceType,
          userAgent,
        };

        // Store analytics data (could be sent to external service)
        console.log('Analytics event:', analyticsData);

        return NextResponse.json({
          success: true,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Track endpoint error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Track endpoint is running',
    timestamp: new Date().toISOString(),
  });
}
