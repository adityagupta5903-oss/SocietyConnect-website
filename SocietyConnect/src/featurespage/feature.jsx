import styles from './feature.module.css'
import { useState, useEffect } from 'react';
import { Link ,useNavigate } from 'react-router-dom';
import icon from '../assets/logo.png'  
function featurespage(){

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [userInitial, setUserInitial] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('admin');


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

    return(
        <>
        <div className={styles.feature_page}>
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
                            <Link className={`${styles.nav_link} ${styles.active}`} to="/features">Features</Link>
                            <Link className={styles.nav_link} to="/about">About Us</Link>
                            <Link className={styles.nav_link} to="/contact">Contact</Link>
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
                {/* main section */}
                <section className={styles.main_section_features}>
                    <div className={styles.main_bg_overlay}></div>
                        <div className={styles.main_container}>
                            <div className={styles.main_grid}>
                                <div className={styles.main_text_content}>
                                    <div className={styles.main_text}>
                                        <span className={styles.main_badge}>Features Overview</span>
                                        <h1 className={styles.main_title}>Empower Your Community With <span className={styles.hightlight}>SocietyConnect</span></h1>
                                        <p className={styles.main_subtitle}>The all-in-one platform designed to help you manage, engage, and grow your society effectively without the administrative headache.</p>
                                    
                                        {/* <div className={styles.main_cta_buttons}>
                                            <button className={`${styles.cta_btn} ${styles.cta_button_primary}`}>Get Started Free</button>
                                            <button className={`${styles.cta_btn} ${styles.cta_button_secondary}`}>View Demo</button>
                                        </div> */}
                                    </div>
                                </div>
                                <div className={styles.main_image_content}>
                                    <div className={styles.main_image_wrapper}>
                                        <div className={styles.main_image_features} style={{ 
                                            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpeqCNlduUyLJoX6RfhtCPKS-odAwjY5N9bEBv0gFwtR3dLdpMyfaMmm8pbRFsYj4iV_dyMwdjR-A_j42CNUiOYt9FVf6QuUdeRfosbD_uj5Tc0wU1rqxxGz61kTOqZ2giSKEM_gOrXmSv77dRugIF23Uv498WxLtM6lhGByQ4ZKTU9G4Rlbe7e_v6MBYTMOmJyyULQx-730czdHnXEzpG1FsjKU6LHdUA79KBv2yr-3sIVQ_q_tDVLwlzLuiRGUcITA6vOzwOraks')"
                                            }}>
                                                <div className={styles.image_overlay}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </section>

                {/* feature section */}
                <section className={styles.features_grid_section}>
                    <div className={styles.features_grid_container}>
                        <div className={styles.features_header}>
                            <h2 className={styles.features_title}>Everything you need to run a society</h2>
                            <p className={styles.features_subtitle}>Our platform provides essential tools to streamline operations and boost engagement across your entire organization.</p>
                        </div>
                        <div className={styles.features_grid}>

                            {/* feature 1 */}
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>groups</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Group Management</h3>
                                    <p className={styles.feature_description}>Create subgroups and committees easily to organize your structure. Assign leaders and manage permissions effortlessly.</p>
                                </div>
                            </div>

                            {/* feature 2 */}
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>campaign</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Smart Announcements</h3>
                                    <p className={styles.feature_description}>Push notifications ensure urgent updates reach everyone instantly. Segment messages by group or role.</p>
                                </div>
                            </div>

                            {/* feature 3 */}
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>contacts</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Member Directory</h3>
                                    <p className={styles.feature_description}> A fully searchable database of all current members at your fingertips. Find contact info and skills quickly.</p>
                                </div>
                            </div>

                            {/* feature 4 */}
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>event</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Event Scheduling</h3>
                                    <p className={styles.feature_description}> Plan meetings and social gatherings with integrated RSVPs. Sync directly to members' personal calendars.</p>
                                </div>
                            </div>

                            {/* feature 5 */}
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>payment</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Dues & Payments</h3>
                                    <p className={styles.feature_description}> Collect membership fees and event tickets securely online. Track payment status in real-time.</p>
                                </div>
                            </div>

                            {/* feature 6 */}
                            <div className={styles.feature_card}>
                                <div className={styles.feature_icon}>
                                    <span className={`material-symbols-outlined`}>analytics</span>
                                </div>
                                <div className={styles.feature_content}>
                                    <h3 className={styles.feature_title}>Engagement Analytics</h3>
                                    <p className={styles.feature_description}> Understand your community better with data on event attendance, message open rates, and activity.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* persona tabs section */}
                <section className={styles.persona_section}>
                    <div className={styles.persona_container}>
                        <div className={styles.persona_header}>
                            <h2 className={styles.persona_title}>Tailored for Every Role</h2>
                            <p className={styles.persona_subtitle}>See how SocietyConnect benefits different members of your organization.</p>
                        </div>

                        {/* tabs navigation */}
                        <div className={styles.tabs_container}>
                            <div className={styles.tabs_nav}>
                                <button 
                                    className={`${styles.tab_button} ${activeTab === 'admin' ? styles.tab_button_active : ''}`}
                                    onClick={() => setActiveTab('admin')}
                                >
                                    <span>For Administrators</span>
                                    {activeTab === 'admin' && <div className={styles.tab_indicator}></div>}
                                </button>
                                <button 
                                    className={`${styles.tab_button} ${activeTab === 'member' ? styles.tab_button_active : ''}`}
                                    onClick={() => setActiveTab('member')}
                                >
                                    <span>For Members</span>
                                    {activeTab === 'member' && <div className={styles.tab_indicator}></div>}
                                </button>
                            </div>
                        </div>

                        {/* tab for admin */}
                        {activeTab === 'admin' && (
                            <div className={styles.tab_content}>
                                <div className={styles.tab_grid}>
                                    <div className={styles.tab_text}>
                                        <h3 className={styles.tab_content_title}>Effortless Administration</h3>
                                        <p className={styles.tab_content_description}> Stop using spreadsheets and disjointed tools. Our admin panel gives you total control over your society's operations in one secure place.</p>
                                        <ul className={styles.feature_list}>
                                            <li className={styles.feature_list_items}>
                                                <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                                <div>
                                                    <h4>Automated Renewals</h4>
                                                    <p>Set up automatic reminders for membership dues.</p>
                                                </div>
                                            </li>
                                            <li className={styles.feature_list_items}>
                                                <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                                <div>
                                                    <h4>Role-Based Access</h4>
                                                    <p>Granular permissions for treasurer, secretary, and more.</p>
                                                </div>
                                            </li>
                                            <li className={styles.feature_list_items}>
                                                <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                                <div>
                                                    <h4>Audit Logs</h4>
                                                    <p>Track every change made to your society's data.</p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className={styles.tab_image}>
                                        <div className={styles.image_wrapper}>
                                            <div className={styles.image_placeholder} style={{ 
                                                backgroundImage: "url('https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* tab for members */}
                        {activeTab === 'member' && (
                            <div className={styles.tab_content}>
                                <div className={styles.tab_grid}>
                                    <div className={styles.tab_text}>
                                        <h3 className={styles.tab_content_title}>Seamless Member Experience</h3>
                                        <p className={styles.tab_content_description}> Join your community, stay updated, and participate in events - all from one intuitive dashboard designed for members.</p>
                                        <ul className={styles.feature_list}>
                                            <li className={styles.feature_list_items}>
                                                <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                                <div>
                                                    <h4>Personal Dashboard</h4>
                                                    <p>View upcoming events, announcements, and dues at a glance.</p>
                                                </div>
                                            </li>
                                            <li className={styles.feature_list_items}>
                                                <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                                <div>
                                                    <h4>Easy Communication</h4>
                                                    <p>Receive instant notifications and engage with community discussions.</p>
                                                </div>
                                            </li>
                                            <li className={styles.feature_list_items}>
                                                <span className={`material-symbols-outlined ${styles.list_icon}`}>check_circle</span>
                                                <div>
                                                    <h4>Quick Payments</h4>
                                                    <p>Pay membership dues and event fees in just a few clicks.</p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className={styles.tab_image}>
                                        <div className={styles.image_wrapper}>
                                            <div className={styles.image_placeholder} style={{ 
                                                backgroundImage: "url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* split screen feature highlight */}
                <section className={styles.split_feature_section}>
                    <div className={styles.split_container}>

                        {/* Image Left ,Text Right */}
                        <div className={styles.split_row}>
                            <div className={styles.split_image}>
                                <div className={styles.decorative_element}></div>
                                <div className={styles.image_container}>
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2UIV-z4uFo7JbewsQh9KuB1o0okRrTggxOZMQucub5_rKGqV3K7ETNgJ4FkR07VJVdxtK5VCGLfHf-Pv8Ec0lnYpp8oXyjIr4r7pIh6qA56f4wsuOkcOhpoVKqxzP0C5fI6RgJ3V5PzVQefkmgc1PSwIa1WlT4_4ZPX-5muhr3nwBSUtiHNGWtOci1ZfyJDw6rJSclaixGBZMMeIfNJAbhwp8TV9Ekgo2Hrmt9ObAZEt4P5r_6AXEAFkn8vDkf3wKFbrWCS6viHev" alt='mobile notification' className={styles.feature_image}></img>
                                </div>
                            </div>

                            <div className={styles.split_text}>
                                <div className={styles.feature_badge}>
                                    <span className={`material-symbols-outlined`}>notifications_active</span>Communication
                                </div>
                                <h2 className={styles.split_title}>Real-time connection, right in their pocket.</h2>
                                <p className={styles.split_description}>Traditional emails get lost in spam folders. SocietyConnect brings your community to the mobile era with a dedicated feed and push notifications.</p>
                                <div className={styles.feature_points}>

                                    <div className={styles.feature_point}>
                                        <div className={styles.point_icon}>
                                            <span className={`material-symbols-outlined`}>send</span>
                                        </div>
                                        <div>
                                            <h4>Instant Broadcasts</h4>
                                            <p>Send urgent alerts in seconds.</p>
                                        </div>
                                    </div>

                                    <div className={styles.feature_point}>
                                        <div className={styles.point_icon}>
                                            <span className={`material-symbols-outlined`}>forum</span>
                                        </div>
                                        <div>
                                            <h4>Discussion Boards</h4>
                                            <p>Foster conversation on specific topics.</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Text left , Image Right */}
                        <div className={`${styles.split_row} ${styles.split_row_reverse}`}>
                            <div className={styles.split_text}>
                                <div className={`${styles.feature_badge} ${styles.feature_badge_indigo}`}>
                                    <span className={`material-symbols-outlined`}>lock</span>Privacy First
                                </div>
                                <h2 className={styles.split_title}>Secure, Private, and Compliant.</h2>
                                <p className={styles.split_description}>Your member data is your most valuable asset. We treat it that way with enterprise-grade security and strict privacy controls.</p>
                                
                                <ul className={styles.security_list}>
                                    <li className={styles.security_item}>
                                        <span className={`material-symbols-outlined ${styles.span_icon}`}>lock</span>
                                        <span>End-to-end encryption for sensitive data</span>
                                    </li>
                                    <li className={styles.security_item}>
                                        <span className={`material-symbols-outlined ${styles.span_icon}`}>verified_user</span>
                                        <span>GDPR & CCPA Compliant framework</span>
                                    </li>
                                    <li className={styles.security_item}>
                                        <span className={`material-symbols-outlined ${styles.span_icon}`}>cloud_done</span>
                                        <span>Daily automated backups</span>
                                    </li>
                                </ul>
                                <button className={styles.learn_more_button}>
                                    Learn more about security
                                    <span className={`material-symbols-outlined ${styles.span_icon}`}>arrow_forward</span>
                                </button>

                            </div>
                            <div className={styles.split_image}>
                                <div className={`${styles.image_container} ${styles.image_container_border}`}>
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTC867nsqTY0rJfuh2baOGpz_ny_kUVWTENmNJT1BAmbuDsksFMx7GR_kiOMr_fc-dcpEDoMNkY6R-MiRqOMmO8NEgq5kmOMLOElWpSfnSN3DHq3-u9c--ilMGnVjbWKSlbnZYhChOzL7czjnNOcq2sGUj-fvryKmF3JEFkyJ98YMztOz5z7BLJzOYDZLUY-ac44GYVyNaM4FzPPMKy2GNYMs216l3f2LX0Cee44yDaqsAuocd8Dwvgn2vIYoDz9xlvThUyYK0cjD7" 
                                         alt="Security Visualization" className={styles.feature_image}></img>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
                                    
                {/* Testimonial Section */}
                <section className={styles.testimonial_section}>
                    <div className={styles.testimonial_container}>
                        <div className={styles.testimonial_content}>
                            <span className={`material-symbols-outlined ${styles.quote_icon}`}>format_quote</span>
                            <h2 className={styles.testimonial_text}>"SocietyConnect transformed how we operate. Engagement is up 40% and our admin time is cut in half."</h2>
                            <div className={styles.testimonial_author}>
                                <div className={styles.author_avatar}>
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYWw1X85tRP4mgBnRa409wf6gmXdzbua-2Taq9u5MsaKY0MfqkLDT9uM9NfvZ4MzJo8HuiX6PP_f8bnULDxz2v4AauJFwqlhIPi6F7goAKad21x_bXGhxt6umjirI8RjHe_a0chFxON43WAGuWirTPpSdsrQccz-PRqYZO4_McW4L0wkQpIxw7qOoW-kwtSwIwbO4-eb9oP8yeH5U0ZcuOY1pOPpBohXYWrXwlz4FezObtuLDXojZOtqvHgEwB9eVgrH2qDJiqOmBI" 
                                         alt="Michael Chen"></img>
                                </div>
                                <div className={styles.author_info}>
                                    <p className={styles.author_name}>Michael Chen</p>
                                    <p className={styles.author_role}>President, University Engineering Society</p>
                                </div>
                            </div> 
                            <div className={styles.testimonial_dots}>
                                <div className={`${styles.dot} ${styles.dot_active}`}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div> 
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.cta_section_features}>
                    <div className={styles.cta_container_features}>
                        <h2 className={styles.cta_title}>Ready to organize your society?</h2>
                        <p className={styles.cta_subtitle}>Join thousands of communities using SocietyConnect to streamline operations and focus on what matters—people.</p>
                        {/* <div className={styles.cta_buttons_features}>
                            <button className={`${styles.cta_btn} ${styles.cta_button_white}`}>Get Started Now</button>
                            <button className={`${styles.cta_btn} ${styles.cta_button_outline}`}>Talk to Sales</button>
                        </div> */}
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className={styles.footer_features}>
                <div className={styles.footer_container_features}>
                    <div className={styles.footer_grid}>
                        <div className={styles.footer_brand}>
                            <div className={styles.footer_logo}>
                                <span><img className={styles.navlogo} src={icon}></img></span>   
                                <span className={styles.footer_brand_text}>SocietyConnect</span>
                            </div>
                            <p className={styles.footer_description}>Building better communities through technology. The modern OS for societies everywhere.</p>
                        </div>
                        <div className={styles.footer_links_grid}>
                            <div className={styles.footer_links}>
                                <h4 className={styles.footer_heading}>Product</h4>
                                <ul className={styles.footer_list}>
                                    <li><a className={styles.footer_link} href='#'>Features</a></li>
                                    <li><a className={styles.footer_link} href='#'>Pricing</a></li>
                                    <li><a className={styles.footer_link} href='#'>Integrations</a></li>
                                    <li><a className={styles.footer_link} href='#'>Changelog</a></li>
                                </ul>
                            </div>
                            <div className={styles.footer_links}>
                                <h4 className={styles.footer_heading}>Resources</h4>
                                <ul className={styles.footer_list}>
                                    <li><a className={styles.footer_link} href='#'>Documentation</a></li>
                                    <li><a className={styles.footer_link} href='#'>API Reference</a></li>
                                    <li><a className={styles.footer_link} href='#'>Community</a></li>
                                    <li><a className={styles.footer_link} href='#'>Help Center</a></li>
                                </ul>
                            </div>
                            <div className={styles.footer_links}>
                                <h4 className={styles.footer_heading}>Company</h4>
                                <ul className={styles.footer_list}>
                                    <li><a className={styles.footer_link} href='#'>About</a></li>
                                    <li><a className={styles.footer_link} href='#'>Blog</a></li>
                                    <li><a className={styles.footer_link} href='#'>Careers</a></li>
                                    <li><a className={styles.footer_link} href='#'>Contact</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className={styles.footer_bottom}>
                        <p className={styles.footer_copyright}>© 2023 SocietyConnect Inc. All rights reserved.</p>
                        <div className={styles.footer_social}>
                            <a className={styles.social_link} href='#'>
                                <span className={`material-symbols-outlined`}>thumb_up</span>
                            </a>
                            <a className={styles.social_link} href='#'>
                                <span className={`material-symbols-outlined`}>share</span>
                            </a>
                            <a className={styles.social_link} href='#'>
                                <span className={`material-symbols-outlined`}>mail</span>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
        </>
    );
};

export default featurespage