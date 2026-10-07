export type DocumentTypeOption =
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving'
  | 'voter'
  | 'other'
  | (string & {});

export interface UploadedDocItem {
  id: DocumentTypeOption;
  title: string;
  name: string;
  sizeBytes: number;
  type: string;
  formattedSize: string;
  uri?: string;
  uploadDate?: string;
  status: 'ready' | 'uploaded' | 'verified';
}

export interface RegistrationState {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  dob: string;
  accountType: string;
  accountTypeLabel: string;
  selectedDocId: DocumentTypeOption;
  documents: UploadedDocItem[];
  // Legacy single-doc backward compatibility fields:
  selectedDocTitle?: string;
  uploadedFileName?: string;
  uploadedFileSize?: string;
  uploadedFileUri?: string;
  hasUploadedDocument?: boolean;
}

const DEFAULT_REGISTRATION_STATE: RegistrationState = {
  fullName: '',
  email: '',
  phone: '',
  countryCode: '+91',
  dob: '',
  accountType: 'general',
  accountTypeLabel: 'General User',
  selectedDocId: 'aadhaar',
  documents: [],
  selectedDocTitle: 'Aadhaar Card',
  uploadedFileName: '',
  uploadedFileSize: '',
  uploadedFileUri: '',
  hasUploadedDocument: false,
};

let currentRegistrationState: RegistrationState = { ...DEFAULT_REGISTRATION_STATE };
const listeners = new Set<() => void>();

export const getRegistrationState = (): RegistrationState => currentRegistrationState;

export const updateRegistrationState = (partial: Partial<RegistrationState>): void => {
  const updatedDocs = partial.documents !== undefined ? partial.documents : currentRegistrationState.documents;
  const primaryDoc = updatedDocs && updatedDocs.length > 0 ? updatedDocs[0] : null;

  currentRegistrationState = {
    ...currentRegistrationState,
    ...partial,
    documents: updatedDocs,
    selectedDocTitle: primaryDoc ? primaryDoc.title : currentRegistrationState.selectedDocTitle,
    uploadedFileName: primaryDoc ? primaryDoc.name : (partial.uploadedFileName ?? currentRegistrationState.uploadedFileName),
    uploadedFileSize: primaryDoc ? primaryDoc.formattedSize : (partial.uploadedFileSize ?? currentRegistrationState.uploadedFileSize),
    uploadedFileUri: primaryDoc ? primaryDoc.uri : (partial.uploadedFileUri ?? currentRegistrationState.uploadedFileUri),
    hasUploadedDocument: updatedDocs && updatedDocs.length > 0,
  };
  listeners.forEach(l => l());
};

export const addOrUpdateDocument = (doc: UploadedDocItem): void => {
  const existingIndex = currentRegistrationState.documents.findIndex(d => d.id === doc.id);
  let newDocs: UploadedDocItem[];
  if (existingIndex >= 0) {
    newDocs = [...currentRegistrationState.documents];
    newDocs[existingIndex] = doc;
  } else {
    newDocs = [...currentRegistrationState.documents, doc];
  }
  updateRegistrationState({
    documents: newDocs,
    selectedDocId: doc.id,
    hasUploadedDocument: true,
  });
};

export const removeDocument = (docId: DocumentTypeOption): void => {
  const newDocs = currentRegistrationState.documents.filter(d => d.id !== docId);
  updateRegistrationState({
    documents: newDocs,
    hasUploadedDocument: newDocs.length > 0,
  });
};

export const subscribeRegistrationState = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const resetRegistrationState = (): void => {
  currentRegistrationState = { ...DEFAULT_REGISTRATION_STATE };
  listeners.forEach(l => l());
};
