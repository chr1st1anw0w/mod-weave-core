import React, { useState } from 'react';
import { X, Figma, Check } from './Icons';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

interface FigmaOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: FigmaOptimizeOptions) => void;
}

export interface FigmaOptimizeOptions {
  autoLayout: boolean;
  variables: {
    padding: boolean;
    borderRadius: boolean;
    typography: boolean;
    colors: boolean;
  };
}

export const FigmaOptimizeDialog: React.FC<FigmaOptimizeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [autoLayout, setAutoLayout] = useState(true);
  const [variables, setVariables] = useState({
    padding: true,
    borderRadius: true,
    typography: true,
    colors: true
  });

  const handleConfirm = () => {
    onConfirm({
      autoLayout,
      variables
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Figma className="w-5 h-5 text-purple-500" />
            Optimize for Figma
          </DialogTitle>
          <DialogDescription>
            Configure how the code should be generated for best Figma import results.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2 border p-4 rounded-lg bg-gray-50">
            <Checkbox 
              id="auto-layout" 
              checked={autoLayout} 
              onCheckedChange={(c) => setAutoLayout(c === true)} 
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="auto-layout" className="font-semibold">Auto Layout Structure</Label>
              <p className="text-sm text-muted-foreground">
                Enforce strict Flexbox/Grid to ensure Auto Layout works.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Figma Variables (Tokens)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="var-colors" 
                  checked={variables.colors}
                  onCheckedChange={(c) => setVariables(prev => ({ ...prev, colors: c === true }))}
                />
                <Label htmlFor="var-colors">Color Styles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="var-type" 
                  checked={variables.typography}
                  onCheckedChange={(c) => setVariables(prev => ({ ...prev, typography: c === true }))}
                />
                <Label htmlFor="var-type">Text Styles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="var-pad" 
                  checked={variables.padding}
                  onCheckedChange={(c) => setVariables(prev => ({ ...prev, padding: c === true }))}
                />
                <Label htmlFor="var-pad">Spacing / Padding</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="var-radius" 
                  checked={variables.borderRadius}
                  onCheckedChange={(c) => setVariables(prev => ({ ...prev, borderRadius: c === true }))}
                />
                <Label htmlFor="var-radius">Corner Radius</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Check className="w-4 h-4" />
            Generate Optimized Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
