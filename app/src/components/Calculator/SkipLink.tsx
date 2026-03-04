import React from 'react';

interface SkipLinkProps {
  targetId?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ targetId = 'main-content' }) => {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
    >
      Skip to main content
    </a>
  );
};
