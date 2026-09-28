import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Invoice from "./Invoice.jsx";

const INVOICE_WIDTH = 794;
let nextId = 2;

const initial = {
  invoiceNo: "001",
  date: new Date().toISOString().slice(0, 10),
  billTo: "",
  currency: "USD",
  deposit: 30,
  vat: 18,
  vatInclusive: true,
  surcharge: 3.5,
  vatReg: "",
  signer: "Julius Kasaija",
  bank: `BANK NAME: EQUITY BANK
BRANCH: KAMPALA ROAD
ACCOUNT NAME: Cream Tours and Safaris Ltd
ACCOUNT NUMBER: 1002202428063
SWIFT CODE: EQBLUGKA`,
  items: [{ id: 1, name: "05 DAYS BEST OF UGANDA SAFARI TOUR", pax: 1, rate: 1500, days: 5 }],
};

export default function App() {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [scale, setScale] = useState(1);
  const invoiceRef = useRef(null);
  const previewRef = useRef(null);

  // Shrink the preview to fit narrow screens (the PDF is always captured at full size).
  useEffect(() => {
    const fit = () => {
      const w = previewRef.current?.parentElement?.clientWidth ?? INVOICE_WIDTH;
      setScale(Math.min(1, w / INVOICE_WIDTH));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const set = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const num = (v) => (v === "" ? 0 : Number(v) || 0);
  const setItem = (id, key, value) =>
    setData((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, [key]: value } : i)) }));
  const addItem = () =>
    setData((d) => ({ ...d, items: [...d.items, { id: nextId++, name: "", pax: 1, rate: 0, days: 1 }] }));
  const removeItem = (id) => setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  async function downloadPdf() {
    setBusy(true);
    setMessage("Preparing PDF…");
    const el = invoiceRef.current;
    const wrapper = previewRef.current;
    const oldTransform = el.style.transform;
    try {
      el.style.transform = "none";
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#fbf7ea" });
      const height = (210 * canvas.height) / canvas.width;
      const pdf = new jsPDF({ unit: "mm", format: [210, height] });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, height);
      const client = (data.billTo || "client").replace(/\W+/g, "_");
      pdf.save(`Invoice_${data.invoiceNo || "001"}_${client}.pdf`);
      setMessage("PDF downloaded ✔");
    } catch (err) {
      setMessage("Could not create the PDF: " + (err.message || err));
    } finally {
      el.style.transform = oldTransform;
      wrapper.style.transform = "";
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <div className="panel">
        <h1>🌴 Invoice Generator</h1>

        <div className="row2">
          <Field label="Invoice No."><input value={data.invoiceNo} onChange={(e) => set("invoiceNo", e.target.value)} /></Field>
          <Field label="Date"><input type="date" value={data.date} onChange={(e) => set("date", e.target.value)} /></Field>
        </div>
        <Field label="Bill to"><input placeholder="Client name" value={data.billTo} onChange={(e) => set("billTo", e.target.value)} /></Field>

        <label>Line items</label>
        {data.items.map((it) => (
          <div className="item" key={it.id}>
            <input placeholder="Particulars" value={it.name} onChange={(e) => setItem(it.id, "name", e.target.value)} />
            <div className="row3">
              <Field label="No. People"><input type="number" min="0" value={it.pax} onChange={(e) => setItem(it.id, "pax", num(e.target.value))} /></Field>
              <Field label="Rate/person"><input type="number" min="0" value={it.rate} onChange={(e) => setItem(it.id, "rate", num(e.target.value))} /></Field>
              <Field label="Items"><input type="number" min="0" value={it.days} onChange={(e) => setItem(it.id, "days", num(e.target.value))} /></Field>
            </div>
            <button className="danger" onClick={() => removeItem(it.id)}>Remove</button>
          </div>
        ))}
        <button className="secondary" onClick={addItem}>+ Add line item</button>

        <div className="row2">
          <Field label="Currency">
            <select value={data.currency} onChange={(e) => set("currency", e.target.value)}>
              {["USD", "UGX", "EUR", "GBP"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Deposit %"><input type="number" min="0" max="100" value={data.deposit} onChange={(e) => set("deposit", num(e.target.value))} /></Field>
        </div>
        <div className="row2">
          <Field label="VAT %"><input type="number" min="0" value={data.vat} onChange={(e) => set("vat", num(e.target.value))} /></Field>
          <Field label="VAT">
            <select value={data.vatInclusive ? "1" : "0"} onChange={(e) => set("vatInclusive", e.target.value === "1")}>
              <option value="1">Inclusive</option>
              <option value="0">Add on top</option>
            </select>
          </Field>
        </div>
        <Field label="Card payment surcharge %"><input type="number" step="0.1" value={data.surcharge} onChange={(e) => set("surcharge", num(e.target.value))} /></Field>
        <Field label="Bank details"><textarea rows="6" value={data.bank} onChange={(e) => set("bank", e.target.value)} /></Field>
        <Field label="Signed by"><input value={data.signer} onChange={(e) => set("signer", e.target.value)} /></Field>
        <Field label="VAT registration number"><input placeholder="Optional" value={data.vatReg} onChange={(e) => set("vatReg", e.target.value)} /></Field>

        <div style={{ marginTop: 14 }}>
          <button onClick={downloadPdf} disabled={busy}>⬇ Download PDF</button>
        </div>
        <div className="msg">{message}</div>
      </div>

      <div>
        <div className="view" style={{ width: INVOICE_WIDTH * scale, height: (invoiceRef.current?.offsetHeight ?? 1123) * scale }}>
          <div ref={previewRef} style={{ width: INVOICE_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <Invoice ref={invoiceRef} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}
