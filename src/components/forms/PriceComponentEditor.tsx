'use client';

import { memo } from 'react';
import { BarEditor } from './price-editors/BarEditor';
import { BoxEditor } from './price-editors/BoxEditor';
import { SelectorsEditor } from './price-editors/SelectorsEditor';
import { AdditionalEditor } from './price-editors/AdditionalEditor';
import { CustomEditor } from './price-editors/CustomEditor';
import { BoxTitleEditor } from './price-editors/BoxTitleEditor';
import { LabelTitleEditor } from './price-editors/LabelTitleEditor';
import { GroupEditor } from './price-editors/GroupEditor';
import type { PriceComponentType } from '@/types/priceComponents';

interface PriceComponentEditorProps {
  type: PriceComponentType;
  config: any;
  configEs?: any;
  onChange: (config: any) => void;
  onChangeEs?: (configEs: any) => void;
}

export const PriceComponentEditor = memo(({ type, config, configEs, onChange, onChangeEs }: PriceComponentEditorProps) => {
  switch (type) {
    case 'bar':
      return <BarEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'box':
      return <BoxEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'selectors':
      return <SelectorsEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'additional':
      return <AdditionalEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'custom':
      return <CustomEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'boxtitle':
      return <BoxTitleEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'labeltitle':
      return <LabelTitleEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'group':
      return <GroupEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    default:
      return null;
  }
});

PriceComponentEditor.displayName = 'PriceComponentEditor';
