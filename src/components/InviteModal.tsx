"use client";

import { useState, useEffect } from "react";
import { Button, IconButton } from "@usefragments/ui";
import { X, Share2, Copy, Check, MessageSquare, Send, Users, Sparkles } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentDisplayName: string;
}

export function InviteModal({
  isOpen,
  onClose,
  currentUsername,
  currentDisplayName,
}: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const cleanUser = currentUsername.replace(/^@/, "");
      setInviteUrl(`${origin}/?invite=${encodeURIComponent(cleanUser)}`);
    }
  }, [currentUsername]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  const shareText = `Join my movie circle on CineCircle! We share real reviews and pick what to watch together: ${inviteUrl}`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleSmsShare = () => {
    const url = `sms:?&body=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my CineCircle",
          text: `Join ${currentDisplayName}'s private circle on CineCircle!`,
          url: inviteUrl,
        });
      } catch (err) {
        console.log("Share dismissed");
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] flex items-center justify-center text-[var(--brand-accent-text)] font-black shadow">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Invite to CineCircle</h3>
              <p className="text-xs text-[var(--text-secondary)]">Grow your private friend circle</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Informative explanation */}
        <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--star-accent)] shrink-0" />
            <span>Frictionless 1-Click Circle Join</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            When your friend opens this link, they will automatically be connected to your circle as soon as they sign up. No codes or manual search needed!
          </p>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)]">Your Personal Invite Link</label>
          <div className="flex items-center gap-2 bg-[var(--canvas)] border border-[var(--surface-border)] p-1.5 rounded-xl">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-transparent text-xs text-[var(--text-primary)] font-mono px-2.5 focus:outline-none truncate"
            />
            <Button
              type="button"
              onClick={handleCopy}
              className="h-8 px-3.5 rounded-lg bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 1-Click Sharing Actions */}
        <div className="space-y-2.5 pt-2">
          <p className="text-xs font-bold text-[var(--text-secondary)]">Quick Share via:</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="h-11 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4" /> WhatsApp
            </button>

            <button
              type="button"
              onClick={handleSmsShare}
              className="h-11 px-4 rounded-xl bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> iMessage / SMS
            </button>
          </div>

          <Button
            type="button"
            onClick={handleNativeShare}
            className="w-full h-11 rounded-xl bg-[var(--surface-hover)] hover:opacity-90 border border-[var(--surface-border)] text-[var(--text-primary)] font-extrabold text-xs flex items-center justify-center gap-2 transition mt-2"
          >
            <Share2 className="w-4 h-4" /> More Share Options...
          </Button>
        </div>

      </div>
    </div>
  );
}
