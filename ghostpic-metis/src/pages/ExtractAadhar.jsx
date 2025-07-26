import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

// Extract structured data from OCR text (same as your helper)
const extractAllDataFromText = (text) => {
  const extractedData = {};
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const keyValuePattern = /^(.+?)\s*[:\s]+(.+)$/;
  let addressLines = [];
  let isAddressSection = false;

  // Aadhaar number regex: 12 digits, grouped as xxxx xxxx xxxx
  const aadhaarPattern = /\b\d{4}\s\d{4}\s\d{4}\b/;
  // DOB regex: matches dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, yyyy/mm/dd, dd.mm.yyyy, yyyy.mm.dd
  // Remove unnecessary escaping in character class
  const dobPattern = /\b(\d{2}[-/.]\d{2}[-/.]\d{4}|\d{4}[-/.]\d{2}[-/.]\d{2})\b/;
  // Gender regex: matches MALE, FEMALE, M, F (uppercase)
  const genderPattern = /\b(MALE|FEMALE|M|F)\b/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const keyValueMatch = line.match(keyValuePattern);
    if (keyValueMatch) {
      let key = keyValueMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
      let value = keyValueMatch[2].trim().replace(/\s+/g, ' ').replace(/[^ -\u007F]+/g, '');
      if (key.includes('address')) {
        isAddressSection = true;
        addressLines.push(value);
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          const nextKeyValueMatch = nextLine.match(keyValuePattern);
          if (nextKeyValueMatch || !nextLine) break;
          addressLines.push(nextLine.trim().replace(/\s+/g, ' ').replace(/[^ -\u007F]+/g, ''));
          i = j;
        }
        extractedData[key] = addressLines.join(', ');
        isAddressSection = false;
        addressLines = [];
        continue;
      }
      extractedData[key] = value;
    } else if (isAddressSection) {
      addressLines.push(line.trim().replace(/\s+/g, ' ').replace(/[^ -\u007F]+/g, ''));
    }

    // Aadhaar number extraction
    if (!extractedData['aadhaar_number']) {
      const aadhaarMatch = line.match(aadhaarPattern);
      if (aadhaarMatch) {
        extractedData['aadhaar_number'] = aadhaarMatch[0];
      }
    }

    // DOB extraction
    if (!extractedData['dob']) {
      const dobMatch = line.match(dobPattern);
      if (dobMatch) {
        extractedData['dob'] = dobMatch[0];
      }
    }

    // Gender extraction
    if (!extractedData['gender']) {
      const genderMatch = line.match(genderPattern);
      if (genderMatch) {
        // Normalize gender value
        let genderVal = genderMatch[0];
        if (genderVal === 'M') genderVal = 'MALE';
        if (genderVal === 'F') genderVal = 'FEMALE';
        // Output as capitalized (Male/Female)
        extractedData['gender'] = genderVal.charAt(0) + genderVal.slice(1).toLowerCase();
      }
    }
  }
  if (addressLines.length > 0) {
    extractedData['address'] = addressLines.join(', ');
  }
  return extractedData;
};

// Minimal preprocessing in browser (convert image File to grayscale canvas)
const preprocessFile = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // Convert to grayscale
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for(let i = 0; i < data.length; i += 4){
        const avg = 0.3*data[i] + 0.59*data[i+1] + 0.11*data[i+2];
        data[i] = data[i+1] = data[i+2] = avg;
      }
      ctx.putImageData(imgData, 0, 0);
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if(blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob failed"));
        }
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load error'));
    };
    img.src = url;
  });
};

const Aadhar = () => {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFrontChange = (e) => {
    setFrontFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleBackChange = (e) => {
    setBackFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const runOcr = async () => {
    if (!frontFile || !backFile) {
      setError("Please upload both front and back Aadhaar images.");
      return;
    }
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      // preprocess + OCR front image
      const frontProcessedBlob = await preprocessFile(frontFile);
      const frontTextResult = await Tesseract.recognize(frontProcessedBlob, 'eng', {
        logger: m => console.log(m),
      });
      let frontText = frontTextResult.data.text;

      // Extract Aadhaar from front
      let extracted = extractAllDataFromText(frontText);

      if (!extracted.aadhaar_number) {
        // preprocess + OCR back image only if front doesn't yield number
        const backProcessedBlob = await preprocessFile(backFile);
        const backTextResult = await Tesseract.recognize(backProcessedBlob, 'eng+tam', {
          logger: m => console.log(m),
        });
        let backText = backTextResult.data.text;

        const backExtracted = extractAllDataFromText(backText);
        // Merge extracted data if any
        extracted = { ...extracted, ...backExtracted };
      }

      setResult({
        rawTextFront: frontText,
        // rawTextBack: backText || null, // optionally keep
        data: extracted,
      });

    } catch (err) {
      console.error(err);
      setError("Failed to process images. Try clearer photos.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{maxWidth: 450, margin: '2em auto', fontFamily: 'Arial, sans-serif'}}>
      <h2>Aadhaar OCR Extraction</h2>
      <div>
        <label>Upload Aadhaar Front Image:
          <input type="file" accept="image/*" onChange={handleFrontChange} disabled={processing} />
        </label>
      </div>
      <div style={{marginTop: 10}}>
        <label>Upload Aadhaar Back Image:
          <input type="file" accept="image/*" onChange={handleBackChange} disabled={processing} />
        </label>
      </div>
      <div style={{marginTop: 15}}>
        <button onClick={runOcr} disabled={processing || !frontFile || !backFile}>
          {processing ? 'Extracting...' : 'Extract Aadhaar Data'}
        </button>
      </div>

      {error && <div style={{color: 'red', marginTop: 20}}>{error}</div>}

      {result &&
        <div style={{marginTop: 20, whiteSpace: 'pre-wrap'}}>
          <h3>Extracted Aadhaar Data:</h3>
          {/* Aadhaar Number */}
          {result.data.aadhaar_number ? (
            <p><strong>Aadhaar Number:</strong> {result.data.aadhaar_number}</p>
          ) : (
            <p style={{color: 'red'}}>Aadhaar Number not found</p>
          )}
          {/* DOB */}
          {result.data.dob ? (
            <p><strong>Date of Birth:</strong> {result.data.dob}</p>
          ) : (
            <p style={{color: 'red'}}>DOB not found</p>
          )}
          {/* Gender */}
          {result.data.gender ? (
            <p><strong>Gender:</strong> {result.data.gender}</p>
          ) : (
            <p style={{color: 'red'}}>Gender not found</p>
          )}

          <details style={{marginTop: 10}}>
            <summary>Show Front Image Raw OCR Text</summary>
            <pre style={{fontSize: 12, maxHeight: 200, overflowY: 'auto'}}>{result.rawTextFront}</pre>
          </details>
        </div>
      }
    </div>
  );
};

export default Aadhar;