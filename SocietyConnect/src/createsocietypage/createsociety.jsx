import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase-client.ts';
import styles from './createsociety.module.css';

function CreateSocietyPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        societyName: '',
        description: '',
        societyCode: '',
        logo: null,
        banner: null,
        selectedDefaultBanner: null,
        visible: 'yes', // 'yes' or 'no'
        accessible: 'anyone' // 'anyone' or 'permission_required'
    });
    const [descriptionLength, setDescriptionLength] = useState(0);
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [userRole, setUserRole] = useState('member');
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Default banner images
    const defaultBanners = [
        {
            id: 1,
            url: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&dpr=1",
            name: "Modern Workspace"
        },
        {
            id: 2,
            url: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&dpr=1",
            name: "Community Gathering"
        },
        {
            id: 3,
            url: "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&dpr=1",
            name: "Team Collaboration"
        },
        {
            id: 4,
            url: "https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&dpr=1",
            name: "Innovation Hub"
        },
        {
            id: 5,
            url: "https://images.pexels.com/photos/3201526/pexels-photo-3201526.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&dpr=1",
            name: "Networking Event"
        }
    ];

    // Generate random society code
    const generateSocietyCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    };

    // Check user role on component mount
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const userSession = sessionStorage.getItem('userSession') || localStorage.getItem('userSession');
                
                if (!userSession) {
                    navigate('/login');
                    return;
                }

                const userData = JSON.parse(userSession);
                setUserEmail(userData.email);
                
                // Fetch user ID from users table
                const { data: userInfo, error: userError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', userData.email)
                    .single();
                
                if (userError) {
                    console.error('Error fetching user:', userError);
                    setErrorMessage('Could not fetch user information. Please try logging in again.');
                } else if (userInfo) {
                    setUserId(userInfo.id);
                }
                
                setUserRole(userData.role === 'admin' ? 'admin' : 'member');
                
                // Generate unique society code
                const code = generateSocietyCode();
                setFormData(prev => ({ ...prev, societyCode: code }));
                
            } catch (error) {
                console.error('Error parsing user session:', error);
                setErrorMessage('Session error. Please login again.');
                navigate('/login');
            }
        };
        
        checkUserRole();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (name === 'description') {
            setDescriptionLength(value.length);
        }
        setErrorMessage('');
    };

    const handleRadioChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrorMessage('');
    };

    const handleToggleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrorMessage('');
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setErrorMessage('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage('File size must be less than 5MB');
                return;
            }
            
            setFormData(prev => ({ 
                ...prev, 
                [type]: file,
                selectedDefaultBanner: type === 'banner' ? null : prev.selectedDefaultBanner
            }));
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') {
                    setLogoPreview(reader.result);
                } else if (type === 'banner') {
                    setBannerPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
            setErrorMessage('');
        }
    };

    const handleDefaultBannerSelect = (banner) => {
        setFormData(prev => ({ 
            ...prev, 
            selectedDefaultBanner: banner.url,
            banner: null
        }));
        setBannerPreview(banner.url);
        setErrorMessage('');
    };

    const handleCancel = () => {
        if (userRole === 'admin') {
            navigate('/superadmin');
        } else {
            navigate('/member');
        }
    };

    // Upload file to Supabase storage
    const uploadFile = async (file, folder) => {
        try {
            if (!file) {
                return null;
            }

            setUploading(true);
            
            const fileExt = file.name.split(".").pop();
            const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            console.log('Uploading file to society_media bucket:', fileName);
            
            // Upload file to the public bucket
            const { data, error } = await supabase.storage
                .from("society_uploads")
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                console.error('Upload error:', error);
                throw error;
            }
            
            console.log('File uploaded successfully:', data);
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("society_uploads")
                .getPublicUrl(fileName);
            
            return publicUrl;
            
        } catch (error) {
            console.error("Error uploading file:", error.message);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        
        try {
            // Validate required fields
            if (!formData.societyName || !formData.description || !formData.societyCode) {
                setErrorMessage('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Check if society name already exists
            const { data: existingSociety, error: checkError } = await supabase
                .from('society')
                .select('society_name')
                .eq('society_name', formData.societyName)
                .maybeSingle();

            if (checkError) {
                console.error('Error checking existing society:', checkError);
                setErrorMessage('Error checking society name. Please try again.');
                setLoading(false);
                return;
            }

            if (existingSociety) {
                setErrorMessage('A society with this name already exists. Please choose a different name.');
                setLoading(false);
                return;
            }

            // Check if society code already exists
            const { data: existingCode, error: codeError } = await supabase
                .from('society')
                .select('society_code')
                .eq('society_code', formData.societyCode)
                .maybeSingle();

            if (codeError) {
                console.error('Error checking society code:', codeError);
            }

            if (existingCode) {
                // Generate new code if duplicate
                const newCode = generateSocietyCode();
                setFormData(prev => ({ ...prev, societyCode: newCode }));
                setErrorMessage('Society code already exists. New code generated. Please submit again.');
                setLoading(false);
                return;
            }

            let bannerUrl = null;
            let logoUrl = null;
            
            // Upload custom banner if provided
            if (formData.banner) {
                try {
                    bannerUrl = await uploadFile(formData.banner, 'society_banners');
                    console.log('Banner uploaded successfully:', bannerUrl);
                } catch (uploadError) {
                    console.error('Banner upload failed:', uploadError);
                    setErrorMessage(`Banner upload failed: ${uploadError.message}`);
                    setLoading(false);
                    return;
                }
            } 
            // Use selected default banner
            else if (formData.selectedDefaultBanner) {
                bannerUrl = formData.selectedDefaultBanner;
                console.log('Using default banner:', bannerUrl);
            }

            // Upload logo if provided
            if (formData.logo) {
                try {
                    logoUrl = await uploadFile(formData.logo, 'society_logos');
                    console.log('Logo uploaded successfully:', logoUrl);
                } catch (uploadError) {
                    console.error('Logo upload failed:', uploadError);
                    setErrorMessage(`Logo upload failed: ${uploadError.message}`);
                    setLoading(false);
                    return;
                }
            }

            // Prepare data for insertion with new columns
            const societyData = {
                society_name: formData.societyName.trim(),
                society_description: formData.description.trim(),
                creator_email: userEmail,
                created_at: new Date().toISOString(),
                society_code: formData.societyCode.trim(),
                society_banner: bannerUrl,
                society_logo: logoUrl,
                visible: formData.visible,
                accessible: formData.accessible
            };

            console.log('Inserting society data:', societyData);

            // Insert into society table
            const { data: societyResult, error: societyError } = await supabase
                .from('society')
                .insert([societyData])
                .select();

            if (societyError) {
                console.error('Society insertion error:', societyError);
                
                if (societyError.message.includes('row-level security')) {
                    setErrorMessage('Database permission error. Please contact the administrator.');
                } else if (societyError.message.includes('duplicate')) {
                    setErrorMessage('Duplicate entry. Society name or code already exists.');
                } else {
                    setErrorMessage(`Database error: ${societyError.message}`);
                }
                setLoading(false);
                return;
            }

            if (societyResult && societyResult[0]) {
                const societyId = societyResult[0].society_id;
                console.log('Society created successfully with ID:', societyId);
                
                // Add creator as admin in member_society table
                if (userId) {
                    const { error: memberError } = await supabase
                        .from('member_society')
                        .insert([{
                            member_id: userId,
                            society_id: societyId,
                            role: 'admin',
                            joined_at: new Date().toISOString()
                        }]);

                    if (memberError) {
                        console.error('Error adding admin to member_society:', memberError);
                        // Don't fail, just warn
                        console.warn('Society created but membership setup failed');
                    }
                }
                
                alert('Society created successfully!');
                
                // Redirect to dashboard
                setTimeout(() => {
                    if (userRole === 'admin') {
                        navigate('/superadmin', { state: { activeTab: 'societies' } });
                    } else {
                        navigate('/member', { state: { activeTab: 'mySocieties' } });
                    }
                }, 1000);
            }
            
        } catch (error) {
            console.error('Unexpected error:', error);
            setErrorMessage(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = () => {
        try {
            const draftData = {
                ...formData,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('societyDraft', JSON.stringify(draftData));
            alert('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            setErrorMessage('Failed to save draft');
        }
    };

    return (
        <div className={styles.create_society_page}>
            {/* Navigation Bar */}
            <header className={styles.header}>
                <div className={styles.header_content}>
                    <div className={styles.header_left}>
                        <div className={styles.logo}>
                            <span className="material-symbols-outlined">diversity_3</span>
                            <h2 className={styles.logo_text}>SocietyConnect</h2>
                        </div>
                    </div>
                    <div className={styles.header_right}>
                        <button className={styles.cancel_button} onClick={handleCancel} disabled={loading || uploading}>
                            Cancel
                        </button>
                        <div className={styles.user_avatar}>
                            <div className={styles.avatar_image} style={{ 
                                backgroundImage: `url('https://ui-avatars.com/api/?name=${userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}&background=137fec&color=fff&size=100')` 
                            }}></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.main_content}>
                <div className={styles.form_container}>
                    {/* Page Heading */}
                    <div className={styles.page_header}>
                        <h1 className={styles.page_title}>Create Your Society</h1>
                        <p className={styles.page_subtitle}>
                            Fill in the details below to create your new society.
                        </p>
                    </div>

                    {/* Error Message Display */}
                    {errorMessage && (
                        <div className={styles.error_alert}>
                            <span className="material-symbols-outlined">error</span>
                            <p>{errorMessage}</p>
                            <button onClick={() => setErrorMessage('')} className={styles.close_error}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    )}

                    {/* Loading/Uploading   */}
                    {(loading || uploading) && (
                        <div className={styles.upload_progress}>
                            <div className={styles.progress_bar_container}>
                                <div className={styles.progress_bar} style={{ width: uploading ? '50%' : '100%' }}></div>
                            </div>
                            <p className={styles.progress_text}>
                                {uploading ? 'Uploading images...' : 'Creating your society...'}
                            </p>
                        </div>
                    )}

                    {/* Form Container */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Section 1: Basic Details */}
                        <div className={styles.form_section}>
                            <div className={styles.section_header}>
                                <span className="material-symbols-outlined">edit_document</span>
                                <h3 className={styles.section_title}>Basic Details</h3>
                            </div>
                            <div className={styles.section_content}>
                                {/* Society Name */}
                                <div className={styles.form_group}>
                                    <label className={styles.form_label}>Society Name *</label>
                                    <input
                                        type="text"
                                        name="societyName"
                                        value={formData.societyName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Tech Innovation Hub"
                                        className={styles.form_input}
                                        required
                                        disabled={loading || uploading}
                                    />
                                </div>

                                {/* Society Code */}
                                <div className={styles.form_group}>
                                    <label className={styles.form_label}>Society Code *</label>
                                    <input
                                        type="text"
                                        name="societyCode"
                                        value={formData.societyCode}
                                        onChange={handleInputChange}
                                        placeholder="Unique code for members to join"
                                        className={`${styles.form_input} ${styles.code_input}`}
                                        required
                                        disabled={loading || uploading}
                                        maxLength={8}
                                        minLength={8}
                                        readOnly
                                    />
                                    <p className={styles.field_hint}>Unique 8-character code for members to join (auto-generated, can be edited)</p>
                                </div>

                                {/* Description */}
                                <div className={styles.form_group}>
                                    <label className={styles.form_label}>Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Tell members what this society is about..."
                                        className={styles.form_textarea}
                                        maxLength={500}
                                        required
                                        disabled={loading || uploading}
                                    />
                                    <p className={styles.char_count}>{descriptionLength}/500 characters</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Visibility & Access Settings */}
                        <div className={styles.form_section}>
                            <div className={styles.section_header}>
                                <span className="material-symbols-outlined">visibility</span>
                                <h3 className={styles.section_title}>Visibility & Access</h3>
                            </div>
                            <div className={styles.section_content}>
                                {/* Visible - Radio Buttons */}
                                <div className={styles.form_group}>
                                    <label className={styles.form_label}>Society Visibility</label>
                                    <div className={styles.radio_group}>
                                        <label className={`${styles.radio_label} ${formData.visible === 'yes' ? styles.selected : ''}`}>
                                            <input
                                                type="radio"
                                                name="visible"
                                                value="yes"
                                                checked={formData.visible === 'yes'}
                                                onChange={() => handleRadioChange('visible', 'yes')}
                                                disabled={loading || uploading}
                                            />
                                            <div className={styles.radio_content}>
                                                <span className="material-symbols-outlined">public</span>
                                                <div className={styles.radio_text}>
                                                    <strong>Visible</strong>
                                                    <small>Society appears in search and recommendations</small>
                                                </div>
                                            </div>
                                        </label>
                                        <label className={`${styles.radio_label} ${formData.visible === 'no' ? styles.selected : ''}`}>
                                            <input
                                                type="radio"
                                                name="visible"
                                                value="no"
                                                checked={formData.visible === 'no'}
                                                onChange={() => handleRadioChange('visible', 'no')}
                                                disabled={loading || uploading}
                                            />
                                            <div className={styles.radio_content}>
                                                <span className="material-symbols-outlined">visibility_off</span>
                                                <div className={styles.radio_text}>
                                                    <strong>Hidden</strong>
                                                    <small>Society is hidden, can only join via code</small>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Accessible - Toggle Button */}
                                <div className={styles.form_group}>
                                    <label className={styles.form_label}>Accessibility</label>
                                    <div className={styles.toggle_group}>
                                        <button
                                            type="button"
                                            className={`${styles.toggle_option} ${formData.accessible === 'anyone' ? styles.active : ''}`}
                                            onClick={() => handleToggleChange('accessible', 'anyone')}
                                            disabled={loading || uploading}
                                        >
                                            <span className="material-symbols-outlined">group_add</span>
                                            <div className={styles.toggle_content}>
                                                <strong>Anyone can join</strong>
                                                <small>Anyone can join the society</small>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.toggle_option} ${formData.accessible === 'permission_required' ? styles.active : ''}`}
                                            onClick={() => handleToggleChange('accessible', 'permission_required')}
                                            disabled={loading || uploading}
                                        >
                                            <span className="material-symbols-outlined">lock</span>
                                            <div className={styles.toggle_content}>
                                                <strong>Permission Required</strong>
                                                <small>Members need admin approval to join</small>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Branding */}
                        <div className={styles.form_section}>
                            <div className={styles.section_header}>
                                <span className="material-symbols-outlined">palette</span>
                                <h3 className={styles.section_title}>Branding (Optional)</h3>
                            </div>
                            
                            {/* Logo Upload */}
                            <div className={styles.form_group}>
                                <label className={styles.form_label}>Society Logo</label>
                                <div className={styles.logo_upload_area}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'logo')}
                                        className={styles.file_input}
                                        id="logo-upload"
                                        disabled={loading || uploading}
                                    />
                                    <label htmlFor="logo-upload" className={styles.upload_label_clickable}>
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" className={styles.logo_preview} />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">add_a_photo</span>
                                                <span>Upload Logo</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                                <p className={styles.upload_hint}>Recommended: 400x400px. Max 2MB</p>
                            </div>

                            {/* Cover Banner */}
                            <div className={styles.form_group}>
                                <label className={styles.form_label}>Cover Banner</label>
                                
                                {/* Default Banner Selection */}
                                <div className={styles.default_banners_section}>
                                    <p className={styles.banner_subtitle}>Choose from our default banners:</p>
                                    <div className={styles.banners_grid}>
                                        {defaultBanners.map(banner => (
                                            <div 
                                                key={banner.id}
                                                className={`${styles.banner_option} ${formData.selectedDefaultBanner === banner.url ? styles.selected : ''}`}
                                                onClick={() => !loading && !uploading && handleDefaultBannerSelect(banner)}
                                            >
                                                <img src={banner.url} alt={banner.name} className={styles.banner_thumbnail} />
                                                <div className={styles.banner_overlay}>
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                </div>
                                                <p className={styles.banner_name}>{banner.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* OR Divider */}
                                <div className={styles.or_divider}>
                                    <div className={styles.divider_line}></div>
                                    <span className={styles.divider_text}>OR</span>
                                    <div className={styles.divider_line}></div>
                                </div>

                                {/* Custom Banner Upload */}
                                <div className={styles.banner_upload_area}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'banner')}
                                        className={styles.file_input}
                                        id="banner-upload"
                                        disabled={loading || uploading}
                                    />
                                    <label htmlFor="banner-upload" className={styles.banner_upload_label}>
                                        {bannerPreview && !formData.selectedDefaultBanner ? (
                                            <img src={bannerPreview} alt="Banner preview" className={styles.banner_preview} />
                                        ) : (
                                            <div className={styles.banner_upload_content}>
                                                <div className={styles.upload_icon_wrapper}>
                                                    <span className="material-symbols-outlined">cloud_upload</span>
                                                </div>
                                                <div className={styles.upload_text}>
                                                    <p className={styles.upload_title}>Upload custom banner</p>
                                                    <p className={styles.upload_subtitle}>SVG, PNG, JPG or GIF (max. 5MB)</p>
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className={styles.form_actions}>
                            {/* <button type="button" className={styles.draft_button} onClick={handleSaveDraft} disabled={loading || uploading}>
                                Save as Draft
                            </button> */}
                            <button type="submit" className={styles.submit_button} disabled={loading || uploading}>
                                {(loading || uploading) ? (
                                    <>
                                        <span className="material-symbols-outlined">hourglass_empty</span>
                                        <span>{uploading ? 'Uploading...' : 'Creating...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Society</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>© 2023 SocietyConnect. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default CreateSocietyPage;