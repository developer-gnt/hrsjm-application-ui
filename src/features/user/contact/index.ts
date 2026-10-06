/**
 * Contact feature module — public surface.
 *
 * Reference-locked Contact Us implementation. Form submission is UI-only
 * until the backend integration phase.
 */
export { ContactUsScreen } from './screens/ContactUsScreen';
export type { ContactUsScreenProps } from './screens/ContactUsScreen';
export { ContactHeader } from './components/ContactHeader';
export { ContactHero } from './components/ContactHero';
export { ContactActionCard, ContactActionsRow } from './components/ContactActionCard';
export { ContactInput } from './components/ContactInput';
export { ContactForm } from './components/ContactForm';
export { ContactDetailsSection, ContactDetailsCard } from './components/ContactDetailsSection';
export { ContactMapSection } from './components/ContactMapSection';
export { ContactFinalCta } from './components/ContactFinalCta';
export type {
  ContactAction,
  ContactDetailCard,
  ContactTab,
  ContactTabId,
  ContactFieldKey,
  ContactFormErrors,
} from './types/contact.types';
