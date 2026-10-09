import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './home.module.css';
import icon from '../assets/logo.png';

function Homepage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [userInitial, setUserInitial] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Check if user is logged in from session storage or local storage
        const checkLoginStatus = () => {
            const userSession = sessionStorage.getItem('userSession') || localStorage.getItem('userSession');
            if (userSession) {
                try {
                    const userData = JSON.parse(userSession);
                    setUserEmail(userData.email);
                    setUserName(userData.name || userData.email.split('@')[0]);
                    // Get first letter of name or email
                    const initial = (userData.name ? userData.name.charAt(0) : userData.email.charAt(0)).toUpperCase();
                    setUserInitial(initial);
                    setIsLoggedIn(true);
                    setUserRole(userData.role || 'user');
                    // Check if user is admin
                    if (userData.role === 'admin') {
                        setIsAdmin(true);
                    }
                } catch (error) {
                    console.error('Error parsing user session:', error);
                }
            }
        };

        checkLoginStatus();
    }, []);

    const handleProfileClick = () => {
        if (isAdmin) {
            navigate('/superadmin');
        } else {
            navigate('/member');
        }
    };

    const handleLogout = () => {
        // Clear user session
        localStorage.removeItem('userSession');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('userSession');
        setIsLoggedIn(false);
        navigate('/');
        window.location.reload(); // Refresh to update navbar
    };

    const handleGetStarted = () => {
        // Check if user is logged in
        if (isLoggedIn) {
            // If logged in, navigate to appropriate dashboard based on role
            if (isAdmin) {
                navigate('/superadmin');
            } else {
                navigate('/member');
            }
        } else {
            // If not logged in, navigate to login page
            navigate('/login');
        }
    };

    const handleViewDemo = () => {
        window.open('https://youtube.com/shorts/L2c39drDVuk?si=03zB56JKyu4mP3XC', '_blank');
    };

    return (
        <div className={styles.homepage}>
            <nav className={styles.navbar}>
                <div className={styles.nav_container}>
                    <div className={styles.navcontent}>
                        <div className={styles.navbrand}>
                            <div className={styles.navlogo}>
                                <span><img className={styles.navlogo} src={icon} alt="logo" /></span>
                            </div>
                            <h2 className={styles.navtitle}>SocietyConnect</h2>
                        </div>

                        {/* Links */}
                        <div className={styles.nav_desktop_menu}>
                            <div className={styles.nav_links}>
                                <Link className={`${styles.nav_link} ${styles.active}`} to="/">Home</Link>
                                <Link className={styles.nav_link} to="/features">Features</Link>
                                <Link className={styles.nav_link} to="/about">About Us</Link>
                                <Link className={styles.nav_link} to="/contact">Contact</Link>
                            </div>

                            {/* Buttons - Show based on login status */}
                            <div className={styles.nav_buttons}>
                                {!isLoggedIn ? (
                                    <button className={`${styles.nav_btn_secondary} ${styles.nav_btn}`}>
                                        <span><Link className={styles.nav_link} to="/login">Log In</Link></span>
                                    </button>
                                ) : (
                                    <div className={styles.profile_container}>
                                        <button 
                                            className={styles.profile_button}
                                            onClick={handleProfileClick}
                                        >
                                            <div className={styles.profile_avatar}>
                                                {userInitial}
                                            </div>
                                            <span className={styles.profile_name}>{userName}</span>
                                            {isAdmin && <span className={styles.admin_badge}>Admin</span>}
                                            <span className={`material-symbols-outlined ${styles.chevron_icon}`}>
                                                chevron_right
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <section className={styles.main_section}>
                    <div className={styles.main_container}>
                        <div className={styles.main_content_wrapper}>
                            <div className={styles.main_content}>
                                <div className={styles.main_text_container}>
                                    <div className={styles.main_text}>
                                        <div className={styles.main_headings}>
                                            <h1 className={styles.main_title}>
                                                Connect, Manage, and <span className={styles.highlight}>Grow</span> Your Society.
                                            </h1>
                                            <h2 className={styles.main_subtitle}>
                                                The all-in-one platform for university clubs, local communities, and professional groups to streamline membership and boost engagement.
                                            </h2>
                                        </div>
                                        <div className={styles.main_cta_buttons}>
                                            <button 
                                                className={`${styles.cta_button_primary} ${styles.cta_btn}`}
                                                onClick={handleGetStarted}
                                            >
                                                <span>Get Started Free</span>
                                            </button>
                                            <button 
                                                className={`${styles.cta_button_secondary} ${styles.cta_btn}`}
                                                onClick={handleViewDemo}
                                            >
                                                <span>View Demo</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.main_image_container}>
                                        <div className={styles.main_image_wrapper}>
                                            <div className={styles.main_image} style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBairF3cwoEKueq72Z875uXRoHa2IXocA6BfwhAi_hF3y8X4v9xCeSFguZeaHbNmHdSWhuhX4sAXylTlxGzceD1SRQ17_j9IQf105oTbp3ay_ZuDlw253q1dEtRPdGYHth9BPyJlsqm2sTILTwonnOJ_CBOXSIWdxfKLjSv6ZczOhKu1G7iQ7KMwRP82HvgSFB18V1yEWmBPVzkC68s-XZh-Zub8bs_Y3CeOdDQ5IhMzIqd9h3E0xRjHHE2I8hNRQ-dsv7-mjbRV51K')" }}></div>
                                            <div className={styles.main_image_overlay}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.logos_section}>
                    <div className={styles.logos_container}>
                        <p className={styles.logos_title}>
                            Empowering groups everywhere
                        </p>
                        <div className={styles.logos_grid}>
                            <div className={styles.logo_items}>
                                <span className={`material-symbols-outlined ${styles.logo_icon}`}>spa</span>
                                <span className={styles.logo_text}>GreenLife</span>
                            </div>
                            <div className={styles.logo_items}>
                                <span className={`material-symbols-outlined ${styles.logo_icon}`}>school</span>
                                <span className={styles.logo_text}>UniConnect</span>
                            </div>
                            <div className={styles.logo_items}>
                                <span className={`material-symbols-outlined ${styles.logo_icon}`}>code</span>
                                <span className={styles.logo_text}>DevGuild</span>
                            </div>
                            <div className={styles.logo_items}>
                                <span className={`material-symbols-outlined ${styles.logo_icon}`}>brush</span>
                                <span className={styles.logo_text}>ArtSociety</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.feature_section}>
                    <div className={styles.feature_container}>
                        <div className={styles.feature_header}>
                            <h2 className={styles.feature_title}>
                                Everything you need to run your community
                            </h2>
                            <p className={styles.feature_subtitle}>
                                Powerful tools designed to reduce administrative burden so you can focus on building connections.
                            </p>
                        </div>
                        <div className={styles.feature_grid}>
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>dashboard</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Unified Dashboard</h3>
                                    <p className={styles.feature_description}>Manage member directories, roles, and permissions in one centralized, intuitive interface.</p>
                                </div>
                            </div>
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>notifications_active</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Smart Notifications</h3>
                                    <p className={styles.feature_description}>Blast announcements via email or push notifications to ensure 100% reach for critical updates.</p>
                                </div>
                            </div>
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>calendar_month</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Event Planning</h3>
                                    <p className={styles.feature_description}>Create events, track RSVPs in real-time, and manage ticketing seamlessly within the platform.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.working_section}>
                    <div className={styles.working_section_container}>
                        <div className={styles.section_header}>
                            <h2 className={styles.section_title}>How It Works</h2>
                            <p className={styles.section_subtitle}>Simple workflows for organizers and members alike.</p>
                        </div>

                        <div className={`${styles.workflow_row} ${styles.workflow_row_reverse}`}>
                            <div className={styles.workflow_content}>
                                <div className={`${styles.workflow_badge} ${styles.workflow_badge_blue}`}>
                                    For Admins
                                </div>
                                <h3 className={styles.workflow_title}>Launch your group in minutes</h3>
                                <p className={styles.workflow_description}>
                                    Skip the spreadsheets. Set up your society profile, customize your branding, and invite members via link or email import. Our onboarding wizard handles the technical setup so you can focus on the mission.
                                </p>
                                <ul className={styles.workflow_list}>
                                    <li className={styles.workflow_list_items}>
                                        <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                        <span>Custom branding and URL</span>
                                    </li>
                                    <li className={styles.workflow_list_items}>
                                        <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                        <span>Automated welcome emails</span>
                                    </li>
                                    <li className={styles.workflow_list_items}>
                                        <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                        <span>Role-based access control</span>
                                    </li>
                                </ul>
                            </div>
                            <div className={styles.workflow_image}>
                                <div className={styles.image_placeholder} style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBpFRqc8vGR0s0f-H2scLLbRt2-GQbaTxGOKwIYV6-wK6_FM5XIOWq0FdcXRm-kmzciuBdz3gq0MVu77netSaqSSG3N5lg6HOGRvnkHoarp9HAAHktEF8kIIqM3rnMIdCaKpstqVyX876D2L8PQkr54cx0dHqGkEeEmcM9wH5kp9nPfYSIX2JVldi7bYquvRYtBblqSBwNnIoVuLPupA5ezJ-2Dp31v_Aj6hu01HmIox8Z4Osm7lJbSZAqjRrbDF8quinrJj2ONHTeT')" }}></div>
                            </div>
                        </div>

                        <div className={`${styles.workflow_row} ${styles.workflow_row_reverse}`}>
                            <div className={styles.workflow_image}>
                                <div className={styles.image_placeholder} style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBasr3ObL5q0JT1vOtdCHHeFtcy3WXnXn72xV8r4fEpY_ioE0YTTL0N8gWJdvE-tjZoSa31MxjOVW4OISDErrYNwm5ZWyborIPRF7m4mPD7jMXLruYbtxPeopy3JcuY4B5oL0Cj5sA-R5F7aEzIGHh-eqO1SJzxy1m9tDkyHh4fKdqeLbX2h0jW4jVlHNMrEncuGpDkef26VeNWp-h3x6pvuHQZ3BU0OcWBexHmvKgKkYBQE15GvH1MyqByho-7q3fdKxNlka6WbxCh')" }}></div>
                            </div>
                            <div className={styles.workflow_content}>
                                <div className={`${styles.workflow_badge} ${styles.workflow_badge_teal}`}>
                                    For Members
                                </div>
                                <h3 className={styles.workflow_title}>Stay connected, effortlessly</h3>
                                <p className={styles.workflow_description}>Members get a dedicated portal to see upcoming events, pay dues, and connect with peers. No more lost emails or missed Facebook group posts.</p>
                                <div className={styles.workflow_link}>
                                    <button className={styles.text_link}>
                                        Learn about the member features
                                        <span className={`material-symbols-outlined ${styles.arrow_icon}`}>arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.cta_section}>
                    <div className={styles.cta_container}>
                        <h2 className={styles.cta_title}>Ready to transform your community?</h2>
                        <p className={styles.cta_subtitle}>Join thousands of societies building stronger connections today.</p>
                        <div className={styles.cta_buttons}>
                            <button 
                                className={`${styles.cta_button} ${styles.cta_button_white}`}
                                onClick={handleGetStarted}
                            >
                                Get Started for Free
                            </button>
                            <button 
                                className={`${styles.cta_button} ${styles.cta_button_outline}`}
                                onClick={handleViewDemo}
                            >
                                View Demo
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footer_container}>
                    <div className={styles.footer_grid}>
                        <div className={styles.footer_brand}>
                            <div className={styles.footer_logo}>
                                <span><img className={styles.navlogo} src={icon} alt="logo" /></span>
                                <span className={styles.footer_brand_text}>SocietyConnect</span>
                            </div>
                            <p className={styles.footer_description}>Building better communities,<br />one society at a time.</p>
                        </div>
                        <div className={styles.footer_links}>
                            <h4 className={styles.footer_heading}>Product</h4>
                            <ul className={styles.footer_list}>
                                <li><a className={styles.footer_link} href="#">Features</a></li>
                                <li><a className={styles.footer_link} href="#">Pricing</a></li>
                                <li><a className={styles.footer_link} href="#">Integrations</a></li>
                                <li><a className={styles.footer_link} href="#">Changelog</a></li>
                            </ul>
                        </div>
                        <div className={styles.footer_links}>
                            <h4 className={styles.footer_heading}>Resources</h4>
                            <ul className={styles.footer_list}>
                                <li><a className={styles.footer_link} href="#">Community Blog</a></li>
                                <li><a className={styles.footer_link} href="#">Help Center</a></li>
                                <li><a className={styles.footer_link} href="#">Guidebooks</a></li>
                                <li><a className={styles.footer_link} href="#">API Docs</a></li>
                            </ul>
                        </div>
                        <div className={styles.footer_links}>
                            <h4 className={styles.footer_heading}>Company</h4>
                            <ul className={styles.footer_list}>
                                <li><a className={styles.footer_link} href="#">About Us</a></li>
                                <li><a className={styles.footer_link} href="#">Careers</a></li>
                                <li><a className={styles.footer_link} href="#">Legal</a></li>
                                <li><a className={styles.footer_link} href="#">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.footer_bottom}>
                        <p className={styles.footer_copyright}>© 2023 SocietyConnect Inc. All rights reserved.</p>
                        <div className={styles.footer_social}>
                            <a className={styles.social_link} href="#">
                                <span className={styles.sr_only}>Twitter</span>
                                <svg className={styles.social_icon} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                </svg>
                            </a>
                            <a className={styles.social_link} href="#">
                                <span className={styles.sr_only}>GitHub</span>
                                <svg className={styles.social_icon} fill="currentColor" viewBox="0 0 24 24">
                                    <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Homepage;