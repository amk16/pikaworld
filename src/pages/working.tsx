import React, { useState, useEffect } from 'react'
import NavigationDock from '../components/NavigationDock'
import FreeTextWriter from '../components/FreeTextWriter'
import FreeDrawing from '../components/FreeDrawing'
import WorkspaceManager from '../components/WorkspaceManager'
import AutosaveStatus from '../components/SyncStatus'
import VoiceAssistant from '../components/VoiceAssistant'
import { enhancedWorkspaceService } from '../services/enhancedWorkspaceService'
import { Workspace } from '../services/workspaceService'

const Working = () => {
  const [mode, setMode] = useState<'text' | 'draw'>('text');
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  // Initialize workspace and cloud sync on component mount
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        // Initialize enhanced workspace service (includes Firebase setup)
        await enhancedWorkspaceService.initialize();
        
        // Get or create default workspace
        const workspace = await enhancedWorkspaceService.getOrCreateDefaultWorkspace();
        setCurrentWorkspace(workspace);
      } catch (error) {
        console.error('Error initializing workspace:', error);
        // Fallback to local-only mode
        try {
          const { workspaceService } = await import('../services/workspaceService');
          const workspace = workspaceService.getOrCreateDefaultWorkspace();
          setCurrentWorkspace(workspace);
        } catch (fallbackError) {
          console.error('Error in fallback initialization:', fallbackError);
        }
      }
    };

    initializeWorkspace();
  }, []);

  // Handle workspace changes
  const handleWorkspaceChange = async (workspace: Workspace) => {
    try {
      const updatedWorkspace = await enhancedWorkspaceService.switchToWorkspace(workspace.id);
      setCurrentWorkspace(updatedWorkspace);
    } catch (error) {
      console.error('Error switching workspace:', error);
      setCurrentWorkspace(workspace);
    }
  };

  // Handle text content changes
  const handleTextChange = async (textContent: string) => {
    if (currentWorkspace) {
      try {
        await enhancedWorkspaceService.updateWorkspaceText(currentWorkspace.id, textContent);
      } catch (error) {
        console.error('Error updating text content:', error);
      }
    }
  };

  // Handle drawing data changes
  const handleDrawingChange = async (drawingData: any) => {
    if (currentWorkspace) {
      try {
        await enhancedWorkspaceService.updateWorkspaceDrawing(currentWorkspace.id, drawingData);
      } catch (error) {
        console.error('Error updating drawing data:', error);
      }
    }
  };

  // Test function to save basic text data under current user ID
  const testSaveData = async () => {
    try {
      console.log('🧪 TEST SAVE - Starting test save...');
      
      // Initialize the enhanced workspace service if not already done
      await enhancedWorkspaceService.initialize();
      
      // Get or create a test workspace
      const testWorkspace = await enhancedWorkspaceService.getOrCreateDefaultWorkspace();
      console.log('🧪 TEST SAVE - Test workspace ID:', testWorkspace.id);
      
      // Hard-coded test text data
      const testTextData = "This is a hard-coded test string saved under user ID: ";
      console.log('🧪 TEST SAVE - Test text data:', testTextData);
      
      // Save the test data
      await enhancedWorkspaceService.updateWorkspaceText(testWorkspace.id, testTextData);
      
      console.log('🧪 TEST SAVE - Test data saved successfully!');
      alert('Test data saved successfully! Check console for details.');
      
      // Update the current workspace state
      setCurrentWorkspace(testWorkspace);
      
    } catch (error) {
      console.error('🧪 TEST SAVE - Error saving test data:', error);
      alert('Error saving test data: ' + error.message);
    }
  };

  return (
    <div className='bg-[#ffeabb] min-h-screen relative'>
        {/* Desk Pikachu image in bottom left */}
        <img 
          src="/deskPika.png" 
          alt="Desk Pikachu" 
          className="absolute -bottom-13 -left-10 w-100 h-150 opacity-30 object-contain"
        />
        
        {/* WORKING text positioned at bottom left under the pikachu image */}
        <h1 className="absolute bottom-4 left-4 font-bold text-6xl z-10 opacity-30">
          <span className="text-black">
            WOR<span className="text-gray-400">K</span><span className="text-gray-400">I</span><span className="text-gray-400">N</span><span className="text-gray-400">G</span>
          </span>
        </h1>
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
          {/* Workspace Manager */}
          <WorkspaceManager 
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={handleWorkspaceChange}
          />
          
          {/* Autosave Status */}
          <AutosaveStatus />
          
          {/* Mode Toggle */}
          <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-full p-1 border border-gray-200 border-opacity-30">
            <button
              onClick={() => setMode('text')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                mode === 'text'
                  ? 'bg-white bg-opacity-20 text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              ✏️ Text
            </button>
            <button
              onClick={() => setMode('draw')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                mode === 'draw'
                  ? 'bg-white bg-opacity-20 text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              🎨 Draw
            </button>
          </div>

          {/* Test Save Button */}
          <button
            onClick={testSaveData}
            className="backdrop-blur-sm bg-red-500 bg-opacity-20 rounded-full px-4 py-2 text-sm font-medium text-red-700 border border-red-300 border-opacity-30 hover:bg-red-500 hover:bg-opacity-30 transition-all duration-200"
          >
            🧪 Test Save
          </button>
        </div>

        {/* Voice Assistant - Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <VoiceAssistant 
            onTranscript={(text) => console.log('Voice transcript:', text)}
            onResponse={(response) => console.log('AI response:', response)}
          />
        </div>

        {/* Free Text Writer - allows writing anywhere on the page */}
        {mode === 'text' && (
          <FreeTextWriter 
            workspaceId={currentWorkspace?.id}
            initialTextContent={currentWorkspace?.textContent}
            onTextChange={handleTextChange}
          />
        )}
        
        {/* Free Drawing - allows drawing anywhere on the page */}
        <FreeDrawing 
          isActive={mode === 'draw'}
          workspaceId={currentWorkspace?.id}
          initialDrawingData={currentWorkspace?.drawingData}
          onDrawingChange={handleDrawingChange}
        />
        
        {/* Navigation Dock */}
        <NavigationDock />
    </div>
  )
}

export default Working
