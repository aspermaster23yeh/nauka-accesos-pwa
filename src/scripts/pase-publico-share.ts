function openWhatsappWithText(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

async function qrDataUrl(token: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(token, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#213138ff", light: "#ffffffff" },
  });
}

async function buildPdfBlob(dataUrl: string, token: string, tipoLabel: string): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Pase Nauka Nayarit", pageW / 2, 28, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Tipo: ${tipoLabel}`, pageW / 2, 38, { align: "center" });
  doc.setFontSize(10);
  doc.text("Presenta este código QR en caseta.", pageW / 2, 46, { align: "center" });

  const qrMm = 90;
  const x = (pageW - qrMm) / 2;
  doc.addImage(dataUrl, "PNG", x, 54, qrMm, qrMm);

  doc.setFontSize(8);
  const tokenLines = doc.splitTextToSize(`Referencia: ${token}`, pageW - 24);
  doc.text(tokenLines, pageW / 2, 54 + qrMm + 14, { align: "center" });

  return doc.output("blob");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function tryShareFiles(files: File[], text: string): Promise<boolean> {
  const shareData: ShareData = { files, text, title: "Pase Nauka Nayarit" };
  if (!navigator.share || !navigator.canShare?.(shareData)) {
    return false;
  }
  try {
    await navigator.share(shareData);
    return true;
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "AbortError") {
      return true;
    }
    return false;
  }
}

function readRoot(): { token: string; tipoLabel: string; link: string } | null {
  const el = document.getElementById("pase-publico-root");
  if (!(el instanceof HTMLElement)) {
    return null;
  }
  const token = el.dataset.token?.trim() ?? "";
  if (!token) {
    return null;
  }
  const tipo = el.dataset.tipo === "salida" ? "salida" : "entrada";
  const tipoLabel = tipo === "salida" ? "Salida" : "Entrada";
  return { token, tipoLabel, link: window.location.href };
}

export function initPasePublicoShare() {
  const imgBtn = document.getElementById("share-pase-qr-image");
  const pdfBtn = document.getElementById("share-pase-pdf");

  imgBtn?.addEventListener("click", async () => {
    const ctx = readRoot();
    if (!ctx) {
      return;
    }
    imgBtn.toggleAttribute("disabled", true);
    try {
      const dataUrl = await qrDataUrl(ctx.token);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "pase-nauka-qr.png", { type: "image/png" });
      const caption = `Pase Nauka Nayarit · ${ctx.tipoLabel}\n${ctx.link}`;
      const shared = await tryShareFiles([file], caption);
      if (!shared) {
        downloadBlob(blob, "pase-nauka-qr.png");
        openWhatsappWithText(
          `${caption}\n\nAdjunta la imagen "pase-nauka-qr.png" que acabas de descargar.`
        );
      }
    } catch {
      openWhatsappWithText(`Pase Nauka Nayarit · ${ctx.tipoLabel}\n${ctx.link}`);
    } finally {
      imgBtn?.toggleAttribute("disabled", false);
    }
  });

  pdfBtn?.addEventListener("click", async () => {
    const ctx = readRoot();
    if (!ctx) {
      return;
    }
    pdfBtn.toggleAttribute("disabled", true);
    try {
      const dataUrl = await qrDataUrl(ctx.token);
      const blob = await buildPdfBlob(dataUrl, ctx.token, ctx.tipoLabel);
      const file = new File([blob], "pase-nauka.pdf", { type: "application/pdf" });
      const caption = `Pase Nauka Nayarit · ${ctx.tipoLabel}\n${ctx.link}`;
      const shared = await tryShareFiles([file], caption);
      if (!shared) {
        downloadBlob(blob, "pase-nauka.pdf");
        openWhatsappWithText(
          `${caption}\n\nAdjunta el PDF "pase-nauka.pdf" que acabas de descargar.`
        );
      }
    } catch {
      openWhatsappWithText(`Pase Nauka Nayarit · ${ctx.tipoLabel}\n${ctx.link}`);
    } finally {
      pdfBtn?.toggleAttribute("disabled", false);
    }
  });
}
