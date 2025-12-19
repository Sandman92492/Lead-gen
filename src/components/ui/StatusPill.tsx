import React from 'react';
import type { LeadStatus } from '../../types/leadWallet';

const STATUS_CLASS: Record<LeadStatus, string> = {
  NEW: 'lw-status--new',
  CONTACTED: 'lw-status--contacted',
  BOOKED: 'lw-status--booked',
  QUOTED: 'lw-status--quoted',
  WON: 'lw-status--won',
  LOST: 'lw-status--lost',
};

type StatusPillProps = {
  status: LeadStatus;
  className?: string;
};

const StatusPill: React.FC<StatusPillProps> = ({ status, className }) => {
  return <span className={`lw-status-pill ${STATUS_CLASS[status]} ${className || ''}`}>{status}</span>;
};

export default StatusPill;

