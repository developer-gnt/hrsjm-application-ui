import React from 'react';
import { useRoute } from '@react-navigation/native';
import { ApplicationStatusScreen } from './ApplicationStatusScreen';

export function ApplicationAppliedScreen() {
  const route = useRoute<any>();
  const applicationId = route.params?.applicationId;

  return (
    <ApplicationStatusScreen
      initialStatus="applied"
      applicationId={applicationId}
    />
  );
}

export default ApplicationAppliedScreen;
