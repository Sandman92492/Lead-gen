import React from 'react';
import Button from '../Button';

type SecondaryButtonProps = React.ComponentProps<typeof Button>;

const SecondaryButton: React.FC<SecondaryButtonProps> = (props) => {
  return <Button {...props} variant="secondary" />;
};

export default SecondaryButton;

