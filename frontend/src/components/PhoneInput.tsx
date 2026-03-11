import { FormControl, Input, InputLabel, InputProps } from '@mui/material';
import React from 'react';
import { IMaskInput } from 'react-imask';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...otherProps } = props;
    return (
      <IMaskInput
        {...otherProps}
        mask="(#00) 000-0000"
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
        overwrite
      />
    );
  }
);

interface PhoneInputProps extends InputProps {
  label?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ label, ...otherProps }) => {
  return (
    <FormControl variant="standard">
      <InputLabel htmlFor="formatted-text-mask-input">{label}</InputLabel>
      <Input {...otherProps} inputComponent={TextMaskCustom as any} />
    </FormControl>
  );
};
