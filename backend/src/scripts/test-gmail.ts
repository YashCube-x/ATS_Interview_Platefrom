import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { createGmailService } from '../config/gmail.config';

async function testGmailInbox() {
  try {
    console.log('Initializing Gmail API client...');
    const gmail = createGmailService();
    console.log('Listing last 20 unread messages in inbox...');

    // Exact query from GmailService
    const query = 'is:unread has:attachment filename:(pdf OR docx OR txt) category:primary -category:promotions -category:social -category:updates -category:forums (resume OR cv OR "job application" OR "applying" OR subject:(apply OR application OR candidate OR resume OR cv))';
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20,
    });

    const messages = response.data.messages || [];
    console.log(`Found ${messages.length} unread messages.`);

    for (const msg of messages) {
      if (!msg.id) continue;
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
      });

      const headers = details.data.payload?.headers || [];
      const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
      const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown Sender';
      const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || 'No Date';
      const labels = details.data.labelIds || [];
      
      console.log(`\n--------------------------------------------`);
      console.log(`Message ID: ${msg.id}`);
      console.log(`From:       ${from}`);
      console.log(`Subject:    ${subject}`);
      console.log(`Date:       ${date}`);
      console.log(`Labels:     ${labels.join(', ')}`);
      
      const parts = details.data.payload?.parts || [];
      const attachmentNames = parts
        .filter(p => p.filename)
        .map(p => p.filename);
      console.log(`Attachments: ${attachmentNames.length > 0 ? attachmentNames.join(', ') : 'None'}`);
    }

  } catch (error: any) {
    console.error('Error testing Gmail:', error.message || error);
  }
}

testGmailInbox();
