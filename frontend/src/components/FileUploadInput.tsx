import * as React from 'react';
import { styled } from '@mui/material/styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Button, ButtonProps } from '@mui/material';
import { useState } from 'react';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface FileUploadInputProps extends ButtonProps {
  multiple?: boolean;
  accept?: string;
  inputName?: string;
  required?: boolean;
  onFileChange?: (file: File | null) => void;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  accept,
  children,
  multiple,
  inputName,
  onFileChange,
  required,
  ...otherProps
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setSelectedFileName(file.name);
    } else {
      setSelectedFileName(null);
    }
    onFileChange && onFileChange(file);
  };

  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<AttachFileIcon />}
      {...otherProps}
    >
      {selectedFileName && <span>{selectedFileName}</span>}
      {!selectedFileName && <span>{children || 'Attach'}</span>}
      <VisuallyHiddenInput
        type="file"
        onChange={handleFileChange}
        name={inputName}
        multiple={multiple}
        accept={accept}
        required={required}
      />
    </Button>
  );
};
