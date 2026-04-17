import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";

function Scanner() {
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth/login", { replace: true });
        return;
      }
      setIsCheckingSession(false);
    }
    checkSession();
  }, [navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setScanResult(null);
      setError("");
    }
  };

  const analyzeIngredients = (text) => {
    const harmfulIngredients = [
      "aspartame",
      "msg",
      "monosodium glutamate",
      "sodium benzoate",
      "high fructose corn syrup",
      "potassium sorbate",
      "sodium nitrite",
      "artificial flavor",
      "artificial color",
      "artificial colours",
      "carrageenan",
      "maltodextrin",
      "trans fat",
      "hydrogenated oil",
      "partially hydrogenated oil",
      "bha",
      "bht",
      "red 40",
      "yellow 5",
      "yellow 6",
      "blue 1",
      "sodium aluminum phosphate",
      "artificial sweetener",
      "acesulfame potassium",
      "sucralose",
      "saccharin",
      "sugar",
      "added sugar",
      "phosphoric acid",
      "caffeine",
      "phenylalanine",
      "caramel",
      "e150",
      "e150d",
      "colour",
      "flavourings"

    ];

    const lowerText = text.toLowerCase();
    const found = harmfulIngredients.filter(ingredient =>
      lowerText.includes(ingredient.toLowerCase())
    );

    return found;
  };

  const getHealthScore = (harmfulCount) => {
    if (harmfulCount === 0) return { score: "Good ✅", color: "text-green-600" };
    if (harmfulCount <= 2) return { score: "Moderate ⚠️", color: "text-yellow-600" };
    return { score: "Unhealthy ❌", color: "text-red-600" };
  };

  const handleScan = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    // Check if API key is configured
    if (!import.meta.env.VITE_OCR_API_KEY || import.meta.env.VITE_OCR_API_KEY === 'your_ocr_api_key_here') {
      setError("OCR API key not configured. Please add your API key to the .env file.");
      return;
    }

    setIsScanning(true);
    setError("");
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");
      formData.append("iscreatesearchablepdf", "false");
      formData.append("issearchablepdfhidetextlayer", "false");
      formData.append("apikey", import.meta.env.VITE_OCR_API_KEY);

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.IsErroredOnProcessing) {
        const errorMessage = data.ErrorMessage?.[0] || data.ErrorDetails || "OCR processing failed";
        throw new Error(errorMessage);
      }

      const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
      const harmfulIngredients = analyzeIngredients(extractedText);
      const healthScore = getHealthScore(harmfulIngredients.length);

      setScanResult({
        text: extractedText,
        harmfulIngredients,
        healthScore,
      });
    } catch (error) {
      console.error("Scan error:", error);
      setError("Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-2xl px-3 py-6 sm:px-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Food Scanner</h1>
          <p className="mt-2 text-sm text-slate-600">
            Upload a food label image to scan ingredients and get health insights
          </p>
        </div>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Select Food Label Image
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Food label preview"
                    className="max-w-full h-auto max-h-48 rounded-lg border border-slate-200"
                  />
                </div>
              )}

              <button
                onClick={handleScan}
                disabled={!selectedFile || isScanning}
                className="w-full rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? "Scanning..." : "Scan Food"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {scanResult && (
            <div className="space-y-4">
              {/* Health Score */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Health Score</h2>
                <p className={`text-xl font-bold ${scanResult.healthScore.color}`}>
                  {scanResult.healthScore.score}
                </p>
              </div>

              {/* Harmful Ingredients */}
              {scanResult.harmfulIngredients.length > 0 ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h2 className="text-lg font-semibold text-red-900 mb-3">
                    ⚠️ Potentially Harmful Ingredients Found
                  </h2>
                  <ul className="space-y-1">
                    {scanResult.harmfulIngredients.map((ingredient, index) => (
                      <li key={index} className="text-sm text-red-700">
                        • {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                  <h2 className="text-lg font-semibold text-green-900 mb-2">
                    ✅ No Harmful Ingredients Detected
                  </h2>
                  <p className="text-sm text-green-700">
                    This food appears to be free of common artificial additives and preservatives.
                  </p>
                </div>
              )}

              {/* Extracted Text */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Extracted Text</h2>
                <div className="rounded-lg bg-slate-50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                    {scanResult.text || "No text could be extracted from the image."}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Scanner;
