import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function InvoiceApp() {
  const [orders, setOrders] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  useEffect(() => {
    axios
      .get("https://order-management-api-r0e0.onrender.com/orders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.log("Error fetching data", err);
        alert("Error fetching API");
      });
  }, []);

  const order = orders[selectedIndex];

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Siddha AI", 14, 22);
    doc.setFontSize(14);
    doc.text("INVOICE", 14, 30);
    doc.line(14, 32, 200, 32);

    doc.setFontSize(12);
    doc.text("Bill To:", 14, 40);
    doc.text(`${order.billTo.name}`, 14, 46);
    doc.text(`${order.billTo.email}`, 14, 52);
    doc.text(`${order.billTo.address}`, 14, 58);

    doc.text("Invoice Details:", 120, 40);
    doc.text(`Invoice : ${order.invoiceNumber}`, 120, 46);
    doc.text(`Date: ${order.date}`, 120, 52);
    doc.text(`Status: ${order.status}`, 120, 58);

    const tableData = order.items.map((item) => [
      item.item,
      item.quantity,
      `INR ${item.unitPrice.toFixed(2)}`,
      `INR ${(item.unitPrice * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [["Item", "Qty", "Unit Price", "Total"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [34, 139, 34],textColor: [255, 255, 255] },
      styles: { fontSize: 11 }
    });

    const subtotal = order.items.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    );
    const tax = 10;
    const total = subtotal + tax;

    const finalY = doc.lastAutoTable.finalY + 10;
    const labelX = 143;
    const amountX = 165;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Subtotal:", labelX, finalY);
    doc.text(`INR ${subtotal.toFixed(2)}`, amountX, finalY);

    doc.text("Tax:", labelX, finalY + 6);
    doc.text(`INR ${tax.toFixed(2)}`, amountX, finalY + 6);

    doc.setFontSize(14);
    doc.setTextColor(34,139,34);
    doc.text("Total:", labelX, finalY + 15);
    doc.text(`INR ${total.toFixed(2)}`, amountX, finalY + 15);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("If you have any questions, feel free to contact us.", 105, finalY + 35, { align: "center" });
    doc.text("Thank you for your business!", 105, finalY + 42, { align: "center" });

    doc.save("invoice.pdf");

    setPdfDownloaded(true);
  };

  if (!orders.length) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Invoice Preview</h1>

      <select
        value={selectedIndex}
        onChange={(e) => {
          setSelectedIndex(Number(e.target.value));
          setPdfDownloaded(false);
        }}
        style={{ marginBottom: "20px", padding: "8px", fontSize: "16px" }}
      >
        {orders.map((o, idx) => (
          <option key={o.id} value={idx}>
            {o.invoiceNumber} - {o.billTo.name}
          </option>
        ))}
      </select>

      <div style={{ marginBottom: "20px" }}>
        <h3>Invoice Number: {order.invoiceNumber}</h3>
        <p><strong>Name:</strong> {order.billTo.name}</p>
        <p><strong>Email:</strong> {order.billTo.email}</p>
        <p><strong>Address:</strong> {order.billTo.address}</p>
        <p><strong>Date:</strong> {order.date}</p>
        <p><strong>Status:</strong> {order.status}</p>
      </div>

      <h2>Order Items</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Item</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Quantity</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Unit Price</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.item}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.quantity}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>₹{item.unitPrice.toFixed(2)}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={generatePDF}
        style={{
          marginTop: "20px",
          backgroundColor: pdfDownloaded ? "#28a745" : "#007bff",
          color: "white",
          border: "none",
          padding: "10px 20px",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "5px",
        }}
      >
        {pdfDownloaded ? "PDF Downloaded" : "Generate PDF"}
      </button>
    </div>
  );
}

export default InvoiceApp;
