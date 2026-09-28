import { forwardRef } from "react";
import logo from "./assets/logo.png";
import safariBand from "./assets/safari-band.svg";
import acacia from "./assets/acacia-watermark.svg";

const SYMBOLS = { USD: "$", EUR: "€", GBP: "£", UGX: "UGX " };
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function calculate({ items, vat, vatInclusive, deposit }) {
  const subtotal = items.reduce((s, i) => s + i.pax * i.rate * i.days, 0);
  const vatAmount = vatInclusive ? (subtotal * vat) / (100 + vat) : (subtotal * vat) / 100;
  const total = vatInclusive ? subtotal : subtotal + vatAmount;
  const depositAmount = (total * deposit) / 100;
  return { total, vatAmount, depositAmount, balance: total - depositAmount };
}

const Invoice = forwardRef(function Invoice({ data }, ref) {
  const { currency, items, vat, vatInclusive, deposit, surcharge } = data;
  const sym = SYMBOLS[currency] ?? "";
  const m = (v) => sym + fmt(v);
  const t = calculate(data);
  const date = data.date ? new Date(data.date + "T00:00").toLocaleDateString("en-GB") : "";

  return (
    <div className="invoice" ref={ref}>
      <img className="watermark" src={acacia} alt="" width={380} height={300} />

      <header className="inv-head">
        <img src={logo} alt="Cream Tours and Safaris logo" />
        <div>
          <h2>CREAM TOURS AND SAFARIS</h2>
          <p><i>Safari Planning · Hotel Booking · Student Trips · Airport Transfer · Car Rentals</i></p>
          <p>info@creamtoursandsafaris.com · www.creamtoursandsafaris.com</p>
          <p>Tel: +256-772619606 · Mob: +256-702619606 · Entebbe Road, Kampala – Uganda</p>
        </div>
      </header>

      <div className="inv-body">
        <div className="inv-meta">
          <div>
            <div className="inv-title">INVOICE</div>
            <div style={{ marginTop: 8 }}>
              <b>BILL TO:</b>
              <br />
              <span style={{ fontSize: 17 }}><b>{data.billTo || "—"}</b></span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div><b>Date:</b> {date}</div>
            <div><b>Invoice No.:</b> {data.invoiceNo}</div>
            {data.vatReg && <div><b>VAT Reg. No.:</b> {data.vatReg}</div>}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No. Pax</th>
              <th>Particulars</th>
              <th className="num">Rate Per Person ({currency})</th>
              <th className="num">No. of Items</th>
              <th className="num">Total ({currency})</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{fmt(it.pax)}</td>
                <td>{it.name}</td>
                <td className="num">{m(it.rate)}</td>
                <td className="num">{fmt(it.days)}</td>
                <td className="num">{m(it.pax * it.rate * it.days)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td /><td>TOTAL COST</td><td /><td /><td className="num">{m(t.total)}</td>
            </tr>
            <tr>
              <td /><td><b>DEPOSIT</b></td><td className="num">{fmt(deposit)}%</td><td />
              <td className="num"><b>{m(t.depositAmount)}</b></td>
            </tr>
            <tr>
              <td /><td><b>VAT {vatInclusive ? "INCLUSIVE" : "ADDED"}</b></td>
              <td className="num">{fmt(vat)}%</td><td /><td className="num">{m(t.vatAmount)}</td>
            </tr>
            <tr className="balance-row">
              <td /><td>BALANCE DUE</td><td /><td /><td className="num">{m(t.balance)}</td>
            </tr>
          </tbody>
        </table>

        <div className="bank">
          <div className="box"><b>BENEFICIARY BANK DETAILS:</b>{"\n" + data.bank}</div>
          <div className="box"><b>ONLINE VISA CARD PAYMENT:</b>{`\nIncurs ${fmt(surcharge)}% surcharge.`}</div>
        </div>

        <div style={{ marginTop: 40 }}>
          Name: <b>{data.signer}</b> &nbsp;&nbsp;&nbsp;&nbsp; Sign: ..............................
        </div>
      </div>

      <img className="inv-foot-band" src={safariBand} alt="" width={794} height={120} />
      <div className="inv-foot-text">
        <span>Address: Old Kampala Hill, Kampala – Uganda</span>
        <span>Adventure for life</span>
      </div>
    </div>
  );
});

export default Invoice;
