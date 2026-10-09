import styles from './forgot.module.css'
import { Link, useNavigate } from 'react-router-dom'
import React, { useState } from 'react';
import { supabase } from '../supabase-client.ts';

function forgotpage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userId, setUserId] = useState(null);

  // Generate 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send OTP email using Supabase
  const sendOTPEmail = async (email, otpCode) => {
    try {
      // Here you can use Supabase Edge Function or a third-party email service
      // For demo, we'll use console.log and show alert
      console.log(`Sending OTP ${otpCode} to ${email}`);
      
      // You can integrate with email services like:
      // - Resend (https://resend.com)
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      
      // For now, we'll show a success message
      alert(`Demo: Your OTP is ${otpCode}\nIn production, this will be sent to your email.`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  // Handle email submission
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      // Check if email exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setError('No account found with this email address');
        setLoading(false);
        return;
      }

      // Generate OTP
      const otpCode = generateOTP();
      setGeneratedOtp(otpCode);
      setUserId(userData.id);

      // Send OTP via email
      const emailSent = await sendOTPEmail(email, otpCode);
      
      if (emailSent) {
        setSuccess(`OTP sent to ${email}`);
        setStep(2);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!otp) {
      setError('Please enter the OTP');
      setLoading(false);
      return;
    }

    if (otp !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess('OTP verified successfully!');
    setStep(3);
    setLoading(false);
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!newPassword) {
      setError('Please enter a new password');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Update password in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    
    const emailSent = await sendOTPEmail(email, newOtp);
    
    if (emailSent) {
      setSuccess(`New OTP sent to ${email}`);
    } else {
      setError('Failed to resend OTP. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.forgot_password_page}>
      <div className={styles.password_card}>
        <div className={styles.card_top_bar}></div>
        
        <div className={styles.card_content}>
          {/* Logo Section */}
          <div className={styles.logo_section}>
            <div className={styles.logo_icon}>
              <span className="material-symbols-outlined">groups</span>
            </div>
            <h2 className={styles.logo_text}>SocietyConnect</h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.error_message}>
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
              <button onClick={() => setError('')} className={styles.close_error}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className={styles.success_message}>
              <span className="material-symbols-outlined">check_circle</span>
              <p>{success}</p>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <>
              <div className={styles.headline_section}>
                <h1 className={styles.headline}>Forgot Password?</h1>
              </div>

              <div className={styles.body_text_section}>
                <p className={styles.body_text}>
                  No worries, we'll send you reset instructions. Please enter your email address below.
                </p>
              </div>

              <form className={styles.password_form} onSubmit={handleSendOTP}>
                <div className={styles.form_group}>
                  <label className={styles.form_label} htmlFor="email">
                    Email Address
                  </label>
                  <div className={styles.input_container}>
                    <div className={styles.input_icon}>
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <input
                      className={styles.form_input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@society.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button className={styles.submit_button} type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div className={styles.headline_section}>
                <h1 className={styles.headline}>Verify OTP</h1>
              </div>

              <div className={styles.body_text_section}>
                <p className={styles.body_text}>
                  Please enter the 6-digit OTP sent to <strong>{email}</strong>
                </p>
              </div>

              <form className={styles.password_form} onSubmit={handleVerifyOTP}>
                <div className={styles.form_group}>
                  <label className={styles.form_label} htmlFor="otp">
                    Enter OTP
                  </label>
                  <div className={styles.input_container}>
                    <div className={styles.input_icon}>
                      <span className="material-symbols-outlined">pin</span>
                    </div>
                    <input
                      className={styles.form_input}
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <button className={styles.submit_button} type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>

              <div className={styles.resend_section}>
                <button 
                  className={styles.resend_button} 
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Didn't receive OTP? Resend
                </button>
              </div>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <div className={styles.headline_section}>
                <h1 className={styles.headline}>Reset Password</h1>
              </div>

              <div className={styles.body_text_section}>
                <p className={styles.body_text}>
                  Enter your new password below.
                </p>
              </div>

              <form className={styles.password_form} onSubmit={handleResetPassword}>
                <div className={styles.form_group}>
                  <label className={styles.form_label} htmlFor="newPassword">
                    New Password
                  </label>
                  <div className={styles.input_container}>
                    <div className={styles.input_icon}>
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <input
                      className={styles.form_input}
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.form_group}>
                  <label className={styles.form_label} htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className={styles.input_container}>
                    <div className={styles.input_icon}>
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <input
                      className={styles.form_input}
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button className={styles.submit_button} type="submit" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Navigation Link */}
          <div className={styles.navigation_section}>
            <Link className={styles.back_link} to="/login">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Log In
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.page_footer}>
        <p className={styles.footer_text}>
          © 2024 SocietyConnect Inc. Secure Platform.
        </p>
      </div>
    </div>
  );
}

export default forgotpage;