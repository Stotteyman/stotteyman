import React from 'react';
import { useParams } from 'react-router-dom';

const VerifyInvite = () => {
  const { code } = useParams();

  const handleAccept = () => {
    alert(`Invite code ${code} accepted. Proceeding with registration...`);
  };

  return (
    <div>
      <h2>Verifying invite code...</h2>
      <button type="button" onClick={handleAccept}>Accept Invite</button>
    </div>
  );
};

export default VerifyInvite;
