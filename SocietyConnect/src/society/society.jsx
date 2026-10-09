import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase-client.ts";
import styles from "./society.module.css";

function SocietyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const society = location.state?.society;
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("announcement");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState({
    id: null,
    name: "",
    email: "",
    role: "",
    condition: "unblocked",
  });
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [posting, setPosting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [memberMenuOpen, setMemberMenuOpen] = useState(null);
  const [commentMenuOpen, setCommentMenuOpen] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockTimePeriod, setBlockTimePeriod] = useState("permanent");
  const [blockDuration, setBlockDuration] = useState("");
  const [societyLogoUrl, setSocietyLogoUrl] = useState(null);
  const [societyData, setSocietyData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  const [notificationFilter, setNotificationFilter] = useState("received");

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showAddNotificationModal, setShowAddNotificationModal] =
    useState(false);
  const [newNotificationTitle, setNewNotificationTitle] = useState("");
  const [newNotificationMessage, setNewNotificationMessage] = useState("");
  const [selectedMemberForNotification, setSelectedMemberForNotification] =
    useState("all");
  const [submittingNotification, setSubmittingNotification] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  const [maintenanceFees, setMaintenanceFees] = useState([]);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceAmount, setMaintenanceAmount] = useState("");
  const [maintenanceDueDate, setMaintenanceDueDate] = useState("");
  const [maintenanceDescription, setMaintenanceDescription] = useState("");
  const [selectedMemberForMaintenance, setSelectedMemberForMaintenance] =
    useState("all");
  const [submittingMaintenance, setSubmittingMaintenance] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const [removedMembersData, setRemovedMembersData] = useState({});

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsData, setSettingsData] = useState({
    visible: "yes",
    accessible: "anyone",
  });
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const [joinRequests, setJoinRequests] = useState([]);
  const [processingRequest, setProcessingRequest] = useState(false);

  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0);
  const [newMembersCount, setNewMembersCount] = useState(0);
  const [pendingDuesCount, setPendingDuesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [viewedAnnouncements, setViewedAnnouncements] = useState([]);
  const [membersTabViewed, setMembersTabViewed] = useState(false);

  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingItem, setReportingItem] = useState(null);
  const [reportType, setReportType] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reports, setReports] = useState([]);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [updatingReport, setUpdatingReport] = useState(false);
  const [societyStatus, setSocietyStatus] = useState("unblocked"); // Add this line

  const getPublicUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const { data } = supabase.storage
      .from("society_uploads")
      .getPublicUrl(path);
    return data.publicUrl;
  };

  // Fetch reports for this society (admin only)
  const fetchReports = async () => {
    // Don't fetch if we don't have the necessary data
    if (!society?.id || !userData?.id) {
      console.log("Cannot fetch reports: missing society or user data");
      return;
    }

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
                    )
                `,
        )
        .eq("society_id", society.id)
        .order("reported_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    }
  };

  // Fetch join requests for this society
  const fetchJoinRequests = async () => {
    if (!society?.id) return;

    try {
      const { data, error } = await supabase
        .from("request")
        .select(
          `
                    *,
                    member:member_id (
                        id,
                        name,
                        email
                    )
                `,
        )
        .eq("society_id", society.id)
        .eq("status", "not_accepted")
        .order("request_time", { ascending: false });

      if (error) throw error;
      setJoinRequests(data || []);
    } catch (error) {
      console.error("Error fetching join requests:", error);
      setJoinRequests([]);
    }
  };

  // Create notification function (defined early)
  const createNotification = async (
    memberId,
    title,
    message,
    senderId = null,
  ) => {
    try {
      if (!memberId || !message) return false;

      let finalTitle = title;
      if (!finalTitle || finalTitle.trim() === "") {
        if (message.includes("announcement"))
          finalTitle = "📢 New Announcement";
        else if (message.includes("blocked")) finalTitle = "⛔ Account Blocked";
        else if (message.includes("unblocked"))
          finalTitle = "✅ Account Unblocked";
        else if (message.includes("promoted")) finalTitle = "🎉 Promotion";
        else if (message.includes("demoted")) finalTitle = "📉 Demotion";
        else if (message.includes("due") || message.includes("maintenance"))
          finalTitle = "💰 Payment Due";
        else if (message.includes("report")) finalTitle = "⚠️ Report Update";
        else finalTitle = "📬 New Notification";
      }

      const notificationData = {
        member_id: parseInt(memberId),
        society_id: parseInt(society.id),
        title: finalTitle.substring(0, 255),
        message: message.substring(0, 1000),
        is_read: false,
        sended_at: new Date().toISOString(),
        created_by: senderId ? parseInt(senderId) : userData.id,
      };

      const { error } = await supabase
        .from("notification")
        .insert([notificationData]);

      if (error) {
        console.error("Supabase error:", error);
        return false;
      }

      await fetchNotifications();
      return true;
    } catch (error) {
      console.error("Error in createNotification:", error);
      return false;
    }
  };

  const createNotificationForAllMembers = async (title, message) => {
    try {
      const memberIds = members.map((m) => m.id);

      if (memberIds.length === 0) return false;

      let successCount = 0;

      for (const memberId of memberIds) {
        const success = await createNotification(
          memberId,
          title,
          message,
          userData.id,
        );
        if (success) successCount++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return successCount > 0;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  // Open report modal
  // Open report modal
  const handleOpenReportModal = (item, type) => {
    // Check if user is trying to report their own content
    if (type === "announcement") {
      // Check if the current user is the creator of the announcement
      if (item.creator_email === userData.email) {
        alert("You cannot report your own announcement.");
        return;
      }
    } else if (type === "comment") {
      // Check if the current user is the author of the comment
      if (item.member_id === userData.id) {
        alert("You cannot report your own comment.");
        return;
      }
    } else if (type === "member") {
      // Check if the current user is trying to report themselves
      if (item.id === userData.id) {
        alert("You cannot report yourself.");
        return;
      }
    }

    setReportingItem(item);
    setReportType(type);
    setReportReason("");
    setReportDescription("");
    setShowReportModal(true);
    setMenuOpen(null);
    setCommentMenuOpen(null);
    setMemberMenuOpen(null);
  };

  // Submit report to society admin
  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting");
      return;
    }

    setSubmittingReport(true);

    try {
      const { data, error } = await supabase
        .from("report")
        .insert([
          {
            reporter_id: userData.id,
            society_id: society.id,
            report_type: reportType,
            assigned_to: "society_admin",
            reason: reportReason,
            description: reportDescription || null,
            status: "pending",
            reported_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      const admins = members.filter((m) => m.role === "admin");
      for (const admin of admins) {
        await createNotification(
          admin.id,
          `⚠️ New ${reportType} Report`,
          `${userData.name} reported a ${reportType} in the society. Reason: ${reportReason.substring(0, 100)}${reportReason.length > 100 ? "..." : ""}`,
        );
      }

      alert(
        "Report submitted successfully! Society admin will review it shortly.",
      );
      setShowReportModal(false);
      setReportingItem(null);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report: " + error.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Update report status to action_taken
  const handleResolveReport = async (reportId) => {
    if (!actionNote.trim()) {
      alert("Please provide action notes");
      return;
    }

    setUpdatingReport(true);

    try {
      const { error } = await supabase
        .from("report")
        .update({
          status: "action_taken",
          resolved_at: new Date().toISOString(),
          resolved_by: userData.id,
          resolution_notes: actionNote,
        })
        .eq("report_id", reportId);

      if (error) throw error;

      alert("Report marked as action taken");
      setShowReportsModal(false);
      setSelectedReport(null);
      setActionNote("");
      await fetchReports();

      const report = reports.find((r) => r.report_id === reportId);
      if (report) {
        await createNotification(
          report.reporter_id,
          "✅ Report Resolved",
          `Your report has been reviewed and action has been taken. Admin notes: ${actionNote.substring(0, 100)}${actionNote.length > 100 ? "..." : ""}`,
        );
      }
    } catch (error) {
      console.error("Error resolving report:", error);
      alert("Error updating report: " + error.message);
    } finally {
      setUpdatingReport(false);
    }
  };

  // Open report details modal
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setActionNote("");
    setShowReportsModal(true);
  };

  // Check if comment is editable (within 2 hours)
  const isCommentEditable = (commentCreatedAt) => {
    const now = new Date();
    const created = new Date(commentCreatedAt);
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff <= 2;
  };

  // Handle edit comment click
  const handleEditCommentClick = (comment) => {
    if (!isCommentEditable(comment.created_at)) {
      alert("Comments can only be edited within 2 hours of posting.");
      return;
    }
    setEditingComment(comment);
    setEditCommentText(comment.message);
    setShowEditCommentModal(true);
    setCommentMenuOpen(null);
  };

  // Save edited comment
  const handleSaveEditedComment = async () => {
    if (!editCommentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const { error } = await supabase
        .from("comment")
        .update({
          message: editCommentText.trim(),
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq("comment_id", editingComment.comment_id);

      if (error) throw error;

      alert("Comment updated successfully!");
      setShowEditCommentModal(false);
      setEditingComment(null);
      setEditCommentText("");
      await fetchComments(selectedAnnouncement.announcement_id);
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("Error editing comment: " + error.message);
    }
  };

  // Mark announcement as viewed
  const markAnnouncementAsViewed = async (announcementId) => {
    try {
      if (viewedAnnouncements.includes(announcementId)) return;

      const { error } = await supabase.from("announcement_views").insert([
        {
          announcement_id: announcementId,
          user_id: userData.id,
          society_id: society.id,
          viewed_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setViewedAnnouncements((prev) => [...prev, announcementId]);
      setUnreadAnnouncementsCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking announcement as viewed:", error);
    }
  };

  // Mark members tab as viewed
  const markMembersTabAsViewed = async () => {
    try {
      const { error } = await supabase.from("member_society_views").upsert(
        {
          user_id: userData.id,
          society_id: society.id,
          last_viewed: new Date().toISOString(),
        },
        {
          onConflict: "user_id, society_id",
        },
      );

      if (error) throw error;
      setNewMembersCount(0);
    } catch (error) {
      console.error("Error updating members tab view:", error);
    }
  };

  // Fetch unread announcements count
  const fetchUnreadAnnouncementsCount = async () => {
    try {
      const { data: viewedData, error: viewError } = await supabase
        .from("announcement_views")
        .select("announcement_id")
        .eq("user_id", userData.id)
        .eq("society_id", society.id);

      if (viewError) {
        console.error("Error fetching viewed announcements:", viewError);
      }

      const viewedIds = viewedData?.map((v) => v.announcement_id) || [];
      setViewedAnnouncements(viewedIds);

      const unviewedCount = announcements.filter(
        (a) => !viewedIds.includes(a.announcement_id),
      ).length;
      setUnreadAnnouncementsCount(unviewedCount);
    } catch (error) {
      console.error("Error fetching announcements count:", error);
      setUnreadAnnouncementsCount(0);
    }
  };

  // Fetch new members count
  const fetchNewMembersCount = async () => {
    try {
      if (!userData.id || !society?.id) return;

      const { data: viewData, error: viewError } = await supabase
        .from("member_society_views")
        .select("last_viewed")
        .eq("user_id", userData.id)
        .eq("society_id", society.id)
        .single();

      let lastViewed = viewData?.last_viewed;

      if (!lastViewed) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        lastViewed = sevenDaysAgo.toISOString();
      }

      const { count, error } = await supabase
        .from("member_society")
        .select("id", { count: "exact", head: true })
        .eq("society_id", society.id)
        .gt("joined_at", lastViewed);

      if (error) throw error;
      setNewMembersCount(count || 0);
    } catch (error) {
      console.error("Error fetching new members count:", error);
      setNewMembersCount(0);
    }
  };

  // Fetch pending dues count
  const fetchPendingDuesCount = async () => {
    try {
      let query = supabase
        .from("maintenance_fees_info")
        .select("id", { count: "exact" })
        .eq("society_id", society.id)
        .eq("status", "due");

      if (userData.role !== "admin") {
        query = query.eq("member_id", userData.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPendingDuesCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching pending dues count:", error);
      setPendingDuesCount(0);
    }
  };

  // Fetch unread notifications count
  const fetchUnreadNotificationsCount = async () => {
    try {
      const { data, error } = await supabase
        .from("notification")
        .select("id", { count: "exact" })
        .eq("member_id", userData.id)
        .eq("society_id", society.id)
        .eq("is_read", false);

      if (error) throw error;
      setUnreadNotificationsCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      setUnreadNotificationsCount(0);
    }
  };

  // Accept join request
  const acceptJoinRequest = async (requestId, memberId) => {
    if (!window.confirm("Are you sure you want to accept this join request?"))
      return;

    setProcessingRequest(true);

    try {
      const { error: deleteError } = await supabase
        .from("request")
        .delete()
        .eq("request_id", requestId);

      if (deleteError) throw deleteError;

      const { error: joinError } = await supabase
        .from("member_society")
        .insert([
          {
            member_id: memberId,
            society_id: society.id,
            role: "member",
            joined_at: new Date().toISOString(),
            condition: "unblocked",
          },
        ]);

      if (joinError) throw joinError;

      await createNotification(
        memberId,
        "✅ Join Request Accepted",
        `Your request to join "${societyData?.society_name || society?.society_name}" has been accepted! You are now a member.`,
      );

      alert("Join request accepted! Member has been added to the society.");
      await fetchJoinRequests();
      await fetchMembers(society.id);
      await fetchNewMembersCount();
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Error accepting request: " + error.message);
    } finally {
      setProcessingRequest(false);
    }
  };

  // Reject join request
  const rejectJoinRequest = async (requestId, memberId) => {
    if (!window.confirm("Are you sure you want to reject this join request?"))
      return;

    setProcessingRequest(true);

    try {
      const { error: deleteError } = await supabase
        .from("request")
        .delete()
        .eq("request_id", requestId);

      if (deleteError) throw deleteError;

      await createNotification(
        memberId,
        "❌ Join Request Rejected",
        `Your request to join "${societyData?.society_name || society?.society_name}" has been rejected.`,
      );

      alert("Join request rejected.");
      await fetchJoinRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Error rejecting request: " + error.message);
    } finally {
      setProcessingRequest(false);
    }
  };

  // Fetch society settings
  const fetchSocietySettings = async () => {
    try {
      const { data, error } = await supabase
        .from("society")
        .select("visible, accessible")
        .eq("society_id", society.id)
        .single();

      if (error) throw error;

      setSettingsData({
        visible: data?.visible || "yes",
        accessible: data?.accessible || "anyone",
      });
    } catch (error) {
      console.error("Error fetching society settings:", error);
    }
  };

  // Open settings modal
  const handleOpenSettings = async () => {
    await fetchSocietySettings();
    setShowSettingsModal(true);
  };

  // Update society settings
  const handleUpdateSettings = async () => {
    setUpdatingSettings(true);

    try {
      const { error } = await supabase
        .from("society")
        .update({
          visible: settingsData.visible,
          accessible: settingsData.accessible,
        })
        .eq("society_id", society.id);

      if (error) throw error;

      alert("Society settings updated successfully!");
      setShowSettingsModal(false);

      const { data: updatedSociety } = await supabase
        .from("society")
        .select("*")
        .eq("society_id", society.id)
        .single();

      if (updatedSociety) {
        setSocietyData(updatedSociety);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Error updating settings: " + error.message);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const fetchMaintenanceFees = async () => {
    try {
      if (!userData.id || !society?.id) return;

      let query = supabase
        .from("maintenance_fees_info")
        .select("*")
        .eq("society_id", society.id)
        .order("due_date", { ascending: true });

      if (userData.role !== "admin") {
        query = query.eq("member_id", userData.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching maintenance fees:", error);
        setMaintenanceFees([]);
        return;
      }

      setMaintenanceFees(data || []);
    } catch (error) {
      console.error("Error in fetchMaintenanceFees:", error);
      setMaintenanceFees([]);
    }
  };

  const refreshMaintenanceFees = async () => {
    await fetchMaintenanceFees();
  };

  const handleAddMaintenance = async () => {
    if (!maintenanceAmount || !maintenanceDueDate) {
      alert("Please fill in amount and due date");
      return;
    }

    setSubmittingMaintenance(true);

    try {
      let successCount = 0;

      if (selectedMemberForMaintenance === "all") {
        const activeMembers = members.filter((m) => m.condition !== "blocked");

        for (const member of activeMembers) {
          const { error } = await supabase
            .from("maintenance_fees_info")
            .insert([
              {
                member_id: member.id,
                admin_id: userData.id,
                society_id: society.id,
                total_amount: parseFloat(maintenanceAmount),
                status: "due",
                due_date: maintenanceDueDate,
              },
            ]);

          if (error) throw error;
          successCount++;
        }
        alert(`Maintenance fee added for ${successCount} members!`);
      } else {
        const { error } = await supabase.from("maintenance_fees_info").insert([
          {
            member_id: parseInt(selectedMemberForMaintenance),
            admin_id: userData.id,
            society_id: society.id,
            total_amount: parseFloat(maintenanceAmount),
            status: "due",
            due_date: maintenanceDueDate,
          },
        ]);

        if (error) throw error;
        alert("Maintenance fee added successfully!");
      }

      setShowMaintenanceModal(false);
      setMaintenanceAmount("");
      setMaintenanceDueDate("");
      setMaintenanceDescription("");
      setSelectedMemberForMaintenance("all");
      await fetchMaintenanceFees();

      if (selectedMemberForMaintenance === "all") {
        await createNotificationForAllMembers(
          "💰 Maintenance Due",
          `Maintenance fee of ₹${maintenanceAmount} is due by ${new Date(maintenanceDueDate).toLocaleDateString()}`,
        );
      } else {
        const member = members.find(
          (m) => m.id === parseInt(selectedMemberForMaintenance),
        );
        if (member) {
          await createNotification(
            member.id,
            "💰 Maintenance Due",
            `Maintenance fee of ₹${maintenanceAmount} is due by ${new Date(maintenanceDueDate).toLocaleDateString()}`,
          );
        }
      }
    } catch (error) {
      console.error("Error adding maintenance:", error);
      alert("Error adding maintenance fee: " + error.message);
    } finally {
      setSubmittingMaintenance(false);
    }
  };

  const handlePayMaintenance = async (maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedMaintenance) return;

    setProcessingPayment(true);

    try {
      const { error } = await supabase
        .from("maintenance_fees_info")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("maintenance_id", selectedMaintenance.maintenance_id);

      if (error) throw error;

      alert("Payment successful!");
      setShowPaymentModal(false);
      setSelectedMaintenance(null);

      await fetchMaintenanceFees();

      const admins = members.filter((m) => m.role === "admin");
      for (const admin of admins) {
        await createNotification(
          admin.id,
          "✅ Payment Received",
          `${userData.name} has paid maintenance fee of ₹${selectedMaintenance.total_amount}`,
        );
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment: " + error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!userData.id || !society?.id) return;

      let query = supabase
        .from("notification")
        .select("*")
        .eq("society_id", society.id)
        .order("sended_at", { ascending: false });

      if (userData.role === "admin") {
        query = query.or(
          `member_id.eq.${userData.id},created_by.eq.${userData.id}`,
        );
      } else {
        query = query.eq("member_id", userData.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
      setNotifications([]);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (userData.role !== "admin") {
      alert("Only admins can delete notifications");
      return;
    }

    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const { error } = await supabase
          .from("notification")
          .delete()
          .eq("notification_id", notificationId);

        if (error) throw error;

        alert("Notification deleted successfully!");
        await fetchNotifications();
        setNotificationMenuOpen(null);
      } catch (error) {
        console.error("Error deleting notification:", error);
        alert("Error deleting notification: " + error.message);
      }
    }
  };

  const toggleNotificationMenu = (notificationId) => {
    setNotificationMenuOpen(
      notificationMenuOpen === notificationId ? null : notificationId,
    );
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("notification_id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif,
        ),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("member_id", userData.id)
        .eq("society_id", society.id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.member_id === userData.id ? { ...notif, is_read: true } : notif,
        ),
      );

      alert("All notifications marked as read");
      await fetchUnreadNotificationsCount();
    } catch (error) {
      console.error("Error:", error);
      alert("Error marking notifications as read");
    }
  };

  const handleAddNotification = async () => {
    if (!newNotificationMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    setSubmittingNotification(true);

    try {
      let success = false;

      if (selectedMemberForNotification === "all") {
        success = await createNotificationForAllMembers(
          newNotificationTitle.trim() || null,
          newNotificationMessage.trim(),
        );
      } else {
        success = await createNotification(
          parseInt(selectedMemberForNotification),
          newNotificationTitle.trim() || null,
          newNotificationMessage.trim(),
          userData.id,
        );
      }

      if (success) {
        alert("Notification sent successfully!");
        setShowAddNotificationModal(false);
        setNewNotificationTitle("");
        setNewNotificationMessage("");
        setSelectedMemberForNotification("all");
        await fetchNotifications();
      } else {
        alert("Error sending notification");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending notification");
    } finally {
      setSubmittingNotification(false);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const fetchAnnouncements = async (societyId) => {
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

        setAnnouncements(announcementsWithMedia);
      } else {
        setAnnouncements([]);
      }

      if (userData?.id) {
        await fetchUnreadAnnouncementsCount();
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    }
  };

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

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    if (userData.condition === "blocked") {
      alert("You are blocked from commenting.");
      return;
    }

    setPostingComment(true);

    try {
      const { data, error } = await supabase
        .from("comment")
        .insert([
          {
            announcement_id: selectedAnnouncement.announcement_id,
            member_id: userData.id,
            message: newComment.trim(),
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        alert(`Error posting comment: ${error.message}`);
        return;
      }

      const announcementCreator = announcements.find(
        (a) => a.announcement_id === selectedAnnouncement.announcement_id,
      );
      if (
        announcementCreator &&
        announcementCreator.creator_email !== userData.email
      ) {
        const creatorUser = await supabase
          .from("users")
          .select("id")
          .eq("email", announcementCreator.creator_email)
          .single();

        if (creatorUser.data) {
          await createNotification(
            creatorUser.data.id,
            null,
            `${userData.name} commented on your announcement: "${newComment.trim().substring(0, 100)}${newComment.trim().length > 100 ? "..." : ""}"`,
          );
        }
      }

      setNewComment("");
      await fetchComments(selectedAnnouncement.announcement_id);
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Error posting comment. Please try again.");
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    const canDelete =
      userData.role === "admin" || comment.member_id === userData.id;

    if (!canDelete) {
      alert("You can only delete your own comments!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const { error } = await supabase
          .from("comment")
          .delete()
          .eq("comment_id", comment.comment_id);

        if (error) throw error;

        await fetchComments(selectedAnnouncement.announcement_id);
        alert("Comment deleted successfully!");
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Error deleting comment. Please try again.");
      }
    }
    setCommentMenuOpen(null);
  };

  const toggleCommentMenu = (commentId) => {
    setCommentMenuOpen(commentMenuOpen === commentId ? null : commentId);
  };

  const fetchMembers = async (societyId) => {
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
        setMembers([]);
        return;
      }

      if (!memberSocietyData || memberSocietyData.length === 0) {
        setMembers([]);
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

      setMembers(sortedMembers);
      await fetchNewMembersCount();
    } catch (error) {
      console.error("Error in fetchMembers:", error);
      setMembers([]);
    }
  };

  const uploadFile = async (file, folder) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("society_uploads")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      return { publicUrl: null, filePath: fileName };
    } catch (error) {
      console.error("Error uploading file:", error.message);
      throw error;
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "application/pdf",
      ];
      if (allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      alert(
        `The following files are invalid (max 10MB, allowed: images, videos, PDFs):\n${invalidFiles.join("\n")}`,
      );
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostAnnouncement = async () => {
    if (isSocietyBlocked()) {
      alert("This society has been blocked. You cannot post announcements.");
      return;
    }
    if (userData.condition === "blocked") {
      alert("You are blocked from posting announcements in this society.");
      return;
    }

    if (!newAnnouncement.trim() && selectedFiles.length === 0) {
      alert("Please enter a message or add attachments");
      return;
    }

    setPosting(true);
    setUploadProgress(0);

    try {
      const { data: announcementData, error: announcementError } =
        await supabase
          .from("announcement")
          .insert([
            {
              creator_email: userData.email,
              society_id: society.id,
              message: newAnnouncement || "📎 Shared an attachment",
              created_at: new Date().toISOString(),
            },
          ])
          .select();

      if (announcementError) throw announcementError;

      const announcementId = announcementData[0].announcement_id;

      if (selectedFiles.length > 0) {
        let uploadedCount = 0;
        for (const file of selectedFiles) {
          try {
            const folder = `announcements/${announcementId}`;
            const { filePath } = await uploadFile(file, folder);

            const fileType = file.type.startsWith("image/")
              ? "image"
              : file.type.startsWith("video/")
                ? "video"
                : "document";

            const { error: mediaError } = await supabase
              .from("announcement_media")
              .insert([
                {
                  announcement_id: announcementId,
                  file_type: fileType,
                  file_size: file.size,
                  file_path: filePath,
                  uploaded_at: new Date().toISOString(),
                },
              ]);

            if (mediaError) throw mediaError;

            uploadedCount++;
            setUploadProgress((uploadedCount / selectedFiles.length) * 100);
          } catch (uploadError) {
            console.error("Error uploading file:", uploadError);
          }
        }
      }

      const announcementPreview =
        newAnnouncement.substring(0, 100) || "New announcement posted";
      await createNotificationForAllMembers(
        null,
        `📢 New announcement from ${userData.name}: "${announcementPreview}${newAnnouncement.length > 100 ? "..." : ""}"`,
      );

      setNewAnnouncement("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchAnnouncements(society.id);
      alert("Announcement posted successfully!");
    } catch (error) {
      console.error("Error posting announcement:", error);
      alert("Error posting announcement. Please try again.");
    } finally {
      setPosting(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAnnouncement = async (announcementId, creatorEmail) => {
    if (userData.email !== creatorEmail && userData.role !== "admin") {
      alert("You can only delete your own announcements!");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this announcement? This will also delete all attachments.",
      )
    ) {
      setPosting(true);
      try {
        const { data: mediaFiles } = await supabase
          .from("announcement_media")
          .select("file_path")
          .eq("announcement_id", announcementId);

        await supabase
          .from("announcement_media")
          .delete()
          .eq("announcement_id", announcementId);

        const { error: deleteError } = await supabase
          .from("announcement")
          .delete()
          .eq("announcement_id", announcementId);

        if (deleteError) throw deleteError;

        if (mediaFiles && mediaFiles.length > 0) {
          try {
            const filePaths = mediaFiles.map((media) => media.file_path);
            await supabase.storage.from("society_uploads").remove(filePaths);
          } catch (storageErr) {
            console.error("Storage cleanup error:", storageErr);
          }
        }

        await fetchAnnouncements(society.id);
        alert("Announcement deleted successfully!");
      } catch (error) {
        console.error("Error:", error);
        alert("Error deleting announcement");
      } finally {
        setPosting(false);
        setMenuOpen(null);
      }
    }
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setEditMessage(announcement.message);
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleSaveEdit = async () => {
    if (!editMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      const { error } = await supabase
        .from("announcement")
        .update({ message: editMessage.trim() })
        .eq("announcement_id", editingAnnouncement.announcement_id);

      if (error) throw error;

      await fetchAnnouncements(society.id);
      alert("Announcement updated successfully!");
      setShowEditModal(false);
      setEditingAnnouncement(null);
      setEditMessage("");
    } catch (error) {
      console.error("Error editing announcement:", error);
      alert("Error editing announcement");
    }
  };

  const handleViewAnnouncement = async (announcement) => {
    setSelectedAnnouncement(announcement);
    await fetchComments(announcement.announcement_id);
  };

  const handleBackToFeed = () => {
    setSelectedAnnouncement(null);
    setComments([]);
    setNewComment("");
    setCommentMenuOpen(null);
  };

  const toggleMemberMenu = (memberId) => {
    if (memberMenuOpen === memberId) {
      setMemberMenuOpen(null);
    } else {
      setMemberMenuOpen(memberId);
    }
  };

  const handlePromoteToAdmin = async (member) => {
    if (userData.role !== "admin") {
      alert("Only admins can promote members");
      return;
    }

    if (member.role === "admin") {
      alert("This user is already an admin");
      setMemberMenuOpen(null);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to promote "${member.name}" to Admin?`,
      )
    ) {
      try {
        const { error } = await supabase
          .from("member_society")
          .update({ role: "admin" })
          .eq("member_id", member.id)
          .eq("society_id", society.id);

        if (error) throw error;

        await createNotification(
          member.id,
          null,
          `🎉 Congratulations! ${userData.name} has promoted you to Admin in ${societyData?.society_name || society?.society_name}`,
        );

        await fetchMembers(society.id);
        alert(`${member.name} has been promoted to Admin successfully!`);
      } catch (error) {
        console.error("Error promoting member:", error);
        alert("Error promoting member: " + error.message);
      }
    }
    setMemberMenuOpen(null);
  };

  const handleDemoteToMember = async (member) => {
    if (userData.role !== "admin") {
      alert("Only admins can demote members");
      return;
    }

    if (member.role !== "admin") {
      alert("This user is not an admin");
      setMemberMenuOpen(null);
      return;
    }

    if (member.id === userData.id) {
      alert("You cannot demote yourself");
      setMemberMenuOpen(null);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to demote "${member.name}" to Member?`,
      )
    ) {
      try {
        const { error } = await supabase
          .from("member_society")
          .update({ role: "member" })
          .eq("member_id", member.id)
          .eq("society_id", society.id);

        if (error) throw error;

        await createNotification(
          member.id,
          null,
          `📉 ${userData.name} has demoted you to Member in ${societyData?.society_name || society?.society_name}`,
        );

        await fetchMembers(society.id);
        alert(`${member.name} has been demoted to Member successfully!`);
      } catch (error) {
        console.error("Error demoting member:", error);
        alert("Error demoting member: " + error.message);
      }
    }
    setMemberMenuOpen(null);
  };

  const handleBlockMember = (member) => {
    if (userData.role !== "admin") {
      alert("Only admins can block members");
      return;
    }

    if (userData.condition === "blocked") {
      alert("You are blocked and cannot perform this action");
      return;
    }

    if (member.role === "admin") {
      alert("Cannot block another admin");
      setMemberMenuOpen(null);
      return;
    }

    if (member.id === userData.id) {
      alert("You cannot block yourself");
      setMemberMenuOpen(null);
      return;
    }

    if (member.condition === "blocked") {
      alert("This member is already blocked");
      setMemberMenuOpen(null);
      return;
    }

    setSelectedMember(member);
    setBlockReason("");
    setBlockTimePeriod("permanent");
    setBlockDuration("");
    setShowBlockModal(true);
    setMemberMenuOpen(null);
  };

  const confirmBlockMember = async () => {
    if (!selectedMember) return;

    let unblockDate = null;
    let message = blockReason || "No reason provided";

    if (blockTimePeriod === "temporary" && blockDuration) {
      const durationDays = parseInt(blockDuration);
      unblockDate = new Date();
      unblockDate.setDate(unblockDate.getDate() + durationDays);
      message = `${blockReason || "No reason provided"} (Temporary block for ${durationDays} days)`;
    } else {
      message = `${blockReason || "No reason provided"} (Permanent block)`;
    }

    try {
      const { error: auditError } = await supabase.from("block_audit").insert([
        {
          member_id: selectedMember.id,
          society_id: society.id,
          admin_id: userData.id,
          message: message,
          timeperiod: unblockDate ? unblockDate.toISOString() : "9999-12-31",
        },
      ]);

      if (auditError) {
        console.error("Error inserting into block_audit:", auditError);
        alert("Error recording block information: " + auditError.message);
        return;
      }

      const { data: memberRecord, error: findError } = await supabase
        .from("member_society")
        .select("id, condition")
        .eq("member_id", selectedMember.id)
        .eq("society_id", society.id)
        .single();

      if (findError) {
        alert("Could not find member record.");
        return;
      }

      if (memberRecord.condition === "blocked") {
        alert(`${selectedMember.name} is already blocked`);
        setShowBlockModal(false);
        setSelectedMember(null);
        setBlockReason("");
        setBlockTimePeriod("permanent");
        setBlockDuration("");
        return;
      }

      const { error: updateError } = await supabase
        .from("member_society")
        .update({ condition: "blocked" })
        .eq("id", memberRecord.id);

      if (updateError) throw updateError;

      let notificationMessage = `⛔ You have been blocked from ${societyData?.society_name || society?.society_name}. Reason: ${blockReason || "Not specified"}`;
      if (blockTimePeriod === "temporary" && blockDuration) {
        const unblockDateFormatted = new Date(unblockDate).toLocaleDateString();
        notificationMessage += `\nThis is a temporary block until ${unblockDateFormatted}.`;
      } else {
        notificationMessage += `\nThis is a permanent block.`;
      }

      await createNotification(
        selectedMember.id,
        "⛔ Account Blocked",
        notificationMessage,
      );

      alert(`${selectedMember.name} has been blocked successfully!`);

      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, condition: "blocked" } : m,
        ),
      );

      if (selectedMember.id === userData.id) {
        setUserData((prev) => ({ ...prev, condition: "blocked" }));
      }

      await fetchMembers(society.id);
      setShowBlockModal(false);
      setSelectedMember(null);
      setBlockReason("");
      setBlockTimePeriod("permanent");
      setBlockDuration("");

      if (blockTimePeriod === "temporary" && unblockDate) {
        scheduleAutoUnblock(selectedMember.id, unblockDate);
      }
    } catch (error) {
      console.error("Error blocking member:", error);
      alert("Error blocking member: " + error.message);
    }
  };

  const scheduleAutoUnblock = (memberId, unblockDate) => {
    const now = new Date();
    const timeUntilUnblock = unblockDate - now;

    if (timeUntilUnblock > 0) {
      setTimeout(async () => {
        try {
          const { error } = await supabase
            .from("member_society")
            .update({ condition: "unblocked" })
            .eq("member_id", memberId)
            .eq("society_id", society.id);

          if (error) throw error;

          console.log(`Member ${memberId} automatically unblocked`);

          await createNotification(
            memberId,
            "✅ Account Unblocked",
            `Your temporary block from ${societyData?.society_name || society?.society_name} has ended. You can now participate again.`,
          );

          await fetchMembers(society.id);
        } catch (error) {
          console.error("Error auto-unblocking member:", error);
        }
      }, timeUntilUnblock);
    }
  };

  const handleUnblockMember = async (member) => {
    if (userData.role !== "admin") {
      alert("Only admins can unblock members");
      return;
    }

    if (userData.condition === "blocked") {
      alert("You are blocked and cannot perform this action");
      return;
    }

    if (window.confirm(`Are you sure you want to unblock "${member.name}"?`)) {
      try {
        const { error } = await supabase
          .from("member_society")
          .update({ condition: "unblocked" })
          .eq("member_id", member.id)
          .eq("society_id", society.id);

        if (error) throw error;

        await createNotification(
          member.id,
          null,
          `✅ You have been unblocked from ${societyData?.society_name || society?.society_name}`,
        );

        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id ? { ...m, condition: "unblocked" } : m,
          ),
        );

        if (member.id === userData.id) {
          setUserData((prev) => ({ ...prev, condition: "unblocked" }));
        }

        alert(`${member.name} has been unblocked!`);
        await fetchMembers(society.id);
      } catch (error) {
        console.error("Error unblocking member:", error);
        alert("Error: " + error.message);
      }
    }
    setMemberMenuOpen(null);
  };

  const handleRemoveMember = async (member) => {
    if (userData.role !== "admin") {
      alert("Only admins can remove members");
      return;
    }

    if (member.role === "admin") {
      alert("Cannot remove another admin");
      setMemberMenuOpen(null);
      return;
    }

    if (member.id === userData.id) {
      alert('You cannot remove yourself. Use "Get Removed" option instead.');
      setMemberMenuOpen(null);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to remove "${member.name}" from the society?`,
      )
    ) {
      try {
        const { error } = await supabase
          .from("member_society")
          .delete()
          .eq("member_id", member.id)
          .eq("society_id", society.id);

        if (error) throw error;

        await createNotification(
          member.id,
          null,
          `👋 You have been removed from ${societyData?.society_name || society?.society_name}`,
        );

        await fetchMembers(society.id);
        alert(`${member.name} has been removed from the society!`);
      } catch (error) {
        console.error("Error removing member:", error);
        alert("Error removing member: " + error.message);
      }
    }
    setMemberMenuOpen(null);
  };

  const handleGetRemoved = async () => {
    if (
      window.confirm(
        `Are you sure you want to leave "${societyData?.society_name || society?.society_name}"?`,
      )
    ) {
      try {
        const { error } = await supabase
          .from("member_society")
          .delete()
          .eq("member_id", userData.id)
          .eq("society_id", society.id);

        if (error) throw error;

        alert(
          `You have left "${societyData?.society_name || society?.society_name}"`,
        );
        navigate("/member");
      } catch (error) {
        console.error("Error leaving society:", error);
        alert("Error leaving society: " + error.message);
      }
    }
  };

  const toggleMenu = (announcementId) => {
    setMenuOpen(menuOpen === announcementId ? null : announcementId);
  };

  // MAIN USE EFFECT - FIXED VERSION
  useEffect(() => {
    if (!society) {
      navigate("/member");
      return;
    }

    const fetchSocietyData = async () => {
      try {
        const { data, error } = await supabase
          .from("society")
          .select("*")
          .eq("society_id", society.id)
          .single();

        if (error) throw error;
        setSocietyData(data);
        setSocietyStatus(data?.society_status || "unblocked");

        if (data?.society_logo) {
          setSocietyLogoUrl(getPublicUrl(data.society_logo));
        }
      } catch (error) {
        console.error("Error fetching society data:", error);
      }
    };

    fetchSocietyData();

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
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        if (userInfo) {
          const { data: memberData } = await supabase
            .from("member_society")
            .select("role, condition")
            .eq("member_id", userInfo.id)
            .eq("society_id", society.id)
            .single();

          const role = memberData?.role || "member";

          setUserData({
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            role: role,
            condition: memberData?.condition || "unblocked",
          });

          await fetchAnnouncements(society.id);
          await fetchMembers(society.id);

          await fetchUnreadAnnouncementsCount();
          await fetchNewMembersCount();
          await fetchPendingDuesCount();
          await fetchUnreadNotificationsCount();

          // Fetch join requests and reports only after userData is set
          if (role === "admin") {
            await fetchJoinRequests();
            // Fetch reports after userData is set
            await fetchReports();
          }

          setTimeout(async () => {
            await fetchMaintenanceFees();
            await fetchNotifications();
            if (role === "admin") {
              await fetchSocietySettings();
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error:", error);
        navigate("/member");
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, [society, navigate]);

  // Separate useEffect to fetch reports when userData is updated (for admin)
  useEffect(() => {
    if (userData.role === "admin" && society?.id && userData?.id) {
      fetchReports();
    }
  }, [userData.role, society?.id, userData?.id]);

  // Refetch join requests when switching to requests tab
  useEffect(() => {
    if (activeTab === "requests" && userData.role === "admin") {
      fetchJoinRequests();
    }
  }, [activeTab, userData.role]);

  // Update notification badge when notifications change
  useEffect(() => {
    const unread = notifications.filter(
      (n) => !n.is_read && n.member_id === userData.id,
    ).length;
    setUnreadNotificationsCount(unread);
  }, [notifications, userData.id]);

  // Update pending dues badge when maintenance fees change
  useEffect(() => {
    const pending = maintenanceFees.filter((f) => f.status === "due").length;
    setPendingDuesCount(pending);
  }, [maintenanceFees]);

  // Refresh new members count when members are updated
  useEffect(() => {
    if (userData.id && society?.id) {
      fetchNewMembersCount();
    }
  }, [members.length, userData.id, society?.id]);

  // Fetch removed members data for payment history
  useEffect(() => {
    const fetchRemovedMembersData = async () => {
      const paidFees = maintenanceFees.filter((f) => f.status === "paid");
      const memberIds = [...new Set(paidFees.map((f) => f.member_id))];

      const currentMemberIds = members.map((m) => m.id);
      const removedMemberIds = memberIds.filter(
        (id) => !currentMemberIds.includes(id),
      );

      if (removedMemberIds.length === 0) return;

      const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", removedMemberIds);

      if (error) {
        console.error("Error fetching removed members data:", error);
        return;
      }

      const memberDataMap = {};
      data.forEach((member) => {
        memberDataMap[member.id] = {
          name: member.name,
          email: member.email,
        };
      });

      setRemovedMembersData(memberDataMap);
    };

    if (maintenanceFees.length > 0 && members.length > 0) {
      fetchRemovedMembersData();
    }
  }, [maintenanceFees, members]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      setMenuOpen(null);
      setCommentMenuOpen(null);
      if (!event.target.closest(".member_menu_container")) {
        setMemberMenuOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Render Functions (kept as in your original code)
  const renderJoinRequests = () => {
    const pendingCount = joinRequests.filter(
      (r) => r.status === "not_accepted",
    ).length;
    if (isSocietyBlocked()) {
      return (
        <div className={styles.content_section}>
          <div className={styles.blocked_alert_full}>
            <span className="material-symbols-outlined">block</span>
            <div>
              <h3>Society is Blocked</h3>
              <p>
                This society has been blocked by the super administrator. Join
                requests are not available.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.content_section}>
        <div className={styles.section_header}>
          <div>
            <h2 className={styles.section_title}>Join Requests</h2>
            <p className={styles.section_subtitle}>
              {pendingCount} pending request{pendingCount !== 1 ? "s" : ""} to
              join this society
            </p>
          </div>
          <button
            className={styles.refresh_btn}
            onClick={() => fetchJoinRequests()}
          >
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>

        {joinRequests.length === 0 ? (
          <div className={styles.empty_state}>
            <span className="material-symbols-outlined">person_add</span>
            <h3>No pending requests</h3>
            <p>There are no pending join requests at the moment.</p>
          </div>
        ) : (
          <div className={styles.requests_container}>
            {joinRequests.map((request) => (
              <div
                key={request.request_id}
                className={styles.request_card_admin}
              >
                <div className={styles.request_avatar}>
                  <div className={styles.request_avatar_placeholder}>
                    <span>
                      {request.member?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                </div>
                <div className={styles.request_details}>
                  <h3 className={styles.request_member_name}>
                    {request.member?.name || "Unknown User"}
                  </h3>
                  <p className={styles.request_member_email}>
                    {request.member?.email || "No email"}
                  </p>
                  <div className={styles.request_meta}>
                    <span className={styles.request_date}>
                      <span className="material-symbols-outlined">
                        schedule
                      </span>
                      Requested:{" "}
                      {new Date(request.request_time).toLocaleDateString()} at{" "}
                      {new Date(request.request_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className={styles.request_actions}>
                  <button
                    className={styles.request_accept_btn}
                    onClick={() =>
                      acceptJoinRequest(request.request_id, request.member_id)
                    }
                    disabled={processingRequest}
                  >
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                    Accept
                  </button>
                  <button
                    className={styles.request_reject_btn}
                    onClick={() =>
                      rejectJoinRequest(request.request_id, request.member_id)
                    }
                    disabled={processingRequest}
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
            <h3>Edit Announcement</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowEditModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <div className={styles.form_group}>
              <label>Message</label>
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                placeholder="What's on your mind?"
                className={styles.edit_textarea}
                rows="6"
                autoFocus
              />
            </div>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button className={styles.submit_btn} onClick={handleSaveEdit}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Check if society is blocked
  const isSocietyBlocked = () => {
    return societyStatus === "blocked";
  };

  const renderAddNotificationModal = () => {
    if (!showAddNotificationModal) return null;

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowAddNotificationModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Send Notification</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowAddNotificationModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <div className={styles.form_group}>
              <label>Send to</label>
              <select
                value={selectedMemberForNotification}
                onChange={(e) =>
                  setSelectedMemberForNotification(e.target.value)
                }
                className={styles.form_select}
              >
                <option value="all">All Members ({members.length})</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.form_group}>
              <label>Title (Optional)</label>
              <input
                type="text"
                value={newNotificationTitle}
                onChange={(e) => setNewNotificationTitle(e.target.value)}
                placeholder="Leave empty for auto-generated title"
                className={styles.form_input}
                maxLength={100}
              />
            </div>

            <div className={styles.form_group}>
              <label>Message *</label>
              <textarea
                value={newNotificationMessage}
                onChange={(e) => setNewNotificationMessage(e.target.value)}
                placeholder="Enter your notification message here..."
                className={styles.form_textarea}
                rows="4"
                maxLength={500}
                required
              />
              <small className={styles.char_count}>
                {newNotificationMessage.length}/500 characters
              </small>
            </div>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowAddNotificationModal(false)}
            >
              Cancel
            </button>
            <button
              className={styles.submit_btn}
              onClick={handleAddNotification}
              disabled={
                submittingNotification || !newNotificationMessage.trim()
              }
            >
              {submittingNotification ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFullAnnouncement = () => {
    if (!selectedAnnouncement) return null;

    return (
      <div className={styles.full_announcement_container}>
        <div className={styles.full_announcement_header}>
          <button
            className={styles.back_button_large}
            onClick={handleBackToFeed}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Feed
          </button>
        </div>

        <div className={styles.full_announcement_content}>
          <div className={styles.full_announcement_card}>
            <div className={styles.announcement_header_full}>
              <div className={styles.announcement_author_full}>
                <div className={styles.author_avatar_full}>
                  <span>
                    {selectedAnnouncement.creator_name
                      ?.charAt(0)
                      .toUpperCase() || "A"}
                  </span>
                </div>
                <div>
                  <h4 className={styles.author_name_full}>
                    {selectedAnnouncement.creator_name}
                  </h4>
                  <p className={styles.announcement_time_full}>
                    {new Date(
                      selectedAnnouncement.created_at,
                    ).toLocaleDateString()}{" "}
                    at{" "}
                    {new Date(
                      selectedAnnouncement.created_at,
                    ).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.announcement_message_full}>
              <p>{selectedAnnouncement.message}</p>
            </div>

            {selectedAnnouncement.media &&
              selectedAnnouncement.media.length > 0 && (
                <div className={styles.media_gallery_full}>
                  {selectedAnnouncement.media.map((media) => (
                    <div
                      key={media.media_id}
                      className={styles.media_item_full}
                    >
                      {media.file_type === "image" ? (
                        <img src={media.file_url} alt="Attachment" />
                      ) : media.file_type === "video" ? (
                        <video controls src={media.file_url} />
                      ) : (
                        <a
                          href={media.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.document_link_full}
                        >
                          <span className="material-symbols-outlined">
                            description
                          </span>
                          <span>Download Attachment</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className={styles.comments_section}>
            <div className={styles.comments_header}>
              <h3>Comments</h3>
              <span className={styles.comments_count}>
                {comments.length} comments
              </span>
            </div>

            {userData.condition !== "blocked" && (
              <div className={styles.comment_input_container}>
                <div className={styles.comment_avatar}>
                  <span>{userData.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className={styles.comment_input_wrapper}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className={styles.comment_input}
                    rows="3"
                  />
                  <button
                    className={styles.post_comment_button}
                    onClick={handlePostComment}
                    disabled={postingComment || !newComment.trim()}
                  >
                    {postingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            )}

            <div className={styles.comments_list}>
              {comments.length === 0 ? (
                <div className={styles.no_comments}>
                  <span className="material-symbols-outlined">chat_bubble</span>
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isCommentOwner = comment.member_id === userData.id;
                  const isAdmin = userData.role === "admin";
                  const canDeleteComment = isCommentOwner || isAdmin;
                  const canEditComment =
                    isCommentOwner && isCommentEditable(comment.created_at);

                  return (
                    <div
                      key={comment.comment_id}
                      className={styles.comment_item}
                    >
                      <div className={styles.comment_avatar_small}>
                        <span>
                          {comment.user?.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className={styles.comment_content}>
                        <div className={styles.comment_author}>
                          <span className={styles.comment_author_name}>
                            {comment.user?.name || "Unknown User"}
                          </span>
                          <span className={styles.comment_time}>
                            {new Date(comment.created_at).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(comment.created_at).toLocaleTimeString()}
                          </span>
                          {comment.is_edited && (
                            <span className={styles.edited_badge}>
                              (Edited)
                            </span>
                          )}
                          {isAdmin && comment.member_id !== userData.id && (
                            <span className={styles.admin_badge}>Admin</span>
                          )}
                        </div>
                        <p className={styles.comment_message}>
                          {comment.message}
                        </p>
                      </div>

                      <div className={styles.comment_menu_container}>
                        <button
                          className={styles.comment_menu_button}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCommentMenu(comment.comment_id);
                          }}
                        >
                          <span className="material-symbols-outlined">
                            more_vert
                          </span>
                        </button>
                        {commentMenuOpen === comment.comment_id && (
                          <div className={styles.comment_dropdown_menu}>
                            {canEditComment && (
                              <button
                                className={styles.dropdown_item}
                                onClick={() => handleEditCommentClick(comment)}
                              >
                                <span className="material-symbols-outlined">
                                  edit
                                </span>
                                Edit Comment
                              </button>
                            )}
                            {canDeleteComment && (
                              <button
                                className={`${styles.dropdown_item} ${styles.danger}`}
                                onClick={() => handleDeleteComment(comment)}
                              >
                                <span className="material-symbols-outlined">
                                  delete
                                </span>
                                Delete Comment
                              </button>
                            )}
                            {/* Only show report button if user is not the comment author */}
                            {comment.member_id !== userData.id && (
                              <button
                                className={`${styles.dropdown_item} ${styles.report_item}`}
                                onClick={() =>
                                  handleOpenReportModal(comment, "comment")
                                }
                              >
                                <span className="material-symbols-outlined">
                                  flag
                                </span>
                                Report Comment
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        {renderEditCommentModal()}
        {renderReportModal()}
      </div>
    );
  };

  const renderEditCommentModal = () => {
    if (!showEditCommentModal) return null;

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowEditCommentModal(false)}
      >
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h3>Edit Comment</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowEditCommentModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <div className={styles.form_group}>
              <label>Edit your comment</label>
              <textarea
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                placeholder="Edit your comment..."
                className={styles.edit_textarea}
                rows="4"
                autoFocus
              />
            </div>
          </div>
          <div className={styles.modal_footer}>
            <button
              className={styles.cancel_btn}
              onClick={() => setShowEditCommentModal(false)}
            >
              Cancel
            </button>
            <button
              className={styles.submit_btn}
              onClick={handleSaveEditedComment}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReportModal = () => {
    if (!showReportModal) return null;

    const getReportTitle = () => {
      switch (reportType) {
        case "announcement":
          return "Report Announcement";
        case "comment":
          return "Report Comment";
        case "member":
          return "Report Member";
        default:
          return "Report";
      }
    };

    const getTargetInfo = () => {
      if (reportType === "announcement" && reportingItem) {
        return `Announcement by: ${reportingItem.creator_name}`;
      } else if (reportType === "comment" && reportingItem) {
        return `Comment by: ${reportingItem.user?.name}`;
      } else if (reportType === "member" && reportingItem) {
        return `Member: ${reportingItem.name}`;
      }
      return "";
    };

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
            <h3>{getReportTitle()}</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowReportModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <div className={styles.report_target_info}>
              <span className="material-symbols-outlined">info</span>
              <p>{getTargetInfo()}</p>
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
                <option value="Spam or misleading">Spam or misleading</option>
                <option value="Harassment or bullying">
                  Harassment or bullying
                </option>
                <option value="Hate speech">Hate speech</option>
                <option value="Inappropriate content">
                  Inappropriate content
                </option>
                <option value="False information">False information</option>
                <option value="Privacy violation">Privacy violation</option>
                <option value="Impersonation">Impersonation</option>
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
                placeholder="Please provide any additional details that might help the admin review this report..."
                className={styles.form_textarea}
                rows="4"
                maxLength={500}
              />
              <small className={styles.char_count}>
                {reportDescription.length}/500 characters
              </small>
            </div>

            {reportingItem && (
              <div className={styles.reported_content_preview}>
                <h4>Reported Content:</h4>
                <div className={styles.preview_content}>
                  {reportType === "announcement" && (
                    <p>{reportingItem.message}</p>
                  )}
                  {reportType === "comment" && <p>{reportingItem.message}</p>}
                  {reportType === "member" && (
                    <div className={styles.member_preview}>
                      <p>
                        <strong>Name:</strong> {reportingItem.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {reportingItem.email}
                      </p>
                      <p>
                        <strong>Role:</strong> {reportingItem.role}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.report_info_note}>
              <span className="material-symbols-outlined">info</span>
              <p>This report will be sent to the society admin for review.</p>
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

  const renderReportDetailsModal = () => {
    if (!showReportsModal || !selectedReport) return null;

    const getReportTypeIcon = (type) => {
      switch (type) {
        case "announcement":
          return "campaign";
        case "comment":
          return "chat_bubble";
        case "member":
          return "person";
        default:
          return "flag";
      }
    };

    const isResolved = selectedReport.status === "action_taken";

    return (
      <div
        className={styles.modal_overlay}
        onClick={() => setShowReportsModal(false)}
      >
        <div
          className={styles.modal_content}
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
                <span className={`material-symbols-outlined`}>
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
                    placeholder="Describe the action taken (e.g., warned user, removed content, blocked member, etc.)"
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
                onClick={() => handleResolveReport(selectedReport.report_id)}
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
            <h3>Society Settings</h3>
            <button
              className={styles.modal_close}
              onClick={() => setShowSettingsModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.modal_body}>
            <div className={styles.form_group}>
              <label className={styles.form_label}>Society Visibility</label>
              <div className={styles.radio_group_settings}>
                <label
                  className={`${styles.radio_label_settings} ${settingsData.visible === "yes" ? styles.selected : ""}`}
                >
                  <input
                    type="radio"
                    name="visible"
                    value="yes"
                    checked={settingsData.visible === "yes"}
                    onChange={(e) =>
                      setSettingsData({
                        ...settingsData,
                        visible: e.target.value,
                      })
                    }
                  />
                  <div className={styles.radio_content_settings}>
                    <span className="material-symbols-outlined">public</span>
                    <div className={styles.radio_text_settings}>
                      <strong>Visible</strong>
                      <small>
                        Society appears in search and recommendations
                      </small>
                    </div>
                  </div>
                </label>
                <label
                  className={`${styles.radio_label_settings} ${settingsData.visible === "no" ? styles.selected : ""}`}
                >
                  <input
                    type="radio"
                    name="visible"
                    value="no"
                    checked={settingsData.visible === "no"}
                    onChange={(e) =>
                      setSettingsData({
                        ...settingsData,
                        visible: e.target.value,
                      })
                    }
                  />
                  <div className={styles.radio_content_settings}>
                    <span className="material-symbols-outlined">
                      visibility_off
                    </span>
                    <div className={styles.radio_text_settings}>
                      <strong>Hidden</strong>
                      <small>Society is hidden, can only join via code</small>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.form_group}>
              <label className={styles.form_label}>Accessibility</label>
              <div className={styles.toggle_group_settings}>
                <button
                  type="button"
                  className={`${styles.toggle_option_settings} ${settingsData.accessible === "anyone" ? styles.active : ""}`}
                  onClick={() =>
                    setSettingsData({ ...settingsData, accessible: "anyone" })
                  }
                >
                  <span className="material-symbols-outlined">group_add</span>
                  <div className={styles.toggle_content_settings}>
                    <strong>Anyone can join</strong>
                    <small>Anyone can request to join the society</small>
                  </div>
                </button>
                <button
                  type="button"
                  className={`${styles.toggle_option_settings} ${settingsData.accessible === "permission_required" ? styles.active : ""}`}
                  onClick={() =>
                    setSettingsData({
                      ...settingsData,
                      accessible: "permission_required",
                    })
                  }
                >
                  <span className="material-symbols-outlined">lock</span>
                  <div className={styles.toggle_content_settings}>
                    <strong>Permission Required</strong>
                    <small>Members need admin approval to join</small>
                  </div>
                </button>
              </div>
            </div>

            <div className={styles.current_status}>
              <h4>Current Settings</h4>
              <div className={styles.status_badges}>
                <span
                  className={`${styles.status_badge} ${settingsData.visible === "yes" ? styles.visible : styles.hidden}`}
                >
                  {settingsData.visible === "yes" ? "👁️ Visible" : "🔒 Hidden"}
                </span>
                <span
                  className={`${styles.status_badge} ${settingsData.accessible === "anyone" ? styles.open : styles.restricted}`}
                >
                  {settingsData.accessible === "anyone"
                    ? "🌐 Open to All"
                    : "🔐 Permission Required"}
                </span>
              </div>
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
              disabled={updatingSettings}
            >
              {updatingSettings ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDues = () => {
    const dueFees = maintenanceFees.filter((f) => f.status === "due");
    const paidFees = maintenanceFees.filter((f) => f.status === "paid");

    const memberDueFees =
      userData.role !== "admin"
        ? dueFees.filter((f) => f.member_id === userData.id)
        : dueFees;
    const memberPaidFees =
      userData.role !== "admin"
        ? paidFees.filter((f) => f.member_id === userData.id)
        : paidFees;

    if (isSocietyBlocked()) {
      return (
        <div className={styles.content_section}>
          <div className={styles.blocked_alert_full}>
            <span className="material-symbols-outlined">block</span>
            <div>
              <h3>Society is Blocked</h3>
              <p>
                This society has been blocked by the super administrator.
                Maintenance fees are not accessible.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.content_section}>
        <div className={styles.section_header}>
          <div>
            <h2 className={styles.section_title}>Maintenance Fees</h2>
            <p className={styles.section_subtitle}>
              {memberDueFees.length} pending • {memberPaidFees.length} paid
            </p>
          </div>
          <div className={styles.notification_actions}>
            <button
              className={styles.refresh_btn}
              onClick={refreshMaintenanceFees}
              title="Refresh maintenance fees"
            >
              <span className="material-symbols-outlined">refresh</span>
              Refresh
            </button>
            {userData.role === "admin" && (
              <button
                className={styles.create_dues_btn}
                onClick={() => setShowMaintenanceModal(true)}
              >
                <span className="material-symbols-outlined">add</span>
                Add Maintenance
              </button>
            )}
          </div>
        </div>

        {memberDueFees.length > 0 && (
          <div className={styles.maintenance_section}>
            <div className={styles.section_subheader}>
              <span className="material-symbols-outlined">pending</span>
              <h3>Pending Dues</h3>
              <span className={styles.section_count}>
                {memberDueFees.length}
              </span>
            </div>
            <div className={styles.maintenance_list}>
              {memberDueFees.map((fee) => {
                const memberData = members.find((m) => m.id === fee.member_id);
                const memberName = memberData?.name || "Unknown Member";
                const adminName =
                  members.find((m) => m.id === fee.admin_id)?.name || "Admin";
                const isOverdue = new Date(fee.due_date) < new Date();

                return (
                  <div
                    key={fee.maintenance_id}
                    className={`${styles.maintenance_card} ${isOverdue ? styles.overdue : ""}`}
                  >
                    <div className={styles.maintenance_info}>
                      <div className={styles.maintenance_amount}>
                        ₹{fee.total_amount}
                        {isOverdue && (
                          <span className={styles.overdue_badge}>Overdue</span>
                        )}
                      </div>
                      <div className={styles.maintenance_details}>
                        {userData.role === "admin" && (
                          <p className={styles.maintenance_meta}>
                            <span className="material-symbols-outlined">
                              person
                            </span>
                            Member: {memberName}
                          </p>
                        )}
                        <p className={styles.maintenance_meta}>
                          <span className="material-symbols-outlined">
                            event
                          </span>
                          Due: {new Date(fee.due_date).toLocaleDateString()}
                        </p>
                        <p className={styles.maintenance_meta}>
                          <span className="material-symbols-outlined">
                            admin_panel_settings
                          </span>
                          Added by: {adminName}
                        </p>
                      </div>
                    </div>
                    {userData.role !== "admin" &&
                      fee.member_id === userData.id && (
                        <button
                          className={styles.pay_button}
                          onClick={() => handlePayMaintenance(fee)}
                        >
                          <span className="material-symbols-outlined">
                            payment
                          </span>
                          Pay Now
                        </button>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {memberPaidFees.length > 0 && (
          <div className={styles.maintenance_section}>
            <div className={styles.section_subheader}>
              <span className="material-symbols-outlined">history</span>
              <h3>Payment History</h3>
              <span className={styles.section_count}>
                {memberPaidFees.length}
              </span>
            </div>
            <div className={styles.maintenance_list}>
              {memberPaidFees.map((fee) => {
                let memberData = members.find((m) => m.id === fee.member_id);
                let memberName = memberData?.name;
                let memberEmail = memberData?.email;

                if (!memberData && removedMembersData[fee.member_id]) {
                  memberName = removedMembersData[fee.member_id].name;
                  memberEmail = removedMembersData[fee.member_id].email;
                }

                if (!memberName) {
                  memberName = "Removed Member";
                  memberEmail = "No longer in society";
                }

                const adminName =
                  members.find((m) => m.id === fee.admin_id)?.name || "Admin";
                const isCurrentUser = fee.member_id === userData.id;
                const isRemoved =
                  !memberData && !removedMembersData[fee.member_id];

                return (
                  <div
                    key={fee.maintenance_id}
                    className={`${styles.maintenance_card} ${styles.paid_card}`}
                  >
                    <div className={styles.maintenance_info}>
                      <div className={styles.maintenance_amount}>
                        ₹{fee.total_amount}
                        <span className={styles.paid_badge}>Paid</span>
                      </div>
                      <div className={styles.maintenance_details}>
                        <div className={styles.member_info_section}>
                          <div className={styles.member_avatar_small}>
                            <span>{memberName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className={styles.member_details}>
                            <p className={styles.member_name_history}>
                              {memberName}
                              {isCurrentUser && (
                                <span className={styles.you_badge}>You</span>
                              )}
                              {isRemoved && (
                                <span className={styles.removed_badge}>
                                  Removed
                                </span>
                              )}
                            </p>
                            <p className={styles.member_email_history}>
                              {memberEmail}
                            </p>
                          </div>
                        </div>

                        <div className={styles.payment_details_grid}>
                          <p className={styles.maintenance_meta}>
                            <span className="material-symbols-outlined">
                              event
                            </span>
                            Due Date:{" "}
                            {new Date(fee.due_date).toLocaleDateString()}
                          </p>
                          <p className={styles.maintenance_meta}>
                            <span className="material-symbols-outlined">
                              admin_panel_settings
                            </span>
                            Added by: {adminName}
                          </p>
                          {fee.paid_at && (
                            <p className={styles.maintenance_meta}>
                              <span className="material-symbols-outlined">
                                check_circle
                              </span>
                              Paid on:{" "}
                              {new Date(fee.paid_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {maintenanceFees.length === 0 && (
          <div className={styles.empty_state}>
            <span className="material-symbols-outlined">payments</span>
            <h3>No maintenance fees</h3>
            <p>No maintenance fees have been added yet</p>
            <button
              className={styles.refresh_empty_btn}
              onClick={refreshMaintenanceFees}
            >
              Refresh
            </button>
          </div>
        )}

        {maintenanceFees.length > 0 &&
          memberDueFees.length === 0 &&
          memberPaidFees.length === 0 &&
          userData.role !== "admin" && (
            <div className={styles.empty_state}>
              <span className="material-symbols-outlined">check_circle</span>
              <h3>All paid up!</h3>
              <p>You have no pending maintenance fees</p>
            </div>
          )}

        {showMaintenanceModal && (
          <div
            className={styles.modal_overlay}
            onClick={() => setShowMaintenanceModal(false)}
          >
            <div
              className={styles.modal_content}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modal_header}>
                <h3>Add Maintenance Fee</h3>
                <button
                  className={styles.modal_close}
                  onClick={() => setShowMaintenanceModal(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className={styles.modal_body}>
                <div className={styles.form_group}>
                  <label>Send to</label>
                  <select
                    value={selectedMemberForMaintenance}
                    onChange={(e) =>
                      setSelectedMemberForMaintenance(e.target.value)
                    }
                    className={styles.form_select}
                  >
                    <option value="all">
                      All Members (
                      {members.filter((m) => m.condition !== "blocked").length})
                    </option>
                    {members
                      .filter((m) => m.condition !== "blocked")
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className={styles.form_group}>
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    value={maintenanceAmount}
                    onChange={(e) => setMaintenanceAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={styles.form_input}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={maintenanceDueDate}
                    onChange={(e) => setMaintenanceDueDate(e.target.value)}
                    className={styles.form_input}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className={styles.form_group}>
                  <label>Description (Optional)</label>
                  <textarea
                    value={maintenanceDescription}
                    onChange={(e) => setMaintenanceDescription(e.target.value)}
                    placeholder="Add any additional notes..."
                    className={styles.form_textarea}
                    rows="3"
                  />
                </div>
              </div>
              <div className={styles.modal_footer}>
                <button
                  className={styles.cancel_btn}
                  onClick={() => setShowMaintenanceModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submit_btn}
                  onClick={handleAddMaintenance}
                  disabled={
                    submittingMaintenance ||
                    !maintenanceAmount ||
                    !maintenanceDueDate
                  }
                >
                  {submittingMaintenance ? "Adding..." : "Add Maintenance Fee"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPaymentModal && selectedMaintenance && (
          <div
            className={styles.modal_overlay}
            onClick={() => setShowPaymentModal(false)}
          >
            <div
              className={styles.modal_content}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modal_header}>
                <h3>Confirm Payment</h3>
                <button
                  className={styles.modal_close}
                  onClick={() => setShowPaymentModal(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className={styles.modal_body}>
                <div className={styles.payment_details}>
                  <div className={styles.payment_amount}>
                    Amount: ₹{selectedMaintenance.total_amount}
                  </div>
                  <div className={styles.payment_due_date}>
                    Due Date:{" "}
                    {new Date(
                      selectedMaintenance.due_date,
                    ).toLocaleDateString()}
                  </div>
                </div>
                <p>Are you sure you want to pay this maintenance fee?</p>
              </div>
              <div className={styles.modal_footer}>
                <button
                  className={styles.cancel_btn}
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.submit_btn} ${styles.payment_btn}`}
                  onClick={confirmPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNotifications = () => {
    if (userData.role !== "admin") {
      const receivedNotifications = notifications.filter(
        (n) => n.member_id === userData.id,
      );
      const unreadCount = receivedNotifications.filter(
        (n) => !n.is_read,
      ).length;
      if (isSocietyBlocked()) {
        return (
          <div className={styles.content_section}>
            <div className={styles.blocked_alert_full}>
              <span className="material-symbols-outlined">block</span>
              <div>
                <h3>Society is Blocked</h3>
                <p>
                  This society has been blocked by the super administrator.
                  Notifications are not available.
                </p>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={styles.content_section}>
          <div className={styles.notifications_header}>
            <div>
              <h2 className={styles.section_title}>Notifications</h2>
              <p className={styles.section_subtitle}>
                {unreadCount} unread • {receivedNotifications.length} total
              </p>
            </div>
            <div className={styles.notification_actions}>
              <button
                className={styles.refresh_btn}
                onClick={refreshNotifications}
              >
                <span className="material-symbols-outlined">refresh</span>
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  className={styles.mark_read_btn}
                  onClick={markAllNotificationsAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className={styles.notifications_list}>
            {receivedNotifications.length === 0 ? (
              <div className={styles.empty_state}>
                <span className="material-symbols-outlined">
                  notifications_none
                </span>
                <h3>No notifications</h3>
                <p>You're all caught up!</p>
              </div>
            ) : (
              receivedNotifications.map((notification) => {
                const senderName =
                  members.find((m) => m.id === notification.created_by)?.name ||
                  "System";
                const isRead = notification.is_read;

                return (
                  <div
                    key={notification.notification_id}
                    className={`${styles.notification_item} ${!isRead ? styles.unread : styles.read}`}
                    onClick={() =>
                      !isRead &&
                      markNotificationAsRead(notification.notification_id)
                    }
                  >
                    <div className={styles.notification_icon}>
                      <span className="material-symbols-outlined">
                        {notification.title?.includes("Announcement")
                          ? "campaign"
                          : "notifications"}
                      </span>
                    </div>
                    <div className={styles.notification_content}>
                      <div className={styles.notification_header_row}>
                        <h4 className={styles.notification_title}>
                          {notification.title || "Notification"}
                        </h4>
                        {notification.created_by &&
                          notification.created_by !== userData.id && (
                            <span className={styles.from_badge}>
                              From: {senderName}
                            </span>
                          )}
                        {isRead && (
                          <span className={styles.read_badge}>Read</span>
                        )}
                      </div>
                      <p className={styles.notification_message}>
                        {notification.message}
                      </p>
                      <p className={styles.notification_time}>
                        {new Date(notification.sended_at).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(notification.sended_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className={styles.notification_actions_wrapper}>
                      {!isRead && <div className={styles.unread_dot}></div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    const receivedNotifications = notifications.filter(
      (n) => n.member_id === userData.id,
    );
    const sentNotifications = notifications.filter(
      (n) => n.created_by === userData.id && n.member_id !== userData.id,
    );
    const displayNotifications =
      notificationFilter === "received"
        ? receivedNotifications
        : sentNotifications;
    const unreadCount = receivedNotifications.filter((n) => !n.is_read).length;

    return (
      <div className={styles.content_section}>
        <div className={styles.notifications_header}>
          <div>
            <h2 className={styles.section_title}>Notifications</h2>
            <p className={styles.section_subtitle}>
              {unreadCount} unread • {receivedNotifications.length} received •{" "}
              {sentNotifications.length} sent
            </p>
          </div>
          <div className={styles.notification_actions}>
            <button
              className={styles.refresh_btn}
              onClick={refreshNotifications}
            >
              <span className="material-symbols-outlined">refresh</span>
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                className={styles.mark_read_btn}
                onClick={markAllNotificationsAsRead}
              >
                Mark all as read
              </button>
            )}
            <button
              className={styles.add_notification_btn}
              onClick={() => setShowAddNotificationModal(true)}
            >
              <span className="material-symbols-outlined">add</span>
              Send Notification
            </button>
          </div>
        </div>

        <div className={styles.notification_tabs}>
          <button
            className={`${styles.tab_btn} ${notificationFilter === "received" ? styles.active_tab : ""}`}
            onClick={() => setNotificationFilter("received")}
          >
            <span className="material-symbols-outlined">inbox</span>
            Received
            <span className={styles.tab_count}>
              {receivedNotifications.length}
            </span>
          </button>
          <button
            className={`${styles.tab_btn} ${notificationFilter === "sent" ? styles.active_tab : ""}`}
            onClick={() => setNotificationFilter("sent")}
          >
            <span className="material-symbols-outlined">outbox</span>
            Sent
            <span className={styles.tab_count}>{sentNotifications.length}</span>
          </button>
        </div>

        <div className={styles.notifications_list}>
          {displayNotifications.length === 0 ? (
            <div className={styles.empty_state}>
              <span className="material-symbols-outlined">
                {notificationFilter === "received"
                  ? "notifications_none"
                  : "outbox"}
              </span>
              <h3>No {notificationFilter} notifications</h3>
            </div>
          ) : (
            displayNotifications.map((notification) => {
              const recipientName =
                members.find((m) => m.id === notification.member_id)?.name ||
                "Unknown";
              const senderName =
                members.find((m) => m.id === notification.created_by)?.name ||
                "Unknown";
              const isRead = notification.is_read;

              return (
                <div
                  key={notification.notification_id}
                  className={`${styles.notification_item} ${!isRead && notificationFilter === "received" ? styles.unread : styles.read}`}
                >
                  <div className={styles.notification_icon}>
                    <span className="material-symbols-outlined">
                      {notificationFilter === "sent" ? "send" : "inbox"}
                    </span>
                  </div>
                  <div className={styles.notification_content}>
                    <div className={styles.notification_header_row}>
                      <h4 className={styles.notification_title}>
                        {notification.title || "Notification"}
                      </h4>
                      {notificationFilter === "sent" && (
                        <span className={styles.sent_badge}>
                          To: {recipientName}
                        </span>
                      )}
                      {notificationFilter === "received" &&
                        notification.created_by && (
                          <span className={styles.from_badge}>
                            From: {senderName}
                          </span>
                        )}
                      {isRead && notificationFilter === "received" && (
                        <span className={styles.read_badge}>Read</span>
                      )}
                    </div>
                    <p className={styles.notification_message}>
                      {notification.message}
                    </p>
                    <p className={styles.notification_time}>
                      {new Date(notification.sended_at).toLocaleDateString()} at{" "}
                      {new Date(notification.sended_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={styles.notification_right_section}>
                    {!isRead && notificationFilter === "received" && (
                      <div className={styles.unread_dot}></div>
                    )}
                    <div className={styles.notification_menu_container}>
                      <button
                        className={styles.notification_menu_button}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNotificationMenu(notification.notification_id);
                        }}
                      >
                        <span className="material-symbols-outlined">
                          more_vert
                        </span>
                      </button>
                      {notificationMenuOpen ===
                        notification.notification_id && (
                        <div className={styles.notification_dropdown_menu}>
                          <button
                            className={`${styles.dropdown_item} ${styles.danger}`}
                            onClick={() =>
                              handleDeleteNotification(
                                notification.notification_id,
                              )
                            }
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                            Delete Notification
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderAnnouncements = () => {
    // Check if society is blocked FIRST - this will show for everyone (members and admins)
    if (isSocietyBlocked()) {
      return (
        <div className={styles.content_section}>
          <div className={styles.blocked_alert_full}>
            <span className="material-symbols-outlined">block</span>
            <div>
              <h3>Society is Blocked</h3>
              <p>
                This society has been blocked by the super administrator.
                Announcements are not available.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.content_section}>
        {userData.condition !== "blocked" && (
          <div className={styles.create_post_card}>
            <div className={styles.post_creator}>
              <div className={styles.creator_avatar}>
                <span>{userData.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className={styles.post_input_container}>
                <textarea
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder={`What's happening in ${societyData?.society_name || society?.society_name}?`}
                  className={styles.post_input}
                  rows="3"
                />

                {selectedFiles.length > 0 && (
                  <div className={styles.selected_files}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className={styles.file_preview}>
                        {file.type.startsWith("image/") ? (
                          <img src={URL.createObjectURL(file)} alt="preview" />
                        ) : file.type.startsWith("video/") ? (
                          <video src={URL.createObjectURL(file)} />
                        ) : (
                          <div className={styles.document_preview}>
                            <span className="material-symbols-outlined">
                              description
                            </span>
                            <span>{file.name}</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className={styles.remove_file}
                        >
                          <span className="material-symbols-outlined">
                            close
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {posting && uploadProgress > 0 && (
                  <div className={styles.upload_progress_bar}>
                    <div
                      className={styles.progress_fill}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <span>Uploading... {Math.round(uploadProgress)}%</span>
                  </div>
                )}

                <div className={styles.post_actions}>
                  <div className={styles.action_buttons}>
                    <label className={styles.attachment_button}>
                      <span className="material-symbols-outlined">
                        attach_file
                      </span>
                      <span>Attachment</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,application/pdf"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                  <button
                    className={styles.submit_post_button}
                    onClick={handlePostAnnouncement}
                    disabled={
                      posting ||
                      (!newAnnouncement.trim() && selectedFiles.length === 0)
                    }
                  >
                    {posting ? "Posting..." : "Post Announcement"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {userData.condition === "blocked" && (
          <div className={styles.blocked_alert}>
            <span className="material-symbols-outlined">block</span>
            <div>
              <h3>You are blocked</h3>
              <p>
                You have been blocked from posting announcements in this
                society.
              </p>
            </div>
          </div>
        )}

        <div className={styles.announcements_list}>
          {announcements.length === 0 ? (
            <div className={styles.empty_state}>
              <span className="material-symbols-outlined">campaign</span>
              <h3>No announcements yet</h3>
              <p>Be the first to post an announcement</p>
            </div>
          ) : (
            announcements.map((announcement) => {
              const isCreator = announcement.creator_email === userData.email;
              const isAdmin = userData.role === "admin";
              const canEdit = isCreator || isAdmin;
              const canDelete = isCreator || isAdmin;

              return (
                <article
                  key={announcement.announcement_id}
                  className={styles.announcement_card}
                >
                  <div className={styles.announcement_header}>
                    <div className={styles.announcement_author}>
                      <div className={styles.author_avatar}>
                        <span>
                          {announcement.creator_name?.charAt(0).toUpperCase() ||
                            "A"}
                        </span>
                      </div>
                      <div>
                        <h4 className={styles.author_name}>
                          {announcement.creator_name}
                        </h4>
                        <p className={styles.announcement_time}>
                          {new Date(
                            announcement.created_at,
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            announcement.created_at,
                          ).toLocaleTimeString()}{" "}
                          • Announcement
                        </p>
                      </div>
                    </div>
                    <div className={styles.post_menu_container}>
                      <button
                        className={styles.post_menu_button}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(announcement.announcement_id);
                        }}
                      >
                        <span className="material-symbols-outlined">
                          more_vert
                        </span>
                      </button>
                      {menuOpen === announcement.announcement_id && (
                        <div className={styles.dropdown_menu}>
                          {canEdit && (
                            <button
                              className={styles.dropdown_item}
                              onClick={() => handleEditClick(announcement)}
                            >
                              <span className="material-symbols-outlined">
                                edit
                              </span>
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className={`${styles.dropdown_item} ${styles.danger}`}
                              onClick={() =>
                                handleDeleteAnnouncement(
                                  announcement.announcement_id,
                                  announcement.creator_email,
                                )
                              }
                            >
                              <span className="material-symbols-outlined">
                                delete
                              </span>
                              Delete
                            </button>
                          )}
                          {/* Only show report button if user is not the creator */}
                          {announcement.creator_email !== userData.email && (
                            <button
                              className={`${styles.dropdown_item} ${styles.report_item}`}
                              onClick={() =>
                                handleOpenReportModal(
                                  announcement,
                                  "announcement",
                                )
                              }
                            >
                              <span className="material-symbols-outlined">
                                flag
                              </span>
                              Report
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.announcement_content}>
                    <p>{announcement.message}</p>
                  </div>

                  {announcement.media && announcement.media.length > 0 && (
                    <div className={styles.media_gallery}>
                      {announcement.media.slice(0, 3).map((media) => (
                        <div key={media.media_id} className={styles.media_item}>
                          {media.file_type === "image" ? (
                            <img src={media.file_url} alt="Attachment" />
                          ) : media.file_type === "video" ? (
                            <video controls src={media.file_url} />
                          ) : (
                            <a
                              href={media.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.document_link}
                            >
                              <span className="material-symbols-outlined">
                                description
                              </span>
                              <span>Download</span>
                            </a>
                          )}
                        </div>
                      ))}
                      {announcement.media.length > 3 && (
                        <div className={styles.more_media}>
                          +{announcement.media.length - 3} more
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.post_footer_simple}>
                    <button
                      className={styles.view_button_simple}
                      onClick={() => {
                        markAnnouncementAsViewed(announcement.announcement_id);
                        handleViewAnnouncement(announcement);
                      }}
                    >
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                      View Details
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderMembers = () => {
    const admins = members.filter((m) => m.role === "admin");
    const regularMembers = members.filter((m) => m.role !== "admin");
    if (isSocietyBlocked()) {
      return (
        <div className={styles.content_section}>
          <div className={styles.blocked_alert_full}>
            <span className="material-symbols-outlined">block</span>
            <div>
              <h3>Society is Blocked</h3>
              <p>
                This society has been blocked by the super administrator. Member
                list is not available.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.content_section}>
        <div className={styles.section_header}>
          <h2 className={styles.section_title}>Society Members</h2>
          <p className={styles.members_count}>{members.length} members</p>
        </div>

        {admins.length > 0 && (
          <div className={styles.members_section}>
            <div className={styles.section_subheader}>
              <span className="material-symbols-outlined">
                admin_panel_settings
              </span>
              <h3>Admins</h3>
              <span className={styles.section_count}>{admins.length}</span>
            </div>
            <div className={styles.members_grid}>
              {admins.map((member) => (
                <div
                  key={member.id}
                  className={`${styles.member_card} ${member.condition === "blocked" ? styles.blocked : ""}`}
                >
                  <div className={styles.member_avatar}>
                    <span>{member.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={styles.member_info}>
                    <h4 className={styles.member_name}>{member.name}</h4>
                    <p className={styles.member_email}>{member.email}</p>
                    <span
                      className={`${styles.member_role} ${styles[member.role]}`}
                    >
                      {member.role === "admin" ? "Admin" : "Member"}
                    </span>
                    {member.condition === "blocked" && (
                      <span className={styles.blocked_badge}>Blocked</span>
                    )}
                  </div>
                  {userData.role === "admin" &&
                    userData.condition !== "blocked" &&
                    member.id !== userData.id && (
                      <div className={styles.member_menu_container}>
                        <button
                          className={styles.member_menu_button}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMemberMenu(member.id);
                          }}
                        >
                          <span className="material-symbols-outlined">
                            more_vert
                          </span>
                        </button>
                        {memberMenuOpen === member.id && (
                          <div className={styles.member_dropdown_menu}>
                            {member.condition === "blocked" ? (
                              <button
                                className={styles.dropdown_item}
                                onClick={() => handleUnblockMember(member)}
                              >
                                <span className="material-symbols-outlined">
                                  lock_open
                                </span>
                                Unblock
                              </button>
                            ) : (
                              <button
                                className={styles.dropdown_item}
                                onClick={() => handleBlockMember(member)}
                              >
                                <span className="material-symbols-outlined">
                                  block
                                </span>
                                Block
                              </button>
                            )}
                            <button
                              className={styles.dropdown_item}
                              onClick={() => handleDemoteToMember(member)}
                            >
                              <span className="material-symbols-outlined">
                                arrow_downward
                              </span>
                              Demote to Member
                            </button>
                            {/* Only show report button if user is not reporting themselves */}
                            {member.id !== userData.id && (
                              <button
                                className={`${styles.dropdown_item} ${styles.report_item}`}
                                onClick={() =>
                                  handleOpenReportModal(member, "member")
                                }
                              >
                                <span className="material-symbols-outlined">
                                  flag
                                </span>
                                Report Member
                              </button>
                            )}
                            <button
                              className={`${styles.dropdown_item} ${styles.danger}`}
                              onClick={() => handleRemoveMember(member)}
                            >
                              <span className="material-symbols-outlined">
                                person_remove
                              </span>
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {regularMembers.length > 0 && (
          <div className={styles.members_section}>
            <div className={styles.section_subheader}>
              <span className="material-symbols-outlined">people</span>
              <h3>Members</h3>
              <span className={styles.section_count}>
                {regularMembers.length}
              </span>
            </div>
            <div className={styles.members_grid}>
              {regularMembers.map((member) => (
                <div
                  key={member.id}
                  className={`${styles.member_card} ${member.condition === "blocked" ? styles.blocked : ""}`}
                >
                  <div className={styles.member_avatar}>
                    <span>{member.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={styles.member_info}>
                    <h4 className={styles.member_name}>{member.name}</h4>
                    <p className={styles.member_email}>{member.email}</p>
                    <span
                      className={`${styles.member_role} ${styles[member.role]}`}
                    >
                      {member.role === "admin" ? "Admin" : "Member"}
                    </span>
                    {member.condition === "blocked" && (
                      <span className={styles.blocked_badge}>Blocked</span>
                    )}
                  </div>
                  {userData.role === "admin" &&
                    userData.condition !== "blocked" &&
                    member.id !== userData.id && (
                      <div className={styles.member_menu_container}>
                        <button
                          className={styles.member_menu_button}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMemberMenu(member.id);
                          }}
                        >
                          <span className="material-symbols-outlined">
                            more_vert
                          </span>
                        </button>
                        {memberMenuOpen === member.id && (
                          <div className={styles.member_dropdown_menu}>
                            {member.condition === "blocked" ? (
                              <button
                                className={styles.dropdown_item}
                                onClick={() => handleUnblockMember(member)}
                              >
                                <span className="material-symbols-outlined">
                                  lock_open
                                </span>
                                Unblock
                              </button>
                            ) : (
                              <button
                                className={styles.dropdown_item}
                                onClick={() => handleBlockMember(member)}
                              >
                                <span className="material-symbols-outlined">
                                  block
                                </span>
                                Block
                              </button>
                            )}
                            <button
                              className={styles.dropdown_item}
                              onClick={() => handlePromoteToAdmin(member)}
                            >
                              <span className="material-symbols-outlined">
                                arrow_upward
                              </span>
                              Promote to Admin
                            </button>
                            <button
                              className={`${styles.dropdown_item} ${styles.report_item}`}
                              onClick={() =>
                                handleOpenReportModal(member, "member")
                              }
                            >
                              <span className="material-symbols-outlined">
                                flag
                              </span>
                              Report Member
                            </button>
                            <button
                              className={`${styles.dropdown_item} ${styles.danger}`}
                              onClick={() => handleRemoveMember(member)}
                            >
                              <span className="material-symbols-outlined">
                                person_remove
                              </span>
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReports = () => {
    const pendingReports = reports.filter((r) => r.status === "pending");
    const resolvedReports = reports.filter((r) => r.status === "action_taken");
    if (isSocietyBlocked()) {
      return (
        <div className={styles.content_section}>
          <div className={styles.blocked_alert_full}>
            <span className="material-symbols-outlined">block</span>
            <div>
              <h3>Society is Blocked</h3>
              <p>
                This society has been blocked by the super administrator.
                Reports are not available.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const getReportTypeIcon = (type) => {
      switch (type) {
        case "announcement":
          return "campaign";
        case "comment":
          return "chat_bubble";
        case "member":
          return "person";
        default:
          return "flag";
      }
    };

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
          <button className={styles.refresh_btn} onClick={() => fetchReports()}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>

        {pendingReports.length > 0 && (
          <div className={styles.reports_section}>
            <div className={styles.section_subheader}>
              <span className="material-symbols-outlined">pending</span>
              <h3>Pending Reports</h3>
              <span className={styles.section_count}>
                {pendingReports.length}
              </span>
            </div>
            <div className={styles.reports_list}>
              {pendingReports.map((report) => (
                <div key={report.report_id} className={styles.report_card}>
                  <div className={styles.report_header}>
                    <div className={styles.report_type}>
                      <span className={`material-symbols-outlined`}>
                        {getReportTypeIcon(report.report_type)}
                      </span>
                      <span className={styles.report_type_label}>
                        {report.report_type}
                      </span>
                    </div>
                    <div className={styles.report_status}>
                      <span
                        className={`${styles.status_badge} ${styles.status_pending}`}
                      >
                        Pending
                      </span>
                    </div>
                  </div>
                  <div className={styles.report_content}>
                    <p className={styles.report_reason}>
                      <strong>Reason:</strong> {report.reason}
                    </p>
                    {report.description && (
                      <p className={styles.report_description}>
                        <strong>Details:</strong> {report.description}
                      </p>
                    )}
                    <div className={styles.report_meta}>
                      <span className={styles.report_meta_item}>
                        <span className="material-symbols-outlined">
                          person
                        </span>
                        Reported by: {report.reporter?.name || "Unknown"}
                      </span>
                      <span className={styles.report_meta_item}>
                        <span className="material-symbols-outlined">
                          schedule
                        </span>
                        {new Date(report.reported_at).toLocaleDateString()} at{" "}
                        {new Date(report.reported_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.report_actions}>
                    <button
                      className={styles.view_report_btn}
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
          <div className={styles.reports_divider}>
            <div className={styles.divider_line}></div>
            <span className={styles.divider_text}>Past Reports</span>
            <div className={styles.divider_line}></div>
          </div>
        )}

        {resolvedReports.length > 0 && (
          <div className={styles.reports_section}>
            <div className={styles.section_subheader}>
              <span className="material-symbols-outlined">history</span>
              <h3>Past Reports (Resolved)</h3>
              <span className={styles.section_count}>
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
                      <span className={`material-symbols-outlined`}>
                        {getReportTypeIcon(report.report_type)}
                      </span>
                      <span className={styles.report_type_label}>
                        {report.report_type}
                      </span>
                    </div>
                    <div className={styles.report_status}>
                      <span
                        className={`${styles.status_badge} ${styles.status_resolved}`}
                      >
                        Action Taken
                      </span>
                    </div>
                  </div>
                  <div className={styles.report_content}>
                    <p className={styles.report_reason}>
                      <strong>Reason:</strong> {report.reason}
                    </p>
                    {report.description && (
                      <p className={styles.report_description}>
                        <strong>Details:</strong> {report.description}
                      </p>
                    )}
                    {report.resolution_notes && (
                      <p className={styles.resolution_notes}>
                        <strong>Resolution:</strong> {report.resolution_notes}
                      </p>
                    )}
                    <div className={styles.report_meta}>
                      <span className={styles.report_meta_item}>
                        <span className="material-symbols-outlined">
                          person
                        </span>
                        Reported by: {report.reporter?.name || "Unknown"}
                      </span>
                      <span className={styles.report_meta_item}>
                        <span className="material-symbols-outlined">
                          schedule
                        </span>
                        Reported:{" "}
                        {new Date(report.reported_at).toLocaleDateString()}
                      </span>
                      {report.resolved_at && (
                        <span className={styles.report_meta_item}>
                          <span className="material-symbols-outlined">
                            check_circle
                          </span>
                          Resolved:{" "}
                          {new Date(report.resolved_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className={styles.view_report_btn}
                    onClick={() => handleViewReport(report)}
                  >
                    <span className="material-symbols-outlined">
                      visibility
                    </span>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {reports.length === 0 && (
          <div className={styles.empty_state}>
            <span className="material-symbols-outlined">flag</span>
            <h3>No reports</h3>
            <p>No reports have been submitted yet.</p>
          </div>
        )}
      </div>
    );
  };

  const getNavItems = () => {
    const items = [
      {
        id: "announcement",
        icon: "campaign",
        label: "Announcements",
        count: unreadAnnouncementsCount,
      },
      {
        id: "members",
        icon: "people",
        label: "Members",
        count: newMembersCount,
      },
      {
        id: "dues",
        icon: "payments",
        label: "Due Maintenance",
        count: pendingDuesCount,
      },
      {
        id: "notifications",
        icon: "notifications",
        label: "Notifications",
        count: unreadNotificationsCount,
      },
    ];

    if (userData.role === "admin") {
      items.push({
        id: "requests",
        icon: "person_add",
        label: "Join Requests",
        count: joinRequests.filter((r) => r.status === "not_accepted").length,
      });
      items.push({
        id: "reports",
        icon: "flag",
        label: "Reports",
        count: reports.filter((r) => r.status === "pending").length,
      });
    }

    return items;
  };

  const navItemsDynamic = getNavItems();

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.loading_spinner}></div>
        <p>Loading society...</p>
      </div>
    );
  }

  if (selectedAnnouncement) {
    return renderFullAnnouncement();
  }

  return (
    <div className={styles.society_page}>
      <header className={styles.society_header}>
        <div className={styles.header_content}>
          <div className={styles.header_left}>
            <button
              className={styles.back_button}
              onClick={() => navigate("/member")}
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
            {societyLogoUrl ? (
              <img
                src={societyLogoUrl}
                alt={societyData?.society_name || society?.society_name}
                className={styles.header_logo_img}
              />
            ) : (
              <div className={styles.header_logo}>
                <span className="material-symbols-outlined">groups</span>
              </div>
            )}
            <div className={styles.header_title_container}>
              <h2 className={styles.header_title}>
                {societyData?.society_name || society?.society_name}
              </h2>
            </div>
          </div>

          <div className={styles.header_right} />
        </div>
      </header>

      <div className={styles.society_main}>
        <div className={styles.society_layout}>
          <aside className={styles.sidebar_left}>
            <div className={styles.sidebar_sticky}>
              <div className={styles.user_profile_card}>
                <div className={styles.profile_header}>
                  <div className={styles.profile_avatar}>
                    <span>{userData.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={styles.profile_info}>
                    <h1 className={styles.profile_name}>{userData.name}</h1>
                    <p className={styles.profile_society}>
                      {societyData?.society_name || society?.society_name}
                    </p>
                    <p className={styles.profile_role}>
                      {userData.role === "admin" ? "Administrator" : "Member"}
                    </p>
                    {userData.condition === "blocked" && (
                      <p className={styles.profile_blocked}>Blocked</p>
                    )}
                  </div>
                </div>
              </div>

              <nav className={styles.sidebar_nav}>
                <p className={styles.nav_section_title}>Main Menu</p>
                {navItemsDynamic.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.nav_item} ${activeTab === item.id ? styles.active : ""}`}
                    onClick={() => {
                      if (item.id === "members") {
                        markMembersTabAsViewed();
                      }
                      setActiveTab(item.id);
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <span className={styles.nav_label}>{item.label}</span>
                    {item.count > 0 && (
                      <span className={styles.badge_count}>
                        {item.count > 99 ? "99+" : item.count}
                      </span>
                    )}
                  </button>
                ))}
                <div className={styles.nav_divider}></div>
                <p className={styles.nav_section_title}>System</p>
                {userData.role === "admin" && (
                  <button
                    className={styles.nav_item}
                    onClick={handleOpenSettings}
                  >
                    <span className="material-symbols-outlined">settings</span>
                    <span className={styles.nav_label}>Settings</span>
                  </button>
                )}
                {/* Only show Get Removed button for non-admin users (members) */}
                {userData.role !== "admin" && (
                  <button
                    className={`${styles.nav_item} ${styles.color_red}`}
                    onClick={handleGetRemoved}
                  >
                    <span className="material-symbols-outlined">
                      exit_to_app
                    </span>
                    <span className={styles.nav_label}>Get Removed</span>
                  </button>
                )}
              </nav>
            </div>
          </aside>

          <main className={styles.main_feed}>
            <div className={styles.feed_container}>
              {activeTab === "announcement" && renderAnnouncements()}
              {activeTab === "members" && renderMembers()}
              {activeTab === "dues" && renderDues()}
              {activeTab === "notifications" && renderNotifications()}
              {activeTab === "requests" && renderJoinRequests()}
              {activeTab === "reports" && renderReports()}
            </div>
          </main>
        </div>
      </div>

      {showBlockModal && (
        <div
          className={styles.modal_overlay}
          onClick={() => setShowBlockModal(false)}
        >
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modal_header}>
              <h3>Block Member</h3>
              <button
                className={styles.modal_close}
                onClick={() => setShowBlockModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={styles.modal_body}>
              <p>
                Are you sure you want to block{" "}
                <strong>{selectedMember?.name}</strong>?
              </p>

              <div className={styles.form_group}>
                <label className={styles.form_label}>Block Duration</label>
                <div className={styles.radio_group_block}>
                  <label
                    className={`${styles.radio_label_block} ${blockTimePeriod === "permanent" ? styles.selected : ""}`}
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
                    <div className={styles.radio_content_block}>
                      <span className="material-symbols-outlined">block</span>
                      <div className={styles.radio_text_block}>
                        <strong>Permanent Block</strong>
                        <small>Member will be permanently blocked</small>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`${styles.radio_label_block} ${blockTimePeriod === "temporary" ? styles.selected : ""}`}
                  >
                    <input
                      type="radio"
                      name="blockTimePeriod"
                      value="temporary"
                      checked={blockTimePeriod === "temporary"}
                      onChange={() => setBlockTimePeriod("temporary")}
                    />
                    <div className={styles.radio_content_block}>
                      <span className="material-symbols-outlined">
                        schedule
                      </span>
                      <div className={styles.radio_text_block}>
                        <strong>Temporary Block</strong>
                        <small>
                          Member will be blocked for a specific duration
                        </small>
                      </div>
                    </div>
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
                  <small className={styles.helper_text}>
                    Member will be automatically unblocked after specified days
                  </small>
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

              <div className={styles.block_summary}>
                <h4>Block Summary</h4>
                <div className={styles.summary_details}>
                  <p>
                    <strong>Member:</strong> {selectedMember?.name}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {blockTimePeriod === "temporary"
                      ? `${blockDuration} days`
                      : "Permanent"}
                  </p>
                  {blockReason && (
                    <p>
                      <strong>Reason:</strong> {blockReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.modal_footer}>
              <button
                className={styles.cancel_btn}
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedMember(null);
                  setBlockReason("");
                  setBlockTimePeriod("permanent");
                  setBlockDuration("");
                }}
              >
                Cancel
              </button>
              <button
                className={`${styles.submit_btn} ${styles.danger_btn}`}
                onClick={confirmBlockMember}
                disabled={blockTimePeriod === "temporary" && !blockDuration}
              >
                Block Member
              </button>
            </div>
          </div>
        </div>
      )}

      {renderEditModal()}
      {renderAddNotificationModal()}
      {renderSettingsModal()}
      {renderReportModal()}
      {renderReportDetailsModal()}
    </div>
  );
}

export default SocietyPage;
