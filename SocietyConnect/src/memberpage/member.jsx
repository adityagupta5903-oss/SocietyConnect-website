import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase-client.ts";
import styles from "./member.module.css";

function MemberPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mySocieties");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);

  // User state with user_status
  const [userData, setUserData] = useState({
    id: null,
    name: "",
    email: "",
    phone_no: "",
    societiesCount: 0,
    avatar: "",
    headerAvatar: "",
    user_status: "unblocked", // Add user_status field
  });

  // My Societies data (joined societies)
  const [mySocieties, setMySocieties] = useState([]);

  // Available societies to join
  const [availableSocieties, setAvailableSocieties] = useState([]);

  // Search term for available societies
  const [searchTerm, setSearchTerm] = useState("");

  // Join with code state
  const [joinCode, setJoinCode] = useState("");
  const [joiningWithCode, setJoiningWithCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  // Edit society modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSociety, setEditingSociety] = useState(null);
  const [editSocietyName, setEditSocietyName] = useState("");
  const [editSocietyDescription, setEditSocietyDescription] = useState("");
  const [editSocietyCode, setEditSocietyCode] = useState("");
  const [editBannerFile, setEditBannerFile] = useState(null);
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editBannerPreview, setEditBannerPreview] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  // Request state
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  // Settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsData, setSettingsData] = useState({
    name: "",
    phone_no: "",
  });
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingSociety, setReportingSociety] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Helper function to check if user is blocked
  const isUserBlocked = () => {
    return userData.user_status === "blocked";
  };

  useEffect(() => {
    const checkUserSession = async () => {
      const userSession =
        sessionStorage.getItem("userSession") ||
        localStorage.getItem("userSession");

      if (!userSession) {
        navigate("/login");
        return;
      }

      try {
        const sessionData = JSON.parse(userSession);
        const userEmail = sessionData.email;

        const { data: userInfo, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", userEmail)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          setLoading(false);
          return;
        }

        if (userInfo) {
          setUserData({
            id: userInfo.id,
            name: userInfo.name || userInfo.email.split("@")[0],
            email: userInfo.email,
            phone_no: userInfo.phone_no || "",
            societiesCount: 0,
            avatar:
              userInfo.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || userInfo.email)}&background=1a73e8&color=fff&size=100`,
            headerAvatar:
              userInfo.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || userInfo.email)}&background=1a73e8&color=fff&size=100`,
            user_status: userInfo.user_status || "unblocked", // Get user_status from database
          });

          await fetchUserSocieties(userInfo.id);
          await fetchAvailableSocieties(userInfo.id);
          await fetchPendingRequests(userInfo.id);
        }
      } catch (error) {
        console.error("Error parsing user session:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, [navigate]);

  // Get public URL from storage bucket
  const getPublicUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const { data } = supabase.storage
      .from("society_uploads")
      .getPublicUrl(path);
    return data.publicUrl;
  };

  // Upload file function
  const uploadFile = async (file, folder, societyId) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${societyId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("society_uploads")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      return fileName;
    } catch (error) {
      console.error("Error uploading file:", error.message);
      throw error;
    }
  };

  // Fetch user settings
  const fetchUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("name, phone_no")
        .eq("id", userData.id)
        .single();

      if (error) throw error;

      setSettingsData({
        name: data?.name || "",
        phone_no: data?.phone_no || "",
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  // Open settings modal
  const handleOpenSettings = async () => {
    await fetchUserSettings();
    setShowSettingsModal(true);
    setSettingsError("");
    setSettingsSuccess("");
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  // Update user settings
  const handleUpdateSettings = async () => {
    if (!settingsData.name.trim()) {
      setSettingsError("Name is required");
      return;
    }

    if (settingsData.phone_no && !validatePhoneNumber(settingsData.phone_no)) {
      setSettingsError("Please enter a valid 10-digit phone number");
      return;
    }

    setUpdatingSettings(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const updateData = {
        name: settingsData.name.trim(),
      };

      if (settingsData.phone_no) {
        updateData.phone_no = settingsData.phone_no.trim();
      } else {
        updateData.phone_no = null;
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userData.id);

      if (error) throw error;

      setUserData((prev) => ({
        ...prev,
        name: settingsData.name.trim(),
        phone_no: settingsData.phone_no || "",
      }));

      setSettingsSuccess("Profile updated successfully!");

      setTimeout(() => {
        setShowSettingsModal(false);
        setSettingsSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Error updating settings:", error);
      setSettingsError("Error updating profile. Please try again.");
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Render Settings Modal
  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowSettingsModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Edit Profile</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowSettingsModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            {isUserBlocked() && (
              <div className={styles.error_message_modal}>
                <span className="material-symbols-outlined">block</span>
                <p>
                  Your account has been blocked. Some features are disabled.
                </p>
              </div>
            )}

            {settingsError && (
              <div className={styles.error_message_modal}>
                <span className="material-symbols-outlined">error</span>
                <p>{settingsError}</p>
              </div>
            )}

            {settingsSuccess && (
              <div className={styles.success_message_modal}>
                <span className="material-symbols-outlined">check_circle</span>
                <p>{settingsSuccess}</p>
              </div>
            )}

            <div className={styles.form_group}>
              <label className={styles.form_label}>Full Name *</label>
              <div className={styles.input_container}>
                <div className={styles.input_icon}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <input
                  type="text"
                  value={settingsData.name}
                  onChange={(e) =>
                    setSettingsData({ ...settingsData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className={styles.form_input}
                  maxLength={100}
                  disabled={isUserBlocked()}
                />
              </div>
            </div>

            <div className={styles.form_group}>
              <label className={styles.form_label}>Email Address</label>
              <div className={styles.input_container}>
                <div className={styles.input_icon}>
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className={`${styles.form_input} ${styles.readonly_input}`}
                />
              </div>
              <small className={styles.helper_text}>
                Email cannot be changed
              </small>
            </div>

            <div className={styles.form_group}>
              <label className={styles.form_label}>
                Phone Number{" "}
                <span className={styles.optional_text}>(Optional)</span>
              </label>
              <div className={styles.input_container}>
                <div className={styles.input_icon}>
                  <span className="material-symbols-outlined">phone</span>
                </div>
                <input
                  type="tel"
                  value={settingsData.phone_no}
                  onChange={(e) =>
                    setSettingsData({
                      ...settingsData,
                      phone_no: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Enter 10-digit mobile number"
                  className={styles.form_input}
                  maxLength={10}
                  disabled={isUserBlocked()}
                />
              </div>
              <small className={styles.helper_text}>
                Enter 10-digit mobile number (optional)
              </small>
            </div>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowSettingsModal(false)}
            >
              Cancel
            </button>
            <button
              className={styles.submit_btn}
              onClick={handleUpdateSettings}
              disabled={updatingSettings || isUserBlocked()}
            >
              {updatingSettings ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Open report modal for society
  // Open report modal for society
  const handleReportSociety = (society) => {
    // Check if the user is trying to report their own society
    if (society.creatorEmail === userData.email) {
      alert("You cannot report your own society.");
      return;
    }

    setReportingSociety(society);
    setReportReason("");
    setReportDescription("");
    setShowReportModal(true);
    setMenuOpen(null);
  };

  // Submit report to superadmin
  const handleSubmitReport = async () => {
    // Validate reason
    if (!reportReason || reportReason.trim() === "") {
      alert("Please select a reason for reporting");
      return;
    }

    setSubmittingReport(true);

    try {
      const finalDescription =
        reportDescription && reportDescription.trim() !== ""
          ? reportDescription.trim()
          : null;

      const { data, error } = await supabase
        .from("report")
        .insert([
          {
            reporter_id: userData.id,
            society_id: reportingSociety.id,
            report_type: "society",
            assigned_to: "super_admin",
            reason: reportReason,
            description: finalDescription,
            status: "pending",
            reported_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      alert(
        `Report submitted successfully! Super admin will review your report about "${reportingSociety.name}".`,
      );
      setShowReportModal(false);
      setReportingSociety(null);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report: " + error.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Render Report Modal
  const renderReportModal = () => {
    if (!showReportModal) return null;

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowReportModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Report Society</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowReportModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <div className={styles.report_society_info}>
              <div className={styles.report_society_icon}>
                {reportingSociety?.logoUrl ? (
                  <img
                    src={reportingSociety.logoUrl}
                    alt={reportingSociety.name}
                  />
                ) : (
                  <span className="material-symbols-outlined">groups</span>
                )}
              </div>
              <div className={styles.report_society_details}>
                <h4>{reportingSociety?.name}</h4>
                <p>{reportingSociety?.description?.substring(0, 100)}</p>
              </div>
            </div>

            <div className={styles.form_group}>
              <label className={styles.form_label}>
                Reason for Reporting *
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className={styles.form_select}
                required
              >
                <option value="">Select a reason</option>
                <option value="Inappropriate content">
                  Inappropriate content
                </option>
                <option value="Harassment or bullying">
                  Harassment or bullying
                </option>
                <option value="Hate speech">Hate speech</option>
                <option value="False information">False information</option>
                <option value="Spam or misleading">Spam or misleading</option>
                <option value="Privacy violation">Privacy violation</option>
                <option value="Illegal activities">Illegal activities</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.form_group}>
              <label className={styles.form_label}>
                Additional Details (Optional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please provide any additional details that might help the super admin review this report..."
                className={styles.form_textarea}
                rows="4"
                maxLength={500}
              />
              <small className={styles.char_count}>
                {reportDescription.length}/500 characters
              </small>
            </div>

            <div className={styles.report_info_note}>
              <span className="material-symbols-outlined">info</span>
              <p>
                This report will be sent to the super administrator for review.
                Please provide accurate information.
              </p>
            </div>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowReportModal(false)}
            >
              Cancel
            </button>
            <button
              className={`${styles.submit_btn} ${styles.report_btn}`}
              onClick={handleSubmitReport}
              disabled={submittingReport || !reportReason}
            >
              {submittingReport ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Fetch pending requests for the user
  const fetchPendingRequests = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("request")
        .select(
          `
                    *,
                    society:society_id (
                        society_id,
                        society_name,
                        society_logo,
                        society_description
                    )
                `,
        )
        .eq("member_id", userId)
        .eq("status", "not_accepted");

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setPendingRequests([]);
    }
  };

  // Delete/cancel request
  const deleteRequest = async (requestId, societyId) => {
    if (window.confirm("Are you sure you want to cancel this join request?")) {
      try {
        const { error } = await supabase
          .from("request")
          .delete()
          .eq("request_id", requestId);

        if (error) throw error;

        alert("Join request cancelled successfully!");
        await fetchPendingRequests(userData.id);
        await fetchAvailableSocieties(userData.id);

        if (showRequestsModal) {
          setShowRequestsModal(false);
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        alert("Error cancelling request: " + error.message);
      }
    }
  };

  // Send join request to admin
  const sendJoinRequest = async (societyId, adminId) => {
    try {
      const { data: existingRequest } = await supabase
        .from("request")
        .select("*")
        .eq("member_id", userData.id)
        .eq("society_id", societyId)
        .maybeSingle();

      if (existingRequest) {
        alert(
          "You have already requested to join this society. Please wait for admin approval.",
        );
        return;
      }

      const { error } = await supabase.from("request").insert([
        {
          member_id: userData.id,
          admin_id: adminId,
          society_id: societyId,
          status: "not_accepted",
          request_time: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert("Join request sent successfully! Admin will review your request.");
      await fetchPendingRequests(userData.id);
      await fetchAvailableSocieties(userData.id);
    } catch (error) {
      console.error("Error sending join request:", error);
      alert("Error sending join request: " + error.message);
    }
  };

  // Fetch societies that the user has joined
  const fetchUserSocieties = async (userId) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from("member_society")
        .select(
          `
                    id,
                    role,
                    joined_at,
                    society:society_id (
                        society_id,
                        society_name,
                        society_description,
                        created_at,
                        creator_email,
                        society_code,
                        society_banner,
                        society_logo,
                        visible,
                        accessible
                    )
                `,
        )
        .eq("member_id", userId);

      if (memberError) {
        console.error("Error fetching member societies:", memberError);
        setMySocieties([]);
        setUserData((prev) => ({ ...prev, societiesCount: 0 }));
        return;
      }

      if (memberData && memberData.length > 0) {
        const societies = await Promise.all(
          memberData.map(async (item) => {
            const bannerUrl = item.society.society_banner
              ? getPublicUrl(item.society.society_banner)
              : null;
            const logoUrl = item.society.society_logo
              ? getPublicUrl(item.society.society_logo)
              : null;

            return {
              id: item.society.society_id,
              name: item.society.society_name,
              description: item.society.society_description,
              role: item.role,
              joinedAt: item.joined_at,
              societyCode: item.society.society_code,
              creatorEmail: item.society.creator_email,
              bannerUrl: bannerUrl,
              logoUrl: logoUrl,
              bannerPath: item.society.society_banner,
              logoPath: item.society.society_logo,
              visible: item.society.visible,
              accessible: item.society.accessible,
              avatar:
                logoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(item.society.society_name)}&background=1a73e8&color=fff&size=100`,
            };
          }),
        );
        setMySocieties(societies);
        setUserData((prev) => ({ ...prev, societiesCount: societies.length }));
      } else {
        setMySocieties([]);
        setUserData((prev) => ({ ...prev, societiesCount: 0 }));
      }
    } catch (error) {
      console.error("Error:", error);
      setMySocieties([]);
    }
  };

  // Fetch societies that the user hasn't joined yet
  // Fetch societies that the user hasn't joined yet
  const fetchAvailableSocieties = async (userId) => {
    try {
      const { data: joinedSocieties, error: joinedError } = await supabase
        .from("member_society")
        .select("society_id")
        .eq("member_id", userId);

      if (joinedError) {
        console.error("Error fetching joined societies:", joinedError);
        return;
      }

      const joinedSocietyIds =
        joinedSocieties?.map((item) => item.society_id) || [];

      const { data: requests } = await supabase
        .from("request")
        .select("society_id")
        .eq("member_id", userId)
        .eq("status", "not_accepted");

      const requestedSocietyIds = requests?.map((r) => r.society_id) || [];

      let query = supabase
        .from("society")
        .select("*")
        .order("created_at", { ascending: false });

      const excludeIds = [...joinedSocietyIds, ...requestedSocietyIds];
      if (excludeIds.length > 0) {
        query = query.not("society_id", "in", `(${excludeIds.join(",")})`);
      }

      // Only show visible AND unblocked societies
      query = query.eq("visible", "yes").eq("society_status", "unblocked");

      const { data: societies, error: societiesError } = await query;

      if (societiesError) {
        console.error("Error fetching available societies:", societiesError);
        setAvailableSocieties([]);
        return;
      }

      if (societies && societies.length > 0) {
        const formattedSocieties = await Promise.all(
          societies.map(async (society) => {
            const bannerUrl = society.society_banner
              ? getPublicUrl(society.society_banner)
              : null;
            const logoUrl = society.society_logo
              ? getPublicUrl(society.society_logo)
              : null;

            const { data: adminData } = await supabase
              .from("users")
              .select("id")
              .eq("email", society.creator_email)
              .single();

            return {
              id: society.society_id,
              name: society.society_name,
              description: society.society_description,
              createdAt: society.created_at,
              creatorEmail: society.creator_email,
              creatorId: adminData?.id,
              societyCode: society.society_code,
              bannerUrl: bannerUrl,
              logoUrl: logoUrl,
              visible: society.visible,
              accessible: society.accessible,
              society_status: society.society_status, // Add this field
              memberCount: 0,
              avatar:
                logoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(society.society_name)}&background=10b981&color=fff&size=100`,
            };
          }),
        );
        setAvailableSocieties(formattedSocieties);
      } else {
        setAvailableSocieties([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setAvailableSocieties([]);
    }
  };

  // Join society using code
  // Join society using code
  const handleJoinWithCode = async () => {
    // Check if user is blocked
    if (isUserBlocked()) {
      alert("Your account has been blocked. You cannot join societies.");
      return;
    }

    if (!joinCode.trim()) {
      setCodeError("Please enter a society code");
      return;
    }

    setJoiningWithCode(true);
    setCodeError("");

    try {
      const { data: society, error: societyError } = await supabase
        .from("society")
        .select("*")
        .eq("society_code", joinCode.toUpperCase().trim())
        .maybeSingle();

      if (societyError || !society) {
        setCodeError("Invalid society code. Please check and try again.");
        setJoiningWithCode(false);
        return;
      }

      // Check if society is blocked
      if (society.society_status === "blocked") {
        setCodeError(
          "This society has been blocked. You cannot join at this time.",
        );
        setJoiningWithCode(false);
        return;
      }

      // if (society.visible === 'no') {
      //     setCodeError('This society is hidden and cannot be joined via search.');
      //     setJoiningWithCode(false);
      //     return;
      // }

      const { data: existingMember, error: checkError } = await supabase
        .from("member_society")
        .select("*")
        .eq("member_id", userData.id)
        .eq("society_id", society.society_id)
        .maybeSingle();

      if (existingMember) {
        setCodeError("You are already a member of this society!");
        setJoiningWithCode(false);
        return;
      }

      const { data: existingRequest } = await supabase
        .from("request")
        .select("*")
        .eq("member_id", userData.id)
        .eq("society_id", society.society_id)
        .maybeSingle();

      if (existingRequest) {
        setCodeError(
          "You have already requested to join this society. Please wait for approval.",
        );
        setJoiningWithCode(false);
        return;
      }

      if (society.accessible === "anyone") {
        const { error: joinError } = await supabase
          .from("member_society")
          .insert([
            {
              member_id: userData.id,
              society_id: society.society_id,
              role: "member",
              joined_at: new Date().toISOString(),
            },
          ]);

        if (joinError) {
          console.error("Error joining society:", joinError);
          setCodeError("Error joining society. Please try again.");
        } else {
          alert(`Successfully joined "${society.society_name}"!`);
          setJoinCode("");
          await fetchUserSocieties(userData.id);
          await fetchAvailableSocieties(userData.id);
        }
      } else {
        const { data: adminData } = await supabase
          .from("users")
          .select("id")
          .eq("email", society.creator_email)
          .single();

        const { error: requestError } = await supabase.from("request").insert([
          {
            member_id: userData.id,
            admin_id: adminData?.id,
            society_id: society.society_id,
            status: "not_accepted",
            request_time: new Date().toISOString(),
          },
        ]);

        if (requestError) {
          console.error("Error sending request:", requestError);
          setCodeError("Error sending join request. Please try again.");
        } else {
          alert(
            `Join request sent to "${society.society_name}"! Admin will review your request.`,
          );
          setJoinCode("");
          await fetchAvailableSocieties(userData.id);
          await fetchPendingRequests(userData.id);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setCodeError("An error occurred. Please try again.");
    } finally {
      setJoiningWithCode(false);
    }
  };

  const navItems = [
    { id: "mySocieties", icon: "groups", label: "My Societies" },
    { id: "joinSociety", icon: "person_add", label: "Join Society" },
    ...(pendingRequests.length > 0
      ? [
          {
            id: "requests",
            icon: "pending",
            label: `Requests (${pendingRequests.length})`,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("userSession");
    localStorage.removeItem("userSession");
    localStorage.removeItem("rememberMe");
    navigate("/");
  };

  const handleJoinSociety = async (societyId) => {
    // Check if user is blocked
    if (isUserBlocked()) {
      alert("Your account has been blocked. You cannot join societies.");
      return;
    }

    // First, check if society is blocked
    const { data: society, error: societyError } = await supabase
      .from("society")
      .select("society_status")
      .eq("society_id", societyId)
      .single();

    if (societyError) {
      alert("Error checking society status.");
      return;
    }

    if (society.society_status === "blocked") {
      alert("This society has been blocked. You cannot join.");
      return;
    }

    try {
      const { data: existingMember, error: checkError } = await supabase
        .from("member_society")
        .select("*")
        .eq("member_id", userData.id)
        .eq("society_id", societyId)
        .maybeSingle();

      if (existingMember) {
        alert("You are already a member of this society!");
        return;
      }

      const { error } = await supabase.from("member_society").insert([
        {
          member_id: userData.id,
          society_id: societyId,
          role: "member",
          joined_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error joining society:", error);
        alert("Error joining society. Please try again.");
      } else {
        alert("Successfully joined the society!");
        await fetchUserSocieties(userData.id);
        await fetchAvailableSocieties(userData.id);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleSendJoinRequest = async (society) => {
    // Check if user is blocked
    if (isUserBlocked()) {
      alert("Your account has been blocked. You cannot send join requests.");
      return;
    }

    // Check if society is blocked
    const { data: societyData, error: societyError } = await supabase
      .from("society")
      .select("society_status")
      .eq("society_id", society.id)
      .single();

    if (societyError) {
      alert("Error checking society status.");
      return;
    }

    if (societyData?.society_status === "blocked") {
      alert("This society has been blocked. You cannot send a join request.");
      return;
    }

    if (!society.creatorId) {
      alert("Unable to send request. Please try again later.");
      return;
    }

    await sendJoinRequest(society.id, society.creatorId);
    await fetchAvailableSocieties(userData.id);
  };

  const handleEditSociety = (society) => {
    // Check if user is blocked
    if (isUserBlocked()) {
      alert("Your account has been blocked. You cannot edit societies.");
      return;
    }

    setEditingSociety(society);
    setEditSocietyName(society.name);
    setEditSocietyDescription(society.description || "");
    setEditSocietyCode(society.societyCode);
    setEditBannerPreview(society.bannerUrl);
    setEditLogoPreview(society.logoUrl);
    setEditBannerFile(null);
    setEditLogoFile(null);
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024) {
        setEditBannerFile(file);
        setEditBannerPreview(URL.createObjectURL(file));
      } else {
        alert("Please select a valid image file (max 5MB)");
      }
    }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (allowedTypes.includes(file.type) && file.size <= 2 * 1024 * 1024) {
        setEditLogoFile(file);
        setEditLogoPreview(URL.createObjectURL(file));
      } else {
        alert("Please select a valid image file (max 2MB)");
      }
    }
  };

  const handleSaveSociety = async () => {
    // Check if user is blocked
    if (isUserBlocked()) {
      alert("Your account has been blocked. You cannot save society changes.");
      return;
    }

    if (!editSocietyName.trim()) {
      alert("Society name is required");
      return;
    }

    setEditSubmitting(true);

    try {
      let bannerPath = editingSociety.bannerPath;
      let logoPath = editingSociety.logoPath;

      if (editBannerFile) {
        setBannerUploading(true);
        const newBannerPath = await uploadFile(
          editBannerFile,
          "society_banners",
          editingSociety.id,
        );
        if (newBannerPath) {
          if (bannerPath) {
            await supabase.storage.from("society_uploads").remove([bannerPath]);
          }
          bannerPath = newBannerPath;
        }
        setBannerUploading(false);
      }

      if (editLogoFile) {
        setLogoUploading(true);
        const newLogoPath = await uploadFile(
          editLogoFile,
          "society_logos",
          editingSociety.id,
        );
        if (newLogoPath) {
          if (logoPath) {
            await supabase.storage.from("society_uploads").remove([logoPath]);
          }
          logoPath = newLogoPath;
        }
        setLogoUploading(false);
      }

      const { error: updateError } = await supabase
        .from("society")
        .update({
          society_name: editSocietyName.trim(),
          society_description: editSocietyDescription.trim() || null,
          society_banner: bannerPath,
          society_logo: logoPath,
        })
        .eq("society_id", editingSociety.id);

      if (updateError) throw updateError;

      alert("Society updated successfully!");
      setShowEditModal(false);
      await fetchUserSocieties(userData.id);
      await fetchAvailableSocieties(userData.id);
    } catch (error) {
      console.error("Error updating society:", error);
      alert("Error updating society: " + error.message);
    } finally {
      setEditSubmitting(false);
      setBannerUploading(false);
      setLogoUploading(false);
    }
  };

  const handleRemoveSociety = async (society) => {
    setMenuOpen(null);

    const isCreator = society.creatorEmail === userData.email;

    let confirmMessage = "";
    let action = "";

    if (isCreator) {
      confirmMessage = `⚠️ WARNING: You are the creator of "${society.name}".\n\nDeleting this society will permanently remove it and all its members. This action CANNOT be undone.\n\nAre you sure you want to delete this society?`;
      action = "delete";
    } else {
      confirmMessage = `Are you sure you want to leave "${society.name}"?`;
      action = "leave";
    }

    if (action === "delete" && window.confirm(confirmMessage)) {
      try {
        const { error: memberDeleteError } = await supabase
          .from("member_society")
          .delete()
          .eq("society_id", society.id);

        if (memberDeleteError) {
          console.error("Error deleting members:", memberDeleteError);
        }

        const { error: deleteError } = await supabase
          .from("society")
          .delete()
          .eq("society_id", society.id)
          .eq("creator_email", userData.email);

        if (deleteError) {
          console.error("Error deleting society:", deleteError);
          alert(
            "Error deleting society. You must be the creator to delete it.",
          );
        } else {
          alert(`"${society.name}" has been permanently deleted.`);
          await fetchUserSocieties(userData.id);
          await fetchAvailableSocieties(userData.id);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    } else if (action === "leave" && window.confirm(confirmMessage)) {
      try {
        const { error } = await supabase
          .from("member_society")
          .delete()
          .eq("member_id", userData.id)
          .eq("society_id", society.id);

        if (error) {
          console.error("Error leaving society:", error);
          alert("Error leaving society. Please try again.");
        } else {
          alert(`You have left "${society.name}"`);
          await fetchUserSocieties(userData.id);
          await fetchAvailableSocieties(userData.id);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleViewSociety = (society) => {
    navigate("/society", { state: { society } });
  };

  const toggleMenu = (societyId) => {
    setMenuOpen(menuOpen === societyId ? null : societyId);
  };

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredSocieties = availableSocieties.filter(
    (society) =>
      society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (society.description &&
        society.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // The filtering is already handled by the filteredSocieties variable
      // This just ensures the UI updates smoothly
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const renderEditModal = () => {
    if (!showEditModal) return null;

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowEditModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Edit Society</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowEditModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <div className={styles.form_group}>
              <label>Society Banner (Header Image)</label>
              <div className={styles.banner_upload_area}>
                {editBannerPreview ? (
                  <div className={styles.banner_preview}>
                    <img src={editBannerPreview} alt="Banner Preview" />
                    <button
                      type="button"
                      className={styles.change_image_btn}
                      onClick={() =>
                        document.getElementById("bannerInput").click()
                      }
                    >
                      <span className="material-symbols-outlined">edit</span>
                      Change Banner
                    </button>
                  </div>
                ) : (
                  <div
                    className={styles.upload_placeholder}
                    onClick={() =>
                      document.getElementById("bannerInput").click()
                    }
                  >
                    <span className="material-symbols-outlined">
                      add_photo_alternate
                    </span>
                    <p>Click to upload banner image</p>
                    <small>Recommended: 1200x400px, max 5MB</small>
                  </div>
                )}
                <input
                  id="bannerInput"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerSelect}
                  style={{ display: "none" }}
                />
                {bannerUploading && (
                  <div className={styles.uploading_indicator}>
                    <span>Uploading banner...</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.form_group}>
              <label>Society Logo</label>
              <div className={styles.logo_upload_area}>
                {editLogoPreview ? (
                  <div className={styles.logo_preview}>
                    <img src={editLogoPreview} alt="Logo Preview" />
                    <button
                      type="button"
                      className={styles.change_image_btn_small}
                      onClick={() =>
                        document.getElementById("logoInput").click()
                      }
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className={styles.logo_placeholder}
                    onClick={() => document.getElementById("logoInput").click()}
                  >
                    <span className="material-symbols-outlined">
                      photo_camera
                    </span>
                    <p>Upload Logo</p>
                  </div>
                )}
                <input
                  id="logoInput"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  style={{ display: "none" }}
                />
                {logoUploading && (
                  <div className={styles.uploading_indicator_small}>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.form_group}>
              <label>Society Name *</label>
              <input
                type="text"
                value={editSocietyName}
                onChange={(e) => setEditSocietyName(e.target.value)}
                placeholder="Enter society name"
                className={styles.form_input}
                maxLength={100}
                disabled={isUserBlocked()}
              />
            </div>

            <div className={styles.form_group}>
              <label>Description</label>
              <textarea
                value={editSocietyDescription}
                onChange={(e) => setEditSocietyDescription(e.target.value)}
                placeholder="Describe your society's purpose and activities"
                className={styles.form_textarea}
                rows="4"
                maxLength={500}
                disabled={isUserBlocked()}
              />
              <small className={styles.char_count}>
                {editSocietyDescription.length}/500 characters
              </small>
            </div>

            <div className={styles.form_group}>
              <label>Society Code</label>
              <div className={styles.code_display}>
                <span className={styles.code_value}>{editSocietyCode}</span>
                <button
                  type="button"
                  className={styles.copy_code_btn}
                  onClick={() => {
                    navigator.clipboard.writeText(editSocietyCode);
                    alert("Code copied to clipboard!");
                  }}
                >
                  <span className="material-symbols-outlined">
                    content_copy
                  </span>
                  Copy
                </button>
              </div>
              <small className={styles.helper_text}>
                This code cannot be changed
              </small>
            </div>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowEditModal(false)}
              disabled={editSubmitting}
            >
              Cancel
            </button>
            <button
              className={styles.submit_btn}
              onClick={handleSaveSociety}
              disabled={
                editSubmitting ||
                bannerUploading ||
                logoUploading ||
                isUserBlocked()
              }
            >
              {editSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRequestsModal = () => {
    if (!showRequestsModal) return null;

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowRequestsModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Pending Join Requests</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowRequestsModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            {pendingRequests.length === 0 ? (
              <div className={styles.empty_state_small}>
                <span className="material-symbols-outlined">check_circle</span>
                <p>No pending requests</p>
              </div>
            ) : (
              <div className={styles.requests_list}>
                {pendingRequests.map((request) => (
                  <div key={request.request_id} className={styles.request_item}>
                    {request.society?.society_logo ? (
                      <img
                        src={getPublicUrl(request.society.society_logo)}
                        alt={request.society.society_name}
                        className={styles.request_logo}
                      />
                    ) : (
                      <div className={styles.request_logo_placeholder}>
                        <span>
                          {request.society?.society_name
                            ?.charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={styles.request_info}>
                      <h4>{request.society?.society_name}</h4>
                      <p>
                        Request sent:{" "}
                        {new Date(request.request_time).toLocaleDateString()}
                      </p>
                      <span className={styles.request_status_pending}>
                        Pending Approval
                      </span>
                    </div>
                    <button
                      className={styles.delete_request_btn}
                      onClick={() =>
                        deleteRequest(request.request_id, request.society_id)
                      }
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMySocieties = () => (
    <div className={styles.content_section}>
      <div className={styles.section_header}>
        <h2 className={styles.section_title}>My Societies</h2>
        <p className={styles.section_subtitle}>
          Manage your active society memberships
        </p>
      </div>

      {mySocieties.length === 0 ? (
        <div className={styles.empty_state}>
          <span className="material-symbols-outlined">groups</span>
          <h3>No societies yet</h3>
          <p>Join a society to start connecting with your community</p>
          <button
            className={styles.join_button}
            onClick={() => setActiveTab("joinSociety")}
            disabled={isUserBlocked()}
          >
            Browse Societies
          </button>
        </div>
      ) : (
        <div className={styles.classroom_grid}>
          {mySocieties.map((society) => (
            <div key={society.id} className={styles.classroom_card}>
              <div
                className={styles.card_header}
                style={{
                  backgroundImage: society.bannerUrl
                    ? `url('${society.bannerUrl}')`
                    : "linear-gradient(135deg, #1a73e8, #0d47a1)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className={styles.card_header_overlay}></div>
                <div className={styles.card_actions}>
                  <button
                    className={styles.menu_button}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(society.id);
                    }}
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                  {menuOpen === society.id && (
                    <div className={styles.dropdown_menu}>
                      <button
                        className={styles.dropdown_item}
                        onClick={() => handleViewSociety(society)}
                      >
                        <span className="material-symbols-outlined">
                          exit_to_app
                        </span>
                        Enter Society
                      </button>
                      {society.role === "admin" && !isUserBlocked() && (
                        <button
                          className={styles.dropdown_item}
                          onClick={() => handleEditSociety(society)}
                        >
                          <span className="material-symbols-outlined">
                            edit
                          </span>
                          Edit
                        </button>
                      )}
                      {/* Only show report button if user is not the creator of the society */}
                      {society.creatorEmail !== userData.email && (
                        <button
                          className={`${styles.dropdown_item} ${styles.report_item}`}
                          onClick={() => handleReportSociety(society)}
                        >
                          <span className="material-symbols-outlined">
                            flag
                          </span>
                          Report Society
                        </button>
                      )}
                      <button
                        className={`${styles.dropdown_item} ${society.creatorEmail === userData.email ? styles.danger : ""}`}
                        onClick={() => handleRemoveSociety(society)}
                      >
                        <span className="material-symbols-outlined">
                          {society.creatorEmail === userData.email
                            ? "delete_forever"
                            : "exit_to_app"}
                        </span>
                        {society.creatorEmail === userData.email
                          ? "Delete Society"
                          : "Leave Society"}
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.card_logo}>
                  {society.logoUrl ? (
                    <img src={society.logoUrl} alt={society.name} />
                  ) : (
                    <span className={styles.logo_text}>
                      {society.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.card_content}>
                <h3 className={styles.card_title}>{society.name}</h3>
                <p className={styles.card_description}>
                  {society.description?.substring(0, 100)}...
                </p>
                <div className={styles.card_meta}>
                  <span className={styles.meta_badge}>
                    <span className="material-symbols-outlined">person</span>
                    {society.role === "admin" ? "Admin" : "Member"}
                  </span>
                </div>
              </div>
              <div className={styles.card_footer}>
                <button
                  className={styles.view_button}
                  onClick={() => handleViewSociety(society)}
                >
                  View Society
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderJoinSociety = () => (
    <div className={styles.content_section}>
      <div className={styles.section_header}>
        <h2 className={styles.section_title}>Discover Societies</h2>
        <p className={styles.section_subtitle}>
          Find and join societies that match your interests
        </p>
      </div>

      {isUserBlocked() && (
        <div className={styles.blocked_banner}>
          <span className="material-symbols-outlined">block</span>
          <div>
            <strong>Your account has been blocked.</strong>
            <p>
              You cannot create new societies or join existing ones. Please
              contact support for assistance.
            </p>
          </div>
        </div>
      )}

      <div className={styles.join_code_section}>
        <div className={styles.join_code_card}>
          <div className={styles.join_code_icon}>
            <span className="material-symbols-outlined">qr_code_scanner</span>
          </div>
          <div className={styles.join_code_content}>
            <h3>Join with Code</h3>
            <p>
              Enter the unique 8-character code provided by the society admin
            </p>
            <div className={styles.join_code_input_group}>
              <input
                type="text"
                placeholder="Enter society code (e.g., ABC12345)"
                className={styles.join_code_input}
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setCodeError("");
                }}
                maxLength={8}
                disabled={isUserBlocked()}
              />
              <button
                className={styles.join_code_button}
                onClick={handleJoinWithCode}
                disabled={joiningWithCode || isUserBlocked()}
              >
                {joiningWithCode ? "Joining..." : "Join Society"}
              </button>
            </div>
            {codeError && <p className={styles.join_code_error}>{codeError}</p>}
            {isUserBlocked() && (
              <p className={styles.blocked_warning}>
                Your account has been blocked. You cannot join societies.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.or_divider_join}>
        <div className={styles.or_line}></div>
        <span className={styles.or_text}>OR</span>
        <div className={styles.or_line}></div>
      </div>

      <div className={styles.search_section}>
        <div className={styles.search_bar_large}>
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search societies by name or description..."
            className={styles.search_input_large}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isUserBlocked()}
          />
        </div>
      </div>

      {filteredSocieties.length === 0 ? (
        <div className={styles.empty_state}>
          <span className="material-symbols-outlined">search</span>
          <h3>No societies found</h3>
          <p>
            {searchTerm
              ? "Try a different search term"
              : "No societies available to join at the moment"}
          </p>
        </div>
      ) : (
        <div className={styles.classroom_grid}>
          {filteredSocieties.map((society) => (
            <div key={society.id} className={styles.classroom_card}>
              <div
                className={styles.card_header}
                style={{
                  backgroundImage: society.bannerUrl
                    ? `url('${society.bannerUrl}')`
                    : "linear-gradient(135deg, #34a853, #0d652d)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className={styles.card_header_overlay}></div>
                <div className={styles.card_logo}>
                  {society.logoUrl ? (
                    <img src={society.logoUrl} alt={society.name} />
                  ) : (
                    <span className={styles.logo_text}>
                      {society.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.card_content}>
                <h3 className={styles.card_title}>{society.name}</h3>
                <p className={styles.card_description}>
                  {society.description?.substring(0, 100)}...
                </p>
                <div className={styles.card_meta}>
                  <span className={styles.meta_badge}>
                    <span className="material-symbols-outlined">lock</span>
                    {society.accessible === "anyone"
                      ? "Open to All"
                      : "Approval Required"}
                  </span>
                </div>
              </div>
              <div className={styles.card_footer}>
                {!isUserBlocked() ? (
                  society.accessible === "anyone" ? (
                    <button
                      className={styles.join_button_primary}
                      onClick={() => handleJoinSociety(society.id)}
                    >
                      Join Society
                      <span className="material-symbols-outlined">
                        add_circle
                      </span>
                    </button>
                  ) : (
                    <button
                      className={styles.request_button}
                      onClick={() => handleSendJoinRequest(society)}
                    >
                      Request to Join
                      <span className="material-symbols-outlined">pending</span>
                    </button>
                  )
                ) : (
                  <button
                    className={`${styles.join_button_primary} ${styles.disabled_button}`}
                    disabled
                    title="Your account has been blocked. You cannot join societies."
                  >
                    Join Society
                    <span className="material-symbols-outlined">block</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className={styles.content_section}>
      <div className={styles.section_header}>
        <h2 className={styles.section_title}>Pending Requests</h2>
        <p className={styles.section_subtitle}>
          Your join requests awaiting approval
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className={styles.empty_state}>
          <span className="material-symbols-outlined">check_circle</span>
          <h3>No pending requests</h3>
          <p>You don't have any pending join requests</p>
        </div>
      ) : (
        <div className={styles.requests_grid}>
          {pendingRequests.map((request) => (
            <div key={request.request_id} className={styles.request_card}>
              <div className={styles.request_header}>
                {request.society?.society_logo ? (
                  <img
                    src={getPublicUrl(request.society.society_logo)}
                    alt={request.society.society_name}
                    className={styles.request_logo_large}
                  />
                ) : (
                  <div className={styles.request_logo_placeholder_large}>
                    <span>
                      {request.society?.society_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  className={styles.delete_request_btn_card}
                  onClick={() =>
                    deleteRequest(request.request_id, request.society_id)
                  }
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
              <div className={styles.request_body}>
                <h3 className={styles.request_society_name}>
                  {request.society?.society_name}
                </h3>
                <p className={styles.request_date}>
                  Requested on:{" "}
                  {new Date(request.request_time).toLocaleDateString()}
                </p>
                <div className={styles.request_status}>
                  <span className={styles.status_pending}>
                    Pending Approval
                  </span>
                </div>
                <p className={styles.request_message}>
                  Your request has been sent to the society admin. You will be
                  notified once it's approved.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.loading_spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardpage}>
      <header className={styles.dashboard_header}>
        <div className={styles.header_content}>
          <div className={styles.header_left}>
            <button
              className={styles.back_button_home}
              onClick={() => navigate("/")}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className={styles.header_brand}>
              <div className={styles.header_logo}>
                <span className="material-symbols-outlined">groups</span>
              </div>
              <h2 className={styles.header_title}>SocietyConnect</h2>
            </div>
          </div>
          <div className={styles.header_right}>
            {!isUserBlocked() ? (
              <button className={styles.create_society_button}>
                <span className="material-symbols-outlined">add_circle</span>
                <Link className={styles.nav_link} to="/createsociety">
                  New Society
                </Link>
              </button>
            ) : (
              <button
                className={`${styles.create_society_button} ${styles.disabled_button}`}
                disabled
                title="Your account has been blocked. You cannot create new societies."
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span>New Society</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className={styles.dashboard_main}>
        <div className={styles.dashboard_layout}>
          <aside className={styles.sidebar_left}>
            <div className={styles.sidebar_sticky}>
              <div className={styles.user_profile_card}>
                <div className={styles.profile_header}>
                  <div
                    className={styles.profile_avatar}
                    style={{ backgroundImage: `url('${userData.avatar}')` }}
                  ></div>
                  <div className={styles.profile_info}>
                    <h1 className={styles.profile_name}>{userData.name}</h1>
                    {userData.email && (
                      <p className={styles.profile_email}>
                        <span className="material-symbols-outlined">mail</span>
                        {userData.email}
                      </p>
                    )}
                    {userData.phone_no && (
                      <p className={styles.profile_phone}>
                        <span className="material-symbols-outlined">phone</span>
                        {userData.phone_no}
                      </p>
                    )}
                    {isUserBlocked() && (
                      <p className={styles.profile_blocked_badge}>Blocked</p>
                    )}
                  </div>
                </div>
                <div className={styles.profile_stats}>
                  <div className={styles.stat_item}>
                    <p className={styles.stat_value}>
                      {userData.societiesCount}
                    </p>
                    <p className={styles.stat_label}>Societies</p>
                  </div>
                  {pendingRequests.length > 0 && (
                    <div className={styles.stat_item}>
                      <button
                        className={styles.pending_requests_btn}
                        onClick={() => setShowRequestsModal(true)}
                      >
                        <p className={styles.stat_value}>
                          {pendingRequests.length}
                        </p>
                        <p className={styles.stat_label}>Pending</p>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <nav className={styles.sidebar_nav}>
                <p className={styles.nav_section_title}>Main Menu</p>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.nav_item} ${activeTab === item.id ? styles.active : ""}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <span className={styles.nav_label}>{item.label}</span>
                  </button>
                ))}
                <div className={styles.nav_divider}></div>
                <p className={styles.nav_section_title}>Account</p>
                <button
                  className={styles.nav_item}
                  onClick={handleOpenSettings}
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span className={styles.nav_label}>Settings</span>
                </button>
                <button
                  className={`${styles.nav_item} ${styles.logout_button}`}
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className={styles.nav_label}>Logout</span>
                </button>
              </nav>

              <div className={styles.sidebar_footer}>
                <div className={styles.footer_links}>
                  <a href="#" className={styles.footer_link}>
                    Privacy
                  </a>
                  <a href="#" className={styles.footer_link}>
                    Terms
                  </a>
                  <a href="#" className={styles.footer_link}>
                    Cookies
                  </a>
                </div>
                <p className={styles.footer_copyright}>
                  © 2023 SocietyConnect Inc.
                </p>
              </div>
            </div>
          </aside>

          <main className={styles.main_feed}>
            <div className={styles.feed_container}>
              {activeTab === "mySocieties" && renderMySocieties()}
              {activeTab === "joinSociety" && renderJoinSociety()}
              {activeTab === "requests" && renderRequests()}
            </div>
          </main>
        </div>
      </div>

      {renderEditModal()}
      {renderRequestsModal()}
      {renderSettingsModal()}
      {renderReportModal()}
    </div>
  );
}

export default MemberPage;
