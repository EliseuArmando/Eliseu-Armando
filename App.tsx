import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Strategist } from './features/Strategist';
import { Editor } from './features/Editor';
import { PropagandaVideo } from './features/PropagandaVideo';
import { AssetForge } from './features/AssetForge';
import { LiveCouncil } from './features/LiveCouncil';
import { AppTab } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.STRATEGIST);

  const renderContent = () => {
    switch (currentTab) {
      case AppTab.STRATEGIST:
        return <Strategist />;
      case AppTab.EDITOR:
        return <Editor />;
      case AppTab.PROPAGANDA:
        return <PropagandaVideo />;
      case AppTab.FORGE:
        return <AssetForge />;
      case AppTab.COUNCIL:
        return <LiveCouncil />;
      default:
        return <Strategist />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
}