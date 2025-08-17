// import { useState } from "react";
// import { processFile } from "../services/api";
// import MindmapTree from "./MindmapTree";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

// export default function FileUploader() {
//   const [file, setFile] = useState(null);
//   const [mindmap, setMindmap] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (e) => setFile(e.target.files[0]);

//   const handleUpload = async () => {
//     if (!file) return alert("Please select a file");
//     setLoading(true);
//     try {
//       const result = await processFile(file);
//       setMindmap(result);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="p-6 max-w-4xl mx-auto">
//       <CardContent>
//         <input type="file" onChange={handleFileChange} />
//         <Button className="mt-4" onClick={handleUpload} disabled={loading}>
//           {loading ? "Processing..." : "Generate Mindmap"}
//         </Button>

//         {mindmap && (
//           <div className="mt-8">
//             <h2 className="text-xl font-bold mb-4">Summary</h2>
//             <p className="mb-6">{mindmap.summary}</p>

//             <h2 className="text-xl font-bold mb-4">Mindmap</h2>
//             <MindmapTree data={mindmap.mindmap} />
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }


import { useState } from "react";
import { processFile } from "../services/api";
import MindmapTree from "./MindmapTree";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [mindmap, setMindmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const processAndSetMindmap = async (file) => {
    setLoading(true);
    try {
      const result = await processFile(file);
      setMindmap(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    await processAndSetMindmap(file);
  };

  const handleRefresh = async () => {
    if (!file) return alert("No file uploaded to refresh");
    await processAndSetMindmap(file);
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <CardContent>
        <input type="file" onChange={handleFileChange} />

        <div className="mt-4 flex gap-4">
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? "Processing..." : "Generate Mindmap"}
          </Button>

          <Button onClick={handleRefresh} disabled={loading || !file} variant="secondary">
            {loading ? "Refreshing..." : "Refresh Mindmap"}
          </Button>
        </div>

        {mindmap && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <p className="mb-6">{mindmap.summary}</p>

            <h2 className="text-xl font-bold mb-4">Mindmap</h2>
            <MindmapTree data={mindmap.mindmap} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

