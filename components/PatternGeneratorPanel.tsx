import React, { useState } from 'react';
import { Layer } from '../types';
import { GeneratorState } from '../services/patternGenerator';
import { Slider } from './ui/Slider';
import { Select } from './ui/Select';
import { Icons } from './Icons';

interface PatternGeneratorPanelProps {
  layer: Layer;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-white/10">
      <button
        className="w-full flex justify-between items-center p-2 hover:bg-white/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        <Icons.ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

export const PatternGeneratorPanel: React.FC<PatternGeneratorPanelProps> = ({ layer, onUpdateLayer }) => {
  const { patternState } = layer;

  if (!patternState) {
    return <div>This layer does not have a pattern state.</div>;
  }

  const handleGridChange = (key: keyof GeneratorState['grid'], value: number) => {
    onUpdateLayer(layer.id, {
      patternState: {
        ...patternState,
        grid: { ...patternState.grid, [key]: value },
      },
    });
  };

  const handleTransformChange = (key: keyof GeneratorState['transform'], value: number) => {
    onUpdateLayer(layer.id, {
      patternState: {
        ...patternState,
        transform: { ...patternState.transform, [key]: value },
      },
    });
  };

  const handleUnitChange = (key: keyof GeneratorState['unit'], value: any) => {
    onUpdateLayer(layer.id, {
      patternState: {
        ...patternState,
        unit: { ...patternState.unit, [key]: value },
      },
    });
  };

  return (
    <div className="bg-mw-panel text-white w-80 max-h-screen overflow-y-auto">
      <div className="p-4 border-b border-white/10">
         <h2 className="text-lg font-bold">Pattern Generator</h2>
      </div>

      <CollapsibleSection title="Grid">
        <Slider label="Columns" value={patternState.grid.cols} onChange={(v) => handleGridChange('cols', v)} min={1} max={100} />
        <Slider label="Rows" value={patternState.grid.rows} onChange={(v) => handleGridChange('rows', v)} min={1} max={100} />
        <Slider label="Spacing X" value={patternState.grid.spacingX} onChange={(v) => handleGridChange('spacingX', v)} min={0} max={200} />
        <Slider label="Spacing Y" value={patternState.grid.spacingY} onChange={(v) => handleGridChange('spacingY', v)} min={0} max={200} />
        <Slider label="Unit Width" value={patternState.grid.width} onChange={(v) => handleGridChange('width', v)} min={1} max={200} />
        <Slider label="Unit Height" value={patternState.grid.height} onChange={(v) => handleGridChange('height', v)} min={1} max={200} />
      </CollapsibleSection>

      <CollapsibleSection title="Unit">
        <Select
          label="Shape"
          value={patternState.unit.shape}
          onChange={(v) => handleUnitChange('shape', v)}
          options={[
            { value: 'rect', label: 'Rectangle' },
            { value: 'circle', label: 'Circle' },
            { value: 'triangle', label: 'Triangle' },
          ]}
        />
        <Slider label="Stroke Width" value={patternState.unit.strokeWidth} onChange={(v) => handleUnitChange('strokeWidth', v)} min={0} max={20} />
        <Slider label="Border Radius" value={typeof patternState.unit.borderRadius === 'number' ? patternState.unit.borderRadius : 0} onChange={(v) => handleUnitChange('borderRadius', v)} min={0} max={100} />
      </CollapsibleSection>

      <CollapsibleSection title="Transform">
        <Slider label="Rotation" value={patternState.transform.rotation} onChange={(v) => handleTransformChange('rotation', v)} min={-180} max={180} />
        <Slider label="Variance" value={patternState.transform.variance} onChange={(v) => handleTransformChange('variance', v)} min={0} max={100} />
        <Slider label="Scale X" value={patternState.transform.scaleX} onChange={(v) => handleTransformChange('scaleX', v)} min={0.1} max={5} step={0.1} />
        <Slider label="Scale Y" value={patternState.transform.scaleY} onChange={(v) => handleTransformChange('scaleY', v)} min={0.1} max={5} step={0.1} />
        <Slider label="Skew X" value={patternState.transform.skewX} onChange={(v) => handleTransformChange('skewX', v)} min={-45} max={45} />
        <Slider label="Skew Y" value={patternState.transform.skewY} onChange={(v) => handleTransformChange('skewY', v)} min={-45} max={45} />
      </CollapsibleSection>

      {/* TODO: Add other sections (Colors, etc.) */}

    </div>
  );
};
