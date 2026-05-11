import { useMemo, useState } from "react";
import { toBlob } from "html-to-image";
import { buildCardFilename, canSharePersonaCard } from "../lib/card/exportPersonaCard";

interface DownloadButtonProps {
  cardNode: HTMLDivElement | null;
  personaName: string;
  walletAddress: string;
}

type ExportState = "idle" | "working" | "done" | "error";

async function renderCardFile(
  cardNode: HTMLDivElement,
  personaName: string,
  walletAddress: string,
) {
  const blob = await toBlob(cardNode, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#07131d",
  });

  if (!blob) {
    throw new Error("Card export returned an empty image.");
  }

  return new File([blob], buildCardFilename(personaName, walletAddress), {
    type: "image/png",
  });
}

function downloadFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

export default function DownloadButton({
  cardNode,
  personaName,
  walletAddress,
}: DownloadButtonProps) {
  const [state, setState] = useState<ExportState>("idle");
  const [message, setMessage] = useState("");

  const fallbackMessage = useMemo(
    () => "If export fails on this device, the on-screen card layout is ready for screenshot sharing.",
    [],
  );

  const handleDownload = async () => {
    if (!cardNode) {
      setState("error");
      setMessage("Card is not ready yet.");
      return;
    }

    setState("working");
    setMessage("");

    try {
      const file = await renderCardFile(cardNode, personaName, walletAddress);
      downloadFile(file);
      setState("done");
      setMessage(`Downloaded ${file.name}`);
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? `${error.message} ${fallbackMessage}`
          : fallbackMessage,
      );
    }
  };

  const handleShare = async () => {
    if (!cardNode) {
      setState("error");
      setMessage("Card is not ready yet.");
      return;
    }

    setState("working");
    setMessage("");

    try {
      const file = await renderCardFile(cardNode, personaName, walletAddress);
      if (
        !canSharePersonaCard({
          file,
          share: navigator.share?.bind(navigator),
          canShare: navigator.canShare?.bind(navigator),
        })
      ) {
        setState("error");
        setMessage(
          `This browser does not support direct image sharing. ${fallbackMessage}`,
        );
        return;
      }

      await navigator.share({
        title: "SuiMe Persona Card",
        text: `My SuiMe persona: ${personaName}`,
        files: [file],
      });
      setState("done");
      setMessage("Share sheet opened.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setState("idle");
        setMessage("");
        return;
      }

      setState("error");
      setMessage(
        error instanceof Error
          ? `${error.message} ${fallbackMessage}`
          : fallbackMessage,
      );
    }
  };

  return (
    <div className="download-actions">
      <div className="action-row">
        <button
          type="button"
          className="secondary-button"
          onClick={handleDownload}
          disabled={!cardNode || state === "working"}
        >
          {state === "working" ? "Rendering..." : "Download PNG"}
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={handleShare}
          disabled={!cardNode || state === "working"}
        >
          Share Image
        </button>
      </div>
      <p className={state === "error" ? "error-copy inline-error" : "helper-copy"}>{message || fallbackMessage}</p>
    </div>
  );
}
