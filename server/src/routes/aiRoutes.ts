import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AIMentorService } from '../services/aiMentorService';

const router = Router();

/**
 * Chat with AI Career Mentor
 */
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message text is required' });
      return;
    }

    // Fetch student context for tailored advice
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user?.id },
      include: {
        recommendations: { include: { career: true }, take: 3 }
      }
    });

    const context = {
      studentName: req.user?.name,
      currentClass: student?.currentClass,
      stream: student?.currentClass === 'CLASS_12' ? 'Higher Secondary' : 'Secondary',
      favouriteSubjects: student?.favouriteSubjects ? JSON.parse(student.favouriteSubjects) : [],
      topCareers: student?.recommendations.map(r => r.career.title) || []
    };

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({ where: { id: conversationId } });
    }
    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId: req.user!.id,
          title: message.slice(0, 40) + '...'
        }
      });
    }

    // Record user message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message
      }
    });

    // Generate AI response
    const aiResult = await AIMentorService.generateResponse(message, [], context);

    // Save assistant message
    const botMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: aiResult.reply,
        sourcesJson: JSON.stringify(aiResult.sources || [])
      }
    });

    res.json({
      success: true,
      conversationId: conversation.id,
      messageId: botMessage.id,
      reply: aiResult.reply,
      sources: aiResult.sources || []
    });
  } catch (err: any) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, message: 'AI mentor service unavailable', error: err.message });
  }
});

/**
 * Get chat conversation history
 */
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversation = await prisma.aIConversation.findFirst({
      where: { userId: req.user?.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      res.json({ success: true, conversationId: null, messages: [] });
      return;
    }

    res.json({
      success: true,
      conversationId: conversation.id,
      messages: conversation.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: m.sourcesJson ? JSON.parse(m.sourcesJson) : [],
        createdAt: m.createdAt
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch AI chat history', error: err.message });
  }
});

export default router;
