import React, { useRef, ChangeEvent, forwardRef, useImperativeHandle } from 'react';

type FileInputProps = {
  onFileSelect: (fileData: string) => void;
  accept?: string;
};

export interface FileInputHandle {
  openFileDialog: () => void;
}

export const FileInput = forwardRef<FileInputHandle, FileInputProps>(
  ({ onFileSelect, accept = 'image/*' }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      openFileDialog: () => {
        inputRef.current?.click();
      }
    }));

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const base64 = loadEvent.target?.result as string;
          onFileSelect(base64);
        };
        reader.readAsDataURL(file);
      }
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    return (
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
      />
    );
  }
);
