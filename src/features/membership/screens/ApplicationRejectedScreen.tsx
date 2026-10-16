import React from 'react';
import { useRoute } from '@react-navigation/native';
import { ApplicationStatusScreen } from './ApplicationStatusScreen';

export function ApplicationRejectedScreen() {
  const route = useRoute<any>();
  const applicationId = route.params?.applicationId;

  return (
    <ApplicationStatusScreen
      initialStatus="rejected"
      applicationId={applicationId}
    />
  );
}

export default ApplicationRejectedScreen;
