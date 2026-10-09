import { Link,useNavigate  } from 'react-router-dom';
import { useState, useEffect } from 'react';
import icon from '../assets/logo.png'
import Countup from 'react-countup';
import styles from './about.module.css'

function aboutUspage(){
     const teamMembers = [
    {
        id: 1,
        name: "Sidda Bhuvan Kumar",
        role: "Lead Developer",
        image: null, // Use null for default image
        defaultIcon: "developer_mode"
    },
    {
        id: 2,
        name: "Tribhuvan Yadav",
        role: "Backend Leader",
        image: null, // Use null for default image
        defaultIcon: "storage"
    },
    {
        id: 3,
        name: "Aditya Gupta",
        role: "Frontend Leader",
        image: null, // Use null for default image
        defaultIcon: "web"
    },
];

  const timelineData = [
    {
      year: "2020",
      title: "Founded",
      description: "Started with a simple idea to help university clubs manage their events.",
      icon: "lightbulb"
    },
    {
      year: "2021",
      title: "First 100 Societies",
      description: "Reached a major milestone with active user bases across 5 campuses.",
      icon: "groups"
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Secured investment to expand features and support professional associations.",
      icon: "trending_up"
    },
    {
      year: "2023 - Present",
      title: "Global Expansion",
      description: "Now serving communities in over 15 countries worldwide.",
      icon: "public"
    }
  ];

  const trustedOrganizations = [
    { name: "UniGlobal", icon: "school" },
    { name: "TechGuild", icon: "diversity_3" },
    { name: "ScienceHub", icon: "science" },
    { name: "ArtCollective", icon: "palette" }
  ];

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

    return(
        <>
        <div className={styles.about_page}>
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
                            <Link className={`${styles.nav_link} ${styles.active}`} to="/about">About Us</Link>
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
            
            <main className={styles.about_main}>
                {/* main Section */}
                <section className={styles.about_main_section}>
                    <div className={styles.main_container}>
                        <div className={styles.main_grid}>
                        <div className={styles.main_text_content}>
                            <div className={styles.main_text}>
                            <span className={styles.main_badge}>About Us</span>
                            <h1 className={styles.main_title}>Empowering Communities to Thrive Together</h1>
                            <p className={styles.main_subtitle}>
                                SocietyConnect provides the digital infrastructure to turn loose groups into tight-knit communities. 
                                Manage members, post announcements, and grow your society seamlessly.
                            </p>
                            </div>
                        </div>
                        <div className={styles.main_image_content}>
                            <div 
                            className={styles.main_image} 
                            style={{ 
                                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAl6CUq_6sSnHkRLp43CNfrB5EZiroTkCAAjwDCaUoEaSef3A-LH8X-24xecY__qCgl0q_vjj5zEwEsiUQrRtY8prOcSz95btdLkEolxYLcgqHwGivLP_nREI27DjugbJ2G8UpBXBy6sYbYE1T3jbpsyyy9n_EdMvNXqDivAloToMRqp9k3CMmmPJ_uCXcBsGCT2cPTP5Kba3hiL-_6weWqBTu-LC-M-xzDB_M2qV0UrHyEvCKOVC7igp-ZZcatXekTO6JOmkn4WKV1')"
                            }}
                            ></div>
                        </div>
                        </div>
                    </div>
                </section>

                {/* Trusted By Strip */}
                <section className={styles.trusted_section}>
                    <div className={styles.trusted_container}>
                        <p className={styles.trusted_title}>Trusted by leading organizations</p>
                        <div className={styles.trusted_logos}>
                        {trustedOrganizations.map((org, index) => (
                            <div key={index} className={styles.logo_item}>
                            <span className={`${styles.logo_icon} material-symbols-outlined`}>{org.icon}</span>
                            <span>{org.name}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className={styles.stats_section}>
                    <div className={styles.stats_container}>
                        <div className={styles.stats_grid}>
                        <div className={styles.stat_card}>
                            <p className={styles.stat_label}>Active Societies</p>
                            <p className={styles.stat_value}><Countup start={0} end={500} duration={3} prefix="+"/></p>
                        </div>
                        <div className={styles.stat_card}>
                            <p className={styles.stat_label}>Members Connected</p>
                            <p className={styles.stat_value}><Countup start={0} end={50000} duration={3} prefix="+"/></p>
                        </div>
                        <div className={styles.stat_card}>
                            <p className={styles.stat_label}>Events Hosted</p>
                            <p className={styles.stat_value}><Countup start={0} end={1200} duration={3} prefix="+"/></p>
                        </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section className={styles.mission_section}>
                    <div className={styles.mission_container}>
                        <div className={styles.mission_header}>
                            <h2 className={styles.mission_title}>Our Mission & Vision</h2>
                            <p className={styles.mission_subtitle}>
                                We are driven by a singular purpose: to give every group the tools they need to organize efficiently and make a real impact.
                            </p>
                        </div>
                        <div className={styles.mission_cards}>
                            <div className={styles.mission_card}>
                                <div className={styles.card_icon}>
                                <span className={`material-symbols-outlined ${styles.target_icon}`}>target</span>
                                </div>
                                <div className={styles.card_content}>
                                    <h3 className={styles.card_title}>Our Mission</h3>
                                    <p className={styles.card_description}>
                                        To provide the digital infrastructure that turns loose groups into tight-knit communities, enabling seamless communication and organization.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.mission_card}>
                                <div className={styles.card_icon}>
                                    <span className={`material-symbols-outlined ${styles.visibility_icon}`}>visibility</span>
                                </div>
                                <div className={styles.card_content}>
                                    <h3 className={styles.card_title}>Our Vision</h3>
                                    <p className={styles.card_description}>
                                        A world where every society, regardless of size, has the professional tools to organize, grow, and make a lasting impact on their members.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className={styles.timeline_section}>
                    <div className={styles.timeline_container}>
                        <h2 className={styles.timeline_title}>Our Journey</h2>
                        <div className={styles.timeline}>
                        {timelineData.map((item, index) => (
                            <div key={index} className={styles.timeline_item}>
                                <div className={styles.timeline_indicator}>
                                    <div className={styles.timeline_icon}>
                                        <span className={`material-symbols-outlined ${styles.timeline_icon_symbol}`}>{item.icon}</span>
                                    </div>
                                    {index < timelineData.length - 1 && <div className={styles.timeline_line}></div>}
                                </div>
                                <div className={styles.timeline_content}>
                                    <div className={styles.timeline_card}>
                                        <span className={styles.timeline_year}>{item.year}</span>
                                        <h3 className={styles.timeline_card_title}>{item.title}</h3>
                                        <p className={styles.timeline_card_description}>{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                
                <section className={styles.team_section}>
                    <div className={styles.team_container}>
                        <div className={styles.team_header}>
                            <h2 className={styles.team_title}>Meet the Builders</h2>
                            <p className={styles.team_subtitle}>
                                The passionate team working behind the scenes to bring communities closer.
                            </p>
                        </div>
                        <div className={styles.team_grid}>
                            {teamMembers.map((member) => (
                                <div key={member.id} className={styles.team_member_card}>
                                    <div className={styles.member_image}>
                                        {member.image ? (
                                            <div 
                                                className={styles.member_image}
                                                style={{ backgroundImage: `url('${member.image}')` }}
                                            ></div>
                                        ) : (
                                            <div className={styles.member_image_default}>
                                                <span className={`material-symbols-outlined ${styles.default_avatar_icon}`}>
                                                    {member.defaultIcon}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.member_info}>
                                        <h3 className={styles.member_name}>{member.name}</h3>
                                        <p className={styles.member_role}>{member.role}</p>
                                        <div className={styles.member_links}>
                                            <a className={styles.member_link} href="#">
                                                <span className="material-symbols-outlined">link</span>
                                            </a>
                                            <a className={styles.member_link} href="#">
                                                <span className="material-symbols-outlined">mail</span>
                                            </a>
                                            <a className={styles.member_link} href="#">
                                                <span className="material-symbols-outlined">code</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.cta_section_about}>
                    <div className={styles.cta_container_about}>
                        <div className={styles.cta_bg_pattern}></div>
                        <h2 className={styles.cta_title}>Ready to organize your society?</h2>
                        <p className={styles.cta_subtitle}>
                        Join thousands of communities using SocietyConnect to manage events, members, and more.
                        </p>
                        <div className={styles.cta_buttons}>
                        <button className={`${styles.cta_button} ${styles.cta_button_primary}`}>
                            Start a Community
                        </button>
                        <button className={`${styles.cta_button} ${styles.cta_button_outline}`}>
                            Contact Sales
                        </button>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className={styles.about_footer}>
                <div className={styles.footer_container}>
                <div className={styles.footer_grid} >
                    {/* Brand */}
                    <div className={styles.footer_brand}>
                    <div className={styles.footer_logo}>
                        <span className={`material-symbols-outlined ${styles.footer_logo_icon}`}>groups</span>
                        <span className={styles.footer_brand_text}>SocietyConnect</span>
                    </div>
                    <p className={styles.footer_description}>
                        Building the future of community management. Connect, organize, and thrive with us.
                    </p>
                    <div className={styles.footer_social}>
                        <a className={styles.social_link} href="#">
                        <span className={`material-symbols-outlined ${styles.social_icon}`}>thumb_up</span>
                        </a>
                        <a className={styles.social_link} href="#">
                        <span className={`material-symbols-outlined ${styles.social_icon}`}>share</span>
                        </a>
                        <a className={styles.social_link} href="#">
                        <span className={`material-symbols-outlined ${styles.social_icon}`}>chat_bubble</span>
                        </a>
                    </div>
                    </div>

                    {/* Platform Links */}
                    <div className={styles.footer_links}>
                    <h4 className={styles.footer_heading}>Platform</h4>
                    <ul className={styles.footer_list}>
                        <li><a className={styles.footer_link} href="#">Features</a></li>
                        <li><a className={styles.footer_link} href="#">Pricing</a></li>
                        <li><a className={styles.footer_link} href="#">Integrations</a></li>
                        <li><a className={styles.footer_link} href="#">API</a></li>
                    </ul>
                    </div>

                    {/* Company Links */}
                    <div className={styles.footer_links}>
                    <h4 className={styles.footer_heading}>Company</h4>
                    <ul className={styles.footer_list}>
                        <li><a className={styles.footer_link} href="#">About Us</a></li>
                        <li><a className={styles.footer_link} href="#">Careers</a></li>
                        <li><a className={styles.footer_link} href="#">Blog</a></li>
                        <li><a className={styles.footer_link} href="#">Contact</a></li>
                    </ul>
                    </div>

                    {/* Support Links */}
                    <div className={styles.footer_links}>
                    <h4 className={styles.footer_heading}>Support</h4>
                    <ul className={styles.footer_list}>
                        <li><a className={styles.footer_link} href="#">Help Center</a></li>
                        <li><a className={styles.footer_link} href="#">Community Guidelines</a></li>
                        <li><a className={styles.footer_link} href="#">Privacy Policy</a></li>
                        <li><a className={styles.footer_link} href="#">Terms of Service</a></li>
                    </ul>
                    </div>
                </div>

                <div className={styles.footer_bottom}>
                    <p className={styles.footer_copyright}>© 2023 SocietyConnect Inc. All rights reserved.</p>
                    <div className={styles.footer_bottom_links}>
                    <a className={styles.bottom_link} href="#">Privacy</a>
                    <a className={styles.bottom_link} href="#">Terms</a>
                    <a className={styles.bottom_link} href="#">Sitemap</a>
                    </div>
                </div>
                </div>
            </footer>
        </div>    
        </>
    );
};

export default aboutUspage;