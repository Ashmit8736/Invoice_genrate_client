import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import api from '../../services/api';

const InvoiceDetails = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, setRes] = await Promise.all([
          api.get(`/invoices/${id}`),
          api.get('/settings')
        ]);
        setInvoice(invRes.data);
        setSettings(setRes.data);
      } catch (error) {
        console.error("Failed to fetch invoice details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: invoice ? `Invoice_${invoice.order_id}` : 'Invoice',
  });

  const handleDownloadPdf = () => {
    const element = componentRef.current;
    const opt = {
      margin:       0.3,
      filename:     `Invoice_${invoice.order_id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading invoice...</div>;
  if (!invoice) return <div style={{ padding: '2rem', color: 'white' }}>Invoice not found.</div>;

  // Primary color matching the design
  const primaryColor = '#1d4ed8'; // Blue color from the Mojija image
  const textColor = '#111827';
  const textMuted = '#4b5563';
  const borderColor = '#e5e7eb';

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/invoices" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className="page-title">Invoice #{invoice.order_id}</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleDownloadPdf} className="btn btn-primary">
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '0', width: '100%', maxWidth: '900px', backgroundColor: 'white', overflowX: 'auto', overflowY: 'hidden' }}>
          
          <div ref={componentRef} style={{ 
            padding: '40px', 
            minWidth: '800px', /* Ensure it doesn't squish too much on mobile */
            backgroundColor: 'white', 
            color: textColor, 
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h1 style={{ color: primaryColor, fontSize: '28px', fontWeight: '800', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {settings?.company_name || 'MOJIJA'}
                </h1>
                <p style={{ margin: 0, color: textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>
                  E-COMMERCE MARKETPLACE
                </p>
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '0.5px' }}>
                  TAX INVOICE
                </h2>
              </div>
            </div>

            {/* Meta Details 4-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                <div style={{ fontWeight: '600', color: textColor }}>Invoice Number:</div>
                <div style={{ fontWeight: '700' }}>INV/{new Date(invoice.invoice_date).getFullYear()}/{invoice.id.toString().padStart(5, '0')}</div>
                
                <div style={{ fontWeight: '600', color: textColor }}>Order ID:</div>
                <div style={{ fontWeight: '700' }}>#{invoice.order_id}</div>
                
                <div style={{ fontWeight: '600', color: textColor }}>Invoice Date:</div>
                <div style={{ fontWeight: '700' }}>{new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: textColor }}>Payment Mode:</div>
                <div style={{ fontWeight: '700' }}>{invoice.payment_mode}</div>
                
                <div style={{ fontWeight: '600', color: textColor }}>Fulfillment Type:</div>
                <div style={{ fontWeight: '700' }}>{invoice.fulfillment_type}</div>
                
                <div style={{ fontWeight: '600', color: textColor }}>Invoice Status:</div>
                <div style={{ fontWeight: '700', color: invoice.status.toLowerCase() === 'paid' ? '#16a34a' : '#d97706' }}>{invoice.status}</div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${borderColor}`, marginBottom: '25px' }}></div>

            {/* Seller and Buyer Details */}
            <div style={{ display: 'flex', marginBottom: '30px' }}>
              
              {/* Seller */}
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: textMuted, marginBottom: '10px' }}>SOLD BY (SELLER DETAILS)</div>
                <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '5px' }}>{settings?.company_name}</div>
                <div style={{ color: textMuted, marginBottom: '5px', maxWidth: '300px' }}>
                  Registered Office: {settings?.address}
                </div>
                <div style={{ marginBottom: '3px' }}><span style={{ fontWeight: '800' }}>GSTIN:</span> {settings?.gstin}</div>
                <div><span style={{ fontWeight: '800' }}>PAN:</span> {settings?.pan}</div>
              </div>
              
              <div style={{ width: '1px', backgroundColor: borderColor, marginRight: '20px' }}></div>

              {/* Buyer */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: textMuted, marginBottom: '10px' }}>BILLING & SHIPPING DETAILS</div>
                <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '5px' }}>{invoice.customer_name}</div>
                <div style={{ color: textMuted, marginBottom: '5px', maxWidth: '300px' }}>
                  {invoice.shipping_address}
                </div>
                <div style={{ marginBottom: '3px', color: textMuted }}>Phone: {invoice.phone}</div>
                {invoice.customer_gstin && <div><span style={{ fontWeight: '800' }}>GSTIN:</span> {invoice.customer_gstin}</div>}
              </div>
              
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr>
                  <th style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: '12px 8px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: textMuted }}>#</th>
                  <th style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: '12px 8px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: textMuted }}>ITEM DESCRIPTION</th>
                  <th style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: '12px 8px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: textMuted }}>QTY</th>
                  <th style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: '12px 8px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: textMuted }}>UNIT PRICE<br/><span style={{ fontSize: '8px', fontWeight: '500' }}>(EXCL. GST)</span></th>
                  <th style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: '12px 8px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: textMuted }}>NET SUBTOTAL</th>
                  <th style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: '12px 8px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: textMuted }}>GST RATE</th>
                  <th style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: '12px 8px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: textMuted }}>GST AMOUNT</th>
                  <th style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: '12px 8px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: textMuted }}>TOTAL AMOUNT<br/><span style={{ fontSize: '8px', fontWeight: '500' }}>(INCL. GST)</span></th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((item, idx) => {
                  const unitPrice = Number(item.unit_price);
                  const qty = Number(item.quantity);
                  const netSubtotal = unitPrice * qty;
                  const gstAmount = (netSubtotal * Number(item.gst_rate)) / 100;
                  const totalIncl = netSubtotal + gstAmount;

                  return (
                    <tr key={idx}>
                      <td style={{ padding: '16px 8px', textAlign: 'center', color: textMuted, verticalAlign: 'top' }}>{idx + 1}</td>
                      <td style={{ padding: '16px 8px', fontWeight: '700', verticalAlign: 'top' }}>
                        {item.description}
                        {item.supplier_name && (
                          <div style={{ fontWeight: '500', fontSize: '11px', color: textMuted, marginTop: '4px' }}>
                            Owner: <br/>{item.supplier_name}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'center', color: textMuted, verticalAlign: 'top' }}>{qty}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', color: textMuted, verticalAlign: 'top' }}>₹{unitPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', color: textMuted, verticalAlign: 'top' }}>₹{netSubtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'center', color: textMuted, verticalAlign: 'top' }}>{item.gst_rate}%</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', color: textMuted, verticalAlign: 'top' }}>₹{gstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', color: textColor, fontWeight: '600', verticalAlign: 'top' }}>₹{totalIncl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div style={{ borderTop: `1px solid ${borderColor}`, marginBottom: '25px' }}></div>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              
              {/* Amount in words & Declaration */}
              <div style={{ flex: 1, paddingRight: '40px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '5px' }}>AMOUNT IN WORDS:</div>
                <div style={{ fontStyle: 'italic', fontWeight: '700', marginBottom: '25px' }}>
                  {invoice.amount_in_words}
                </div>
                
                <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '15px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '5px' }}>Declaration:</div>
                  <div style={{ fontSize: '9px', color: textMuted, lineHeight: '1.4' }}>
                    We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. All values are calculated under the rules of CGST and SGST or IGST as applicable.
                  </div>
                </div>
              </div>

              {/* Calculations */}
              <div style={{ width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: textMuted }}>Total Subtotal (Excl. GST):</span>
                  <span style={{ fontWeight: '700' }}>₹{Number(invoice.net_subtotal).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                
                {Number(invoice.cgst_amount) > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: textMuted }}>CGST:</span>
                      <span style={{ fontWeight: '700' }}>₹{Number(invoice.cgst_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: textMuted }}>SGST:</span>
                      <span style={{ fontWeight: '700' }}>₹{Number(invoice.sgst_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                  </>
                )}
                
                {Number(invoice.igst_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: textMuted }}>IGST:</span>
                    <span style={{ fontWeight: '700' }}>₹{Number(invoice.igst_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ color: textMuted }}>Total Tax / GST:</span>
                  <span style={{ fontWeight: '700' }}>₹{(Number(invoice.cgst_amount) + Number(invoice.sgst_amount) + Number(invoice.igst_amount)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px 0', 
                  borderTop: '1px solid #111827', 
                  borderBottom: '1px solid #111827',
                  fontSize: '14px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: '800' }}>Grand Total:</span>
                  <span style={{ fontWeight: '800', color: primaryColor, fontSize: '16px' }}>₹{Number(invoice.total_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', marginBottom: '40px' }}>
                  For <span style={{ fontWeight: '800' }}>{settings?.company_name}</span>
                </div>
                <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '5px', fontSize: '10px', color: textMuted, width: '200px', textAlign: 'center' }}>
                  Authorized Signatory
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
