"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as lucide from "lucide-react";
import DOMPurify from "dompurify";
import DashboardLayout from "@/components/dashboard-layout";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types
type EmailLabel = "important" | "personal" | "work" | "social" | "updates" | "promotions";

type EmailStatus = "inbox" | "starred" | "sent" | "drafts" | "trash" | "archived" | "scheduled";

type EmailAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
};

type EmailParticipant = {
  name: string;
  email: string;
  avatarUrl?: string;
};

type Email = {
  id: string;
  from: EmailParticipant;
  to: EmailParticipant[];
  cc?: EmailParticipant[];
  bcc?: EmailParticipant[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  snippet: string;
  date: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  attachments: EmailAttachment[];
  labels: EmailLabel[];
  threadId: string;
  folder: EmailStatus;
  hasReplied: boolean;
  hasForwarded: boolean;
};

type GmailStats = {
  inboxUnread: number;
  draftCount: number;
  scheduledCount: number;
  storageUsed: number;
  storageTotal: number;
};

type GmailAuthResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

interface GmailAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenClient: any;
  accessToken: string | null;
  userProfile: {
    name: string;
    email: string;
    picture: string;
  } | null;
}

interface GmailServiceState {
  emails: Email[];
  isLoading: boolean;
  currentFolder: EmailStatus;
  selectedLabels: EmailLabel[];
  stats: GmailStats;
  searchQuery: string;
}

// Gmail API Auth Hook
const useGmailAuth = () => {
  const [authState, setAuthState] = useState<GmailAuthState>({
    isAuthenticated: false,
    isLoading: true,
    tokenClient: null,
    accessToken: null,
    userProfile: null
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Client ID from Google Cloud Console
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";
  
  const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ].join(" ");

  // Load the Google API script
  const loadGoogleScript = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        resolve();
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => resolve();
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    });
  }, []);

  // Initialize Google API client
  const initializeGapiClient = useCallback(async () => {
    return new Promise<void>((resolve) => {
      if (window.gapi) {
        window.gapi.load("client", async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
              "https://www.googleapis.com/discovery/v1/apis/oauth2/v2/rest"
            ],
          });
          
          const savedToken = localStorage.getItem("gmail_access_token");
          if (savedToken) {
            setAuthState(prev => ({
              ...prev,
              accessToken: savedToken,
              isAuthenticated: true
            }));
            window.gapi.client.setToken({ access_token: savedToken });
            await fetchUserProfile(savedToken);
          }
          
          resolve();
        });
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load("client", async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
              "https://www.googleapis.com/discovery/v1/apis/oauth2/v2/rest"
            ],
          });
          
          const savedToken = localStorage.getItem("gmail_access_token");
          if (savedToken) {
            setAuthState(prev => ({
              ...prev,
              accessToken: savedToken,
              isAuthenticated: true
            }));
            window.gapi.client.setToken({ access_token: savedToken });
            await fetchUserProfile(savedToken);
          }
          
          resolve();
        });
      };
      document.body.appendChild(script);
    });
  }, [API_KEY]);

  // Fetch user profile information
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        setAuthState(prev => ({
          ...prev,
          userProfile: {
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Initialize Google Identity Services
  const initializeTokenClient = useCallback(async () => {
    await loadGoogleScript();
    
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse: GmailAuthResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            const token = tokenResponse.access_token;
            localStorage.setItem("gmail_access_token", token);
            
            if (window.gapi && window.gapi.client) {
              window.gapi.client.setToken({ access_token: token });
            }
            
            await fetchUserProfile(token);
            
            setAuthState(prev => ({
              ...prev,
              accessToken: token,
              isAuthenticated: true,
              isLoading: false
            }));
          }
        },
        error_callback: (error: any) => {
          console.error("Error getting OAuth token:", error);
          setAuthState(prev => ({
            ...prev,
            isLoading: false
          }));
        }
      });
      
      setAuthState(prev => ({
        ...prev,
        tokenClient: client
      }));
    }
  }, [CLIENT_ID, SCOPES, loadGoogleScript]);

  // Initialize everything
  useEffect(() => {
    const initialize = async () => {
      setAuthState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      await initializeGapiClient();
      await initializeTokenClient();
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }));
    };
    
    initialize();
  }, [initializeGapiClient, initializeTokenClient]);

  // Request authentication
  const signIn = useCallback(() => {
    if (authState.tokenClient) {
      authState.tokenClient.requestAccessToken({
        prompt: 'consent'
      });
    }
  }, [authState.tokenClient]);

  // Sign out
  const signOut = useCallback(() => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(authState.accessToken || "", () => {
        localStorage.removeItem("gmail_access_token");
        
        if (window.gapi && window.gapi.client) {
          window.gapi.client.setToken(null);
        }
        
        setAuthState(prev => ({
          ...prev,
          accessToken: null,
          isAuthenticated: false,
          userProfile: null
        }));
      });
    }
  }, [authState.accessToken]);

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    signIn,
    signOut,
    accessToken: authState.accessToken,
    userProfile: authState.userProfile
  };
};

// Gmail API Service
const useGmailService = (isAuthenticated: boolean, accessToken: string | null) => {
  const [state, setState] = useState<GmailServiceState>({
    emails: [],
    isLoading: false,
    currentFolder: "inbox",
    selectedLabels: [],
    stats: {
      inboxUnread: 0,
      draftCount: 0,
      scheduledCount: 0,
      storageUsed: 0,
      storageTotal: 1024 * 1024 * 1024 * 15 // 15 GB default
    },
    searchQuery: ""
  });
  
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [composeState, setComposeState] = useState({
    isOpen: false,
    replyTo: null as Email | null,
    forwardFrom: null as Email | null,
    draftId: null as string | null
  });

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchEmails(state.currentFolder, state.selectedLabels, state.searchQuery);
      fetchMailboxStats();
    }
  }, [isAuthenticated, accessToken, state.currentFolder, state.selectedLabels]);

  const fetchMailboxStats = async () => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      // Fetch unread count
      const inboxUnreadResponse = await window.gapi.client.gmail.users.messages.list({
        userId: "me",
        q: "in:inbox is:unread",
        maxResults: 1
      });
      
      // Fetch drafts count
      const draftsResponse = await window.gapi.client.gmail.users.drafts.list({
        userId: "me",
        maxResults: 1
      });
      
      // Fake scheduled count (Gmail API doesn't have direct access to scheduled)
      const scheduledCount = Math.floor(Math.random() * 5);
      
      // Profile info including storage
      const profileResponse = await window.gapi.client.gmail.users.getProfile({
        userId: "me"
      });
      
      setState(prev => ({
        ...prev,
        stats: {
          inboxUnread: inboxUnreadResponse.result.resultSizeEstimate || 0,
          draftCount: draftsResponse.result.resultSizeEstimate || 0,
          scheduledCount,
          storageUsed: parseInt(profileResponse.result.messagesTotal || "0"),
          storageTotal: 1024 * 1024 * 1024 * 15 // 15 GB
        }
      }));
    } catch (error) {
      console.error("Error fetching mailbox stats:", error);
    }
  };

  const fetchEmails = async (
    folder: EmailStatus, 
    labels: EmailLabel[] = [], 
    searchQuery: string = ""
  ) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      searchQuery
    }));
    
    try {
      // Define query based on folder
      let query = "";
      switch (folder) {
        case "inbox":
          query = "in:inbox";
          break;
        case "starred":
          query = "is:starred";
          break;
        case "sent":
          query = "in:sent";
          break;
        case "drafts":
          query = "is:draft";
          break;
        case "trash":
          query = "in:trash";
          break;
        case "archived":
          query = "is:archived";
          break;
        case "scheduled":
          query = "label:scheduled"; // Not directly supported but we can use labels
          break;
        default:
          query = "in:inbox";
      }

      // Add labels to query
      if (labels.length > 0) {
        const labelQuery = labels.map(label => `label:${label}`).join(" OR ");
        query = `${query} (${labelQuery})`;
      }

      // Add search query if provided
      if (searchQuery) {
        query = `${query} ${searchQuery}`;
      }

      const response = await window.gapi.client.gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 50,
      });

      const messages = response.result.messages || [];
      const fetchedEmails: Email[] = [];

      // Fetch details for each message
      for (const message of messages) {
        const details = await window.gapi.client.gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full"
        });

        const payload = details.result.payload;
        const headers = payload.headers;
        
        // Extract email details from headers
        const from = headers.find((h: any) => h.name === "From" || h.name === "from");
        const to = headers.find((h: any) => h.name === "To" || h.name === "to");
        const cc = headers.find((h: any) => h.name === "Cc" || h.name === "cc");
        const bcc = headers.find((h: any) => h.name === "Bcc" || h.name === "bcc");
        const subject = headers.find((h: any) => h.name === "Subject" || h.name === "subject");
        const date = headers.find((h: any) => h.name === "Date" || h.name === "date");
        
        // Extract email body (both plain text and HTML)
        let bodyText = "";
        let bodyHtml = "";
        
        // Function to decode base64
        const decodeBase64 = (data: string) => {
          return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
        };
        
        // Extract parts recursively
        const extractParts = (part: any) => {
          if (part.mimeType === "text/plain" && part.body.data) {
            bodyText = decodeBase64(part.body.data);
          } else if (part.mimeType === "text/html" && part.body.data) {
            bodyHtml = decodeBase64(part.body.data);
          } else if (part.parts) {
            part.parts.forEach((subpart: any) => extractParts(subpart));
          }
        };
        
        if (payload.mimeType === "text/plain" && payload.body.data) {
          bodyText = decodeBase64(payload.body.data);
        } else if (payload.mimeType === "text/html" && payload.body.data) {
          bodyHtml = decodeBase64(payload.body.data);
        } else if (payload.parts) {
          payload.parts.forEach(extractParts);
        }
        
        // Extract attachments
        const attachments: EmailAttachment[] = [];
        
        const extractAttachments = (part: any, partId: string = "") => {
          if (part.filename && part.filename.length > 0) {
            attachments.push({
              id: part.body.attachmentId || `${message.id}_${partId}`,
              name: part.filename,
              type: part.mimeType,
              size: part.body.size || 0,
            });
          }
          
          if (part.parts) {
            part.parts.forEach((subpart: any, i: number) => {
              extractAttachments(subpart, partId ? `${partId}.${i+1}` : `${i+1}`);
            });
          }
        };
        
        if (payload.parts) {
          payload.parts.forEach((part: any, i: number) => {
            extractAttachments(part, `${i+1}`);
          });
        }

        // Parse from field
        const parseEmailField = (field: string): EmailParticipant => {
          const match = field.match(/(.*?)(?:\s*<(.*)>)?$/);
          if (match) {
            const [_, name, email] = match;
            return {
              name: name.trim(),
              email: email ? email.trim() : name.trim(),
            };
          }
          return { name: "", email: field };
        };
        
        // Parse to field (can contain multiple addresses)
        const parseMultipleEmailField = (field: string): EmailParticipant[] => {
          return field.split(",").map(part => parseEmailField(part.trim()));
        };
        
        const fromParsed = from ? parseEmailField(from.value) : { name: "", email: "" };
        const toParsed = to ? parseMultipleEmailField(to.value) : [{ name: "", email: "" }];
        const ccParsed = cc ? parseMultipleEmailField(cc.value) : [];
        const bccParsed = bcc ? parseMultipleEmailField(bcc.value) : [];

        // Check message status
        const isRead = !details.result.labelIds.includes("UNREAD");
        const isStarred = details.result.labelIds.includes("STARRED");
        const isImportant = details.result.labelIds.includes("IMPORTANT");
        
        // Generate fake labels for demonstration
        const customLabels = details.result.labelIds
          .filter((label: string) => !label.startsWith("CATEGORY_") && 
                                    !["INBOX", "SENT", "DRAFT", "TRASH", "STARRED", "IMPORTANT", "UNREAD"].includes(label))
          .map((label: string) => label.toLowerCase() as EmailLabel);
        
        // Detect if email has been replied to or forwarded
        const hasReplied = headers.some((h: any) => h.name === "In-Reply-To");
        const hasForwarded = subject ? subject.value.startsWith("Fwd:") : false;
        
        // Create a snippet
        const snippet = details.result.snippet || bodyText.substring(0, 100);

        fetchedEmails.push({
          id: message.id,
          from: fromParsed,
          to: toParsed,
          cc: ccParsed,
          bcc: bccParsed,
          subject: subject ? subject.value : "(No Subject)",
          bodyText,
          bodyHtml,
          snippet,
          date: date ? date.value : "",
          read: isRead,
          starred: isStarred,
          important: isImportant,
          attachments,
          labels: customLabels as EmailLabel[],
          threadId: details.result.threadId,
          folder,
          hasReplied,
          hasForwarded
        });
      }

      setState(prev => ({
        ...prev,
        emails: fetchedEmails,
        isLoading: false,
        currentFolder: folder
      }));
    } catch (error) {
      console.error("Error fetching emails:", error);
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const toggleStarred = async (emailId: string) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      const email = state.emails.find(e => e.id === emailId);
      if (!email) return;

      // Update message labels
      await window.gapi.client.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        resource: {
          addLabelIds: email.starred ? [] : ["STARRED"],
          removeLabelIds: email.starred ? ["STARRED"] : [],
        },
      });

      // Update local state
      setState(prev => ({
        ...prev,
        emails: prev.emails.map(e => 
          e.id === emailId ? { ...e, starred: !e.starred } : e
        )
      }));
    } catch (error) {
      console.error("Error toggling starred status:", error);
    }
  };

  const toggleImportant = async (emailId: string) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      const email = state.emails.find(e => e.id === emailId);
      if (!email) return;

      // Update message labels
      await window.gapi.client.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        resource: {
          addLabelIds: email.important ? [] : ["IMPORTANT"],
          removeLabelIds: email.important ? ["IMPORTANT"] : [],
        },
      });

      // Update local state
      setState(prev => ({
        ...prev,
        emails: prev.emails.map(e => 
          e.id === emailId ? { ...e, important: !e.important } : e
        )
      }));
    } catch (error) {
      console.error("Error toggling important status:", error);
    }
  };

  const markAsRead = async (emailId: string) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      const email = state.emails.find(e => e.id === emailId);
      if (!email || email.read) return;

      // Update message labels
      await window.gapi.client.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        resource: {
          removeLabelIds: ["UNREAD"],
        },
      });

      // Update local state
      setState(prev => ({
        ...prev,
        emails: prev.emails.map(e => 
          e.id === emailId ? { ...e, read: true } : e
        ),
        stats: {
          ...prev.stats,
          inboxUnread: Math.max(0, prev.stats.inboxUnread - 1)
        }
      }));
    } catch (error) {
      console.error("Error marking email as read:", error);
    }
  };

  const markAsUnread = async (emailId: string) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      const email = state.emails.find(e => e.id === emailId);
      if (!email || !email.read) return;

      // Update message labels
      await window.gapi.client.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        resource: {
          addLabelIds: ["UNREAD"],
        },
      });

      // Update local state
      setState(prev => ({
        ...prev,
        emails: prev.emails.map(e => 
          e.id === emailId ? { ...e, read: false } : e
        ),
        stats: {
          ...prev.stats,
          inboxUnread: prev.stats.inboxUnread + 1
        }
      }));
    } catch (error) {
      console.error("Error marking email as unread:", error);
    }
  };

  const moveToTrash = async (emailId: string) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      // Update message labels
      await window.gapi.client.gmail.users.messages.trash({
        userId: "me",
        id: emailId
      });

      // Update local state
      setState(prev => ({
        ...prev,
        emails: prev.emails.filter(e => e.id !== emailId)
      }));
    } catch (error) {
      console.error("Error moving email to trash:", error);
    }
  };

  const archiveEmail = async (emailId: string) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      // Update message labels
      await window.gapi.client.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        resource: {
          removeLabelIds: ["INBOX"],
        },
      });

      // Update local state
      setState(prev => ({
        ...prev,
        emails: prev.emails.filter(e => e.id !== emailId)
      }));
    } catch (error) {
      console.error("Error archiving email:", error);
    }
  };

  const applyLabel = async (emailId: string, label: EmailLabel) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      // Create label if it doesn't exist
      try {
        await window.gapi.client.gmail.users.labels.create({
          userId: "me",
          resource: {
            name: label.toUpperCase(),
            labelListVisibility: "labelShow",
            messageListVisibility: "show"
          }
        });
      } catch (error) {
        // Label might already exist, which is fine
      }

      // Update message labels
      await window.gapi.client.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        resource: {
          addLabelIds: [label.toUpperCase()],
        },
      });

      // Update local state
      setState(prev => ({
        ...prev,
        emails: prev.emails.map(e => 
          e.id === emailId ? { 
            ...e, 
            labels: [...e.labels, label].filter((v, i, a) => a.indexOf(v) === i) 
          } : e
        )
      }));
    } catch (error) {
      console.error("Error applying label:", error);
    }
  };

  const removeLabel = async (emailId: string, label: EmailLabel) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return;
    
    try {
      // Update message labels
      await window.gapi.client.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        resource: {
          removeLabelIds: [label.toUpperCase()],
        },
      });

      // Update local state
      setState(prev => ({
        ...prev,
        emails: prev.emails.map(e => 
          e.id === emailId ? { 
            ...e, 
            labels: e.labels.filter(l => l !== label) 
          } : e
        )
      }));
    } catch (error) {
      console.error("Error removing label:", error);
    }
  };

  const createDraft = async (
    to: string[],
    subject: string,
    body: string,
    cc?: string[],
    bcc?: string[]
  ) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return null;
    
    try {
      // Create email content in RFC 5322 format
      const emailLines = [
        `To: ${to.join(", ")}`,
        `Subject: ${subject}`,
        cc && cc.length > 0 ? `Cc: ${cc.join(", ")}` : null,
        bcc && bcc.length > 0 ? `Bcc: ${bcc.join(", ")}` : null,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        "",
        body
      ].filter(Boolean);
      
      const emailContent = emailLines.join("\r\n");

      // Encode the email content
      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Create the draft
      const response = await window.gapi.client.gmail.users.drafts.create({
        userId: "me",
        resource: {
          message: {
            raw: encodedEmail,
          },
        },
      });

      // Get the draft ID
      const draftId = response.result.id;
      
      // Update stats
      setState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          draftCount: prev.stats.draftCount + 1
        }
      }));

      return draftId;
    } catch (error) {
      console.error("Error creating draft:", error);
      return null;
    }
  };

  const sendEmail = async (
    to: string[],
    subject: string,
    body: string,
    cc?: string[],
    bcc?: string[],
    draftId?: string
  ) => {
    if (!isAuthenticated || !accessToken || !window.gapi?.client?.gmail) return false;
    
    try {
      if (draftId) {
        // Send an existing draft
        await window.gapi.client.gmail.users.drafts.send({
          userId: "me",
          resource: {
            id: draftId
          }
        });
      } else {
        // Create email content in RFC 5322 format
        const emailLines = [
          `To: ${to.join(", ")}`,
          `Subject: ${subject}`,
          cc && cc.length > 0 ? `Cc: ${cc.join(", ")}` : null,
          bcc && bcc.length > 0 ? `Bcc: ${bcc.join(", ")}` : null,
          "Content-Type: text/html; charset=utf-8",
          "MIME-Version: 1.0",
          "",
          body
        ].filter(Boolean);
        
        const emailContent = emailLines.join("\r\n");

        // Encode the email content
        const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        // Send the email
        await window.gapi.client.gmail.users.messages.send({
          userId: "me",
          resource: {
            raw: encodedEmail,
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };

  const searchEmails = (query: string) => {
    fetchEmails(state.currentFolder, state.selectedLabels, query);
  };

  const selectFolder = (folder: EmailStatus) => {
    setState(prev => ({
      ...prev,
      currentFolder: folder,
      selectedLabels: []
    }));
    
    fetchEmails(folder, []);
  };

  const selectLabels = (labels: EmailLabel[]) => {
    setState(prev => ({
      ...prev,
      selectedLabels: labels
    }));
    
    fetchEmails(state.currentFolder, labels, state.searchQuery);
  };

  const viewEmail = (emailId: string) => {
    setSelectedEmail(emailId);
    
    // Mark as read when viewed
    const email = state.emails.find(e => e.id === emailId);
    if (email && !email.read) {
      markAsRead(emailId);
    }
  };

  const viewThread = (threadId: string) => {
    setSelectedThread(threadId);
  };

  const closeEmail = () => {
    setSelectedEmail(null);
  };

  const closeThread = () => {
    setSelectedThread(null);
  };

  const openCompose = (options?: {
    replyTo?: Email,
    forwardFrom?: Email,
    draftId?: string
  }) => {
    setComposeState({
      isOpen: true,
      replyTo: options?.replyTo || null,
      forwardFrom: options?.forwardFrom || null,
      draftId: options?.draftId || null
    });
  };

  const closeCompose = () => {
    setComposeState({
      isOpen: false,
      replyTo: null,
      forwardFrom: null,
      draftId: null
    });
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date >= today) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if it's yesterday
    if (date >= yesterday) {
      return 'Yesterday';
    }
    
    // Check if it's this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get emails for the current thread
  const getThreadEmails = useMemo(() => {
    if (!selectedThread) return [];
    return state.emails.filter(email => email.threadId === selectedThread)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedThread, state.emails]);

  // Get the selected email
  const getSelectedEmail = useMemo(() => {
    if (!selectedEmail) return null;
    return state.emails.find(email => email.id === selectedEmail) || null;
  }, [selectedEmail, state.emails]);

  // Sanitize HTML content
  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'hr', 'i', 'img', 'li', 'ol', 'p', 'span', 'strong', 'table',
        'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul'
      ],
      ALLOWED_ATTR: [
        'href', 'style', 'src', 'alt', 'title', 'width', 'height',
        'cellpadding', 'cellspacing', 'border', 'bgcolor'
      ]
    });
  };

  return {
    emails: state.emails,
    isLoading: state.isLoading,
    currentFolder: state.currentFolder,
    selectedLabels: state.selectedLabels,
    stats: state.stats,
    searchQuery: state.searchQuery,
    selectedEmail,
    selectedThread,
    composeState,
    fetchEmails,
    toggleStarred,
    toggleImportant,
    markAsRead,
    markAsUnread,
    moveToTrash,
    archiveEmail,
    applyLabel,
    removeLabel,
    createDraft,
    sendEmail,
    searchEmails,
    selectFolder,
    selectLabels,
    viewEmail,
    viewThread,
    closeEmail,
    closeThread,
    openCompose,
    closeCompose,
    formatDate,
    getThreadEmails,
    getSelectedEmail,
    sanitizeHtml
  };
};

// Main Gmail Component
const GmailInterface = () => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    signIn,
    signOut,
    accessToken,
    userProfile
  } = useGmailAuth();

  const {
    emails,
    isLoading: emailsLoading,
    currentFolder,
    selectedLabels,
    stats,
    searchQuery,
    selectedEmail,
    selectedThread,
    composeState,
    fetchEmails,
    toggleStarred,
    toggleImportant,
    markAsRead,
    markAsUnread,
    moveToTrash,
    archiveEmail,
    applyLabel,
    removeLabel,
    createDraft,
    sendEmail,
    searchEmails,
    selectFolder,
    selectLabels,
    viewEmail,
    viewThread,
    closeEmail,
    closeThread,
    openCompose,
    closeCompose,
    formatDate,
    getThreadEmails,
    getSelectedEmail,
    sanitizeHtml
  } = useGmailService(isAuthenticated, accessToken);

  const [searchInputValue, setSearchInputValue] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEmails(searchInputValue);
  };

  // Handle clicking on email
  const handleEmailClick = (email: Email) => {
    if (email.threadId) {
      viewThread(email.threadId);
    } else {
      viewEmail(email.id);
    }
  };

  // Icons mapping
  const Icons = {
    inbox: lucide.Inbox,
    star: lucide.Star,
    send: lucide.Send,
    file: lucide.File,
    archive: lucide.Archive,
    trash: lucide.Trash,
    clock: lucide.Clock,
    alert: lucide.AlertTriangle,
    tag: lucide.Tag,
    user: lucide.User,
    briefcase: lucide.Briefcase,
    users: lucide.Users,
    bell: lucide.Bell,
    shopping: lucide.ShoppingBag,
    reply: lucide.Reply,
    forward: lucide.Forward,
    plus: lucide.Plus,
    search: lucide.Search,
    menu: lucide.Menu,
    close: lucide.X,
    compose: lucide.PenSquare,
    attachment: lucide.Paperclip,
    more: lucide.MoreVertical,
    logout: lucide.LogOut,
    back: lucide.ArrowLeft,
    check: lucide.Check,
    warning: lucide.AlertTriangle,
    label: lucide.Tag,
    expand: lucide.ChevronDown,
    collapse: lucide.ChevronUp,
    settings: lucide.Settings,
    refresh: lucide.RefreshCw,
    download: lucide.Download,
    print: lucide.Printer,
    delete: lucide.Trash2,
    edit: lucide.Edit,
    newWindow: lucide.ExternalLink,
    arrowUp: lucide.ArrowUp,
    arrowDown: lucide.ArrowDown,
    chevronLeft: lucide.ChevronLeft,
    chevronRight: lucide.ChevronRight
  };

  // Function to get folder icon
  const getFolderIcon = (folder: EmailStatus) => {
    const Icon = (() => {
      switch (folder) {
        case "inbox": return Icons.inbox;
        case "starred": return Icons.star;
        case "sent": return Icons.send;
        case "drafts": return Icons.file;
        case "archived": return Icons.archive;
        case "trash": return Icons.trash;
        case "scheduled": return Icons.clock;
        default: return Icons.inbox;
      }
    })();

    return <Icon size={20} />;
  };

  // Function to get label icon and color
  const getLabelData = (label: EmailLabel) => {
    switch (label) {
      case "important":
        return { Icon: Icons.alert, color: "#e25142" };
      case "personal":
        return { Icon: Icons.user, color: "#41a0e2" };
      case "work":
        return { Icon: Icons.briefcase, color: "#6e41e2" };
      case "social":
        return { Icon: Icons.users, color: "#e241d0" };
      case "updates":
        return { Icon: Icons.bell, color: "#e2a141" };
      case "promotions":
        return { Icon: Icons.shopping, color: "#41e27a" };
      default:
        return { Icon: Icons.tag, color: "#777777" };
    }
  };

  // Computed folders list with counts
  const folders = [
    { id: "inbox", name: "Inbox", count: stats.inboxUnread, selected: currentFolder === "inbox" },
    { id: "starred", name: "Starred", count: 0, selected: currentFolder === "starred" },
    { id: "sent", name: "Sent", count: 0, selected: currentFolder === "sent" },
    { id: "drafts", name: "Drafts", count: stats.draftCount, selected: currentFolder === "drafts" },
    { id: "scheduled", name: "Scheduled", count: stats.scheduledCount, selected: currentFolder === "scheduled" },
    { id: "archived", name: "Archive", count: 0, selected: currentFolder === "archived" },
    { id: "trash", name: "Trash", count: 0, selected: currentFolder === "trash" }
  ];

  // Computed labels list
  const labels = [
    { id: "important", name: "Important", selected: selectedLabels.includes("important") },
    { id: "personal", name: "Personal", selected: selectedLabels.includes("personal") },
    { id: "work", name: "Work", selected: selectedLabels.includes("work") },
    { id: "social", name: "Social", selected: selectedLabels.includes("social") },
    { id: "updates", name: "Updates", selected: selectedLabels.includes("updates") },
    { id: "promotions", name: "Promotions", selected: selectedLabels.includes("promotions") }
  ];

  // Handle folder click
  const handleFolderClick = (folder: EmailStatus) => {
    selectFolder(folder);
    setShowMobileMenu(false);
  };

  // Handle label toggle
  const handleLabelToggle = (label: EmailLabel) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label];
    
    selectLabels(newLabels);
    
    // Close mobile menu if open
    if (showMobileMenu) {
      setShowMobileMenu(false);
    }
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Handle compose button click
  const handleComposeClick = () => {
    openCompose();
    
    // Close mobile menu if open
    if (showMobileMenu) {
      setShowMobileMenu(false);
    }
  };

  // Calculate storage usage
  const storagePercentage = Math.min(100, (stats.storageUsed / stats.storageTotal) * 100);

  // Storage usage in human readable format
  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Animations
  const sidebarVariants = {
    expanded: { width: "240px" },
    collapsed: { width: "64px" }
  };

  const mobileMenuVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  // Compose email component
  const ComposeEmail = () => {
    const [to, setTo] = useState<string>("");
    const [cc, setCc] = useState<string>("");
    const [bcc, setBcc] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [showCcBcc, setShowCcBcc] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
    const [draftId, setDraftId] = useState<string | null>(composeState.draftId);
    const [draftSaved, setDraftSaved] = useState<boolean>(false);
    
    // Auto-save draft timer
    const [draftTimer, setDraftTimer] = useState<NodeJS.Timeout | null>(null);
    
    // Set initial values for reply or forward
    useEffect(() => {
      if (composeState.replyTo) {
        const email = composeState.replyTo;
        setTo(email.from.email);
        setSubject(`Re: ${email.subject}`);
        setBody(`<br><br><div style="border-left: 2px solid #ccc; padding-left: 10px; margin: 10px 0;">
          <p><strong>On ${new Date(email.date).toLocaleString()}, ${email.from.name} &lt;${email.from.email}&gt; wrote:</strong></p>
          ${email.bodyHtml || `<p>${email.bodyText}</p>`}
        </div>`);
      } else if (composeState.forwardFrom) {
        const email = composeState.forwardFrom;
        setSubject(`Fwd: ${email.subject}`);
        setBody(`<br><br>---------- Forwarded message ----------<br>
          <p><strong>From:</strong> ${email.from.name} &lt;${email.from.email}&gt;</p>
          <p><strong>Date:</strong> ${new Date(email.date).toLocaleString()}</p>
          <p><strong>Subject:</strong> ${email.subject}</p>
          <p><strong>To:</strong> ${email.to.map(t => `${t.name} <${t.email}>`).join(", ")}</p>
          <br>
          ${email.bodyHtml || `<p>${email.bodyText}</p>`}
        `);
      }
    }, [composeState.replyTo, composeState.forwardFrom]);
    
    // Auto-save draft
    useEffect(() => {
      if (draftTimer) {
        clearTimeout(draftTimer);
      }
      
      // Don't save if fields are empty
      if (!to && !subject && !body) return;
      
      const timer = setTimeout(async () => {
        setIsSavingDraft(true);
        
        const toEmails = to.split(",").map(email => email.trim()).filter(Boolean);
        const ccEmails = cc.split(",").map(email => email.trim()).filter(Boolean);
        const bccEmails = bcc.split(",").map(email => email.trim()).filter(Boolean);
        
        // Save to existing draft or create new
        const savedDraftId = await createDraft(
          toEmails,
          subject,
          body,
          ccEmails.length > 0 ? ccEmails : undefined,
          bccEmails.length > 0 ? bccEmails : undefined
        );
        
        if (savedDraftId) {
          setDraftId(savedDraftId);
          setDraftSaved(true);
          
          // Hide the "Draft saved" message after 2 seconds
          setTimeout(() => {
            setDraftSaved(false);
          }, 2000);
        }
        
        setIsSavingDraft(false);
      }, 3000);
      
      setDraftTimer(timer);
      
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }, [to, cc, bcc, subject, body]);
    
    const handleSend = async () => {
      setIsSending(true);
      
      const toEmails = to.split(",").map(email => email.trim()).filter(Boolean);
      const ccEmails = cc.split(",").map(email => email.trim()).filter(Boolean);
      const bccEmails = bcc.split(",").map(email => email.trim()).filter(Boolean);
      
      const success = await sendEmail(
        toEmails,
        subject,
        body,
        ccEmails.length > 0 ? ccEmails : undefined,
        bccEmails.length > 0 ? bccEmails : undefined,
        draftId || undefined
      );
      
      setIsSending(false);
      
      if (success) {
        closeCompose();
      }
    };
    
    return (
      <motion.div
        className="fixed bottom-0 right-4 z-50 flex flex-col w-full max-w-lg bg-white border rounded-t-lg shadow-lg"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-t-lg border-b">
          <h3 className="font-medium">
            {composeState.replyTo ? "Reply" : 
             composeState.forwardFrom ? "Forward" : 
             "New Message"}
          </h3>
          <div className="flex gap-2">
            <button 
              className="p-1 hover:bg-gray-200 rounded"
              onClick={closeCompose}
            >
              <Icons.close size={18} />
            </button>
          </div>
        </div>
        <div className="p-3 flex-1 overflow-auto">
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <label className="w-16 text-sm text-gray-600">To:</label>
              <input 
                type="text" 
                value={to} 
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Recipients"
              />
            </div>
            
            {showCcBcc && (
              <>
                <div className="flex items-center mb-2">
                  <label className="w-16 text-sm text-gray-600">Cc:</label>
                  <input 
                    type="text" 
                    value={cc} 
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="flex items-center mb-2">
                  <label className="w-16 text-sm text-gray-600">Bcc:</label>
                  <input 
                    type="text" 
                    value={bcc} 
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </>
            )}
            
            {!showCcBcc && (
              <div className="text-right">
                <button 
                  onClick={() => setShowCcBcc(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Cc/Bcc
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <input 
              type="text" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Subject"
            />
          </div>
          
          <div className="mb-3 min-h-32">
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-48 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Compose email..."
            />
          </div>
        </div>
        
        <div className="p-3 border-t flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleSend}
              disabled={isSending || !to.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium flex items-center gap-1 disabled:bg-blue-300"
            >
              {isSending ? (
                <>
                  <Icons.refresh className="animate-spin" size={16} />
                  Sending...
                </>
              ) : "Send"}
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded">
              <Icons.attachment size={18} />
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            {isSavingDraft && "Saving draft..."}
            {draftSaved && "Draft saved"}
          </div>
        </div>
      </motion.div>
    );
  };

  // Email view component
  const EmailView = () => {
    const email = getSelectedEmail;
    
    if (!email) return null;
    
    return (
      <motion.div
        className="bg-white rounded-lg shadow-sm border  h-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        

        <div className="p-4 border-b flex justify-between items-center">
          <button 
            onClick={closeEmail}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <Icons.back size={18} />
          </button>
          
          <div className="flex gap-2">
            <button 
              className="hover:bg-gray-100 p-2 rounded-full"
              onClick={() => archiveEmail(email.id)}
              title="Archive"
            >
              <Icons.archive size={18} />
            </button>
            <button 
              className="hover:bg-gray-100 p-2 rounded-full"
              onClick={() => moveToTrash(email.id)}
              title="Delete"
            >
              <Icons.delete size={18} />
            </button>
            <button 
              className="hover:bg-gray-100 p-2 rounded-full"
              onClick={() => markAsUnread(email.id)}
              title="Mark as unread"
            >
              <Icons.bell size={18} />
            </button>
            <button 
              className={`p-2 rounded-full ${email.starred ? "text-yellow-500" : "hover:bg-gray-100"}`}
              onClick={() => toggleStarred(email.id)}
              title={email.starred ? "Unstar" : "Star"}
            >
              <Icons.star size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b">
          <h2 className="text-2xl font-medium mb-3">{email.subject}</h2>
          
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium uppercase">
                {email.from.name.charAt(0)}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{email.from.name}</span>
                  <span className="text-sm text-gray-500">&lt;{email.from.email}&gt;</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  To: {email.to.map(t => t.name || t.email).join(", ")}
                </div>
                
                {email.cc && email.cc.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Cc: {email.cc.map(c => c.name || c.email).join(", ")}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {new Date(email.date).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-4 flex-grow overflow-hidden flex flex-col ">
        <ScrollArea className="h-[calc(100vh-60px)]">
          {email.bodyHtml ? (
            <div 
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.bodyHtml) }}
              className="email-body"
            />
          ) : (
            <div className="whitespace-pre-wrap">{email.bodyText}</div>
          )}
          
          {email.attachments.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Attachments ({email.attachments.length})</h3>
              <div className="flex flex-wrap gap-3">
                {email.attachments.map(attachment => (
                  <div key={attachment.id} className="border rounded p-2 flex items-center gap-2">
                    <Icons.attachment size={16} />
                    <div>
                      <div className="text-sm">{attachment.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatStorageSize(attachment.size)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
        </div>
        <div className="p-4 border-t flex gap-2">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium flex items-center gap-1"
            onClick={() => openCompose({ replyTo: email })}
          >
            <Icons.reply size={16} />
            Reply
          </button>
          
          <button 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium flex items-center gap-1"
            onClick={() => openCompose({ forwardFrom: email })}
          >
            <Icons.forward size={16} />
            Forward
          </button>
        </div>
        

        
      </motion.div>
    );
  };

  // Thread view component
  const ThreadView = () => {
    const emails = getThreadEmails;
    
    if (!emails.length) return null;
    
    return (
      <motion.div
        className="bg-white rounded-lg shadow-sm border h-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <button 
            onClick={closeThread}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <Icons.back size={18} />
          </button>
          
          <div className="flex gap-2">
            <button 
              className="hover:bg-gray-100 p-2 rounded-full"
              onClick={() => emails.forEach(email => archiveEmail(email.id))}
              title="Archive"
            >
              <Icons.archive size={18} />
            </button>
            <button 
              className="hover:bg-gray-100 p-2 rounded-full"
              onClick={() => emails.forEach(email => moveToTrash(email.id))}
              title="Delete"
            >
              <Icons.delete size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b">
          <h2 className="text-2xl font-medium">{emails[0].subject}</h2>
          <div className="text-sm text-gray-500 mt-1">
            {emails.length} messages
          </div>
        </div>
        
        <div className="flex-grow overflow-auto">
          {emails.map((email, index) => (
            <div 
              key={email.id}
              className={`p-4 border-b ${index === emails.length - 1 ? 'border-transparent' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium uppercase">
                    {email.from.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{email.from.name}</span>
                      <span className="text-sm text-gray-500">&lt;{email.from.email}&gt;</span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      To: {email.to.map(t => t.name || t.email).join(", ")}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {new Date(email.date).toLocaleString()}
                </div>
              </div>
              
              <div>
                {email.bodyHtml ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.bodyHtml) }}
                    className="email-body"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{email.bodyText}</div>
                )}
                
                {email.attachments.length > 0 && (
                  <div className="mt-4 pt-2 border-t">
                    <h3 className="text-sm font-medium mb-2">Attachments ({email.attachments.length})</h3>
                    <div className="flex flex-wrap gap-3">
                      {email.attachments.map(attachment => (
                        <div key={attachment.id} className="border rounded p-2 flex items-center gap-2">
                          <Icons.attachment size={16} />
                          <div>
                            <div className="text-sm">{attachment.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatStorageSize(attachment.size)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t flex gap-2">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium flex items-center gap-1"
            onClick={() => openCompose({ replyTo: emails[emails.length - 1] })}
          >
            <Icons.reply size={16} />
            Reply
          </button>
          
          <button 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium flex items-center gap-1"
            onClick={() => openCompose({ forwardFrom: emails[emails.length - 1] })}
          >
            <Icons.forward size={16} />
            Forward
          </button>
        </div>
      </motion.div>
    );
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen  flex items-center justify-center bg-gray-100">
        <motion.div 
          className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Gmail</h1>
            <p className="text-gray-600 mt-2">Sign in to access your inbox</p>
          </div>
          
          <button
            onClick={signIn}
            disabled={authLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-blue-700 disabled:bg-blue-300"
          >
            {authLoading ? (
              <Icons.refresh className="animate-spin" size={20} />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.818h5.556c-0.222,1.301-0.898,2.464-1.948,3.212v2.401h3.053c1.791-1.654,2.827-4.093,2.827-6.984c0-0.568-0.056-1.136-0.163-1.7h-9.325v-0.748h9.325c0.107-0.563,0.163-1.132,0.163-1.7c0-2.891-1.036-5.33-2.827-6.984h-3.053v2.401c1.05,0.749,1.727,1.911,1.948,3.212h-5.556v3.818l-8.544-4.773v1.009l8.544,4.773v1.009l-8.544-4.773v1.009l8.544,4.773z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 overflow-y-scroll">

    <div className="min-h-screen flex flex-col bg-gray-100 ">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-2 mr-2 rounded-full hover:bg-gray-100 md:hidden"
            onClick={toggleMobileMenu}
          >
            <Icons.menu size={20} />
          </button>
          
          <button
            className="p-2 mr-2 rounded-full hover:bg-gray-100 hidden md:flex"
            onClick={toggleSidebar}
          >
            <Icons.menu size={20} />
          </button>
          
          <div className="flex items-center">
            <h1 className="text-xl font-medium text-gray-800">Hey Manju!</h1>
          </div>
        </div>
        
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search mail"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-gray-300 focus:outline-none transition-colors"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <Icons.search size={18} />
            </button>
          </form>
        </div>
        
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 hidden md:flex"
            onClick={() => fetchEmails(currentFolder, selectedLabels)}
            title="Refresh"
          >
            <Icons.refresh size={20} />
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={signOut}
            title="Sign out"
          >
            <Icons.logout size={20} />
          </button>
          
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium ml-2">
            {userProfile?.name?.[0] || "U"}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          initial="closed"
          animate={showMobileMenu ? "open" : "closed"}
          variants={{
            open: { opacity: 1, display: "block" },
            closed: { opacity: 0, transitionEnd: { display: "none" } }
          }}
          transition={{ duration: 0.2 }}
          onClick={toggleMobileMenu}
        >
          <motion.div
            className="w-64 h-full bg-white overflow-y-auto"
            initial="closed"
            animate={showMobileMenu ? "open" : "closed"}
            variants={mobileMenuVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <button
                onClick={handleComposeClick}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center gap-2 font-medium shadow-md"
              >
                <Icons.compose size={20} />
                <span>Compose</span>
              </button>
            </div>
            
            <nav className="mt-2">
              <ul>
                {folders.map((folder) => (
                  <li key={folder.id}>
                    <button
                      onClick={() => handleFolderClick(folder.id as EmailStatus)}
                      className={`px-4 py-2 w-full flex items-center justify-between ${
                        folder.selected ? "bg-blue-100 text-blue-600 font-medium" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getFolderIcon(folder.id as EmailStatus)}
                        <span>{folder.name}</span>
                      </div>
                      
                      {folder.count > 0 && (
                        <span className="text-sm font-medium bg-gray-200 rounded-full px-2">
                          {folder.count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="px-4 pt-4 pb-2 mt-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">LABELS</h3>
            </div>
            
            <nav>
              <ul>
                {labels.map((label) => {
                  const { Icon, color } = getLabelData(label.id as EmailLabel);
                  
                  return (
                    <li key={label.id}>
                      <button
                        onClick={() => handleLabelToggle(label.id as EmailLabel)}
                        className={`px-4 py-2 w-full flex items-center justify-between ${
                          label.selected ? "bg-blue-100 text-blue-600 font-medium" : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} color={color} />
                          <span>{label.name}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            <div className="p-4 mt-4">
              <div className="text-sm text-gray-600 flex justify-between mb-1">
                <span>Storage</span>
                <span>
                  {formatStorageSize(stats.storageUsed)} of {formatStorageSize(stats.storageTotal)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Desktop Sidebar */}
        <motion.div
          className="hidden md:block bg-white border-r flex-shrink-0"
          initial="expanded"
          animate={isSidebarCollapsed ? "collapsed" : "expanded"}
          variants={sidebarVariants}
        >
           <ScrollArea className="h-[calc(100vh-58px)]">

          <div className="p-4">
            <button
              onClick={handleComposeClick}
              className={`py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center ${
                isSidebarCollapsed ? "justify-center" : "gap-2 font-medium"
              } shadow-md w-full`}
            >
              <Icons.compose size={20} />
              {!isSidebarCollapsed && <span>Compose</span>}
            </button>
          </div>
          
          <nav className="mt-2">
            <ul>
              {folders.map((folder) => (
                <li key={folder.id}>
                  <button
                    onClick={() => handleFolderClick(folder.id as EmailStatus)}
                    className={`px-3 py-2 w-full text-md flex items-center justify-between ${
                      folder.selected ? "bg-blue-100 text-blue-600 font-medium" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getFolderIcon(folder.id as EmailStatus)}
                      {!isSidebarCollapsed && <span>{folder.name}</span>}
                    </div>
                    
                    {!isSidebarCollapsed && folder.count > 0 && (
                      <span className="text-sm font-medium bg-gray-200 rounded-full px-2">
                        {folder.count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {!isSidebarCollapsed && (
            <>
              <div className="px-4 pt-4 pb-2 mt-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">LABELS</h3>
              </div>
              
              <nav>
                <ul>
                  {labels.map((label) => {
                    const { Icon, color } = getLabelData(label.id as EmailLabel);
                    
                    return (
                      <li key={label.id}>
                        <button
                          onClick={() => handleLabelToggle(label.id as EmailLabel)}
                          className={`px-4 py-2 w-full flex items-center justify-between ${
                            label.selected ? "bg-blue-100 text-blue-600 font-medium" : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} color={color} />
                            <span>{label.name}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              
              <div className="p-4 mt-4">
                <div className="text-sm text-gray-600 flex justify-between mb-1">
                  <span>Storage</span>
                  <span>
                    {formatStorageSize(stats.storageUsed)} of {formatStorageSize(stats.storageTotal)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600"
                    style={{ width: `${storagePercentage}%` }}
                  />
                </div>
              </div>
            </>
          )}
           </ScrollArea>
          
        </motion.div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile search */}
          <div className="p-4 block md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search mail"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-gray-300 focus:outline-none transition-colors"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <Icons.search size={18} />
              </button>
            </form>
          </div>
          
          {/* Email content */}
          <div className="flex-1 overflow-hidden p-4">
            {selectedEmail ? (
              <EmailView />
            ) : selectedThread ? (
              <ThreadView />
            ) : (
              <motion.div
                className="h-full flex flex-col"
                initial="hidden"
                animate="visible"
                variants={fadeInVariants}
              >
                <div className="border-b pb-3 flex justify-between items-center">
                  <h2 className="text-xl font-medium">
                    {folders.find(f => f.id === currentFolder)?.name || "Inbox"}
                    {selectedLabels.length > 0 && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        {selectedLabels.map(l => labels.find(label => label.id === l)?.name).join(", ")}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        Search: "{searchQuery}"
                      </span>
                    )}
                  </h2>
                  
                  <button
                    onClick={() => fetchEmails(currentFolder, selectedLabels)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    title="Refresh"
                  >
                    <Icons.refresh size={18} />
                  </button>
                </div>
                
                {emailsLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Icons.refresh className="animate-spin" size={20} />
                      <span>Loading emails...</span>
                    </div>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                    <Icons.inbox size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No emails found</h3>
                    <p>
                      {searchQuery ? `No results for "${searchQuery}"` : "Your inbox is empty"}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                  <ScrollArea className="h-[calc(100vh-140px)]">
                    <ul className="divide-y w-full">
                      {emails.map((email) => (
                        <li
                          key={email.id}
                          className={`cursor-pointer ${!email.read ? "bg-blue-50" : "hover:bg-gray-50"}`}
                          onClick={() => handleEmailClick(email)}
                        >
                          <div className="flex items-center p-2 gap-2 w-full">
                            {/* Star button */}
                            <div className="flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStarred(email.id);
                                }}
                                className={`p-1 rounded-full ${email.starred ? "text-yellow-500" : "text-gray-400 hover:text-gray-600"}`}
                              >
                                <Icons.star size={18} />
                              </button>
                            </div>
                        
                            {/* Main content */}
                            <div className="min-w-0 flex-1 flex gap-2 items-center justify-between">
                              {/* Text content */}
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-baseline gap-2 w-full overflow-hidden">
                                  <span className={`font-medium truncate ${!email.read ? "font-bold" : ""}`}>
                                    {email.from.name}
                                  </span>
                                </div>
                                
                                <div className="flex items-baseline gap-2 w-full overflow-hidden">
                                  <span className={`truncate ${!email.read ? "font-bold" : ""}`}>
                                    {email.subject}
                                  </span>
                                  <span className="text-gray-500 text-sm truncate hidden sm:inline max-w-sm">
                                    {email.snippet}
                                  </span>
                                </div>
                              </div>
                        
                              {/* Icons and date */}
                              <div className="flex-shrink-0 flex items-center gap-2 ml-2">
                                {/* Labels and attachments */}
                                <div className="hidden md:flex items-center gap-1">
                                  {email.labels.map(label => {
                                    const { Icon, color } = getLabelData(label);
                                    return (
                                      <div
                                        key={label}
                                        className="shrink-0"
                                        title={labels.find(l => l.id === label)?.name}
                                      >
                                        <Icon size={16} color={color} />
                                      </div>
                                    );
                                  })}
                                  
                                  {email.attachments.length > 0 && (
                                    <div className="shrink-0" title="Has attachments">
                                      <Icons.attachment size={16} />
                                    </div>
                                  )}
                                </div>
                        
                                {/* Date */}
                                <div className="text-sm text-gray-500">
                                  {formatDate(email.date)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Compose email popup */}
      {composeState.isOpen && <ComposeEmail />}
    </div>
    </div>
  );
};

// export default function GmailInterfaceFunction(){
//   return <DashboardLayout>
//   <GmailInterface/>
//   </DashboardLayout>
// };
export default GmailInterface;