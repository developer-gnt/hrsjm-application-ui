import React from 'react';
import { useRoute } from '@react-navigation/native';
import {
  ApplicationStatusScreen,
  type ApplicationInnerStatus,
} from './ApplicationStatusScreen';

export function ApplicationDetailsScreen() {
  const route = useRoute<any>();
  const statusParam = (route.params?.status as ApplicationInnerStatus) || undefined;
  const applicationId = route.params?.applicationId;

  return (
    <ApplicationStatusScreen
      initialStatus={statusParam || 'under_review'}
      applicationId={applicationId}
    />
  );
}

export default ApplicationDetailsScreen;
