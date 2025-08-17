export default function SummaryView({ summary }) {
  return (
    <div className="mt-6 p-6 border rounded-xl shadow bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">AI Summary</h2>
      <p className="text-gray-700 whitespace-pre-line">{summary}</p>
    </div>
  );
}
