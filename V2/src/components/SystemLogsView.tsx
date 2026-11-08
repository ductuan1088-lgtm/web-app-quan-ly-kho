import React from 'react';
import { StockHistoryView } from './StockHistoryView';

// Backward compatible export: SystemLogsView now provides the full StockHistoryView
export const SystemLogsView: React.FC = () => {
  return <StockHistoryView />;
};

export default SystemLogsView;
