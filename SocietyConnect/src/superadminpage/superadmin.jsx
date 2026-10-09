import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase-client.ts";
import styles from "./superadmin.module.css";

function SuperAdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("societies");
  const [societies, setSocieties] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(null);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [updatingReport, setUpdatingReport] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockTimePeriod, setBlockTimePeriod] = useState("permanent");
  const [blockDuration, setBlockDuration] = useState("");

  // Badge counts - store last viewed timestamps
  const [newSocietiesCount, setNewSocietiesCount] = useState(0);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [newReportsCount, setNewReportsCount] = useState(0);

  // Track if tabs have been viewed
  const [societiesTabViewed, setSocietiesTabViewed] = useState(false);
  const [usersTabViewed, setUsersTabViewed] = useState(false);
  const [reportsTabViewed, setReportsTabViewed] = useState(false);

  // View Society Page State
  const [viewSocietyMode, setViewSocietyMode] = useState(false);
  const [viewSocietyData, setViewSocietyData] = useState(null);
  const [viewSocietyTab, setViewSocietyTab] = useState("announcements");
  const [societyAnnouncements, setSocietyAnnouncements] = useState([]);
  const [societyMembers, setSocietyMembers] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentMenuOpen, setCommentMenuOpen] = useState(null);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // User state for sidebar profile
  // const [userData, setUserData] = useState({
  //     id: null,
  //     name: 'Super Admin',
  //     email: 'admin@societyconnect.com',
  //     role: 'super_admin'
  // });

  const getPublicUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const { data } = supabase.storage
      .from("society_uploads")
      .getPublicUrl(path);
    return data.publicUrl;
  };

  // Get last viewed timestamp from localStorage
  const getLastViewedTimestamp = (key) => {
    const timestamp = localStorage.getItem(`superadmin_${key}_last_viewed`);
    return timestamp ? new Date(timestamp) : null;
  };

  // Set last viewed timestamp
  const setLastViewedTimestamp = (key) => {
    localStorage.setItem(
      `superadmin_${key}_last_viewed`,
      new Date().toISOString(),
    );
  };

  // Check for new societies (created after last view)
  const checkNewSocieties = async () => {
    const lastViewed = getLastViewedTimestamp("societies");

    try {
      let query = supabase
        .from("society")
        .select("society_id", { count: "exact", head: true });

      if (lastViewed) {
        query = query.gt("created_at", lastViewed.toISOString());
      }

      const { count, error } = await query;

      if (!error && count > 0) {
        setNewSocietiesCount(count);
      } else {
        setNewSocietiesCount(0);
      }
    } catch (error) {
      console.error("Error checking new societies:", error);
      setNewSocietiesCount(0);
    }
  };

  // Check for new users (registered after last view)
  const checkNewUsers = async () => {
    const lastViewed = getLastViewedTimestamp("users");

    try {
      let query = supabase
        .from("users")
        .select("id", { count: "exact", head: true });

      if (lastViewed) {
        query = query.gt("created_at", lastViewed.toISOString());
      }

      const { count, error } = await query;

      if (!error && count > 0) {
        setNewUsersCount(count);
      } else {
        setNewUsersCount(0);
      }
    } catch (error) {
      console.error("Error checking new users:", error);
      setNewUsersCount(0);
    }
  };

  // Check for new reports (reported after last view)
  const checkNewReports = async () => {
    const lastViewed = getLastViewedTimestamp("reports");

    try {
      let query = supabase
        .from("report")
        .select("report_id", { count: "exact", head: true })
        .eq("assigned_to", "super_admin")
        .eq("status", "pending");

      if (lastViewed) {
        query = query.gt("reported_at", lastViewed.toISOString());
      }

      const { count, error } = await query;

      if (!error && count > 0) {
        setNewReportsCount(count);
      } else {
        setNewReportsCount(0);
      }
    } catch (error) {
      console.error("Error checking new reports:", error);
      setNewReportsCount(0);
    }
  };

  // Mark societies tab as viewed and clear badge
  const markSocietiesTabViewed = () => {
    if (!societiesTabViewed) {
      setSocietiesTabViewed(true);
      setNewSocietiesCount(0);
      setLastViewedTimestamp("societies");
    }
  };

  // Mark users tab as viewed and clear badge
  const markUsersTabViewed = () => {
    if (!usersTabViewed) {
      setUsersTabViewed(true);
      setNewUsersCount(0);
      setLastViewedTimestamp("users");
    }
  };

  // Mark reports tab as viewed and clear badge
  const markReportsTabViewed = () => {
    if (!reportsTabViewed) {
      setReportsTabViewed(true);
      setNewReportsCount(0);
      setLastViewedTimestamp("reports");
    }
  };

  // Fetch all societies
  const fetchSocieties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("society")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSocieties(data || []);
      await checkNewSocieties();
    } catch (error) {
      console.error("Error fetching societies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setUsers(data || []);
      await checkNewUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch reports assigned to super_admin
  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const { data, error } = await supabase
        .from("report")
        .select(
          `
                    *,
                    reporter:reporter_id (
                        id,
                        name,
                        email
                    ),
                    society:society_id (
                        society_id,
                        society_name,
                        society_logo
                    )
                `,
        )
        .eq("assigned_to", "super_admin")
        .order("reported_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
      await checkNewReports();
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  // Fetch society announcements for view mode
  const fetchSocietyAnnouncements = async (societyId) => {
    setLoadingAnnouncements(true);
    try {
      const { data: announcementsData, error: announcementsError } =
        await supabase
          .from("announcement")
          .select("*")
          .eq("society_id", societyId)
          .order("created_at", { ascending: false });

      if (announcementsError) throw announcementsError;

      if (announcementsData && announcementsData.length > 0) {
        const creatorEmails = [
          ...new Set(announcementsData.map((a) => a.creator_email)),
        ];

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("name, email")
          .in("email", creatorEmails);

        if (usersError) throw usersError;

        const userMap = {};
        usersData.forEach((user) => {
          userMap[user.email] = user.name;
        });

        const announcementsWithMedia = await Promise.all(
          announcementsData.map(async (announcement) => {
            const { data: mediaData, error: mediaError } = await supabase
              .from("announcement_media")
              .select("*")
              .eq("announcement_id", announcement.announcement_id);

            const mediaWithUrls =
              mediaData?.map((media) => ({
                ...media,
                file_url: getPublicUrl(media.file_path),
              })) || [];

            return {
              ...announcement,
              creator_name:
                userMap[announcement.creator_email] ||
                announcement.creator_email.split("@")[0],
              media: mediaWithUrls,
            };
          }),
        );

        setSocietyAnnouncements(announcementsWithMedia);
      } else {
        setSocietyAnnouncements([]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setSocietyAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Fetch society members for view mode
  const fetchSocietyMembers = async (societyId) => {
    setLoadingMembers(true);
    try {
      const { data: memberSocietyData, error: memberError } = await supabase
        .from("member_society")
        .select(
          `
                    id,
                    role,
                    joined_at,
                    condition,
                    member_id
                `,
        )
        .eq("society_id", societyId);

      if (memberError) {
        setSocietyMembers([]);
        return;
      }

      if (!memberSocietyData || memberSocietyData.length === 0) {
        setSocietyMembers([]);
        return;
      }

      const formattedMembers = [];

      for (const record of memberSocietyData) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", record.member_id)
          .single();

        if (userError) continue;

        if (userData) {
          formattedMembers.push({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: record.role,
            condition: record.condition || "unblocked",
            joinedAt: record.joined_at,
            member_society_id: record.id,
          });
        }
      }

      const sortedMembers = formattedMembers.sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return (a.name || "").localeCompare(b.name || "");
      });

      setSocietyMembers(sortedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      setSocietyMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch comments for an announcement
  const fetchComments = async (announcementId) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("comment")
        .select(
          `
                    *,
                    users:member_id (
                        id,
                        name,
                        email
                    )
                `,
        )
        .eq("announcement_id", announcementId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      if (commentsData && commentsData.length > 0) {
        const formattedComments = commentsData.map((comment) => ({
          ...comment,
          user: comment.users || { name: "Unknown User", email: "" },
        }));
        setComments(formattedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  };

  const handleViewFullSociety = async (society) => {
    setViewSocietyMode(true);
    setViewSocietyData(society);
    setViewSocietyTab("announcements");
    setSelectedAnnouncement(null);
    await fetchSocietyAnnouncements(society.society_id);
    await fetchSocietyMembers(society.society_id);
    setMenuOpen(null);
  };

  const handleViewAnnouncement = async (announcement) => {
    setSelectedAnnouncement(announcement);
    await fetchComments(announcement.announcement_id);
  };

  const handleBackToSocietyList = () => {
    setViewSocietyMode(false);
    setViewSocietyData(null);
    setSelectedAnnouncement(null);
    setSocietyAnnouncements([]);
    setSocietyMembers([]);
    setComments([]);
  };

  const toggleCommentMenu = (commentId) => {
    setCommentMenuOpen(commentMenuOpen === commentId ? null : commentId);
  };

  useEffect(() => {
    fetchSocieties();
    fetchUsers();
    fetchReports();

    // Check for new items every 30 seconds
    const interval = setInterval(() => {
      if (!societiesTabViewed) checkNewSocieties();
      if (!usersTabViewed) checkNewUsers();
      if (!reportsTabViewed) checkNewReports();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userSession");
    localStorage.removeItem("userSession");
    localStorage.removeItem("rememberMe");
    navigate("/");
  };

  // Society Menu Handlers
  const toggleMenu = (societyId) => {
    setMenuOpen(menuOpen === societyId ? null : societyId);
    setUserMenuOpen(null);
  };

  // User Menu Handlers
  const toggleUserMenu = (userId) => {
    setUserMenuOpen(userMenuOpen === userId ? null : userId);
    setMenuOpen(null);
  };

  // Society Actions
  const handleViewSociety = (society) => {
    setSelectedSociety(society);
    setShowViewModal(true);
    setMenuOpen(null);
  };

  const handleBlockSociety = (society) => {
    setSelectedSociety(society);
    setBlockReason("");
    setBlockTimePeriod("permanent");
    setBlockDuration("");
    setShowBlockModal(true);
    setMenuOpen(null);
  };

  const handleUnblockSociety = (society) => {
    setSelectedSociety(society);
    setShowUnblockModal(true);
    setMenuOpen(null);
  };

  const handleRemoveSociety = (society) => {
    setSelectedSociety(society);
    setShowRemoveModal(true);
    setMenuOpen(null);
  };

  // User Actions
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
    setUserMenuOpen(null);
  };

  const handleBlockUser = (user) => {
    setSelectedUser(user);
    setBlockReason("");
    setBlockTimePeriod("permanent");
    setBlockDuration("");
    setShowBlockModal(true);
    setUserMenuOpen(null);
  };

  const handleUnblockUser = (user) => {
    setSelectedUser(user);
    setShowUnblockModal(true);
    setUserMenuOpen(null);
  };

  const handleRemoveUser = (user) => {
    setSelectedUser(user);
    setShowRemoveModal(true);
    setUserMenuOpen(null);
  };

  // Report Actions
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setActionNote("");
    setShowReportsModal(true);
  };

  // Update report status to action_taken
  const handleResolveReport = async () => {
    if (!actionNote.trim()) {
      alert("Please provide action notes");
      return;
    }

    setUpdatingReport(true);

    try {
      // First, get the super admin user ID from the users table
      // You can either:
      // Option 1: Get the current logged-in super admin's ID from session
      // Option 2: Query for a user with role 'super_admin'

      // For now, let's get the current user from session
      const userSession =
        sessionStorage.getItem("userSession") ||
        localStorage.getItem("userSession");
      let currentUserId = 1; // fallback

      if (userSession) {
        try {
          const sessionData = JSON.parse(userSession);
          const userEmail = sessionData.email;

          const { data: userInfo } = await supabase
            .from("users")
            .select("id")
            .eq("email", userEmail)
            .single();

          if (userInfo) {
            currentUserId = userInfo.id;
          }
        } catch (e) {
          console.error("Error getting user session:", e);
        }
      }

      const { error } = await supabase
        .from("report")
        .update({
          status: "action_taken",
          resolved_at: new Date().toISOString(),
          resolved_by: null, // Use actual user ID from database
          resolution_notes: actionNote,
        })
        .eq("report_id", selectedReport.report_id);

      if (error) throw error;

      alert("Report marked as action taken");
      setShowReportsModal(false);
      setSelectedReport(null);
      setActionNote("");
      await fetchReports();

      // Notify the reporter
      const report = reports.find(
        (r) => r.report_id === selectedReport.report_id,
      );
      if (report) {
        // You can add notification logic here if needed
        console.log(
          `Report ${selectedReport.report_id} resolved by user ${currentUserId}`,
        );
      }
    } catch (error) {
      console.error("Error resolving report:", error);
      alert("Error updating report: " + error.message);
    } finally {
      setUpdatingReport(false);
    }
  };

  // Confirm Block Society
  const confirmBlockSociety = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("society")
        .update({ society_status: "blocked" })
        .eq("society_id", selectedSociety.society_id);

      if (error) throw error;

      alert(
        `Society "${selectedSociety.society_name}" has been blocked successfully!`,
      );
      setShowBlockModal(false);
      setSelectedSociety(null);
      setBlockReason("");
      setBlockTimePeriod("permanent");
      setBlockDuration("");
      await fetchSocieties();
    } catch (error) {
      console.error("Error blocking society:", error);
      alert("Error blocking society: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Unblock Society
  const confirmUnblockSociety = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("society")
        .update({ society_status: "unblocked" })
        .eq("society_id", selectedSociety.society_id);

      if (error) throw error;

      alert(
        `Society "${selectedSociety.society_name}" has been unblocked successfully!`,
      );
      setShowUnblockModal(false);
      setSelectedSociety(null);
      await fetchSocieties();
    } catch (error) {
      console.error("Error unblocking society:", error);
      alert("Error unblocking society: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Remove Society
  const confirmRemoveSociety = async () => {
    setActionLoading(true);
    try {
      // Delete member associations
      const { error: memberDeleteError } = await supabase
        .from("member_society")
        .delete()
        .eq("society_id", selectedSociety.society_id);

      if (memberDeleteError) {
        console.error("Error deleting member associations:", memberDeleteError);
      }

      // Delete the society
      const { error } = await supabase
        .from("society")
        .delete()
        .eq("society_id", selectedSociety.society_id);

      if (error) throw error;

      alert(
        `Society "${selectedSociety.society_name}" has been removed permanently!`,
      );
      setShowRemoveModal(false);
      setSelectedSociety(null);
      await fetchSocieties();
    } catch (error) {
      console.error("Error removing society:", error);
      alert("Error removing society: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Block User
  const confirmBlockUser = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ user_status: "blocked" })
        .eq("id", selectedUser.id);

      if (error) throw error;

      alert(`User "${selectedUser.name}" has been blocked successfully!`);
      setShowBlockModal(false);
      setSelectedUser(null);
      setBlockReason("");
      setBlockTimePeriod("permanent");
      setBlockDuration("");
      await fetchUsers();
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Error blocking user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Unblock User
  const confirmUnblockUser = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ user_status: "unblocked" })
        .eq("id", selectedUser.id);

      if (error) throw error;

      alert(`User "${selectedUser.name}" has been unblocked successfully!`);
      setShowUnblockModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Error unblocking user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Remove User
  const confirmRemoveUser = async () => {
    setActionLoading(true);
    try {
      // Check if user is a member of any society
      const { data: memberData } = await supabase
        .from("member_society")
        .select("*")
        .eq("member_id", selectedUser.id);

      if (memberData && memberData.length > 0) {
        await supabase
          .from("member_society")
          .delete()
          .eq("member_id", selectedUser.id);
      }

      // Check if user created any societies
      const { data: societyData } = await supabase
        .from("society")
        .select("society_id")
        .eq("creator_email", selectedUser.email);

      if (societyData && societyData.length > 0) {
        for (const society of societyData) {
          await supabase
            .from("member_society")
            .delete()
            .eq("society_id", society.society_id);
        }

        await supabase
          .from("society")
          .delete()
          .eq("creator_email", selectedUser.email);
      }

      // Delete the user
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      alert(`User "${selectedUser.name}" has been removed permanently!`);
      setShowRemoveModal(false);
      setSelectedUser(null);
      await fetchUsers();
      await fetchSocieties();
    } catch (error) {
      console.error("Error removing user:", error);
      alert("Error removing user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "blocked") {
      return <span className={styles.status_badge_blocked}>Blocked</span>;
    }
    return <span className={styles.status_badge_active}>Active</span>;
  };

  const getUserStatusBadge = (status) => {
    if (status === "blocked") {
      return <span className={styles.status_badge_blocked}>Blocked</span>;
    }
    return <span className={styles.status_badge_active}>Active</span>;
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case "announcement":
        return "campaign";
      case "comment":
        return "chat_bubble";
      case "member":
        return "person";
      case "society":
        return "corporate_fare";
      default:
        return "flag";
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case "announcement":
        return "Announcement";
      case "comment":
        return "Comment";
      case "member":
        return "Member";
      case "society":
        return "Society";
      default:
        return type;
    }
  };

  // Render View Society Full Page
  const renderViewSocietyPage = () => {
    if (!viewSocietyData) return null;

    const viewNavItems = [
      { id: "announcements", icon: "campaign", label: "Announcements" },
      { id: "members", icon: "people", label: "Members" },
    ];

    return (
      <div className={styles.view_society_page}>
        <header className={styles.view_society_header}>
          <div className={styles.view_society_header_content}>
            <button
              className={styles.back_button_large}
              onClick={handleBackToSocietyList}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Societies
            </button>
            <div className={styles.view_society_title}>
              <div className={styles.view_society_logo_small}>
                {viewSocietyData.society_logo ? (
                  <img
                    src={getPublicUrl(viewSocietyData.society_logo)}
                    alt={viewSocietyData.society_name}
                  />
                ) : (
                  <span>
                    {viewSocietyData.society_name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1>{viewSocietyData.society_name}</h1>
                <p>Code: {viewSocietyData.society_code}</p>
              </div>
            </div>
            <div style={{ width: "120px" }}></div>
          </div>
        </header>

        <div className={styles.view_society_main}>
          <div className={styles.view_society_layout}>
            <aside className={styles.view_society_sidebar}>
              <nav className={styles.view_society_nav}>
                {viewNavItems.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.view_nav_item} ${viewSocietyTab === item.id ? styles.active : ""}`}
                    onClick={() => {
                      setViewSocietyTab(item.id);
                      setSelectedAnnouncement(null);
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <main className={styles.view_society_content}>
              {viewSocietyTab === "announcements" && (
                <div className={styles.announcements_section}>
                  <div className={styles.section_header_inline}>
                    <h2>Announcements</h2>
                    <span className={styles.count_badge}>
                      {societyAnnouncements.length}
                    </span>
                  </div>

                  {loadingAnnouncements ? (
                    <div className={styles.loading_state_small}>
                      <div className={styles.loading_spinner_small}></div>
                      <p>Loading announcements...</p>
                    </div>
                  ) : selectedAnnouncement ? (
                    <div className={styles.full_announcement_view}>
                      <button
                        className={styles.back_to_list_btn}
                        onClick={() => setSelectedAnnouncement(null)}
                      >
                        <span className="material-symbols-outlined">
                          arrow_back
                        </span>
                        Back to Announcements
                      </button>

                      <div className={styles.announcement_detail_card}>
                        <div className={styles.announcement_detail_header}>
                          <div className={styles.announcement_author}>
                            <div className={styles.author_avatar}>
                              <span>
                                {selectedAnnouncement.creator_name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4>{selectedAnnouncement.creator_name}</h4>
                              <p>
                                {new Date(
                                  selectedAnnouncement.created_at,
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={styles.announcement_detail_message}>
                          <p>{selectedAnnouncement.message}</p>
                        </div>
                        {selectedAnnouncement.media &&
                          selectedAnnouncement.media.length > 0 && (
                            <div className={styles.announcement_detail_media}>
                              {selectedAnnouncement.media.map((media) => (
                                <div
                                  key={media.media_id}
                                  className={styles.media_item}
                                >
                                  {media.file_type === "image" ? (
                                    <img
                                      src={media.file_url}
                                      alt="Attachment"
                                    />
                                  ) : media.file_type === "video" ? (
                                    <video controls src={media.file_url} />
                                  ) : (
                                    <a
                                      href={media.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Download Attachment
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className={styles.comments_section}>
                        <h3>Comments ({comments.length})</h3>
                        <div className={styles.comments_list}>
                          {comments.length === 0 ? (
                            <div className={styles.no_comments}>
                              <p>No comments yet.</p>
                            </div>
                          ) : (
                            comments.map((comment) => (
                              <div
                                key={comment.comment_id}
                                className={styles.comment_item}
                              >
                                <div className={styles.comment_avatar}>
                                  <span>
                                    {comment.user?.name
                                      ?.charAt(0)
                                      .toUpperCase() || "?"}
                                  </span>
                                </div>
                                <div className={styles.comment_content}>
                                  <div className={styles.comment_author}>
                                    <strong>
                                      {comment.user?.name || "Unknown User"}
                                    </strong>
                                    <span>
                                      {new Date(
                                        comment.created_at,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <p>{comment.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.announcements_list}>
                      {societyAnnouncements.length === 0 ? (
                        <div className={styles.empty_state_small}>
                          <span className="material-symbols-outlined">
                            campaign
                          </span>
                          <p>No announcements yet</p>
                        </div>
                      ) : (
                        societyAnnouncements.map((announcement) => (
                          <div
                            key={announcement.announcement_id}
                            className={styles.announcement_card_small}
                          >
                            <div className={styles.announcement_card_header}>
                              <div className={styles.announcement_author_info}>
                                <div className={styles.author_avatar_small}>
                                  <span>
                                    {announcement.creator_name
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <strong>{announcement.creator_name}</strong>
                                  <p>
                                    {new Date(
                                      announcement.created_at,
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className={styles.announcement_card_message}>
                              <p>{announcement.message.substring(0, 150)}...</p>
                            </div>
                            <div className={styles.announcement_card_footer}>
                              <button
                                className={styles.view_detail_btn}
                                onClick={() =>
                                  handleViewAnnouncement(announcement)
                                }
                              >
                                <span className="material-symbols-outlined">
                                  visibility
                                </span>
                                View Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {viewSocietyTab === "members" && (
                <div className={styles.members_section}>
                  <div className={styles.section_header_inline}>
                    <h2>Members</h2>
                    <span className={styles.count_badge}>
                      {societyMembers.length}
                    </span>
                  </div>

                  {loadingMembers ? (
                    <div className={styles.loading_state_small}>
                      <div className={styles.loading_spinner_small}></div>
                      <p>Loading members...</p>
                    </div>
                  ) : societyMembers.length === 0 ? (
                    <div className={styles.empty_state_small}>
                      <span className="material-symbols-outlined">people</span>
                      <p>No members yet</p>
                    </div>
                  ) : (
                    <div className={styles.members_grid_view}>
                      {societyMembers.map((member) => (
                        <div
                          key={member.id}
                          className={styles.member_card_view}
                        >
                          <div className={styles.member_avatar_view}>
                            <span>{member.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className={styles.member_info_view}>
                            <h4>{member.name}</h4>
                            <p>{member.email}</p>
                            <span
                              className={`${styles.member_role_badge} ${member.role === "admin" ? styles.admin_role : styles.member_role}`}
                            >
                              {member.role === "admin" ? "Admin" : "Member"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  };

  // Render Societies Management
  const renderSocietiesManagement = () => {
    markSocietiesTabViewed();

    return (
      <div className={styles.content_section}>
        <div className={styles.section_header}>
          <div>
            <h2 className={styles.section_title}>All Societies</h2>
            <p className={styles.section_subtitle}>
              Manage all societies on the platform
            </p>
          </div>
          <button className={styles.refresh_btn} onClick={fetchSocieties}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className={styles.empty_state}>
            <div className={styles.loading_spinner}></div>
            <p>Loading societies...</p>
          </div>
        ) : societies.length === 0 ? (
          <div className={styles.empty_state}>
            <span className="material-symbols-outlined">corporate_fare</span>
            <h3>No societies found</h3>
            <p>There are no societies registered on the platform yet.</p>
          </div>
        ) : (
          <div className={styles.table_container}>
            <table className={styles.data_table}>
              <thead>
                <tr>
                  <th>Society Name</th>
                  <th>Description</th>
                  <th>Creator Email</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th className={styles.text_right}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {societies.map((society) => (
                  <tr key={society.society_id}>
                    <tr>
                      <div className={styles.society_info}>
                        <div className={styles.society_avatar}>
                          {society.society_logo ? (
                            <img
                              src={getPublicUrl(society.society_logo)}
                              alt={society.society_name}
                            />
                          ) : (
                            <span>
                              {society.society_name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className={styles.society_details}>
                          <span className={styles.society_name}>
                            {society.society_name}
                          </span>
                          <span className={styles.society_code}>
                            Code: {society.society_code}
                          </span>
                        </div>
                      </div>
                    </tr>
                    <td>
                      <div className={styles.society_description_cell}>
                        {society.society_description?.substring(0, 80)}...
                      </div>
                    </td>
                    <td>{society.creator_email}</td>
                    <td>{new Date(society.created_at).toLocaleDateString()}</td>
                    <td>{getStatusBadge(society.society_status)}</td>
                    <td className={styles.text_right}>
                      <div className={styles.menu_container}>
                        <button
                          className={styles.menu_button}
                          onClick={() => toggleMenu(society.society_id)}
                        >
                          <span className="material-symbols-outlined">
                            more_vert
                          </span>
                        </button>
                        {menuOpen === society.society_id && (
                          <div className={styles.dropdown_menu}>
                            <button
                              className={styles.dropdown_item}
                              onClick={() => handleViewFullSociety(society)}
                            >
                              <span className="material-symbols-outlined">
                                visibility
                              </span>
                              View Society
                            </button>
                            <button
                              className={styles.dropdown_item}
                              onClick={() => handleViewSociety(society)}
                            >
                              <span className="material-symbols-outlined">
                                info
                              </span>
                              View Details
                            </button>
                            {society.society_status === "blocked" ? (
                              <button
                                className={styles.dropdown_item}
                                onClick={() => handleUnblockSociety(society)}
                              >
                                <span className="material-symbols-outlined">
                                  lock_open
                                </span>
                                Unblock Society
                              </button>
                            ) : (
                              <button
                                className={`${styles.dropdown_item} ${styles.warning_item}`}
                                onClick={() => handleBlockSociety(society)}
                              >
                                <span className="material-symbols-outlined">
                                  block
                                </span>
                                Block Society
                              </button>
                            )}
                            <button
                              className={`${styles.dropdown_item} ${styles.danger_item}`}
                              onClick={() => handleRemoveSociety(society)}
                            >
                              <span className="material-symbols-outlined">
                                delete_forever
                              </span>
                              Remove Society
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render Users Management
  const renderUsersManagement = () => {
    markUsersTabViewed();

    return (
      <div className={styles.content_section}>
        <div className={styles.section_header}>
          <div>
            <h2 className={styles.section_title}>All Users</h2>
            <p className={styles.section_subtitle}>
              Manage all users on the platform
            </p>
          </div>
          <button className={styles.refresh_btn} onClick={fetchUsers}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>

        {usersLoading ? (
          <div className={styles.empty_state}>
            <div className={styles.loading_spinner}></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.empty_state}>
            <span className="material-symbols-outlined">group</span>
            <h3>No users found</h3>
            <p>There are no users registered on the platform yet.</p>
          </div>
        ) : (
          <div className={styles.table_container}>
            <table className={styles.data_table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th className={styles.text_right}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.society_info}>
                        <div className={styles.user_avatar}>
                          <span>{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className={styles.society_details}>
                          <span className={styles.society_name}>
                            {user.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone_no || "Not provided"}</td>
                    <td>#{user.id}</td>
                    <td>{getUserStatusBadge(user.user_status)}</td>
                    <td className={styles.text_right}>
                      <div className={styles.menu_container}>
                        <button
                          className={styles.menu_button}
                          onClick={() => toggleUserMenu(user.id)}
                        >
                          <span className="material-symbols-outlined">
                            more_vert
                          </span>
                        </button>
                        {userMenuOpen === user.id && (
                          <div className={styles.dropdown_menu}>
                            <button
                              className={styles.dropdown_item}
                              onClick={() => handleViewUser(user)}
                            >
                              <span className="material-symbols-outlined">
                                visibility
                              </span>
                              View Details
                            </button>
                            {user.user_status === "blocked" ? (
                              <button
                                className={styles.dropdown_item}
                                onClick={() => handleUnblockUser(user)}
                              >
                                <span className="material-symbols-outlined">
                                  lock_open
                                </span>
                                Unblock User
                              </button>
                            ) : (
                              <button
                                className={`${styles.dropdown_item} ${styles.warning_item}`}
                                onClick={() => handleBlockUser(user)}
                              >
                                <span className="material-symbols-outlined">
                                  block
                                </span>
                                Block User
                              </button>
                            )}
                            <button
                              className={`${styles.dropdown_item} ${styles.danger_item}`}
                              onClick={() => handleRemoveUser(user)}
                            >
                              <span className="material-symbols-outlined">
                                delete_forever
                              </span>
                              Remove User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render Reports Section
  const renderReports = () => {
    markReportsTabViewed();

    const pendingReports = reports.filter((r) => r.status === "pending");
    const resolvedReports = reports.filter((r) => r.status === "action_taken");

    return (
      <div className={styles.content_section}>
        <div className={styles.section_header}>
          <div>
            <h2 className={styles.section_title}>Reports</h2>
            <p className={styles.section_subtitle}>
              {pendingReports.length} pending • {resolvedReports.length}{" "}
              resolved
            </p>
          </div>
          <button className={styles.refresh_btn} onClick={fetchReports}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>

        {reportsLoading ? (
          <div className={styles.empty_state}>
            <div className={styles.loading_spinner}></div>
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className={styles.empty_state}>
            <span className="material-symbols-outlined">flag</span>
            <h3>No reports</h3>
            <p>No reports have been submitted to super admin yet.</p>
          </div>
        ) : (
          <>
            {pendingReports.length > 0 && (
              <div className={styles.reports_subsection}>
                <div className={styles.subsection_header}>
                  <span className="material-symbols-outlined">pending</span>
                  <h3>Pending Reports</h3>
                  <span className={styles.badge_count}>
                    {pendingReports.length}
                  </span>
                </div>
                <div className={styles.reports_list}>
                  {pendingReports.map((report) => (
                    <div key={report.report_id} className={styles.report_card}>
                      <div className={styles.report_header}>
                        <div className={styles.report_type}>
                          <span className="material-symbols-outlined">
                            {getReportTypeIcon(report.report_type)}
                          </span>
                          <span>{getReportTypeLabel(report.report_type)}</span>
                        </div>
                        <div className={styles.report_status}>
                          <span className={styles.status_badge_pending}>
                            Pending
                          </span>
                        </div>
                      </div>
                      <div className={styles.report_content}>
                        <p>
                          <strong>Reason:</strong> {report.reason}
                        </p>
                        {report.description && (
                          <p>
                            <strong>Details:</strong> {report.description}
                          </p>
                        )}
                        <div className={styles.report_meta}>
                          <span>
                            <span className="material-symbols-outlined">
                              person
                            </span>
                            Reported by: {report.reporter?.name || "Unknown"}
                          </span>
                          <span>
                            <span className="material-symbols-outlined">
                              corporate_fare
                            </span>
                            Society: {report.society?.society_name || "N/A"}
                          </span>
                          <span>
                            <span className="material-symbols-outlined">
                              schedule
                            </span>
                            {new Date(report.reported_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.report_footer}>
                        <button
                          className={styles.view_button}
                          onClick={() => handleViewReport(report)}
                        >
                          <span className="material-symbols-outlined">
                            visibility
                          </span>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingReports.length > 0 && resolvedReports.length > 0 && (
              <div className={styles.divider}>
                <div className={styles.divider_line}></div>
                <span className={styles.divider_text}>Past Reports</span>
                <div className={styles.divider_line}></div>
              </div>
            )}

            {resolvedReports.length > 0 && (
              <div className={styles.reports_subsection}>
                <div className={styles.subsection_header}>
                  <span className="material-symbols-outlined">history</span>
                  <h3>Resolved Reports</h3>
                  <span className={styles.badge_count}>
                    {resolvedReports.length}
                  </span>
                </div>
                <div className={styles.reports_list}>
                  {resolvedReports.map((report) => (
                    <div
                      key={report.report_id}
                      className={`${styles.report_card} ${styles.resolved_card}`}
                    >
                      <div className={styles.report_header}>
                        <div className={styles.report_type}>
                          <span className="material-symbols-outlined">
                            {getReportTypeIcon(report.report_type)}
                          </span>
                          <span>{getReportTypeLabel(report.report_type)}</span>
                        </div>
                        <div className={styles.report_status}>
                          <span className={styles.status_badge_resolved}>
                            Resolved
                          </span>
                        </div>
                      </div>
                      <div className={styles.report_content}>
                        <p>
                          <strong>Reason:</strong> {report.reason}
                        </p>
                        {report.description && (
                          <p>
                            <strong>Details:</strong> {report.description}
                          </p>
                        )}
                        {report.resolution_notes && (
                          <p>
                            <strong>Resolution:</strong>{" "}
                            {report.resolution_notes}
                          </p>
                        )}
                        <div className={styles.report_meta}>
                          <span>
                            <span className="material-symbols-outlined">
                              person
                            </span>
                            By: {report.reporter?.name || "Unknown"}
                          </span>
                          <span>
                            <span className="material-symbols-outlined">
                              schedule
                            </span>
                            {new Date(report.reported_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.report_footer}>
                        <button
                          className={styles.view_button}
                          onClick={() => handleViewReport(report)}
                        >
                          <span className="material-symbols-outlined">
                            visibility
                          </span>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Render Report Details Modal
  const renderReportDetailsModal = () => {
    if (!showReportsModal || !selectedReport) return null;

    const isResolved = selectedReport.status === "action_taken";

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowReportsModal(false)}
      >
        <div
          className={styles.modal_content_large}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Report Details</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowReportsModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <div className={styles.report_detail_header}>
              <div className={styles.report_detail_type}>
                <span className="material-symbols-outlined">
                  {getReportTypeIcon(selectedReport.report_type)}
                </span>
                <span>{selectedReport.report_type?.toUpperCase()}</span>
              </div>
              <div className={styles.report_detail_status}>
                <span
                  className={`${styles.status_badge} ${selectedReport.status === "pending" ? styles.status_pending : styles.status_resolved}`}
                >
                  {selectedReport.status === "pending"
                    ? "Pending"
                    : "Action Taken"}
                </span>
              </div>
            </div>

            <div className={styles.report_detail_section}>
              <h4>Report Information</h4>
              <p>
                <strong>Reported by:</strong> {selectedReport.reporter?.name} (
                {selectedReport.reporter?.email})
              </p>
              <p>
                <strong>Society:</strong> {selectedReport.society?.society_name}
              </p>
              <p>
                <strong>Reported on:</strong>{" "}
                {new Date(selectedReport.reported_at).toLocaleString()}
              </p>
              <p>
                <strong>Reason:</strong> {selectedReport.reason}
              </p>
              {selectedReport.description && (
                <p>
                  <strong>Additional Details:</strong>{" "}
                  {selectedReport.description}
                </p>
              )}
            </div>

            {selectedReport.resolution_notes && (
              <div className={styles.report_detail_section}>
                <h4>Resolution Information</h4>
                <p>
                  <strong>Resolved on:</strong>{" "}
                  {new Date(selectedReport.resolved_at).toLocaleString()}
                </p>
                <p>
                  <strong>Resolution Notes:</strong>{" "}
                  {selectedReport.resolution_notes}
                </p>
              </div>
            )}

            {!isResolved && (
              <div className={styles.report_detail_section}>
                <h4>Take Action</h4>
                <div className={styles.form_group}>
                  <label className={styles.form_label}>Action Notes *</label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Describe the action taken (e.g., warned user, removed content, blocked member, suspended society, etc.)"
                    className={styles.form_textarea}
                    rows="4"
                    required
                  />
                </div>
              </div>
            )}
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowReportsModal(false)}
            >
              Close
            </button>
            {!isResolved && (
              <button
                className={`${styles.submit_btn} ${styles.resolve_btn}`}
                onClick={handleResolveReport}
                disabled={updatingReport || !actionNote.trim()}
              >
                {updatingReport ? "Processing..." : "Mark as Action Taken"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render View Modal
  const renderViewModal = () => {
    if (!showViewModal) return null;

    const isSociety = selectedSociety !== null;
    const item = isSociety ? selectedSociety : selectedUser;

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowViewModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>{isSociety ? "Society Details" : "User Details"}</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowViewModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            {isSociety ? (
              <>
                <div className={styles.view_society_header}>
                  <div className={styles.view_society_logo}>
                    {selectedSociety.society_logo ? (
                      <img
                        src={getPublicUrl(selectedSociety.society_logo)}
                        alt={selectedSociety.society_name}
                      />
                    ) : (
                      <span>
                        {selectedSociety.society_name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={styles.view_society_info}>
                    <h2>{selectedSociety.society_name}</h2>
                    <p className={styles.society_code_text}>
                      Code: {selectedSociety.society_code}
                    </p>
                    {getStatusBadge(selectedSociety.society_status)}
                  </div>
                </div>

                <div className={styles.detail_section}>
                  <label>Description</label>
                  <p>
                    {selectedSociety.society_description ||
                      "No description provided"}
                  </p>
                </div>

                <div className={styles.detail_grid}>
                  <div className={styles.detail_item}>
                    <label>Creator Email</label>
                    <p>{selectedSociety.creator_email}</p>
                  </div>
                  <div className={styles.detail_item}>
                    <label>Created Date</label>
                    <p>
                      {new Date(selectedSociety.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className={styles.detail_item}>
                    <label>Visibility</label>
                    <p>
                      {selectedSociety.visible === "yes" ? "Visible" : "Hidden"}
                    </p>
                  </div>
                  <div className={styles.detail_item}>
                    <label>Accessibility</label>
                    <p>
                      {selectedSociety.accessible === "anyone"
                        ? "Anyone can join"
                        : "Permission Required"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.view_society_header}>
                  <div className={styles.view_user_avatar}>
                    <span>{selectedUser.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={styles.view_society_info}>
                    <h2>{selectedUser.name}</h2>
                    <p className={styles.user_email_text}>
                      {selectedUser.email}
                    </p>
                    {getUserStatusBadge(selectedUser.user_status)}
                  </div>
                </div>

                <div className={styles.detail_grid}>
                  <div className={styles.detail_item}>
                    <label>User ID</label>
                    <p>#{selectedUser.id}</p>
                  </div>
                  <div className={styles.detail_item}>
                    <label>Phone Number</label>
                    <p>{selectedUser.phone_no || "Not provided"}</p>
                  </div>
                  <div className={styles.detail_item}>
                    <label>Status</label>
                    <p>
                      {selectedUser.user_status === "blocked"
                        ? "Blocked"
                        : "Active"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowViewModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Block Modal
  const renderBlockModal = () => {
    if (!showBlockModal) return null;

    const isSociety = selectedSociety !== null;
    const itemName = isSociety
      ? selectedSociety?.society_name
      : selectedUser?.name;
    const itemType = isSociety ? "society" : "user";

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowBlockModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Block {itemType === "society" ? "Society" : "User"}</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowBlockModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <p>
              Are you sure you want to block <strong>{itemName}</strong>?
            </p>

            <div className={styles.form_group}>
              <label className={styles.form_label}>Block Duration</label>
              <div className={styles.radio_group}>
                <label
                  className={`${styles.radio_label} ${blockTimePeriod === "permanent" ? styles.selected : ""}`}
                >
                  <input
                    type="radio"
                    name="blockTimePeriod"
                    value="permanent"
                    checked={blockTimePeriod === "permanent"}
                    onChange={() => {
                      setBlockTimePeriod("permanent");
                      setBlockDuration("");
                    }}
                  />
                  <span>Permanent Block</span>
                </label>
                <label
                  className={`${styles.radio_label} ${blockTimePeriod === "temporary" ? styles.selected : ""}`}
                >
                  <input
                    type="radio"
                    name="blockTimePeriod"
                    value="temporary"
                    checked={blockTimePeriod === "temporary"}
                    onChange={() => setBlockTimePeriod("temporary")}
                  />
                  <span>Temporary Block</span>
                </label>
              </div>
            </div>

            {blockTimePeriod === "temporary" && (
              <div className={styles.form_group}>
                <label className={styles.form_label}>
                  Block Duration (Days)
                </label>
                <input
                  type="number"
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  placeholder="Enter number of days"
                  className={styles.form_input}
                  min="1"
                  max="365"
                />
              </div>
            )}

            <div className={styles.form_group}>
              <label className={styles.form_label}>Reason (Optional)</label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
                className={styles.form_textarea}
                rows="3"
              />
            </div>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowBlockModal(false)}
            >
              Cancel
            </button>
            <button
              className={`${styles.submit_btn} ${styles.danger_btn}`}
              onClick={isSociety ? confirmBlockSociety : confirmBlockUser}
              disabled={
                actionLoading ||
                (blockTimePeriod === "temporary" && !blockDuration)
              }
            >
              {actionLoading
                ? "Blocking..."
                : `Block ${itemType === "society" ? "Society" : "User"}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Unblock Modal
  const renderUnblockModal = () => {
    if (!showUnblockModal) return null;

    const isSociety = selectedSociety !== null;
    const itemName = isSociety
      ? selectedSociety?.society_name
      : selectedUser?.name;
    const itemType = isSociety ? "society" : "user";

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowUnblockModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Unblock {itemType === "society" ? "Society" : "User"}</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowUnblockModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <p>
              Are you sure you want to unblock <strong>{itemName}</strong>?
            </p>
            <p className={styles.warning_text}>
              This will restore full access.
            </p>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowUnblockModal(false)}
            >
              Cancel
            </button>
            <button
              className={`${styles.submit_btn} ${styles.success_btn}`}
              onClick={isSociety ? confirmUnblockSociety : confirmUnblockUser}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Unblocking..."
                : `Unblock ${itemType === "society" ? "Society" : "User"}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Remove Modal
  const renderRemoveModal = () => {
    if (!showRemoveModal) return null;

    const isSociety = selectedSociety !== null;
    const itemName = isSociety
      ? selectedSociety?.society_name
      : selectedUser?.name;
    const itemType = isSociety ? "society" : "user";

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowRemoveModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Remove {itemType === "society" ? "Society" : "User"}</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowRemoveModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <p className={styles.warning_text_large}>
              ⚠️ Warning: This action cannot be undone!
            </p>
            <p>
              Are you sure you want to permanently remove{" "}
              <strong>{itemName}</strong>?
            </p>
            <ul className={styles.delete_list}>
              {isSociety ? (
                <>
                  <li>All member associations</li>
                  <li>All announcements and comments</li>
                  <li>All maintenance fees records</li>
                  <li>All join requests</li>
                </>
              ) : (
                <>
                  <li>All society memberships</li>
                  <li>Any societies created by this user</li>
                  <li>All comments and posts</li>
                  <li>All join requests</li>
                </>
              )}
            </ul>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowRemoveModal(false)}
            >
              Cancel
            </button>
            <button
              className={`${styles.submit_btn} ${styles.danger_btn}`}
              onClick={isSociety ? confirmRemoveSociety : confirmRemoveUser}
              disabled={actionLoading}
            >
              {actionLoading ? "Removing..." : "Permanently Remove"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "societies":
        return renderSocietiesManagement();
      case "users":
        return renderUsersManagement();
      case "reports":
        return renderReports();
      default:
        return renderSocietiesManagement();
    }
  };

  // If in view society mode, render the full page
  if (viewSocietyMode) {
    return renderViewSocietyPage();
  }

  const navItems = [
    {
      id: "societies",
      icon: "corporate_fare",
      label: "Society Management",
      count: newSocietiesCount,
    },
    {
      id: "users",
      icon: "group",
      label: "User Management",
      count: newUsersCount,
    },
    { id: "reports", icon: "flag", label: "Reports", count: newReportsCount },
  ];

  return (
    <div className={styles.super_admin_page}>
      <header className={styles.admin_header}>
        <div className={styles.header_content}>
          <div className={styles.header_left}>
            <button
              className={styles.back_button}
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

          <div className={styles.header_center}>
            <h2 className={styles.header_subtitle}>Admin Console</h2>
          </div>

          <div className={styles.header_right}>
            <button className={styles.logout_button} onClick={handleLogout}>
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.admin_main}>
        <div className={styles.admin_layout}>
          <aside className={styles.sidebar_left}>
            <div className={styles.sidebar_sticky}>
              <div className={styles.user_profile_card}>
                <div className={styles.profile_header}>
                  <div className={styles.profile_avatar}>
                    <span>A</span>
                  </div>
                  <div className={styles.profile_info}>
                    <h1 className={styles.profile_name}>Super Admin</h1>
                    <p className={styles.profile_role}>Super Administrator</p>
                  </div>
                </div>
              </div>

              <nav className={styles.sidebar_nav}>
                <p className={styles.nav_section_title}>Main Menu</p>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.nav_item} ${activeTab === item.id ? styles.active : ""}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === "societies") {
                        setNewSocietiesCount(0);
                        setLastViewedTimestamp("societies");
                      } else if (item.id === "users") {
                        setNewUsersCount(0);
                        setLastViewedTimestamp("users");
                      } else if (item.id === "reports") {
                        setNewReportsCount(0);
                        setLastViewedTimestamp("reports");
                      }
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <span className={styles.nav_label}>{item.label}</span>
                    {item.count > 0 && (
                      <span className={styles.notification_badge_red}>
                        {item.count > 99 ? "99+" : item.count}
                      </span>
                    )}
                  </button>
                ))}
                <div className={styles.nav_divider}></div>
                <p className={styles.nav_section_title}>System</p>
                <button
                  className={`${styles.nav_item} ${styles.color_red}`}
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined">exit_to_app</span>
                  <span className={styles.nav_label}>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          <main className={styles.main_feed}>
            <div className={styles.feed_container}>{renderContent()}</div>
          </main>
        </div>
      </div>

      {renderViewModal()}
      {renderBlockModal()}
      {renderUnblockModal()}
      {renderRemoveModal()}
      {renderReportDetailsModal()}
    </div>
  );
}

export default SuperAdminPage;
