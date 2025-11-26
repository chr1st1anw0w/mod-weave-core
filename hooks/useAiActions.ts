import { useCallback } from 'react';
import { Layer, LayerType, Modifier, GeminiResponse } from '../types';
import { MODIFIER_CATALOG_FLAT } from '../constants';
import { ToastType } from './useToast';

interface UseAiActionsProps {
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  handleUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  showToast: (message: string, type?: ToastType) => void;
}

export const useAiActions = ({
  setLayers,
  selectedLayerId,
  setSelectedLayerId,
  handleUpdateLayer,
  showToast,
}: UseAiActionsProps) => {

  const handleAiResponse = useCallback((response: GeminiResponse, text: string) => {
    if (!response.actionType || response.actionType === 'NONE') {
      return;
    }

    try {
      if (
        response.actionType === "MANIPULATE_NODES" &&
        response.actionPayload &&
        selectedLayerId
      ) {
        setLayers((prevLayers) => {
          return prevLayers.map((layer) => {
            if (layer.id !== selectedLayerId) return layer;

            let newModifiers = [...layer.modifiers];
            let newConnections = [...(layer.connections || [])];

            response.actionPayload?.forEach((action) => {
              switch (action.action) {
                case "update_modifier_params":
                  newModifiers = newModifiers.map((mod) =>
                    mod.id === action.modId
                      ? {
                          ...mod,
                          params: { ...mod.params, ...action.params },
                          lastUsed: Date.now(),
                        }
                      : mod
                  );
                  break;
                case "add_modifier":
                  const catalogItem = MODIFIER_CATALOG_FLAT.find(
                    (c) => c.type === action.type
                  );
                  const newMod: Modifier = {
                    id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    type: action.type,
                    name: catalogItem?.label || action.type,
                    active: true,
                    params: {},
                    lastUsed: Date.now(),
                  };
                  newModifiers.push(newMod);
                  break;
                case "create_connection":
                  const newConn = { id: `conn-${Date.now()}`, ...action };
                  // Prevent duplicate connections (same from-to pair)
                  const exists = newConnections.some(
                    (c) =>
                      c.fromModId === newConn.fromModId &&
                      c.fromPort === newConn.fromPort &&
                      c.toModId === newConn.toModId &&
                      c.toPort === newConn.toPort
                  );
                  if (!exists) {
                    newConnections.push(newConn);
                  } else {
                    console.log("Connection already exists, skipping:", newConn);
                  }
                  break;
              }
            });

            return {
              ...layer,
              modifiers: newModifiers,
              connections: newConnections,
            };
          });
        });
        showToast("AI applied changes to nodes", "success");
      } else if (
        response.actionType === "CREATE_LAYER" &&
        response.generatedImage
      ) {
        const newLayer: Layer = {
          id: `gen-${Date.now()}`,
          name: `AI Gen: ${text.slice(0, 15)}...`,
          type: LayerType.IMAGE,
          x: 200,
          y: 200,
          width: 512,
          height: 512,
          rotation: 0,
          opacity: 1,
          content: `data:image/png;base64,${response.generatedImage}`,
          modifiers: [],
          connections: [],
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        showToast("AI generated new layer", "success");
      } else if (
        response.actionType === "UPDATE_LAYER" &&
        response.generatedImage &&
        selectedLayerId
      ) {
        handleUpdateLayer(selectedLayerId, {
          content: `data:image/png;base64,${response.generatedImage}`,
        });
        showToast("AI updated layer content", "success");
      }
    } catch (error) {
      console.error("Error executing AI action:", error);
      showToast("Failed to execute AI action", "error");
    }
  }, [setLayers, selectedLayerId, setSelectedLayerId, handleUpdateLayer, showToast]);

  return { handleAiResponse };
};
