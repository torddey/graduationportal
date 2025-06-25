import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/ui/Button";

const PrintTest = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Test Print",
  });

  return (
    <div>
      <Button variant="outline" onClick={handlePrint}>
        Print Test
      </Button>
      <div
        ref={printRef}
        style={{ marginTop: 20, padding: 20, border: "1px solid black" }}
      >
        <h2>Test Print Area</h2>
        <p>This should appear in the print preview.</p>
      </div>
    </div>
  );
};

export default PrintTest; 