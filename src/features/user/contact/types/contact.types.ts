import type { IconName } from '../../components/icons';
import type { HomeTab, HomeTabId } from '../../home/types/home.types';

export interface ContactAction {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface ContactDetailCard {
  id: string;
  icon: IconName;
  title: string;
  lines: string[];
  /** Optional trailing link label, e.g. 'View on Maps'. */
  linkLabel?: string;
}

/**
 * Contact tabs reuse the shared Home tab model (same bottom-nav renderer);
 * the union already includes 'contact'.
 */
export type ContactTabId = HomeTabId;
export type ContactTab = HomeTab;

export type ContactFieldKey = 'name' | 'email' | 'subject' | 'message';

export type ContactFormErrors = Partial<Record<ContactFieldKey, string>>;
