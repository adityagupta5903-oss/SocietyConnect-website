import { Link, useNavigate } from "react-router-dom";
import styles from './login.module.css'
import icon from '../assets/logo.png'
import React, { useState } from "react";
import { supabase } from '../supabase-client.ts';

function LoginPage() {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    
    // Form state variables
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    
    // Field-specific error states
    const [loginEmailError, setLoginEmailError] = useState('');
    const [loginPasswordError, setLoginPasswordError] = useState('');
    const [signupNameError, setSignupNameError] = useState('');
    const [signupEmailError, setSignupEmailError] = useState('');
    const [signupPhoneError, setSignupPhoneError] = useState('');
    const [signupPasswordError, setSignupPasswordError] = useState('');
    const [signupConfirmPasswordError, setSignupConfirmPasswordError] = useState('');
    const [signupTermsError, setSignupTermsError] = useState('');
    
    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Images for login and signup modes
    const loginBackgroundImage = "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
    const signupBackgroundImage = "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
    
    // Content for login and signup modes
    const loginContent = {
        badge: "Welcome Back",
        badgeIcon: "verified",
        title: "Welcome back to your community",
        subtitle: "Log in to connect with neighbors, access society events, and manage your community activities."
    };
    
    const signupContent = {
        badge: "Join Our Community",
        badgeIcon: "groups",
        title: "Become a member of your society",
        subtitle: "Create your account to start connecting with neighbors, participate in events, and stay updated with society announcements."
    };

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Phone number validation function
    const validatePhoneNumber = (phone) => {
        if (!phone) return true;
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    // Login validation function - returns all errors at once
    const validateLoginForm = () => {
        let errors = {};
        let isValid = true;
        
        if (!loginEmail.trim()) {
            errors.loginEmail = 'Email address is required';
            isValid = false;
        } else if (!validateEmail(loginEmail)) {
            errors.loginEmail = 'Please enter a valid email address';
            isValid = false;
        }
        
        if (!loginPassword) {
            errors.loginPassword = 'Password is required';
            isValid = false;
        }
        
        return { isValid, errors };
    };

    // Signup validation function - returns all errors at once
    const validateSignupForm = () => {
        let errors = {};
        let isValid = true;
        
        // Validate name
        if (!signupName.trim()) {
            errors.signupName = 'Full name is required';
            isValid = false;
        }
        
        // Validate email
        if (!signupEmail.trim()) {
            errors.signupEmail = 'Email address is required';
            isValid = false;
        } else if (!validateEmail(signupEmail)) {
            errors.signupEmail = 'Please enter a valid email address';
            isValid = false;
        } else if (signupEmail === 'admin@gmail.com') {
            errors.signupEmail = 'This email is reserved for admin. Please use a different email.';
            isValid = false;
        }
        
        // Validate phone number (optional)
        if (signupPhone && !validatePhoneNumber(signupPhone)) {
            errors.signupPhone = 'Please enter a valid 10-digit phone number';
            isValid = false;
        }
        
        // Validate password
        if (!signupPassword) {
            errors.signupPassword = 'Password is required';
            isValid = false;
        } else if (signupPassword.length < 6) {
            errors.signupPassword = 'Password must be at least 6 characters long';
            isValid = false;
        }
        
        // Validate confirm password
        if (!signupConfirmPassword) {
            errors.signupConfirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (signupPassword !== signupConfirmPassword) {
            errors.signupConfirmPassword = 'Passwords do not match';
            isValid = false;
        }
        
        // Validate terms agreement
        if (!agreeTerms) {
            errors.signupTerms = 'You must agree to the Terms of Service and Privacy Policy';
            isValid = false;
        }
        
        return { isValid, errors };
    };

    // Clear all login errors
    const clearLoginErrors = () => {
        setLoginEmailError('');
        setLoginPasswordError('');
        setError('');
    };

    // Clear all signup errors
    const clearSignupErrors = () => {
        setSignupNameError('');
        setSignupEmailError('');
        setSignupPhoneError('');
        setSignupPasswordError('');
        setSignupConfirmPasswordError('');
        setSignupTermsError('');
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        clearLoginErrors();
        
        // Validate all fields at once
        const { isValid, errors } = validateLoginForm();
        
        if (!isValid) {
            // Set all errors at once
            if (errors.loginEmail) setLoginEmailError(errors.loginEmail);
            if (errors.loginPassword) setLoginPasswordError(errors.loginPassword);
            return;
        }
        
        setLoading(true);
        
        try {
            // Check for admin credentials first
            if (loginEmail === 'admin@gmail.com' && loginPassword === 'admin123') {
                console.log('Admin login successful');
                
                const adminData = {
                    email: loginEmail,
                    role: 'admin',
                    loggedInAt: new Date().toISOString()
                };
                
                if (rememberMe) {
                    localStorage.setItem('userSession', JSON.stringify(adminData));
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    sessionStorage.setItem('userSession', JSON.stringify(adminData));
                }
                
                navigate('/superadmin');
                return;
            }
            
            // Regular user login
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', loginEmail)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    setLoginEmailError('No account found with this email address');
                } else {
                    setError('Error connecting to database');
                }
                setLoading(false);
                return;
            }
            
            if (data) {
                if (data.password === loginPassword) {
                    console.log('Login successful:', data);
                    
                    const userData = {
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        phone: data.phone_no,
                        role: 'user',
                        loggedInAt: new Date().toISOString()
                    };
                    
                    if (rememberMe) {
                        localStorage.setItem('userSession', JSON.stringify(userData));
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        sessionStorage.setItem('userSession', JSON.stringify(userData));
                    }
                    
                    navigate('/');
                } else {
                    setLoginPasswordError('Incorrect password. Please try again.');
                }
            }
            
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSignup = async (e) => {
        e.preventDefault();
        clearSignupErrors();
        
        // Validate all fields at once
        const { isValid, errors } = validateSignupForm();
        
        if (!isValid) {
            // Set all errors at once
            if (errors.signupName) setSignupNameError(errors.signupName);
            if (errors.signupEmail) setSignupEmailError(errors.signupEmail);
            if (errors.signupPhone) setSignupPhoneError(errors.signupPhone);
            if (errors.signupPassword) setSignupPasswordError(errors.signupPassword);
            if (errors.signupConfirmPassword) setSignupConfirmPasswordError(errors.signupConfirmPassword);
            if (errors.signupTerms) setSignupTermsError(errors.signupTerms);
            return;
        }
        
        setLoading(true);
        
        try {
            // Check if email already exists
            const { data: existingUser, error: checkUserError } = await supabase
                .from('users')
                .select('email')
                .eq('email', signupEmail)
                .maybeSingle();
            
            if (existingUser) {
                setSignupEmailError('An account with this email already exists. Please login instead.');
                setLoading(false);
                return;
            }
            
            // Insert into users table
            const userDataToInsert = {
                name: signupName,
                email: signupEmail,
                password: signupPassword,
                user_status: 'unblocked'
            };
            
            if (signupPhone && signupPhone.trim()) {
                userDataToInsert.phone_no = signupPhone.trim();
            }
            
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert([userDataToInsert])
                .select();
            
            if (userError) {
                console.error('Users table error:', userError);
                setError('Error creating user account: ' + userError.message);
                setLoading(false);
                return;
            }
            
            console.log('Signup successful - User created:', userData);
            
            // Clear form fields
            setSignupName('');
            setSignupEmail('');
            setSignupPhone('');
            setSignupPassword('');
            setSignupConfirmPassword('');
            setAgreeTerms(false);
            
            setSuccessMessage('Account created successfully! You can now log in.');
            
            setTimeout(() => {
                setAuthMode('login');
                setLoginEmail(signupEmail);
                setSuccessMessage('');
            }, 2000);
            
        } catch (error) {
            console.error('Signup error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (authMode === 'login') {
            handleLogin(e);
        } else {
            handleSignup(e);
        }
    };

    const toggleAuthMode = (mode) => {
        setAuthMode(mode);
        setError('');
        setSuccessMessage('');
        clearLoginErrors();
        clearSignupErrors();
        // Clear form fields when switching
        if (mode === 'login') {
            setLoginEmail('');
            setLoginPassword('');
        } else {
            setSignupName('');
            setSignupEmail('');
            setSignupPhone('');
            setSignupPassword('');
            setSignupConfirmPassword('');
            setAgreeTerms(false);
        }
    };

    const currentContent = authMode === 'login' ? loginContent : signupContent;
    const currentBackgroundImage = authMode === 'login' ? loginBackgroundImage : signupBackgroundImage;

    return (
        <div className={styles.loginpage}>
            <nav className={styles.navbar}>
                <div className={styles.nav_container}>
                    <div className={styles.navcontent}>
                        <div className={styles.navbrand}>
                            <div className={styles.navlogo}>
                                <span><img className={styles.navlogo} src={icon} alt="logo"></img></span>
                            </div>
                            <h2 className={styles.navtitle}>SocietyConnect</h2>
                        </div>

                        <div className={styles.nav_desktop_menu}>
                            <div className={styles.nav_links}>
                                <Link className={styles.nav_link} to="/">Home</Link>
                                <Link className={styles.nav_link} to="/features">Features</Link>
                                <Link className={styles.nav_link} to="/about">About Us</Link>
                                <Link className={styles.nav_link} to="/contact">Contact</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className={styles.auth_main}>
                <div className={styles.auth_section}>
                    <div className={styles.main_background} style={{ 
                        backgroundImage: `url('${currentBackgroundImage}')`
                    }}>
                        <div className={styles.main_overlay}></div>
                        <div className={styles.main_content}>
                            <span className={styles.main_badge}>
                                <span className={`material-symbols-outlined`}>{currentContent.badgeIcon}</span>
                                {currentContent.badge}
                            </span>
                            <h1 className={styles.main_title}>{currentContent.title}</h1>
                            <p className={styles.main_subtitle}>{currentContent.subtitle}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.auth_form_container}>
                    <div className={styles.auth_form_wrapper}>
                        <div className={styles.auth_toggle}>
                            <div className={styles.toggle_container}>
                                <label className={`${styles.toggle_option} ${authMode === 'login' ? styles.active : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="auth_mode" 
                                        value='login' 
                                        checked={authMode === 'login'}
                                        onChange={() => toggleAuthMode('login')}
                                    />
                                    <span className={styles.toggle_label}>Log In</span>
                                </label>
                                <label className={`${styles.toggle_option} ${authMode === 'signup' ? styles.active : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="auth_mode" 
                                        value='signup' 
                                        checked={authMode === 'signup'}
                                        onChange={() => toggleAuthMode('signup')}
                                    />
                                    <span className={styles.toggle_label}>Sign Up</span>
                                </label>
                            </div>
                        </div>

                        {/* General Error Message Display */}
                        {error && (
                            <div className={styles.error_message}>
                                <span className={`material-symbols-outlined`}>error</span>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Success Message Display */}
                        {successMessage && (
                            <div className={styles.success_message}>
                                <span className={`material-symbols-outlined`}>check_circle</span>
                                <p>{successMessage}</p>
                            </div>
                        )}

                        {authMode === 'login' ? (
                            <>
                                <div className={styles.auth_header_text}>
                                    <h2 className={styles.auth_title}>Welcome Back</h2>
                                    <p className={styles.auth_subtitle}>Enter your details to access your community account.</p>
                                </div>
                                <form className={styles.auth_form} onSubmit={handleSubmit}>
                                    {/* Email Field */}
                                    <div className={styles.form_group}>
                                        <label className={styles.form_label}>Email Address</label>
                                        <div className={styles.input_container}>
                                            <input 
                                                className={`${styles.form_input} ${loginEmailError ? styles.input_error : ''}`}
                                                type="email"
                                                placeholder="name@societyconnect.com"
                                                value={loginEmail}
                                                onChange={(e) => {
                                                    setLoginEmail(e.target.value);
                                                    if (loginEmailError) setLoginEmailError('');
                                                }}
                                                required
                                                disabled={loading}
                                            />
                                            <div className={styles.input_icon}>
                                                <span className={`material-symbols-outlined`}>mail</span>
                                            </div>
                                        </div>
                                        {loginEmailError && <p className={styles.field_error}>{loginEmailError}</p>}
                                    </div>
                                    
                                    {/* Password Field */}
                                    <div className={styles.form_group}>
                                        <div className={styles.form_label_row}>
                                            <span className={styles.form_label}>Password</span>
                                            <Link className={styles.forgot_link} to='/forgot'>Forgot?</Link>
                                        </div>
                                        <div className={styles.input_container}>
                                            <input 
                                                className={`${styles.form_input} ${loginPasswordError ? styles.input_error : ''}`}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={loginPassword}
                                                onChange={(e) => {
                                                    setLoginPassword(e.target.value);
                                                    if (loginPasswordError) setLoginPasswordError('');
                                                }}
                                                required
                                                disabled={loading}
                                            />
                                            <button 
                                                type="button"
                                                className={styles.password_toggle}
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={loading}
                                            >
                                                <span className={`material-symbols-outlined`}>{showPassword ? "visibility" : "visibility_off"}</span>
                                            </button>
                                        </div>
                                        {loginPasswordError && <p className={styles.field_error}>{loginPasswordError}</p>}
                                    </div>

                                    {/* Remember Me Checkbox */}
                                    <div className={styles.remember_me}>
                                        <input
                                            className={styles.checkbox}
                                            type="checkbox"
                                            id="remember"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            disabled={loading}
                                        />
                                        <label htmlFor="remember" className={styles.checkbox_label}>Remember me for 30 days</label>
                                    </div>

                                    <button className={styles.submit_button} type="submit" disabled={loading}>
                                        {loading ? 'Logging in...' : 'Log In'}
                                    </button>
                                </form>

                                <div className={styles.divider}>
                                    <div className={styles.divider_line}></div>
                                    <span className={styles.divider_text}>Or register with</span>
                                    <div className={styles.divider_line}></div>
                                </div>

                                <div className={styles.social_auth}>
                                    <button className={styles.social_button_full} disabled={loading}>
                                        <img alt="Google logo"
                                            className={styles.social_icon_large}
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGc9NEWk8__Le43tDrEpGMbTgd6nsvyciNs_xHf70Oy0CRe8Ic0_XIi-NxGNnrkzKpgY8ZUDgGssJct0imRfJfsj1pr8kCqfoFZte0OoLpA9WUCrX4u_BtNDkPoWtFCRU2V5tMCprne5opTS0eHFte5ILR-2pwb5C8hOeiYmsHasrM_iWkwCRDJiwfPXEtLinQrZ5iultdYHQSXkQYZVSfqlUy-Za9DroTE-CJCzhDW8VENlhzqF27JQkY6p25LoQXaRRv1GKSCn2e"/>
                                        <span>Sign up with Google</span>
                                    </button>
                                </div>

                                <p className={styles.terms_text}>
                                    By clicking "Log In" you agree to our{' '}<a className={styles.terms_link} href="#">Terms of Service</a>{' '}and{' '}<a className={styles.terms_link} href="#">Privacy Policy</a>
                                </p>
                            </>
                        ) : (
                            <>
                                <div className={styles.auth_header_text}>
                                    <h2 className={styles.auth_title}>Create Account</h2>
                                    <p className={styles.auth_subtitle}>Join your society today. It takes less than a minute.</p>
                                </div>

                                <form className={styles.auth_form} onSubmit={handleSubmit}>
                                    {/* Full Name Field */}
                                    <div className={styles.form_group}>
                                        <label className={styles.form_label}>Full Name</label>
                                        <div className={styles.input_container}>
                                            <input 
                                                className={`${styles.form_input} ${signupNameError ? styles.input_error : ''}`}
                                                type="text"
                                                placeholder="John Doe"
                                                value={signupName}
                                                onChange={(e) => {
                                                    setSignupName(e.target.value);
                                                    if (signupNameError) setSignupNameError('');
                                                }}
                                                required
                                                disabled={loading}
                                            />
                                            <div className={styles.input_icon}>
                                                <span className={`material-symbols-outlined`}>person</span>
                                            </div>
                                        </div>
                                        {signupNameError && <p className={styles.field_error}>{signupNameError}</p>}
                                    </div>
                                    
                                    {/* Email Field */}
                                    <div className={styles.form_group}>
                                        <label className={styles.form_label}>Email Address</label>
                                        <div className={styles.input_container}>
                                            <input 
                                                className={`${styles.form_input} ${signupEmailError ? styles.input_error : ''}`}
                                                type="email"
                                                placeholder="name@societyconnect.com"
                                                value={signupEmail}
                                                onChange={(e) => {
                                                    setSignupEmail(e.target.value);
                                                    if (signupEmailError) setSignupEmailError('');
                                                }}
                                                required
                                                disabled={loading}
                                            />
                                            <div className={styles.input_icon}>
                                                <span className={`material-symbols-outlined`}>mail</span>
                                            </div>
                                        </div>
                                        {signupEmailError && <p className={styles.field_error}>{signupEmailError}</p>}
                                    </div>
                                    
                                    {/* Phone Number Field */}
                                    <div className={styles.form_group}>
                                        <label className={styles.form_label}>
                                            Phone Number <span className={styles.optional_text}>(Optional)</span>
                                        </label>
                                        <div className={styles.input_container}>
                                            <input 
                                                className={`${styles.form_input} ${signupPhoneError ? styles.input_error : ''}`}
                                                type="tel"
                                                placeholder="1234567890"
                                                value={signupPhone}
                                                onChange={(e) => {
                                                    setSignupPhone(e.target.value.replace(/\D/g, ''));
                                                    if (signupPhoneError) setSignupPhoneError('');
                                                }}
                                                disabled={loading}
                                                maxLength={10}
                                            />
                                            <div className={styles.input_icon}>
                                                <span className={`material-symbols-outlined`}>phone</span>
                                            </div>
                                        </div>
                                        {signupPhoneError && <p className={styles.field_error}>{signupPhoneError}</p>}
                                        <small className={styles.helper_text}>Enter 10-digit mobile number (optional)</small>
                                    </div>
                                    
                                    {/* Password Field */}
                                    <div className={styles.form_group}>
                                        <label className={styles.form_label}>Password</label>                                           
                                        <div className={styles.input_container}>
                                            <input 
                                                className={`${styles.form_input} ${signupPasswordError ? styles.input_error : ''}`}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                value={signupPassword}
                                                onChange={(e) => {
                                                    setSignupPassword(e.target.value);
                                                    if (signupPasswordError) setSignupPasswordError('');
                                                }}
                                                required
                                                disabled={loading}
                                            />
                                            <button 
                                                type="button"
                                                className={styles.password_toggle}
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={loading}
                                            >
                                                <span className={`material-symbols-outlined`}>{showPassword ? "visibility" : "visibility_off"}</span>
                                            </button>
                                        </div>
                                        {signupPasswordError && <p className={styles.field_error}>{signupPasswordError}</p>}
                                    </div>
                                    
                                    {/* Confirm Password Field */}
                                    <div className={styles.form_group}>
                                        <label className={styles.form_label}>Confirm Password</label>                                           
                                        <div className={styles.input_container}>
                                            <input 
                                                className={`${styles.form_input} ${signupConfirmPasswordError ? styles.input_error : ''}`}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                value={signupConfirmPassword}
                                                onChange={(e) => {
                                                    setSignupConfirmPassword(e.target.value);
                                                    if (signupConfirmPasswordError) setSignupConfirmPasswordError('');
                                                }}
                                                required
                                                disabled={loading}
                                            />
                                            <button 
                                                type="button"
                                                className={styles.password_toggle}
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={loading}
                                            >
                                                <span className={`material-symbols-outlined`}>{showConfirmPassword ? "visibility" : "visibility_off"}</span>
                                            </button>
                                        </div>
                                        {signupConfirmPasswordError && <p className={styles.field_error}>{signupConfirmPasswordError}</p>}
                                    </div>

                                    {/* Terms Agreement */}
                                    <div className={styles.terms_agreement}>
                                        <input
                                            className={styles.checkbox}
                                            type="checkbox"
                                            id="terms"
                                            checked={agreeTerms}
                                            onChange={(e) => {
                                                setAgreeTerms(e.target.checked);
                                                if (signupTermsError) setSignupTermsError('');
                                            }}
                                            required
                                            disabled={loading}
                                        />
                                        <label htmlFor="terms" className={styles.checkbox_label}>
                                            I agree to the{' '}
                                            <a className={styles.terms_link_inline} href="#">Terms of Service</a>
                                            {' '}and{' '}
                                            <a className={styles.terms_link_inline} href="#">Privacy Policy</a>
                                        </label>
                                    </div>
                                    {signupTermsError && <p className={styles.field_error}>{signupTermsError}</p>}

                                    <button className={styles.submit_button} type="submit" disabled={loading}>
                                        {loading ? 'Creating Account...' : 'Sign Up'}
                                    </button>
                                </form>
                                
                                <div className={styles.divider}>
                                    <div className={styles.divider_line}></div>
                                    <span className={styles.divider_text}>Or register with</span>
                                    <div className={styles.divider_line}></div>
                                </div>

                                <div className={styles.social_auth}>
                                    <button className={styles.social_button_full} disabled={loading}>
                                        <img alt="Google logo"
                                            className={styles.social_icon_large}
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGc9NEWk8__Le43tDrEpGMbTgd6nsvyciNs_xHf70Oy0CRe8Ic0_XIi-NxGNnrkzKpgY8ZUDgGssJct0imRfJfsj1pr8kCqfoFZte0OoLpA9WUCrX4u_BtNDkPoWtFCRU2V5tMCprne5opTS0eHFte5ILR-2pwb5C8hOeiYmsHasrM_iWkwCRDJiwfPXEtLinQrZ5iultdYHQSXkQYZVSfqlUy-Za9DroTE-CJCzhDW8VENlhzqF27JQkY6p25LoQXaRRv1GKSCn2e"/>
                                        <span>Sign up with Google</span>
                                    </button>
                                </div>

                                <p className={styles.switch_auth_text}>
                                    Already have an account?{' '}
                                    <button type="button" className={styles.switch_auth_link} onClick={() => toggleAuthMode('login')}>
                                        Log In
                                    </button>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;