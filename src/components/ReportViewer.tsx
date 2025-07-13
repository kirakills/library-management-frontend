import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FRAPPE_API_KEY = '6eab1607a5fe04b'; // Your API Key
const FRAPPE_API_SECRET = '5250726de623280'; // Your API Secret
const FRAPPE_BASE_URL = 'http://localhost:8000';

interface ReportColumn {
  fieldname: string;
  label: string;
  fieldtype: string;
  options?: string;
  width?: number;
}

interface ReportRow {
  [key: string]: any; // Allows for dynamic properties
}

interface ReportData {
  columns: ReportColumn[];
  data: ReportRow[];
}

const ReportViewer: React.FC = () => {
  const [reportType, setReportType] = useState<'books_on_loan' | 'overdue_books'>('books_on_loan');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map the reportType to the corresponding custom API method
      let apiUrl = '';
      if (reportType === 'books_on_loan') {
          apiUrl = `${FRAPPE_BASE_URL}/api/method/library_management.api.get_books_on_loan_report`;
      } else if (reportType === 'overdue_books') {
          apiUrl = `${FRAPPE_BASE_URL}/api/method/library_management.api.get_overdue_books_report`;
      } else {
          setError("Invalid report type selected.");
          setLoading(false);
          return;
      }

      // Use POST for method calls, even if no payload
      const response = await axios.post(apiUrl, {}, {
          headers: {
              'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
          }
      });

      // --- FIX IS HERE ---
      // Frappe custom API method returns data in response.data.message if successful,
      // and that message contains columns and result.
      // Or it might return columns and result directly depending on exact frappe.call/return.
      // Based on your provided JSON, it's `response.data.message.columns` and `response.data.message.result`
      if (response.data && response.data.message) {
        setReportData({
          columns: response.data.message.columns,
          data: response.data.message.result
        });
      } else if (response.data && response.data.columns && response.data.result) {
        // Fallback if Frappe sometimes returns directly (less likely for custom method)
        setReportData({
          columns: response.data.columns,
          data: response.data.result
        });
      } else {
        // Handle unexpected response format
        setError("Unexpected report data format received.");
        console.error("Unexpected report data format:", response.data);
      }
      // --- END FIX ---

    } catch (err: any) {
      console.error(`Error fetching ${reportType} report:`, err);
      setError(err.message || `Failed to fetch ${reportType} report.`);
      alert(`Error fetching report: ${err.response?.data?.exception || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]); // Re-fetch when reportType changes

  return (
    <div className="report-viewer-container">
      <h2>Library Reports</h2>
      <div>
        <button onClick={() => setReportType('books_on_loan')} style={{ marginRight: '10px', backgroundColor: reportType === 'books_on_loan' ? '#0056b3' : '#007bff' }}>Books On Loan</button>
        <button onClick={() => setReportType('overdue_books')} style={{ backgroundColor: reportType === 'overdue_books' ? '#0056b3' : '#007bff' }}>Overdue Books</button>
      </div>
      {loading ? (
        <div>Loading report...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : reportData && reportData.data.length > 0 ? (
        <table className="report-table">
          <thead>
            <tr>
              {reportData.columns.map((col) => (
                <th key={col.fieldname}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {reportData.columns.map((col) => (
                  <td key={col.fieldname}>{row[col.fieldname]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data found for this report.</p>
      )}
    </div>
  );
};

export default ReportViewer;