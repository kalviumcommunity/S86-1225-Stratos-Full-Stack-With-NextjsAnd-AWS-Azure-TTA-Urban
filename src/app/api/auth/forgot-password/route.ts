import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to user (you'll need to add these fields to User model)
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      // In a production environment, you would send an email here
      // For now, we'll just log the reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      // Send password reset email
      try {
        const emailTemplate = getPasswordResetEmailTemplate(resetUrl, user.name);
        await sendEmail({
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });
        console.log(`✅ Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Log the reset URL as fallback for development
        console.log('====================================');
        console.log('PASSWORD RESET REQUESTED (Email failed - URL logged)');
        console.log('Email:', email);
        console.log('Reset URL:', resetUrl);
        console.log('Token expires in 1 hour');
        console.log('====================================');
        
        // In production, you might want to return an error here
        // For now, we'll continue to prevent exposing email issues
      }
    }

    // Always return success message
    return NextResponse.json({
      message: 'If an account exists with that email, we have sent password reset instructions.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
