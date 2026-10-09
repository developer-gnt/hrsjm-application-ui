export const types = {
  allFiles: '*/*',
  images: 'image/*',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
};

export const errorCodes = {
  IN_PROGRESS: 'ASYNC_OP_IN_PROGRESS',
  UNABLE_TO_OPEN_FILE_TYPE: 'UNABLE_TO_OPEN_FILE_TYPE',
  OPERATION_CANCELED: 'OPERATION_CANCELED',
};

export const isErrorWithCode = (error) => false;

export const pick = async (options) => {
  return [];
};

export default {
  types,
  errorCodes,
  isErrorWithCode,
  pick,
};
