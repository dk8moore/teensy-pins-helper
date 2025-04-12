import { useState, useEffect } from "react";
import { TeensyDataError, safeJsonFetch } from "@/lib/utils";
import {
  TeensyDataResult,
  DigitalInterface,
  CapabilityDetail,
  Pin,
  PeripheralInterface,
} from "@/types";

export function useTeensyData(modelId: string = "teensy_41"): TeensyDataResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [boardUIData, setBoardUIData] =
    useState<TeensyDataResult["boardUIData"]>(null);
  const [modelData, setModelData] =
    useState<TeensyDataResult["modelData"]>(null);

  const boardName = modelId.split("_")[0].toLowerCase();
  const boardVersion = modelId.split("_")[1];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const basePath = window.location.pathname.includes("teensy-pins-helper")
          ? "/teensy-pins-helper"
          : "";

        const [pinShapes, capabilityDetails] = await Promise.all([
          safeJsonFetch(`${basePath}/config/${boardName}/pin-shapes.json`),
          safeJsonFetch(
            `${basePath}/config/${boardName}/capability-details.json`
          ),
        ]).catch((error) => {
          if (!(error instanceof TeensyDataError)) {
            throw new TeensyDataError(
              "Failed to load configuration files",
              `Multiple files failed to load: ${error.message}`
            );
          }
          throw error;
        });

        const boardData = await safeJsonFetch(
          `${basePath}/config/${boardName}/models/${boardVersion}.json`
        );
        const capabilityDetailsWithMaxPinPort = countInterfacesPinPorts(
          capabilityDetails,
          boardData.pins
        );

        const imageResolution = "-4x";

        setBoardUIData({
          pinShapes,
          capabilityDetails: capabilityDetailsWithMaxPinPort,
          componentsImgPath: `${basePath}/img/${boardName}/${boardVersion}${imageResolution}.png`,
        });
        setModelData(boardData);
        setError(null);
      } catch (err: any) {
        console.error(
          "Technical error details:",
          err.technicalDetails || err.message
        );
        setError(
          err instanceof TeensyDataError
            ? err.userMessage
            : "An unexpected error occurred"
        );
        setBoardUIData(null);
        setModelData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [modelId]);

  return {
    loading,
    error,
    boardUIData,
    modelData,
  };
}

function countInterfacesPinPorts(
  capabilities: Record<string, CapabilityDetail>,
  pins: Pin[]
): Record<string, CapabilityDetail> {
  for (const pin of pins) {
    if (pin.interfaces) {
      for (const [iface, content] of Object.entries(pin.interfaces)) {
        if (!capabilities[iface]) {
          throw new TeensyDataError(
            "Failed to load configuration files",
            `Pin ${pin.id} has an interface ${iface} that is not defined in capability-details.json`
          );
        }
        switch (capabilities[iface].allocation) {
          case "pin":
            if (iface === "digital") {
              if (!capabilities[iface].portCount) {
                capabilities[iface].portCount = {};
              }
              const digitalInterface = content as DigitalInterface;
              if (
                digitalInterface?.gpio !== undefined &&
                digitalInterface?.gpio.port !== undefined
              ) {
                capabilities[iface].portCount[digitalInterface.gpio.port] =
                  capabilities[iface].portCount[digitalInterface.gpio.port]
                    ? capabilities[iface].portCount[
                        digitalInterface.gpio.port
                      ] + 1
                    : 1;
              }
            }
            capabilities[iface].max = capabilities[iface].max
              ? capabilities[iface].max + 1
              : 1;
            break;
          case "port":
            if (!capabilities[iface].portCount) {
              capabilities[iface].portCount = {};
            }

            const peripheralInterface = content as PeripheralInterface;
            if (peripheralInterface?.port !== undefined) {
              capabilities[iface].portCount[peripheralInterface.port] =
                capabilities[iface].portCount[peripheralInterface.port]
                  ? capabilities[iface].portCount[peripheralInterface.port] + 1
                  : 1;
            }
            break;
          case "hybrid":
          default:
            // Not handled yet
            break;
        }
      }
    } else if (pin.designation) {
      if (!capabilities[pin.designation]) {
        throw new TeensyDataError(
          "Failed to load configuration files",
          `Pin ${pin.name} has a designation ${pin.designation} that is not defined in capability-details.json`
        );
      }
      // Pin designations are always single pin allocations
      if (capabilities[pin.designation]) {
        capabilities[pin.designation].max = capabilities[pin.designation].max
          ? capabilities[pin.designation].max! + 1
          : 1;
      }
    }
  }

  // Sum up the port counts
  for (const [capability, content] of Object.entries(capabilities)) {
    if (content.portCount) {
      if (capability === "digital") {
        capabilities[capability].gpioPinCount = content.portCount;
        capabilities[capability].max = Object.values(content.portCount).reduce(
          (sum, value) => sum + value,
          0
        );
      } else {
        capabilities[capability].max = Object.keys(content.portCount).length;
      }
      delete capabilities[capability].portCount;
    }
  }
  return capabilities;
}
