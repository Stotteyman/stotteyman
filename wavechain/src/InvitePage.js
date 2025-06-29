import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const InvitePage = () => {
  const [code, setCode] = useState("");

  useEffect(() => {
    const inviteCode = uuidv4();
    setCode(inviteCode);
    const docRef = doc(db, 'invites', inviteCode);
    setDoc(docRef, {
      from: 'userId_placeholder',
      used: false,
      createdAt: new Date()
    });
  }, []);

  return (
    <div>
      <h2>Let someone scan this to join:</h2>
      <QRCode value={`https://yourapp.com/verify/${code}`} />
    </div>
  );
};

export default InvitePage;
