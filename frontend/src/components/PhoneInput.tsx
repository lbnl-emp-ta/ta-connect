import {
  FilledInput,
  FormControl,
  Input,
  InputLabel,
  InputProps,
  OutlinedInput,
  TextFieldProps,
} from '@mui/material';
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
  label?: TextFieldProps['label'];
  variant?: TextFieldProps['variant'];
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  variant = 'standard',
  id,
  required,
  ...otherProps
}) => {
  return (
    <FormControl variant={variant}>
      <InputLabel htmlFor={id} required={required}>
        {label}
      </InputLabel>
      {variant === 'outlined' && (
        <OutlinedInput
          {...otherProps}
          id={id}
          required={required}
          label={label}
          inputComponent={TextMaskCustom as any}
        />
      )}
      {variant === 'standard' && (
        <Input {...otherProps} id={id} required={required} inputComponent={TextMaskCustom as any} />
      )}
      {variant === 'filled' && (
        <FilledInput
          {...otherProps}
          id={id}
          required={required}
          inputComponent={TextMaskCustom as any}
        />
      )}
    </FormControl>
  );
};
