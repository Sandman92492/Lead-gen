import React from 'react';
import Button from '../Button';

type PrimaryButtonProps = React.ComponentProps<typeof Button>;

const PrimaryButton: React.FC<PrimaryButtonProps> = (props) => {
  return <Button {...props} variant="primary" />;
};

export default PrimaryButton;

