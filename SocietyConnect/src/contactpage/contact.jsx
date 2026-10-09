import styles from './contact.module.css';
import icon from '../assets/logo.png';
import { useState, useEffect } from 'react';
import { Link,useNavigate  } from 'react-router-dom';

function ContactUs() {

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [userInitial, setUserInitial] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
    const checkLoginStatus = () => {
        const userSession = sessionStorage.getItem('userSession') || localStorage.getItem('userSession');
        if (userSession) {
            try {
                const userData = JSON.parse(userSession);
                setUserEmail(userData.email);
                setUserName(userData.name || userData.email.split('@')[0]);
                const initial = (userData.name ? userData.name.charAt(0) : userData.email.charAt(0)).toUpperCase();
                setUserInitial(initial);
                setIsLoggedIn(true);
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
    localStorage.removeItem('userSession');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('userSession');
    setIsLoggedIn(false);
    navigate('/');
    window.location.reload();
};

  return (
        <div className={styles.contact_page}>
            {/* TopNavBar */}
            <nav className={styles.navbar}>
                            <div className={styles.nav_container}>
                                <div className={styles.navcontent}>
                                    <div className={styles.navbrand}>
                                        <div className={styles.navlogo}>
                                            <span><img className={styles.navlogo} src={icon}></img></span>
                                        </div>
                                        <h2 className={styles.navtitle}>SocietyConnect</h2>
                                    </div>
            
                                        {/* Links */}
            
                                    <div className={styles.nav_desktop_menu}>
                                        <div className={styles.nav_links}>
                                        <Link className={styles.nav_link} to="/">Home</Link>
                                        <Link className={styles.nav_link} to="/features">Features</Link>
                                        <Link className={styles.nav_link} to="/about">About Us</Link>
                                        <Link className={`${styles.nav_link} ${styles.active}`} to="/contact">Contact</Link>
                                        </div>
            
                                        {/* Buttons */}
            
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

            <main className={styles.main_content}>
                {/* Hero Section */}
                <section className={styles.hero_section}>
                    <div className={styles.hero_badge}>
                        GET IN TOUCH
                    </div>
                    <h1 className={styles.hero_title}>
                        We're here to help build <br/><span className={styles.hero_highlight}>stronger communities.</span>
                    </h1>
                    <p className={styles.hero_subtitle}>
                        Whether you have questions about our features or need technical assistance, our team is ready to support your society's journey.
                    </p>
                </section>

                {/* Bento Grid Contact Info */}
                <section className={styles.contact_grid}>
                    {/* Email Card */}
                    <div className={styles.contact_card}>
                        <div className={styles.contact_icon}>
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <h3 className={styles.contact_card_title}>Email Support</h3>
                        <p className={styles.contact_card_description}>
                            Send us a message and we'll get back to you within 24 hours.
                        </p>
                        <a className={styles.contact_link} href="mailto:support@societyconnect.com">
                            support@societyconnect.com
                        </a>
                    </div>

                    {/* Phone Card */}
                    <div className={styles.contact_card}>
                        <div className={styles.contact_icon}>
                            <span className="material-symbols-outlined">call</span>
                        </div>
                        <h3 className={styles.contact_card_title}>Call Us</h3>
                        <p className={styles.contact_card_description}>
                            Available Monday to Friday, 9am - 6pm EST for urgent queries.
                        </p>
                        <a className={styles.contact_link} href="tel:+1800SOCIETY">
                            +1 800-SOCIETY
                        </a>
                    </div>

                    {/* Address Card */}
                    <div className={styles.contact_card}>
                        <div className={styles.contact_icon}>
                            <span className="material-symbols-outlined">location_on</span>
                        </div>
                        <h3 className={styles.contact_card_title}>Office Headquarters</h3>
                        <p className={styles.contact_card_description}>
                            Visit our main hub in the heart of the tech district.
                        </p>
                        <p className={styles.contact_address}>
                            123 Innovation Way, Suite 400<br/>San Francisco, CA 94105
                        </p>
                    </div>
                </section>

                {/* Visual Map Section */}
                <section className={styles.map_section}>
                    <div className={styles.map_container}>
                        <img 
                            className={styles.map_image} 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgsPskdtdS53TORqr-U4btW8NIui9QxjZLrdg8yj1S4gsKevixKXaCb7qqlCdIQpFyLmA3UNdBHxeupvtSdlErCp3G9uPPhfHXhIDsFhPd1YZFoBecCXWwife4fW-D423C66T_7u6WupwgRglV0XMp-QUfYp5vp5763AGOjZKkG7gjyh-tGtzSOgKA2etl389Vgdn-52sh1KnbdE89EbUyDdZklbrsIFjEFZvEdaUW_gDyAvO1-v8exi_AlhXj1CtMJ9bJHKl6LNhc" 
                            alt="Modern architectural map or minimalist satellite view of an urban district with clean lines and soft blue tones" 
                        />
                        <div className={styles.map_overlay}></div>
                        <div className={styles.map_info_card}>
                            <p className={styles.map_info_label}>Our Location</p>
                            <p className={styles.map_info_text}>Experience the pulse of SocietyConnect in downtown San Francisco.</p>
                        </div>
                    </div>
                </section>

                {/* Social Media Platforms */}
                <section className={styles.social_section}>
                    <div className={styles.social_container}>
                        <div className={styles.social_content}>
                            <div className={styles.social_text}>
                                <h2 className={styles.social_title}>Join our global community</h2>
                                <p className={styles.social_subtitle}>Stay updated with the latest news, events, and features.</p>
                            </div>
                            <div className={styles.social_icons}>
                                <a className={styles.social_icon_link} href="#">
                                    <span className="material-symbols-outlined">brand_family</span>
                                    <span className={styles.sr_only}>Facebook</span>
                                </a>
                                <a className={styles.social_icon_link} href="#">
                                    <span className="material-symbols-outlined">share</span>
                                    <span className={styles.sr_only}>Twitter</span>
                                </a>
                                <a className={styles.social_icon_link} href="#">
                                    <span className="material-symbols-outlined">work</span>
                                    <span className={styles.sr_only}>LinkedIn</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footer_container}>
                    <div className={styles.footer_brand_section}>
                        <div className={styles.footer_brand}>SocietyConnect</div>
                        <p className={styles.footer_copyright}>© 2024 SocietyConnect. All rights reserved.</p>
                    </div>
                    <div className={styles.footer_links_section}>
                        <a className={styles.footer_link} href="#">Privacy Policy</a>
                        <a className={styles.footer_link} href="#">Terms of Service</a>
                        <a className={styles.footer_link} href="#">Cookie Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default ContactUs;