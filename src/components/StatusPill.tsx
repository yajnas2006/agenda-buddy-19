// Status pill component for AI Meeting Buddy
import React from 'react';

interface StatusPillProps {
  status: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, children, className = '' }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'success':
        return 'status-pill-success';
      case 'warning':
        return 'status-pill-warning';
      case 'danger':
        return 'status-pill-danger';
      default:
        return 'status-pill bg-primary/10 text-primary border border-primary/20';
    }
  };

  return (
    <span className={`${getStatusClass()} ${className}`}>
      {children}
    </span>
  );
};

export default StatusPill;