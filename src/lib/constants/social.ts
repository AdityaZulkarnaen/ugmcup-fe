import type { ComponentType } from "react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/ui/icons";

export interface SocialLink {
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}

/**
 * Single source for the social accounts, so a real URL only has to be filled in
 * once. Listed in the order the footer shows its icon buttons; the mobile menu
 * reverses it to match its own design.
 */
export const socialLinks: SocialLink[] = [
  { label: "YouTube", href: "#", Icon: YoutubeIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@ugmcup2026?_r=1&_t=ZS-98KkBVLEX7I", Icon: TiktokIcon },
  { label: "Instagram", href: "https://www.instagram.com/ugm_cup?igsh=MXUzZWphY3F2dWRvNQ==", Icon: InstagramIcon },
];
