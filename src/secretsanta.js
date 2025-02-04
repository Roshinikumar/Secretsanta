import React, { useState } from "react";
import axios from "axios";
import { Button, Container, Card, Spinner, Alert } from "react-bootstrap";
import { FaFileCsv, FaFileExport } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

function Secretsant() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a CSV file to upload.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(response.data.message);
    } catch (error) {
      setErrorMessage("Error uploading file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Secret_Santa_Assignments.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setErrorMessage("Error exporting file. Please try again.");
    }
  };

  return (
    <Container className="mt-5 text-center">
      <Card className="shadow-lg p-4 rounded">
        <Card.Body>
          <h2 className="text-primary mb-4">🎅 Secret Santa 🎁</h2>

          <input type="file" accept=".csv" onChange={handleFileChange} className="form-control mb-3" />

          <Button variant="success" size="lg" className="mb-3" onClick={handleUpload} disabled={isProcessing}>
            {isProcessing ? <Spinner animation="border" size="sm" className="mr-2" /> : <FaFileCsv className="mr-2" />}
            Upload CSV
          </Button>

          <Button variant="primary" size="lg" className="mb-3 ml-3" onClick={handleExport}>
            <FaFileExport className="mr-2" />
            Export Excel
          </Button>
  
          {message && <Alert variant="success">{message}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Secretsant;
