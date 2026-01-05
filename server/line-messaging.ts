import { Client, ClientConfig, Message, WebhookEvent, TextMessage, FlexMessage, ImageMessage } from '@line/bot-sdk';
import { getDb } from './db';
import { integrations, friends, broadcasts, messageTemplates } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * LINE Messaging API Client Wrapper
 * Provides helper functions for LINE Bot operations
 */

export class LineMessagingService {
  private client: Client | null = null;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Initialize LINE client with tenant credentials
   */
  async initialize(): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) {
        console.error('Database not available');
        return false;
      }

      const integration = await db
        .select()
        .from(integrations)
        .where(eq(integrations.integrationType, 'line_official'))
        .limit(1);

      if (!integration || integration.length === 0) {
        console.error('LINE integration not found for tenant:', this.tenantId);
        return false;
      }

      const config = integration[0];
      const lineConfig = config.config as any; // Parse JSON config
      if (config.status !== 'active') {
        console.error('LINE integration is not active');
        return false;
      }

      const clientConfig: ClientConfig = {
        channelAccessToken: lineConfig.channelAccessToken,
        channelSecret: lineConfig.channelSecret,
      };

      this.client = new Client(clientConfig);
      return true;
    } catch (error) {
      console.error('Failed to initialize LINE client:', error);
      return false;
    }
  }

  /**
   * Send text message to a user
   */
  async sendTextMessage(userId: string, text: string): Promise<boolean> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('LINE client not initialized');
    }

    try {
      const message: TextMessage = {
        type: 'text',
        text,
      };

      await this.client.pushMessage(userId, message);
      return true;
    } catch (error) {
      console.error('Failed to send text message:', error);
      return false;
    }
  }

  /**
   * Send multiple messages to a user
   */
  async sendMessages(userId: string, messages: Message[]): Promise<boolean> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('LINE client not initialized');
    }

    try {
      await this.client.pushMessage(userId, messages);
      return true;
    } catch (error) {
      console.error('Failed to send messages:', error);
      return false;
    }
  }

  /**
   * Send broadcast message to multiple users
   */
  async sendBroadcast(userIds: string[], messages: Message[]): Promise<{ success: number; failed: number }> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('LINE client not initialized');
    }

    let success = 0;
    let failed = 0;

    // Send in batches to avoid rate limits
    const batchSize = 500;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      try {
        await this.client.multicast(batch, messages);
        success += batch.length;
      } catch (error) {
        console.error('Failed to send broadcast batch:', error);
        failed += batch.length;
      }
    }

    return { success, failed };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('LINE client not initialized');
    }

    try {
      const profile = await this.client.getProfile(userId);
      return profile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Reply to a message
   */
  async replyMessage(replyToken: string, messages: Message[]): Promise<boolean> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('LINE client not initialized');
    }

    try {
      await this.client.replyMessage(replyToken, messages);
      return true;
    } catch (error) {
      console.error('Failed to reply message:', error);
      return false;
    }
  }

  /**
   * Handle webhook event
   */
  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'message':
          await this.handleMessageEvent(event);
          break;
        case 'follow':
          await this.handleFollowEvent(event);
          break;
        case 'unfollow':
          await this.handleUnfollowEvent(event);
          break;
        case 'postback':
          await this.handlePostbackEvent(event);
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
    }
  }

  /**
   * Handle message event
   */
  private async handleMessageEvent(event: any): Promise<void> {
    const userId = event.source.userId;
    const messageType = event.message.type;

    // Log message
    console.log(`Received ${messageType} message from ${userId}`);

    // Check for auto-reply rules
    if (messageType === 'text') {
      const text = event.message.text;
      // TODO: Implement auto-reply logic
      // Check database for matching keywords and send response
    }
  }

  /**
   * Handle follow event (friend added)
   */
  private async handleFollowEvent(event: any): Promise<void> {
    const userId = event.source.userId;

    try {
      // Get user profile
      const profile = await this.getUserProfile(userId);

      if (profile) {
        // Save friend to database
        const db = await getDb();
        if (!db) return;

        await db.insert(friends).values({
          lineUserId: userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          isBlocked: false,
          followedAt: new Date(),
        }).onDuplicateKeyUpdate({
          set: {
            isBlocked: false,
            followedAt: new Date(),
          },
        });

        // TODO: Send greeting message
        // TODO: Apply traffic source actions
      }
    } catch (error) {
      console.error('Error handling follow event:', error);
    }
  }

  /**
   * Handle unfollow event (friend blocked)
   */
  private async handleUnfollowEvent(event: any): Promise<void> {
    const userId = event.source.userId;

    try {
      // Update friend status
      const db = await getDb();
      if (!db) return;

      await db
        .update(friends)
        .set({
          isBlocked: true,
          blockedAt: new Date(),
        })
        .where(eq(friends.lineUserId, userId));
    } catch (error) {
      console.error('Error handling unfollow event:', error);
    }
  }

  /**
   * Handle postback event (button action)
   */
  private async handlePostbackEvent(event: any): Promise<void> {
    const userId = event.source.userId;
    const data = event.postback.data;

    console.log(`Received postback from ${userId}:`, data);

    // TODO: Parse postback data and execute actions
    // Example: data = "action=tag_add&tag_id=123"
  }

  /**
   * Set rich menu for a user
   */
  async setRichMenu(userId: string, richMenuId: string): Promise<boolean> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('LINE client not initialized');
    }

    try {
      await this.client.linkRichMenuToUser(userId, richMenuId);
      return true;
    } catch (error) {
      console.error('Failed to set rich menu:', error);
      return false;
    }
  }

  /**
   * Unlink rich menu from a user
   */
  async unlinkRichMenu(userId: string): Promise<boolean> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('LINE client not initialized');
    }

    try {
      await this.client.unlinkRichMenuFromUser(userId);
      return true;
    } catch (error) {
      console.error('Failed to unlink rich menu:', error);
      return false;
    }
  }
}

/**
 * Get LINE Messaging Service instance for a tenant
 */
export function getLineMessagingService(tenantId: string): LineMessagingService {
  return new LineMessagingService(tenantId);
}
