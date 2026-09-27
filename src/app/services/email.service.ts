import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  private serviceId = 'service_i151jys';
  private templateId = 'template_mww3wjf';

  private publicKey = 'ul0t9y8e5RwxAAJDw';

  async sendNotificationEmail(
    toEmail: string,
    message: string,
    replyTo: string = ''
  ) {

    try {

      await emailjs.send(
        this.serviceId,
        this.templateId,
        {
          to_email: toEmail,
          message: message,
          reply_to: replyTo,
        },
        {
          publicKey: this.publicKey,
        }
      );

      console.log('📧 Email sent successfully');

    } catch (error) {

      console.error(
        '❌ Email sending failed:',
        error
      );

      throw error;
    }
  }
}