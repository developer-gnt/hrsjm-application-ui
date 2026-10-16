import React from 'react';
import { useRoute } from '@react-navigation/native';
import { ApplicationStatusScreen } from './ApplicationStatusScreen';

export function ApplicationApprovedScreen() {
  const route = useRoute<any>();
  const applicationId = route.params?.applicationId;

  return (
    <ApplicationStatusScreen
      initialStatus="approved"
      applicationId={applicationId}
    />
  );
}

export default ApplicationApprovedScreen;
